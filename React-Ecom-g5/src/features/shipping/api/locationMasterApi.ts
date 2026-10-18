import axios from 'axios';
import rawLocations from '../data/myanmar-locations.json';

export interface LocationRegionDto {
  regionOrState: string;
  city: string;
  townships: string[];
}

const DEFAULT_LOCATIONS: LocationRegionDto[] = rawLocations as LocationRegionDto[];

export const locationMasterApi = {
  // ၁။ တိုင်း/ပြည်နယ် နှင့် မြို့နယ်အားလုံးကို ဆွဲထုတ်ရန် (GET /api/locations)
  getAllLocations: async (): Promise<LocationRegionDto[]> => {
    try {
      const response = await axios.get<LocationRegionDto[]>('/api/locations', {
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

  // ၂။ ရွေးချယ်လိုက်သော Region သို့မဟုတ် City အလိုက် မြို့နယ်များကိုသာ ဆွဲထုတ်ရန်
  getTownships: async (regionOrCity: string): Promise<string[]> => {
    if (!regionOrCity) return [];
    try {
      const response = await axios.get<string[]>('/api/locations/townships', {
        params: { regionOrCity },
        timeout: 4000,
      });
      if (Array.isArray(response.data) && response.data.length > 0) {
        return response.data;
      }
    } catch {
      // Fallback
    }

    const norm = regionOrCity.trim().toLowerCase();
    const matched = DEFAULT_LOCATIONS.find(
      (loc) =>
        loc.regionOrState.trim().toLowerCase() === norm ||
        loc.city.trim().toLowerCase() === norm
    );
    return matched ? matched.townships : [];
  },
};
