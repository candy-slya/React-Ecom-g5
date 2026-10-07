import { useState, useEffect, useMemo } from 'react';
import { shippingApi } from '../features/shipping/api/shippingApi';
import type { DeliveryZoneResponse } from '../features/checkout/types';
import { DEFAULT_DELIVERY_ZONES } from '../features/shipping/data/deliveryZonesData';

export const useDeliveryLocations = () => {
  const [zones, setZones] = useState<DeliveryZoneResponse[]>(DEFAULT_DELIVERY_ZONES);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let mounted = true;
    const fetchZones = async () => {
      try {
        const data = await shippingApi.getAvailableDeliveryZones();
        if (mounted && Array.isArray(data) && data.length > 0) {
          setZones(data);
          setError(null);
        }
      } catch (err: any) {
        if (mounted) {
          // If unauthenticated or network error, fallback to MySQL exported data
          setZones(DEFAULT_DELIVERY_ZONES);
        }
      } finally {
        if (mounted) {
          setLoading(false);
        }
      }
    };
    fetchZones();
    return () => { mounted = false; };
  }, []);

  // ၁။ တိုင်း/ပြည်နယ် အားလုံးကို ဆွဲထုတ်ခြင်း (Extract unique regions)
  const regions = useMemo(() => {
    const map = new Map<string, string>();
    zones.forEach(z => {
      // ⚠️ မှတ်ချက်: DeliveryZoneResponse type ထဲမှာ regionOrState မပါသေးရင် ထည့်ပေးရန် လိုအပ်ပါမည်
      const regionRaw = (z as any).regionOrState || ''; 
      const norm = regionRaw.trim().toLowerCase();
      if (norm && !map.has(norm)) {
        map.set(norm, regionRaw.trim());
      }
    });
    return Array.from(map.values()).sort((a, b) => a.localeCompare(b));
  }, [zones]);

  // မူလအတိုင်း မြို့အားလုံးကို ဆွဲထုတ်ခြင်း (အခြားနေရာများတွင် သုံးထားပါက Error မတက်စေရန်)
  const cities = useMemo(() => {
    const map = new Map<string, string>();
    zones.forEach(z => {
      const cityRaw = z.city || '';
      const norm = cityRaw.trim().toLowerCase();
      if (norm && !map.has(norm)) {
        map.set(norm, cityRaw.trim());
      }
    });
    return Array.from(map.values()).sort((a, b) => a.localeCompare(b));
  }, [zones]);

  // ၂။ ရွေးချယ်ထားသော တိုင်း/ပြည်နယ်ပေါ်မူတည်၍ သက်ဆိုင်ရာ မြို့များကိုသာ ဆွဲထုတ်ခြင်း
  const getCitiesForRegion = (region: string) => {
    if (!region) return [];
    const normRegion = region.trim().toLowerCase();
    const map = new Map<string, string>();
    
    zones.forEach(z => {
      const zRegion = ((z as any).regionOrState || '').trim().toLowerCase();
      if (zRegion === normRegion) {
        const cityRaw = z.city || '';
        const normCity = cityRaw.trim().toLowerCase();
        if (normCity && !map.has(normCity)) {
          map.set(normCity, cityRaw.trim());
        }
      }
    });
    return Array.from(map.values()).sort((a, b) => a.localeCompare(b));
  };

  // ၃။ ရွေးချယ်ထားသော မြို့ပေါ်မူတည်၍ သက်ဆိုင်ရာ မြို့နယ်များကို ဆွဲထုတ်ခြင်း
  const getTownshipsForCity = (city: string) => {
    if (!city) return [];
    const normCity = city.trim().toLowerCase();
    const map = new Map<string, string>();
    zones.forEach(z => {
      if ((z.city || '').trim().toLowerCase() === normCity) {
        const townshipRaw = z.township || '';
        const norm = townshipRaw.trim().toLowerCase();
        if (norm && !map.has(norm)) {
          map.set(norm, townshipRaw.trim());
        }
      }
    });
    return Array.from(map.values()).sort((a, b) => a.localeCompare(b));
  };

  const getZoneForLocation = (city: string, township: string) => {
    if (!city || !township) return undefined;
    const normCity = city.trim().toLowerCase();
    const normTownship = township.trim().toLowerCase();
    return zones.find(z => 
      (z.city || '').trim().toLowerCase() === normCity &&
      (z.township || '').trim().toLowerCase() === normTownship
    );
  };

  return { 
    zones, 
    regions,             // အသစ်ဖြည့်ထားသည်
    getCitiesForRegion,  // အသစ်ဖြည့်ထားသည်
    cities, 
    getTownshipsForCity, 
    getZoneForLocation, 
    loading, 
    error 
  };
};