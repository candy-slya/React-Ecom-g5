import React, { useState, useMemo, useEffect } from 'react';
import { useDeliveryLocations } from '../../hooks/useDeliveryLocations';

interface DeliveryFeeModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const DeliveryFeeModal: React.FC<DeliveryFeeModalProps> = ({ isOpen, onClose }) => {
  const { zones, regions, getCitiesForRegion, loading } = useDeliveryLocations();

  const [searchTerm, setSearchTerm] = useState('');
  const [selectedRegion, setSelectedRegion] = useState<string>('ALL');
  const [selectedCity, setSelectedCity] = useState<string>('ALL');

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

  // Cities for the selected region
  const availableCities = useMemo(() => {
    if (selectedRegion === 'ALL') return [];
    return getCitiesForRegion(selectedRegion);
  }, [selectedRegion, getCitiesForRegion]);

  // Reset city filter if region changes
  const handleRegionChange = (reg: string) => {
    setSelectedRegion(reg);
    setSelectedCity('ALL');
  };

  // Filtered zones
  const filteredZones = useMemo(() => {
    const term = searchTerm.trim().toLowerCase();
    return zones.filter(z => {
      const matchRegion = selectedRegion === 'ALL' || (z.regionOrState || '').toLowerCase() === selectedRegion.toLowerCase();
      const matchCity = selectedCity === 'ALL' || (z.city || '').toLowerCase() === selectedCity.toLowerCase();
      
      const searchMatch = !term || 
        (z.regionOrState || '').toLowerCase().includes(term) ||
        (z.city || '').toLowerCase().includes(term) ||
        (z.township || '').toLowerCase().includes(term) ||
        (z.zoneName || '').toLowerCase().includes(term) ||
        (z.zoneCode || '').toLowerCase().includes(term);

      return matchRegion && matchCity && searchMatch;
    });
  }, [zones, searchTerm, selectedRegion, selectedCity]);

  // Group by Region -> City
  const groupedZones = useMemo(() => {
    const map = new Map<string, Map<string, typeof zones>>();

    filteredZones.forEach(z => {
      const reg = z.regionOrState || 'Other Regions';
      const city = z.city || 'General';

      if (!map.has(reg)) {
        map.set(reg, new Map());
      }
      const cityMap = map.get(reg)!;
      if (!cityMap.has(city)) {
        cityMap.set(city, []);
      }
      cityMap.get(city)!.push(z);
    });

    return map;
  }, [filteredZones]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-5 bg-slate-950/75 backdrop-blur-xs animate-fadeIn">
      {/* Click outside backdrop */}
      <div className="absolute inset-0" onClick={onClose} />

      {/* Modal Dialog */}
      <div className="relative w-full max-w-4xl max-h-[90vh] bg-white rounded-3xl shadow-[0_25px_60px_-15px_rgba(15,23,42,0.45)] flex flex-col overflow-hidden border border-slate-200/90 animate-scaleUp z-10">
        
        {/* Premium Header */}
        <div className="flex items-center justify-between px-6 py-4.5 border-b border-slate-800 bg-gradient-to-r from-slate-900 via-[#1E293B] to-[#0F172A] text-white">
          <div className="flex items-center gap-3.5">
            <div className="w-11 h-11 rounded-2xl bg-gradient-to-br from-amber-400 via-amber-500 to-amber-600 text-slate-950 flex items-center justify-center shadow-lg shadow-amber-500/25 flex-shrink-0">
              <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 17a2 2 0 11-4 0 2 2 0 014 0zM19 17a2 2 0 11-4 0 2 2 0 014 0z" />
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16V6a1 1 0 00-1-1H4a1 1 0 00-1 1v10a1 1 0 001 1h1m8-1a1 1 0 01-1 1H9m4-1V8a1 1 0 011-1h2.586a1 1 0 01.707.293l3.414 3.414a1 1 0 01.293.707V16a1 1 0 01-1 1h-1m-6-1a1 1 0 001 1h1M5 17a2 2 0 104 0m-4 0a2 2 0 114 0m6 0a2 2 0 104 0m-4 0a2 2 0 114 0" />
              </svg>
            </div>
            <div>
              <div className="flex items-center gap-2.5">
                <h2 className="text-lg font-black tracking-tight text-white">
                  Delivery Rates & Coverage
                </h2>
                <span className="inline-flex items-center gap-1.5 text-[11px] font-bold bg-emerald-500/15 text-emerald-400 border border-emerald-500/30 px-2.5 py-0.5 rounded-full shadow-xs">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse"></span>
                  Verified Rates
                </span>
              </div>
              <p className="text-xs text-slate-300 mt-0.5">
                Standard delivery rates and estimated delivery timelines by region, district, and township.
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="w-9 h-9 rounded-xl bg-white/10 hover:bg-white/20 text-slate-300 hover:text-white flex items-center justify-center transition-all cursor-pointer text-xl flex-shrink-0"
            aria-label="Close modal"
          >
            &times;
          </button>
        </div>

        {/* Filters and Search Bar */}
        <div className="p-4 sm:p-5 bg-gradient-to-b from-slate-50 via-slate-50 to-indigo-50/20 border-b border-slate-200/90 space-y-3">
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            
            {/* Search Box */}
            <div className="relative">
              <input
                type="text"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder="Search township, city, or zone..."
                className="w-full bg-white border border-slate-300 hover:border-slate-400 rounded-xl px-3.5 py-2.5 pl-9 text-xs font-medium text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-amber-500/40 focus:border-amber-500 shadow-xs transition-all"
              />
              <svg className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
              {searchTerm && (
                <button
                  onClick={() => setSearchTerm('')}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 text-sm font-bold"
                >
                  &times;
                </button>
              )}
            </div>

            {/* Region / State */}
            <div>
              <select
                value={selectedRegion}
                onChange={(e) => handleRegionChange(e.target.value)}
                className="w-full bg-white border border-slate-300 hover:border-slate-400 rounded-xl px-3.5 py-2.5 text-xs font-semibold text-slate-800 focus:outline-none focus:ring-2 focus:ring-amber-500/40 focus:border-amber-500 shadow-xs transition-all cursor-pointer"
              >
                <option value="ALL">All Regions & States</option>
                {regions.map(r => (
                  <option key={r} value={r}>{r}</option>
                ))}
              </select>
            </div>

            {/* City / District */}
            <div>
              <select
                value={selectedCity}
                onChange={(e) => setSelectedCity(e.target.value)}
                disabled={selectedRegion === 'ALL' || availableCities.length === 0}
                className="w-full bg-white border border-slate-300 hover:border-slate-400 rounded-xl px-3.5 py-2.5 text-xs font-semibold text-slate-800 focus:outline-none focus:ring-2 focus:ring-amber-500/40 focus:border-amber-500 disabled:bg-slate-100 disabled:text-slate-400 disabled:cursor-not-allowed shadow-xs transition-all cursor-pointer"
              >
                <option value="ALL">
                  {selectedRegion === 'ALL' ? 'Select a region first' : 'All Districts & Cities'}
                </option>
                {availableCities.map(c => (
                  <option key={c} value={c}>{c}</option>
                ))}
              </select>
            </div>
          </div>

          {/* Result Count and Quick info */}
          <div className="flex flex-wrap items-center justify-between gap-2 text-xs text-slate-500 pt-1">
            <div className="flex items-center gap-2">
              <span className="inline-flex items-center gap-1.5 bg-gradient-to-r from-emerald-600 to-teal-600 text-white font-extrabold px-2.5 py-0.5 rounded-full text-xs shadow-xs">
                <span>{filteredZones.length}</span> destinations
              </span>
              {selectedRegion !== 'ALL' && (
                <span className="bg-indigo-600 text-white px-2.5 py-0.5 rounded-full font-bold text-xs shadow-xs">
                  {selectedRegion}
                </span>
              )}
              {selectedCity !== 'ALL' && (
                <span className="bg-sky-600 text-white px-2.5 py-0.5 rounded-full font-bold text-xs shadow-xs">
                  {selectedCity}
                </span>
              )}
            </div>
            <div className="text-[11px] text-slate-500 font-medium">
              * Shipping fee is automatically calculated at checkout based on your delivery address.
            </div>
          </div>
        </div>

        {/* Modal Body / Zones List */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-6 bg-slate-50/50">
          {loading ? (
            <div className="py-20 text-center text-slate-500">
              <div className="w-10 h-10 border-4 border-slate-200 border-t-amber-500 rounded-full animate-spin mx-auto mb-3" />
              <p className="text-xs font-semibold text-slate-600">Loading delivery fee rates...</p>
            </div>
          ) : filteredZones.length === 0 ? (
            <div className="py-20 text-center text-slate-500 bg-white rounded-2xl border border-slate-200 p-8 shadow-xs">
              <div className="w-14 h-14 bg-amber-50 text-amber-500 rounded-2xl flex items-center justify-center mx-auto mb-3 border border-amber-200/60">
                <svg className="w-7 h-7" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9.172 16.172a4 4 0 015.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <p className="font-extrabold text-slate-800 text-base">No delivery locations found</p>
              <p className="text-xs text-slate-500 mt-1">Try resetting your search query or filter selection.</p>
            </div>
          ) : (
            Array.from(groupedZones.entries()).map(([regionName, cityMap]) => (
              <div key={regionName} className="border border-slate-200 rounded-2xl overflow-hidden shadow-xs bg-white hover:border-indigo-200 transition-all">
                
                {/* Region Bar */}
                <div className="bg-gradient-to-r from-slate-900 via-indigo-950 to-slate-900 text-white px-5 py-3.5 flex items-center justify-between border-l-4 border-amber-400">
                  <div className="flex items-center gap-2.5">
                    <span className="w-2.5 h-2.5 rounded-full bg-amber-400 shadow-xs shadow-amber-400/80"></span>
                    <span className="text-[11px] font-bold uppercase tracking-wider text-amber-300">Region / State:</span>
                    <h3 className="font-black text-sm text-white tracking-wide">{regionName}</h3>
                  </div>
                  <span className="text-xs bg-amber-400/15 text-amber-300 border border-amber-400/25 px-3 py-1 rounded-full font-bold">
                    {Array.from(cityMap.values()).reduce((sum, list) => sum + list.length, 0)} Townships
                  </span>
                </div>

                {/* Cities / Districts & Townships */}
                <div className="divide-y divide-slate-100 p-2 sm:p-3">
                  {Array.from(cityMap.entries()).map(([cityName, townshipList]) => (
                    <div key={cityName} className="p-3 sm:p-4">
                      
                      {/* District / City Subheading */}
                      <div className="flex items-center gap-2 mb-3.5">
                        <span className="text-xs font-bold text-slate-400 uppercase tracking-wide">
                          District / City:
                        </span>
                        <span className="text-xs font-black text-indigo-950 bg-indigo-50 px-3 py-1 rounded-lg border border-indigo-200/80 shadow-2xs">
                          {cityName}
                        </span>
                        <span className="text-[11px] font-semibold text-slate-400">
                          ({townshipList.length} {townshipList.length === 1 ? 'township' : 'townships'})
                        </span>
                      </div>

                      {/* Township Cards Grid */}
                      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
                        {townshipList.map(item => (
                          <div
                            key={item.zoneId}
                            className="bg-gradient-to-b from-white to-slate-50/60 hover:to-amber-50/20 border border-slate-200 hover:border-amber-400/70 rounded-xl p-3.5 transition-all duration-200 hover:shadow-md hover:-translate-y-0.5 flex items-center justify-between group"
                          >
                            <div className="min-w-0 pr-2">
                              <div className="text-xs font-extrabold text-slate-800 group-hover:text-amber-600 transition-colors truncate flex items-center gap-1.5">
                                <span className="w-1.5 h-1.5 rounded-full bg-amber-500 group-hover:scale-125 transition-transform flex-shrink-0" />
                                <span className="truncate">{item.township || item.zoneName}</span>
                              </div>
                              <div className="text-[10px] text-slate-500 font-mono font-medium mt-1 bg-slate-100 group-hover:bg-amber-100/60 group-hover:text-amber-900 px-1.5 py-0.5 rounded inline-block transition-colors">
                                Zone: {item.zoneCode}
                              </div>
                            </div>

                            <div className="text-right flex-shrink-0">
                              <div className="text-xs font-black text-emerald-800 bg-emerald-100/80 border border-emerald-300/70 px-2.5 py-1 rounded-lg tracking-tight shadow-2xs">
                                {Number(item.shippingFee).toLocaleString()} MMK
                              </div>
                              <div className="text-[10px] font-bold text-sky-700 bg-sky-50 border border-sky-200/60 px-2 py-0.5 rounded-full flex items-center gap-1 mt-1 justify-end">
                                <svg className="w-3 h-3 text-sky-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                                </svg>
                                {item.estimatedDays ? `${item.estimatedDays} Days` : '1-2 Days'}
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>

                    </div>
                  ))}
                </div>

              </div>
            ))
          )}
        </div>

        {/* Footer info bar */}
        <div className="px-6 py-3.5 border-t border-slate-200 bg-slate-50 flex items-center justify-between text-xs text-slate-600">
          <div className="font-medium text-slate-700">
            Showing verified delivery rates for <b className="text-slate-900 font-bold">{zones.length}</b> destinations nationwide.
          </div>
          <button
            onClick={onClose}
            className="px-5 py-2 bg-slate-900 hover:bg-slate-800 active:scale-95 text-white font-bold rounded-xl text-xs transition-all shadow-sm hover:shadow cursor-pointer"
          >
            Close
          </button>
        </div>

      </div>
    </div>
  );
};
