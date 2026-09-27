import { useState, useEffect, useMemo } from 'react';
import { shippingApi } from '../features/shipping/api/shippingApi';
import type { DeliveryZoneResponse } from '../features/checkout/types';

export const useDeliveryLocations = () => {
  const [zones, setZones] = useState<DeliveryZoneResponse[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let mounted = true;
    const fetchZones = async () => {
      try {
        setLoading(true);
        const data = await shippingApi.getAvailableDeliveryZones();
        if (mounted) {
          setZones(data);
          setError(null);
        }
      } catch (err: any) {
        if (mounted) {
          setError(err.response?.data?.message || err.message || 'Failed to fetch delivery zones');
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

  return { zones, cities, getTownshipsForCity, getZoneForLocation, loading, error };
};
