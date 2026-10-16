import { useState, useEffect, useMemo } from 'react';
import { shippingApi } from '../features/shipping/api/shippingApi';
import { locationMasterApi, type LocationRegionDto } from '../features/shipping/api/locationMasterApi';
import type { DeliveryZoneResponse } from '../features/checkout/types';
import { DEFAULT_DELIVERY_ZONES } from '../features/shipping/data/deliveryZonesData';
import rawLocations from '../features/shipping/data/myanmar-locations.json';

const DEFAULT_MASTER_LOCATIONS: LocationRegionDto[] = rawLocations as LocationRegionDto[];

export const useDeliveryLocations = () => {
  const [zones, setZones] = useState<DeliveryZoneResponse[]>(DEFAULT_DELIVERY_ZONES);
  const [masterLocations, setMasterLocations] = useState<LocationRegionDto[]>(DEFAULT_MASTER_LOCATIONS);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let mounted = true;

    const loadData = async () => {
      setLoading(true);
      try {
        // 1. Fetch master locations from LocationMasterController (/api/locations)
        const locations = await locationMasterApi.getAllLocations();
        if (mounted && Array.isArray(locations) && locations.length > 0) {
          setMasterLocations(locations);
        }

        // 2. Fetch available delivery zones from backend shipping API
        try {
          const zoneData = await shippingApi.getAvailableDeliveryZones();
          if (mounted && Array.isArray(zoneData)) {
            setZones(zoneData);
          }
        } catch {
          // If delivery zones are truncated or empty, zones remains empty or existing
        }
      } catch (err: any) {
        if (mounted) {
          setError(err.message || 'Failed to load locations');
        }
      } finally {
        if (mounted) {
          setLoading(false);
        }
      }
    };

    loadData();
    return () => {
      mounted = false;
    };
  }, []);

  // ၁။ တိုင်း/ပြည်နယ် အားလုံးကို ဆွဲထုတ်ခြင်း (Master locations မှ)
  const regions = useMemo(() => {
    const list = masterLocations
      .map((loc) => loc.regionOrState?.trim())
      .filter(Boolean);
    return Array.from(new Set(list)).sort((a, b) => a.localeCompare(b));
  }, [masterLocations]);

  // မူလအတိုင်း မြို့အားလုံးကို ဆွဲထုတ်ခြင်း
  const cities = useMemo(() => {
    const list = masterLocations
      .map((loc) => loc.city?.trim())
      .filter(Boolean);
    return Array.from(new Set(list)).sort((a, b) => a.localeCompare(b));
  }, [masterLocations]);

  // ၂။ ရွေးချယ်ထားသော တိုင်း/ပြည်နယ်ပေါ်မူတည်၍ သက်ဆိုင်ရာ မြို့များကို ဆွဲထုတ်ခြင်း
  const getCitiesForRegion = (region: string): string[] => {
    if (!region) return [];
    const norm = region.trim().toLowerCase();
    const matched = masterLocations.filter(
      (loc) => (loc.regionOrState || '').trim().toLowerCase() === norm
    );
    const cityList = matched.map((loc) => loc.city?.trim()).filter(Boolean);
    return Array.from(new Set(cityList)).sort((a, b) => a.localeCompare(b));
  };

  // ၃။ ရွေးချယ်ထားသော မြို့ပေါ်မူတည်၍ သက်ဆိုင်ရာ မြို့နယ်များကို ဆွဲထုတ်ခြင်း
  const getTownshipsForCity = (city: string, region?: string): string[] => {
    if (!city) return [];
    const normCity = city.trim().toLowerCase();
    const normRegion = region ? region.trim().toLowerCase() : null;

    const matched = masterLocations.find((loc) => {
      const cityMatches = (loc.city || '').trim().toLowerCase() === normCity;
      if (normRegion) {
        return cityMatches && (loc.regionOrState || '').trim().toLowerCase() === normRegion;
      }
      return cityMatches;
    });

    if (matched && Array.isArray(matched.townships)) {
      return [...matched.townships].sort((a, b) => a.localeCompare(b));
    }
    return [];
  };

  // ၄။ သတ်မှတ်ထားသော Delivery Zone ရှာဖွေခြင်း
  const getZoneForLocation = (city?: string, township?: string): DeliveryZoneResponse | undefined => {
    if (!city) return undefined;
    const normCity = city.trim().toLowerCase();
    const normTownship = (township || '').trim().toLowerCase();

    // Specific township match first
    if (normTownship) {
      const exact = zones.find(
        (z) =>
          (z.city || '').trim().toLowerCase() === normCity &&
          (z.township || '').trim().toLowerCase() === normTownship
      );
      if (exact) return exact;
    }

    // Default city zone match (township is null or empty)
    return zones.find(
      (z) =>
        (z.city || '').trim().toLowerCase() === normCity &&
        (!z.township || z.township.trim() === '')
    );
  };

  return {
    zones,
    masterLocations,
    regions,
    cities,
    getCitiesForRegion,
    getTownshipsForCity,
    getZoneForLocation,
    loading,
    error,
  };
};