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
    const list: string[] = [];
    masterLocations.forEach((loc) => {
      if (Array.isArray(loc.cities)) {
        loc.cities.forEach((c) => {
          if (c.cityName?.trim()) list.push(c.cityName.trim());
        });
      }
    });
    return Array.from(new Set(list)).sort((a, b) => a.localeCompare(b));
  }, [masterLocations]);

  // ၂။ ရွေးချယ်ထားသော တိုင်း/ပြည်နယ်ပေါ်မူတည်၍ သက်ဆိုင်ရာ မြို့များကို ဆွဲထုတ်ခြင်း
  const getCitiesForRegion = (region: string): string[] => {
    if (!region) return [];
    const norm = region.trim().toLowerCase();
    const matched = masterLocations.find(
      (loc) => (loc.regionOrState || '').trim().toLowerCase() === norm
    );
    if (!matched || !Array.isArray(matched.cities)) return [];
    const cityList = matched.cities.map((c) => c.cityName?.trim()).filter(Boolean);
    return Array.from(new Set(cityList)).sort((a, b) => a.localeCompare(b));
  };

  // ၃။ ရွေးချယ်ထားသော မြို့ပေါ်မူတည်၍ သက်ဆိုင်ရာ မြို့နယ်များကို ဆွဲထုတ်ခြင်း
  const getTownshipsForCity = (city: string, region?: string): string[] => {
    if (!city) return [];
    const normCity = city.trim().toLowerCase();
    const normRegion = region ? region.trim().toLowerCase() : null;

    if (normRegion) {
      const matchedRegion = masterLocations.find(
        (loc) => (loc.regionOrState || '').trim().toLowerCase() === normRegion
      );
      if (matchedRegion && Array.isArray(matchedRegion.cities)) {
        const matchedCity = matchedRegion.cities.find(
          (c) => (c.cityName || '').trim().toLowerCase() === normCity
        );
        if (matchedCity && Array.isArray(matchedCity.townships)) {
          return [...matchedCity.townships].sort((a, b) => a.localeCompare(b));
        }
      }
    }

    for (const loc of masterLocations) {
      if (Array.isArray(loc.cities)) {
        const matchedCity = loc.cities.find(
          (c) => (c.cityName || '').trim().toLowerCase() === normCity
        );
        if (matchedCity && Array.isArray(matchedCity.townships)) {
          return [...matchedCity.townships].sort((a, b) => a.localeCompare(b));
        }
      }
    }
    return [];
  };

  // ၄။ သတ်မှတ်ထားသော Delivery Zone ရှာဖွေခြင်း
  const getZoneForLocation = (city?: string, township?: string): DeliveryZoneResponse | undefined => {
    if (!city && !township) return undefined;
    const normCity = (city || '').trim().toLowerCase();
    const altCity = normCity.replace(/ city$/, '');
    const normTownship = (township || '').trim().toLowerCase();

    // Specific township match first
    if (normTownship) {
      const exact = zones.find(
        (z) =>
          ((z.city || '').trim().toLowerCase() === normCity ||
           (z.city || '').trim().toLowerCase() === altCity) &&
          (z.township || '').trim().toLowerCase() === normTownship
      );
      if (exact) return exact;

      const townshipMatch = zones.find(
        (z) => (z.township || '').trim().toLowerCase() === normTownship
      );
      if (townshipMatch) return townshipMatch;
    }

    // Default city zone match (township is null or empty)
    if (normCity) {
      return zones.find(
        (z) =>
          ((z.city || '').trim().toLowerCase() === normCity ||
           (z.city || '').trim().toLowerCase() === altCity) &&
          (!z.township || z.township.trim() === '')
      );
    }

    return undefined;
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
