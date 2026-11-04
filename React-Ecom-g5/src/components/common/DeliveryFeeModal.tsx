import React, { useState, useMemo, useEffect } from 'react';
import { useDeliveryLocations } from '../../hooks/useDeliveryLocations';
import rawMyanmarLocations from '../../features/shipping/data/myanmar-locations.json';

interface MyanmarCity {
  cityName: string;
  townships: string[];
}

interface MyanmarRegion {
  regionOrState: string;
  cities: MyanmarCity[];
}

const myanmarLocationsData = rawMyanmarLocations as MyanmarRegion[];

export interface TownshipDeliveryItem {
  id: string;
  regionOrState: string;
  cityName: string;
  township: string;
  isInZone: boolean;
  zoneCode: string;
  zoneName: string;
  shippingFee: number;
  estimatedDays: number;
}

interface DeliveryFeeModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const DeliveryFeeModal: React.FC<DeliveryFeeModalProps> = ({ isOpen, onClose }) => {
  const { zones, loading } = useDeliveryLocations();

  const [searchTerm, setSearchTerm] = useState('');
  const [selectedRegion, setSelectedRegion] = useState<string>('ALL');
  const [selectedCity, setSelectedCity] = useState<string>('ALL');
  const [selectedTownship, setSelectedTownship] = useState<string>('ALL');
  const [zoneTypeFilter, setZoneTypeFilter] = useState<'ALL' | 'IN_ZONE' | 'OUT_ZONE'>('ALL');

  // Handle escape key
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isOpen) {
        onClose();
      }
    };
    if (isOpen) {
      document.body.style.overflow = 'hidden';
      window.addEventListener('keydown', handleKeyDown);
    }
    return () => {
      document.body.style.overflow = 'unset';
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [isOpen, onClose]);

  // 1. Compile all townships with In-Zone / Default Out-Zone rates from myanmar-locations.json
  const allTownshipItems: TownshipDeliveryItem[] = useMemo(() => {
    const list: TownshipDeliveryItem[] = [];

    myanmarLocationsData.forEach((reg) => {
      reg.cities.forEach((c) => {
        c.townships.forEach((t) => {
          const normT = t.toLowerCase().trim();

          // Find matching zone from deliveryZones / backend API
          const match = zones.find((z) => {
            const zTown = (z.township || '').toLowerCase().trim();
            return zTown && zTown === normT;
          });

          // In-Zone check: specific zone assigned with defined fee
          if (match && match.shippingFee && match.shippingFee < 5000) {
            list.push({
              id: `${reg.regionOrState}-${c.cityName}-${t}`,
              regionOrState: reg.regionOrState,
              cityName: c.cityName,
              township: t,
              isInZone: true,
              zoneCode: match.zoneCode || 'ZONE-EXPRESS',
              zoneName: match.zoneName || 'Express Zone Delivery',
              shippingFee: match.shippingFee,
              estimatedDays: match.estimatedDays || 1,
            });
          } else {
            // Zone အပြင် -> Default စျေး 5,000 MMK (Estimated 3-5 Days)
            list.push({
              id: `${reg.regionOrState}-${c.cityName}-${t}`,
              regionOrState: reg.regionOrState,
              cityName: c.cityName,
              township: t,
              isInZone: false,
              zoneCode: 'STANDARD',
              zoneName: 'Standard Delivery (Zone အပြင်)',
              shippingFee: 5000,
              estimatedDays: 3,
            });
          }
        });
      });
    });

    return list;
  }, [zones]);

  // 2. Cascading dropdown helpers
  const regionOptions = useMemo(() => {
    return myanmarLocationsData.map((r) => r.regionOrState);
  }, []);

  const cityOptions = useMemo(() => {
    if (selectedRegion === 'ALL') {
      return [];
    }
    const matchedRegion = myanmarLocationsData.find(
      (r) => r.regionOrState.toLowerCase() === selectedRegion.toLowerCase()
    );
    return matchedRegion ? matchedRegion.cities.map((c) => c.cityName) : [];
  }, [selectedRegion]);

  const townshipOptions = useMemo(() => {
    if (selectedRegion === 'ALL') return [];
    const matchedRegion = myanmarLocationsData.find(
      (r) => r.regionOrState.toLowerCase() === selectedRegion.toLowerCase()
    );
    if (!matchedRegion) return [];

    if (selectedCity === 'ALL') {
      // If region is chosen but city is ALL, gather all townships in that region
      const allTownshipsInRegion: string[] = [];
      matchedRegion.cities.forEach((c) => allTownshipsInRegion.push(...c.townships));
      return Array.from(new Set(allTownshipsInRegion)).sort((a, b) => a.localeCompare(b));
    }

    const matchedCity = matchedRegion.cities.find(
      (c) => c.cityName.toLowerCase() === selectedCity.toLowerCase()
    );
    return matchedCity ? [...matchedCity.townships].sort((a, b) => a.localeCompare(b)) : [];
  }, [selectedRegion, selectedCity]);

  // Handle cascading changes
  const handleRegionChange = (reg: string) => {
    setSelectedRegion(reg);
    setSelectedCity('ALL');
    setSelectedTownship('ALL');
  };

  const handleCityChange = (city: string) => {
    setSelectedCity(city);
    setSelectedTownship('ALL');
  };

  const handleResetFilters = () => {
    setSearchTerm('');
    setSelectedRegion('ALL');
    setSelectedCity('ALL');
    setSelectedTownship('ALL');
    setZoneTypeFilter('ALL');
  };

  // 3. Filter items based on cascading selectors, search, and zone type
  const filteredItems = useMemo(() => {
    const term = searchTerm.trim().toLowerCase();

    return allTownshipItems.filter((item) => {
      // Region match
      const matchRegion =
        selectedRegion === 'ALL' ||
        item.regionOrState.toLowerCase() === selectedRegion.toLowerCase();

      // City match
      const matchCity =
        selectedCity === 'ALL' ||
        item.cityName.toLowerCase() === selectedCity.toLowerCase();

      // Township match
      const matchTownship =
        selectedTownship === 'ALL' ||
        item.township.toLowerCase() === selectedTownship.toLowerCase();

      // Zone type filter
      const matchZoneType =
        zoneTypeFilter === 'ALL' ||
        (zoneTypeFilter === 'IN_ZONE' && item.isInZone) ||
        (zoneTypeFilter === 'OUT_ZONE' && !item.isInZone);

      // Search match (township, city, region, zoneCode)
      const matchSearch =
        !term ||
        item.township.toLowerCase().includes(term) ||
        item.cityName.toLowerCase().includes(term) ||
        item.regionOrState.toLowerCase().includes(term) ||
        item.zoneCode.toLowerCase().includes(term);

      return matchRegion && matchCity && matchTownship && matchZoneType && matchSearch;
    });
  }, [allTownshipItems, selectedRegion, selectedCity, selectedTownship, zoneTypeFilter, searchTerm]);

  // In-zone & out-zone count summary
  const inZoneCount = useMemo(() => allTownshipItems.filter((i) => i.isInZone).length, [allTownshipItems]);
  const outZoneCount = allTownshipItems.length - inZoneCount;

  // 4. Group by Region -> City for display
  const groupedData = useMemo(() => {
    const map = new Map<string, Map<string, TownshipDeliveryItem[]>>();

    filteredItems.forEach((item) => {
      const reg = item.regionOrState;
      const city = item.cityName;

      if (!map.has(reg)) {
        map.set(reg, new Map());
      }
      const cityMap = map.get(reg)!;
      if (!cityMap.has(city)) {
        cityMap.set(city, []);
      }
      cityMap.get(city)!.push(item);
    });

    return map;
  }, [filteredItems]);

  const hasActiveFilters =
    searchTerm !== '' ||
    selectedRegion !== 'ALL' ||
    selectedCity !== 'ALL' ||
    selectedTownship !== 'ALL' ||
    zoneTypeFilter !== 'ALL';

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-5 bg-slate-900/60 backdrop-blur-sm animate-fadeIn">
      {/* Click outside backdrop */}
      <div className="absolute inset-0" onClick={onClose} />

      {/* Modal Dialog */}
      <div className="relative w-full max-w-4xl max-h-[92vh] bg-white rounded-3xl shadow-[0_25px_70px_-15px_rgba(0,0,0,0.35)] flex flex-col overflow-hidden border border-slate-200 animate-scaleUp z-10">
        
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100 bg-white">
          <div className="flex items-center gap-3.5">
            <div className="w-11 h-11 rounded-2xl bg-gradient-to-br from-blue-600 to-indigo-700 text-white flex items-center justify-center shadow-lg shadow-blue-600/25 flex-shrink-0">
              <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.2} d="M9 17a2 2 0 11-4 0 2 2 0 014 0zM19 17a2 2 0 11-4 0 2 2 0 014 0z" />
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.2} d="M13 16V6a1 1 0 00-1-1H4a1 1 0 00-1 1v10a1 1 0 001 1h1m8-1a1 1 0 01-1 1H9m4-1V8a1 1 0 011-1h2.586a1 1 0 01.707.293l3.414 3.414a1 1 0 01.293.707V16a1 1 0 01-1 1h-1m-6-1a1 1 0 001 1h1M5 17a2 2 0 104 0m-4 0a2 2 0 114 0m6 0a2 2 0 104 0m-4 0a2 2 0 114 0" />
              </svg>
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-lg font-black tracking-tight text-slate-900">
                  Delivery Rates &amp; Coverage
                </h2>
                <span className="inline-flex items-center gap-1 text-[11px] font-extrabold bg-blue-50 text-blue-700 border border-blue-200 px-2.5 py-0.5 rounded-full shadow-2xs">
                  <span className="w-1.5 h-1.5 rounded-full bg-blue-500 animate-pulse"></span>
                  322 Townships
                </span>
              </div>
              <p className="text-xs text-slate-500 mt-0.5 font-medium">
                Myanmar 15 တိုင်းနှင့်ပြည်နယ်အလိုက် ပို့ဆောင်ခနှင့် ကြာချိန်များကို အဆင့်လိုက် ရှာဖွေနိုင်ပါသည်။
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="w-9 h-9 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-500 hover:text-slate-800 flex items-center justify-center transition-all cursor-pointer text-xl flex-shrink-0"
            aria-label="Close modal"
          >
            &times;
          </button>
        </div>

        {/* Filters and Cascading Selectors */}
        <div className="p-4 sm:p-5 bg-slate-50/70 border-b border-slate-200/80 space-y-3.5">
          
          {/* Row 1: Search Box */}
          <div className="relative">
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Search by township, city, or region... (e.g., Bahan, Taunggyi, Pyin Oo Lwin)"
              className="w-full bg-white border border-slate-200 rounded-xl px-4 py-2.5 pl-10 text-xs font-semibold text-slate-800 placeholder-slate-400 focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 shadow-xs transition-all"
            />
            <svg className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
            {searchTerm && (
              <button
                onClick={() => setSearchTerm('')}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 text-sm font-bold transition-colors cursor-pointer"
              >
                &times;
              </button>
            )}
          </div>

          {/* Row 2: Cascading 3-Tier Selectors (Region -> City -> Township) */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
            
            {/* Step 1: Region / State */}
            <div>
              <label className="block text-[10px] font-bold uppercase tracking-wider text-slate-400 mb-1">
                1. Region / State (တိုင်း / ပြည်နယ်)
              </label>
              <select
                value={selectedRegion}
                onChange={(e) => handleRegionChange(e.target.value)}
                className="w-full bg-white border border-slate-200 rounded-xl px-3 py-2 text-xs font-bold text-slate-800 focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 shadow-2xs transition-all cursor-pointer"
              >
                <option value="ALL">All Regions &amp; States ({regionOptions.length})</option>
                {regionOptions.map((r) => (
                  <option key={r} value={r}>
                    {r}
                  </option>
                ))}
              </select>
            </div>

            {/* Step 2: City / District */}
            <div>
              <label className="block text-[10px] font-bold uppercase tracking-wider text-slate-400 mb-1">
                2. City / District (ခရိုင် / မြို့)
              </label>
              <select
                value={selectedCity}
                onChange={(e) => handleCityChange(e.target.value)}
                disabled={selectedRegion === 'ALL'}
                className="w-full bg-white border border-slate-200 rounded-xl px-3 py-2 text-xs font-bold text-slate-800 focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 disabled:bg-slate-100 disabled:text-slate-400 disabled:cursor-not-allowed shadow-2xs transition-all cursor-pointer"
              >
                <option value="ALL">
                  {selectedRegion === 'ALL' ? 'Select Region First' : `All Cities in ${selectedRegion} (${cityOptions.length})`}
                </option>
                {cityOptions.map((c) => (
                  <option key={c} value={c}>
                    {c}
                  </option>
                ))}
              </select>
            </div>

            {/* Step 3: Township */}
            <div>
              <label className="block text-[10px] font-bold uppercase tracking-wider text-slate-400 mb-1">
                3. Township (မြို့နယ်)
              </label>
              <select
                value={selectedTownship}
                onChange={(e) => setSelectedTownship(e.target.value)}
                disabled={selectedRegion === 'ALL'}
                className="w-full bg-white border border-slate-200 rounded-xl px-3 py-2 text-xs font-bold text-slate-800 focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 disabled:bg-slate-100 disabled:text-slate-400 disabled:cursor-not-allowed shadow-2xs transition-all cursor-pointer"
              >
                <option value="ALL">
                  {selectedRegion === 'ALL'
                    ? 'Select Region First'
                    : selectedCity === 'ALL'
                    ? `All Townships in Region (${townshipOptions.length})`
                    : `All Townships in City (${townshipOptions.length})`}
                </option>
                {townshipOptions.map((t) => (
                  <option key={t} value={t}>
                    {t}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Row 3: Quick Filter Chips & Reset */}
          <div className="flex flex-wrap items-center justify-between gap-2 pt-1 border-t border-slate-200/60 text-xs">
            <div className="flex flex-wrap items-center gap-1.5">
              <button
                type="button"
                onClick={() => setZoneTypeFilter('ALL')}
                className={`px-3 py-1 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                  zoneTypeFilter === 'ALL'
                    ? 'bg-slate-800 text-white shadow-xs'
                    : 'bg-white text-slate-600 border border-slate-200 hover:bg-slate-100'
                }`}
              >
                All Destinations ({allTownshipItems.length})
              </button>

              <button
                type="button"
                onClick={() => setZoneTypeFilter('IN_ZONE')}
                className={`px-3 py-1 rounded-lg text-xs font-bold transition-all cursor-pointer flex items-center gap-1.5 ${
                  zoneTypeFilter === 'IN_ZONE'
                    ? 'bg-emerald-600 text-white shadow-xs'
                    : 'bg-white text-emerald-700 border border-emerald-200 hover:bg-emerald-50'
                }`}
              >
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
                Zone အတွင်း ({inZoneCount})
              </button>

              <button
                type="button"
                onClick={() => setZoneTypeFilter('OUT_ZONE')}
                className={`px-3 py-1 rounded-lg text-xs font-bold transition-all cursor-pointer flex items-center gap-1.5 ${
                  zoneTypeFilter === 'OUT_ZONE'
                    ? 'bg-blue-600 text-white shadow-xs'
                    : 'bg-white text-slate-600 border border-slate-200 hover:bg-slate-100'
                }`}
              >
                <span className="w-1.5 h-1.5 rounded-full bg-blue-500" />
                Zone အပြင် ({outZoneCount})
              </button>
            </div>

            {hasActiveFilters && (
              <button
                type="button"
                onClick={handleResetFilters}
                className="text-xs font-bold text-red-600 hover:text-red-700 hover:underline cursor-pointer flex items-center gap-1"
              >
                <span>&times;</span> Reset Filters
              </button>
            )}
          </div>
        </div>

        {/* Modal Body / Townships List */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-6 bg-slate-50/50">
          {loading ? (
            <div className="py-20 text-center text-slate-500">
              <div className="w-10 h-10 border-4 border-slate-200 border-t-blue-600 rounded-full animate-spin mx-auto mb-3" />
              <p className="text-xs font-bold text-slate-600">Loading delivery rates...</p>
            </div>
          ) : filteredItems.length === 0 ? (
            <div className="py-16 text-center bg-white rounded-2xl border border-slate-200 p-8 shadow-xs">
              <div className="w-12 h-12 bg-amber-50 text-amber-500 rounded-2xl flex items-center justify-center mx-auto mb-3 border border-amber-100">
                <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.172 16.172a4 4 0 015.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <p className="font-extrabold text-slate-800 text-sm">ရှာဖွေမှုနှင့် ကိုက်ညီသော မြို့နယ်မရှိပါ</p>
              <p className="text-xs text-slate-500 mt-1">ကျေးဇူးပြု၍ စာလုံးပေါင်း သို့မဟုတ် Filter များကို ပြန်စစ်ပေးပါ။</p>
              <button
                type="button"
                onClick={handleResetFilters}
                className="mt-4 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-bold transition-all shadow-xs"
              >
                Filter အားလုံး ရှင်းမည်
              </button>
            </div>
          ) : (
            Array.from(groupedData.entries()).map(([regionName, cityMap]) => {
              const totalRegionTownships = Array.from(cityMap.values()).reduce(
                (sum, list) => sum + list.length,
                0
              );

              return (
                <div
                  key={regionName}
                  className="border border-slate-200/90 rounded-2xl overflow-hidden shadow-xs bg-white"
                >
                  {/* Region Header */}
                  <div className="bg-gradient-to-r from-slate-900 via-indigo-950 to-blue-900 text-white px-5 py-3.5 flex items-center justify-between border-l-4 border-amber-400">
                    <div className="flex items-center gap-2.5">
                      <span className="w-2.5 h-2.5 rounded-full bg-amber-400 shadow-[0_0_8px_rgba(251,191,36,0.8)]" />
                      <span className="text-[11px] font-bold uppercase tracking-wider text-slate-300">
                        Region / State:
                      </span>
                      <h3 className="font-black text-sm text-white tracking-wide">{regionName}</h3>
                    </div>
                    <span className="text-xs bg-white/10 text-white border border-white/20 px-3 py-1 rounded-full font-bold backdrop-blur-xs">
                      {totalRegionTownships} {totalRegionTownships === 1 ? 'Township' : 'Townships'}
                    </span>
                  </div>

                  {/* Cities & Townships */}
                  <div className="divide-y divide-slate-100 p-3 sm:p-4 space-y-4">
                    {Array.from(cityMap.entries()).map(([cityName, townshipList]) => (
                      <div key={cityName} className="pt-2 first:pt-0">
                        {/* District / City Subheading */}
                        <div className="flex items-center gap-2 mb-3">
                          <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wide">
                            District / City:
                          </span>
                          <span className="text-xs font-black text-blue-900 bg-blue-50 px-2.5 py-0.5 rounded-lg border border-blue-200">
                            {cityName}
                          </span>
                          <span className="text-[11px] font-semibold text-slate-400">
                            ({townshipList.length} {townshipList.length === 1 ? 'township' : 'townships'})
                          </span>
                        </div>

                        {/* Townships Grid */}
                        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
                          {townshipList.map((item) => (
                            <div
                              key={item.id}
                              className={`rounded-xl p-3.5 border transition-all duration-200 flex items-center justify-between group ${
                                item.isInZone
                                  ? 'bg-white hover:bg-emerald-50/30 border-slate-200 hover:border-emerald-300 shadow-2xs hover:shadow-xs'
                                  : 'bg-white hover:bg-blue-50/30 border-slate-200 hover:border-blue-300 shadow-2xs hover:shadow-xs'
                              }`}
                            >
                              <div className="min-w-0 pr-2">
                                <div className="text-xs font-black text-slate-800 group-hover:text-blue-700 transition-colors truncate flex items-center gap-1.5">
                                  <span
                                    className={`w-2 h-2 rounded-full flex-shrink-0 ${
                                      item.isInZone ? 'bg-emerald-500 animate-pulse' : 'bg-slate-400'
                                    }`}
                                  />
                                  <span className="truncate">{item.township}</span>
                                </div>

                                <div className="mt-1.5 flex flex-wrap items-center gap-1">
                                  {item.isInZone ? (
                                    <span className="text-[10px] text-emerald-800 bg-emerald-100/80 border border-emerald-200 font-bold px-1.5 py-0.5 rounded">
                                      Zone: {item.zoneCode}
                                    </span>
                                  ) : (
                                    <span className="text-[10px] text-slate-600 bg-slate-100 border border-slate-200 font-medium px-1.5 py-0.5 rounded">
                                      Zone အပြင် (Default)
                                    </span>
                                  )}
                                </div>
                              </div>

                              <div className="text-right flex-shrink-0">
                                <div
                                  className={`text-xs font-black px-2.5 py-1 rounded-lg tracking-tight shadow-2xs border ${
                                    item.isInZone
                                      ? 'text-emerald-700 bg-emerald-50 border-emerald-200'
                                      : 'text-blue-700 bg-blue-50 border-blue-200'
                                  }`}
                                >
                                  {item.shippingFee.toLocaleString()} MMK
                                </div>
                                <div
                                  className={`text-[10px] font-bold px-2 py-0.5 rounded-full flex items-center gap-1 mt-1 justify-end border ${
                                    item.isInZone
                                      ? 'text-amber-800 bg-amber-50 border-amber-200'
                                      : 'text-slate-600 bg-slate-100 border-slate-200'
                                  }`}
                                >
                                  {item.isInZone ? '⚡' : '🕒'} {item.estimatedDays}{' '}
                                  {item.estimatedDays === 1 ? 'Day' : 'Days'}
                                </div>
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              );
            })
          )}
        </div>

        {/* Footer info bar */}
        <div className="px-6 py-3.5 border-t border-slate-100 bg-white flex flex-col sm:flex-row items-center justify-between gap-3 text-xs text-slate-600">
          <div className="font-semibold text-slate-600 flex items-center gap-2">
            <span>
              Showing <b className="text-blue-600 font-black">{filteredItems.length}</b> of{' '}
              <b className="text-slate-900 font-black">{allTownshipItems.length}</b> townships across Myanmar.
            </span>
          </div>
          <button
            onClick={onClose}
            className="w-full sm:w-auto px-5 py-2.5 bg-slate-900 hover:bg-slate-800 active:scale-95 text-white font-bold rounded-xl text-xs transition-all shadow-md hover:shadow-lg cursor-pointer tracking-wide"
          >
            Close
          </button>
        </div>

      </div>
    </div>
  );
};
