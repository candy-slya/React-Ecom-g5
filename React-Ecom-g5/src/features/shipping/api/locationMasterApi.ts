import { axiosClient } from '../../../api/axiosClient';
import rawLocations from '../data/myanmar-locations.json';

export interface LocationCityDto {
  cityName: string;
  townships: string[];
}

export interface LocationRegionDto {
  regionOrState: string;
  cities: LocationCityDto[];
}

const DEFAULT_LOCATIONS: LocationRegionDto[] = rawLocations as LocationRegionDto[];

export const locationMasterApi = {
  // ၁။ တိုင်း/ပြည်နယ် နှင့် မြို့နယ်အားလုံးကို ဆွဲထုတ်ရန် (GET /api/locations)
  getAllLocations: async (): Promise<LocationRegionDto[]> => {
    try {
      const response = await axiosClient.get<LocationRegionDto[]>('../locations', {
        timeout: 4000,
      });
      if (Array.isArray(response.data) && response.data.length > 0) {
        return response.data;
      }
      return DEFAULT_LOCATIONS;
    } catch {
      // Backend api မရသေးပါက သို့မဟုတ် offline ဖြစ်ပါက json file မှ fallback အဖြစ် ယူသုံးမည်
      return DEFAULT_LOCATIONS;
    }
  },

  // ၂။ ရွေးချယ်လိုက်သော တိုင်း/ပြည်နယ် (Region) အလိုက် မြို့များ (Cities) ကို ဆွဲထုတ်ရန်
  getCities: async (region: string): Promise<string[]> => {
    if (!region) return [];
    try {
      const response = await axiosClient.get<string[]>('../locations/cities', {
        params: { region },
        timeout: 4000,
      });
      if (Array.isArray(response.data) && response.data.length > 0) {
        return response.data;
      }
    } catch {
      // Fallback
    }

    const norm = region.trim().toLowerCase();
    const matched = DEFAULT_LOCATIONS.find(
      (loc) => loc.regionOrState.trim().toLowerCase() === norm
    );
    return matched && Array.isArray(matched.cities)
      ? matched.cities.map((c) => c.cityName).filter(Boolean)
      : [];
  },

  // ၃။ ရွေးချယ်လိုက်သော မြို့ (City) အလိုက် မြို့နယ်များကိုသာ ဆွဲထုတ်ရန်
  getTownships: async (city: string): Promise<string[]> => {
    if (!city) return [];
    try {
      const response = await axiosClient.get<string[]>('../locations/townships', {
        params: { city },
        timeout: 4000,
      });
      if (Array.isArray(response.data) && response.data.length > 0) {
        return response.data;
      }
    } catch {
      // Fallback
    }

    const norm = city.trim().toLowerCase();
    for (const loc of DEFAULT_LOCATIONS) {
      if (Array.isArray(loc.cities)) {
        const matched = loc.cities.find(
          (c) => c.cityName.trim().toLowerCase() === norm
        );
        if (matched && Array.isArray(matched.townships)) {
          return matched.townships;
        }
      }
    }
    return [];
  },
};
