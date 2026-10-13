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
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
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
              className="bg-white rounded-3xl p-3.5 border border-slate-200/90 shadow-2xs hover:shadow-md transition-all space-y-2.5 cursor-pointer relative"
            >
              <div className="flex items-start justify-between gap-2">
                <div className="space-y-1 flex-1">
                  <div className="flex items-center gap-1.5 flex-wrap">
                    <h3 className="font-black text-sm text-slate-900 leading-tight">
                      {hospital.name}
                    </h3>

                    {hospital.emergency24h && (
                      <span className="inline-flex items-center gap-1 text-[10px] font-black bg-rose-50 text-rose-800 border border-rose-200 px-1.5 py-0.5 rounded-md">
                        <span className="w-1.5 h-1.5 rounded-full bg-rose-600 animate-pulse" />
                        <span>طوارئ 24 ساعة</span>
                      </span>
                    )}

                    {hospital.isVerified && (
                      <span
                        title="منشأة صحية موثقة ومعتمدة"
                        className="inline-flex items-center gap-0.5 text-[10px] font-black bg-blue-50 text-blue-800 border border-blue-200 px-1.5 py-0.5 rounded-md"
                      >
                        <ShieldCheck className="w-3 h-3 text-blue-600" />
                        <span>معتمد</span>
                      </span>
                    )}
                  </div>

                  <p className="text-xs font-bold text-rose-800">
                    {hospital.type}
                  </p>

                  <p className="text-xs text-slate-500 flex items-center gap-1">
                    <MapPin className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                    <span>{hospital.district}</span>
                  </p>
                </div>

                <div className="flex items-center gap-1.5 shrink-0">
                  <button
                    type="button"
                    onClick={(e) => handleShareHospital(hospital, e)}
                    title="مشاركة بيانات المشفى عبر واتساب / وسائل التواصل (Feature 12)"
                    className="p-1.5 rounded-xl transition text-rose-700 bg-rose-50 hover:bg-rose-100 border border-rose-200 shadow-2xs active:scale-95"
                  >
                    <Share2 className="w-3.5 h-3.5" />
                  </button>

                  <button
                    type="button"
                    onClick={(e) => handleToggleFavorite(hospital.id, e)}
                    title={isFav ? 'إزالة من المفضلة' : 'إضافة إلى المفضلة'}
                    className={`p-1.5 rounded-xl transition ${
                      isFav
                        ? 'text-amber-500 bg-amber-50 border border-amber-200'
                        : 'text-slate-400 bg-slate-50 hover:bg-slate-100 border border-slate-100'
                    }`}
                  >
                    <Star className={`w-3.5 h-3.5 ${isFav ? 'fill-amber-400' : ''}`} />
                  </button>

                  <div className="text-left bg-slate-50 border border-slate-100 px-2 py-1 rounded-xl">
                    <span className="text-xs font-black text-slate-800 block">
                      {distanceFmt.full}
                    </span>
                    <span className="text-[9px] text-slate-400 font-semibold block">
                      عنك
                    </span>
                  </div>
                </div>
              </div>

              {/* Services list */}
              <div className="flex flex-wrap gap-1 pt-0.5">
                {hospital.services.map((srv, idx) => (
                  <span
                    key={idx}
                    className="text-[10px] font-medium text-slate-600 bg-slate-100 px-2 py-0.5 rounded-lg"
                  >
                    {srv}
                  </span>
                ))}
              </div>

              {/* Actions */}
              <div className="pt-1 flex items-center gap-2 border-t border-slate-100">
                <a
                  href={`tel:${hospital.emergencyPhone}`}
                  onClick={(e) => e.stopPropagation()}
                  className="flex-1 bg-rose-700 hover:bg-rose-800 text-white py-2 px-3 rounded-2xl text-xs font-black transition-all flex items-center justify-center gap-1.5 shadow-2xs active:scale-95"
                >
                  <PhoneCall className="w-3.5 h-3.5" />
                  <span>اتصال ({hospital.emergencyPhone})</span>
                </a>

                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    onSelectOnMap({
                      id: hospital.id,
                      type: 'hospital',
                      name: hospital.name,
                      latitude: hospital.latitude,
                      longitude: hospital.longitude,
                      distanceKm: hospital.distanceKm,
                      district: hospital.district
                    });
                  }}
                  className="flex-1 bg-slate-800 hover:bg-slate-900 text-white py-2 px-3 rounded-2xl text-xs font-bold transition-all flex items-center justify-center gap-1 active:scale-95"
                >
                  <Compass className="w-3.5 h-3.5 text-emerald-400" />
                  <span>مسار الخريطة</span>
                </button>

                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    onOpenRatingModal?.({
                      id: hospital.id,
                      name: hospital.name,
                      type: 'hospital',
                      currentRating: hospital.rating
                    });
                  }}
                  title="تقييم المشفى"
                  className="p-2 rounded-2xl bg-amber-50 hover:bg-amber-100 text-amber-700 text-xs font-bold transition border border-amber-200 flex items-center gap-1"
                >
                  <Star className="w-3.5 h-3.5 fill-amber-400 text-amber-500" />
                  <span>{hospital.rating || 4.6}</span>
                </button>

                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    onOpenCommunityReport({
                      id: hospital.id,
                      name: hospital.name,
                      type: 'hospital',
                      district: hospital.district,
                      currentPhone: hospital.emergencyPhone
                    });
                  }}
                  className="p-2 rounded-2xl bg-slate-100 hover:bg-emerald-50 text-slate-600 hover:text-emerald-800 text-xs font-bold transition border border-slate-200"
                  title="مشاركة تحديث أو ملاحظة حول هذا المركز"
                >
                  <MessageSquarePlus className="w-4 h-4 text-emerald-700" />
                </button>
              </div>
            </div>
          );
        })
      )}
      </div>
    </div>
  );
};
