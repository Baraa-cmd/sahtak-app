import React, { useState, useMemo } from 'react';
import {
  Building2,
  PhoneCall,
  MapPin,
  Compass,
  Search,
  ShieldAlert,
  MessageSquarePlus,
  Star,
  ShieldCheck,
  Share2
} from 'lucide-react';
import { Hospital, SelectedRouteTarget } from '../types';
import { formatDistanceMetersOrKm } from '../lib/initialData';
import { offlineStorage } from '../lib/offlineStorage';

interface HospitalsViewProps {
  hospitals: Hospital[];
  onSelectOnMap: (target: SelectedRouteTarget) => void;
  onOpenCommunityReport: (target: {
    id: string;
    name: string;
    type: 'hospital';
    district?: string;
    currentPhone?: string;
  }) => void;
  onOpenRatingModal?: (target: {
    id: string;
    name: string;
    type: 'hospital';
    currentRating?: number;
  }) => void;
}

export const HospitalsView: React.FC<HospitalsViewProps> = ({
  hospitals,
  onSelectOnMap,
  onOpenCommunityReport,
  onOpenRatingModal
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [favorites, setFavorites] = useState<string[]>(() => offlineStorage.getFavorites());

  const handleToggleFavorite = (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    offlineStorage.toggleFavorite(id);
    setFavorites(offlineStorage.getFavorites());
  };

  // Feature 12: مشاركة بيانات المشفى عبر واتساب / وسائل التواصل بنقرة واحدة
  const handleShareHospital = (h: Hospital, e: React.MouseEvent) => {
    e.stopPropagation();
    const text = `🏥 *${h.name}* - منصة صحتك (دير حافر)
📍 *المنطقة:* دير حافر - ${h.district}
🚑 *طوارئ 24 ساعة:* ${h.emergency24h ? 'متاح على مدار الساعة 24/7' : 'دوام نهاري'}
📞 *هاتف الإسعاف:* ${h.emergencyPhone}
🛠️ *الأقسام والخدمات:* ${h.services.join('، ')}
🗺️ *الموقع:* https://www.google.com/maps?q=${h.latitude},${h.longitude}`;

    if (navigator.share) {
      navigator.share({ title: h.name, text }).catch(() => {});
    } else {
      window.open(`https://wa.me/?text=${encodeURIComponent(text)}`, '_blank');
    }
  };

  const filteredHospitals = useMemo(() => {
    let list = [...hospitals];
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase().trim();
      list = list.filter(
        (h) =>
          h.name.toLowerCase().includes(q) ||
          h.district.toLowerCase().includes(q) ||
          h.type.toLowerCase().includes(q) ||
          h.services.some((s) => s.toLowerCase().includes(q))
      );
    }
    return list.sort((a, b) => (a.distanceKm ?? 999) - (b.distanceKm ?? 999));
  }, [hospitals, searchQuery]);

  return (
    <div className="pb-24 md:pb-12 px-3 sm:px-4 lg:px-6 pt-3 max-w-6xl mx-auto space-y-3.5">
      {/* Clean Hospitals Header */}
      <div className="pt-1 flex items-center justify-between">
        <div>
          <h2 className="text-lg font-black text-slate-900">المشافي والمراكز الطبية</h2>
          <p className="text-xs text-slate-500 font-medium">
            دليل المراكز الصحية والمشافي والإسعاف بدير حافر
          </p>
        </div>
      </div>

      {/* Search Input */}
      <div className="relative">
        <Search className="w-4 h-4 text-slate-400 absolute right-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
        <input
          type="text"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          placeholder="ابحث باسم المشفى، القسم، أو النقطة الطبية..."
          className="w-full pl-3 pr-10 py-2.5 bg-white border border-slate-200 rounded-2xl text-xs font-semibold text-slate-800 placeholder-slate-400 focus:outline-none focus:border-rose-600 shadow-2xs"
        />
        {searchQuery && (
          <button
            onClick={() => setSearchQuery('')}
            className="absolute left-3 top-1/2 -translate-y-1/2 text-xs font-bold text-slate-400 hover:text-slate-600"
          >
            مسح
          </button>
        )}
      </div>

      {/* Hospitals List */}
      <div className="grid grid-cols-2 gap-2.5 sm:gap-3.5">
        {filteredHospitals.length === 0 ? (
          <div className="col-span-full bg-white rounded-3xl p-7 text-center border border-slate-200 shadow-2xs space-y-2">
            <p className="text-xs font-bold text-slate-700">لم يتم العثور على نتائج مطابقة للبحث</p>
          </div>
        ) : (
          filteredHospitals.map((hospital) => {
            const distanceFmt = formatDistanceMetersOrKm(hospital.distanceKm);
            const isFav = favorites.includes(hospital.id);

            return (
              <div
                key={hospital.id}
                onClick={() =>
                  onSelectOnMap({
                    id: hospital.id,
                    type: 'hospital',
                    name: hospital.name,
                    latitude: hospital.latitude,
                    longitude: hospital.longitude,
                    distanceKm: hospital.distanceKm,
                    district: hospital.district
                  })
                }
                className="bg-white rounded-2xl p-3 border border-slate-200/90 shadow-2xs hover:border-rose-600 transition-all space-y-2 cursor-pointer relative flex flex-col justify-between"
              >
                {/* Header: Name, Distance & Favorite */}
                <div className="space-y-1">
                  <div className="flex items-start justify-between gap-1">
                    <h3 className="font-black text-slate-900 text-xs sm:text-sm line-clamp-1 leading-snug">
                      {hospital.name}
                    </h3>

                    <button
                      type="button"
                      onClick={(e) => handleToggleFavorite(hospital.id, e)}
                      title={isFav ? 'إزالة من المفضلة' : 'إضافة إلى المفضلة'}
                      className="p-1 rounded-lg text-slate-400 hover:text-amber-500 shrink-0 cursor-pointer"
                    >
                      <Star className={`w-3.5 h-3.5 ${isFav ? 'fill-amber-400 text-amber-500' : ''}`} />
                    </button>
                  </div>

                  <p className="text-[11px] text-slate-500 font-medium flex items-center gap-1 line-clamp-1">
                    <MapPin className="w-3 h-3 text-slate-400 shrink-0" />
                    <span>{hospital.district} • {distanceFmt.full}</span>
                  </p>
                </div>

                {/* Emergency Badge */}
                <div className="flex items-center gap-1">
                  {hospital.emergency24h ? (
                    <span className="inline-flex items-center gap-1 text-[10px] font-bold bg-rose-50 text-rose-800 border border-rose-200 px-2 py-0.5 rounded-md">
                      <span className="w-1.5 h-1.5 rounded-full bg-rose-600 animate-pulse" />
                      <span>طوارئ 24 ساعة</span>
                    </span>
                  ) : (
                    <span className="inline-flex items-center gap-1 text-[10px] font-bold bg-slate-100 text-slate-600 border border-slate-200 px-2 py-0.5 rounded-md">
                      <span>{hospital.type}</span>
                    </span>
                  )}
                </div>

                {/* Actions Row */}
                <div className="pt-1.5 border-t border-slate-100 flex items-center justify-between gap-1 text-xs">
                  <div className="flex items-center gap-1">
                    {hospital.emergencyPhone && (
                      <a
                        href={`tel:${hospital.emergencyPhone}`}
                        onClick={(e) => e.stopPropagation()}
                        className="inline-flex items-center gap-1 bg-rose-700 hover:bg-rose-800 text-white font-bold text-[11px] px-2 py-1 rounded-lg active:scale-95 transition"
                      >
                        <PhoneCall className="w-3 h-3" />
                        <span>طوارئ</span>
                      </a>
                    )}
                    <span className="inline-flex items-center gap-0.5 text-rose-900 bg-rose-50 hover:bg-rose-100 font-bold text-[11px] px-2 py-1 rounded-lg border border-rose-200/60">
                      <Compass className="w-3 h-3 text-rose-700" />
                      <span>الخريطة</span>
                    </span>
                  </div>

                  <span className="inline-flex items-center gap-0.5 text-[10px] font-bold text-amber-700 bg-amber-50 px-1.5 py-0.5 rounded-md border border-amber-200/50">
                    <Star className="w-3 h-3 fill-amber-400 text-amber-500 shrink-0" />
                    <span>{hospital.rating || 4.7}</span>
                  </span>
                </div>
              </div>
            );
          })
      )}
      </div>
    </div>
  );
};
