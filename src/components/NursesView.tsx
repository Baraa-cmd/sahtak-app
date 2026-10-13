import React, { useState, useMemo } from 'react';
import {
  Search,
  MapPin,
  Phone,
  MessageCircle,
  Star,
  Award,
  Compass,
  AlertCircle,
  Timer,
  ChevronLeft,
  MessageSquarePlus,
  CheckCircle2,
  ShieldCheck,
  Share2
} from 'lucide-react';
import { Nurse, SelectedRouteTarget } from '../types';
import { formatArabicTime, formatDistanceMetersOrKm } from '../lib/initialData';
import { offlineStorage } from '../lib/offlineStorage';

interface NursesViewProps {
  nurses: Nurse[];
  onSelectOnMap: (target: SelectedRouteTarget) => void;
  onOpenCommunityReport: (target: {
    id: string;
    name: string;
    type: 'nurse';
    district?: string;
    currentPhone?: string;
    isOnDuty?: boolean;
  }) => void;
  onOpenRatingModal?: (target: {
    id: string;
    name: string;
    type: 'nurse';
    currentRating?: number;
  }) => void;
}

type FilterTab = 'nearest' | 'on_duty' | 'favorites' | 'all';

export const NursesView: React.FC<NursesViewProps> = ({
  nurses,
  onSelectOnMap,
  onOpenCommunityReport,
  onOpenRatingModal
}) => {
  const [filterTab, setFilterTab] = useState<FilterTab>('nearest');
  const [searchQuery, setSearchQuery] = useState('');
  const [favorites, setFavorites] = useState<string[]>(() => offlineStorage.getFavorites());

  const handleToggleFavorite = (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    offlineStorage.toggleFavorite(id);
    setFavorites(offlineStorage.getFavorites());
  };

  // Feature 12: مشاركة بيانات الممرض عبر واتساب / وسائل التواصل بنقرة واحدة
  const handleShareNurse = (nurse: Nurse, e: React.MouseEvent) => {
    e.stopPropagation();
    const dutyText = nurse.isOnDuty
      ? '🌙 مناوب ليلاً ومستعد للزيارات المنزلية'
      : nurse.isAvailable
      ? '🟢 متاح للزيارات والاستشارات'
      : '⚪ متاح بالاتصال المسبق';

    const text = `🩺 *${nurse.name}* (${nurse.title}) - منصة صحتك (دير حافر)
📍 *المنطقة:* دير حافر - ${nurse.district}
⏰ *الحالة:* ${dutyText}
📞 *رقم الاتصال:* ${nurse.phone}
🛠️ *الخدمات المقدمة:* ${nurse.services.join('، ')}
🗺️ *الخريطة:* https://www.google.com/maps?q=${nurse.latitude},${nurse.longitude}`;

    if (navigator.share) {
      navigator.share({
        title: nurse.name,
        text: text
      }).catch(() => {});
    } else {
      window.open(`https://wa.me/?text=${encodeURIComponent(text)}`, '_blank');
    }
  };

  const filteredNurses = useMemo(() => {
    let list = [...nurses];

    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase().trim();
      list = list.filter(
        (n) =>
          n.name.toLowerCase().includes(q) ||
          n.title.toLowerCase().includes(q) ||
          n.district.toLowerCase().includes(q) ||
          n.services.some((s) => s.toLowerCase().includes(q))
      );
    }

    if (filterTab === 'on_duty') {
      return list.filter((n) => n.isOnDuty);
    } else if (filterTab === 'favorites') {
      return list.filter((n) => favorites.includes(n.id));
    } else if (filterTab === 'nearest') {
      list.sort((a, b) => (a.distanceKm ?? 999) - (b.distanceKm ?? 999));
      if (!searchQuery.trim()) {
        return list.slice(0, 4);
      }
      return list;
    } else {
      return list.sort((a, b) => (a.distanceKm ?? 999) - (b.distanceKm ?? 999));
    }
  }, [nurses, filterTab, searchQuery, favorites]);

  const onDutyCount = useMemo(() => nurses.filter((n) => n.isOnDuty).length, [nurses]);

  return (
    <div className="pb-24 px-3 sm:px-4 pt-3 max-w-xl md:max-w-2xl mx-auto space-y-3.5">
      {/* Header */}
      <div className="bg-gradient-to-r from-sky-800 via-sky-800 to-cyan-900 text-white rounded-3xl p-4 shadow-sm space-y-2.5">
        <div className="flex items-center justify-between">
          <span className="text-[11px] font-bold bg-white/15 px-2.5 py-0.5 rounded-full">
            التمريض المنزلي بدير حافر
          </span>
          <button
            onClick={() => setFilterTab('on_duty')}
            className="flex items-center gap-1.5 text-xs font-black bg-sky-950/70 hover:bg-sky-950 px-3 py-1 rounded-full border border-sky-400/40 transition active:scale-95 shadow-2xs"
          >
            <span className="w-2 h-2 rounded-full bg-cyan-300 animate-pulse" />
            <span>{onDutyCount} ممرضين مناوبين الآن</span>
          </button>
        </div>

        <div>
          <h2 className="text-xl font-black tracking-tight">كوادر التمريض المنزلي</h2>
          <p className="text-xs text-sky-100 font-medium">
            حقن وريدية ومحاليل، غيار جروح، وزيارات منزلية فورية
          </p>
        </div>

        {/* Filter Tabs */}
        <div className="grid grid-cols-4 gap-1.5 bg-sky-950/40 p-1 rounded-2xl border border-sky-700/50 text-xs">
          <button
            onClick={() => setFilterTab('nearest')}
            className={`py-1.5 rounded-xl font-bold transition flex items-center justify-center gap-1 ${
              filterTab === 'nearest'
                ? 'bg-white text-sky-900 shadow-xs'
                : 'text-sky-200 hover:text-white'
            }`}
          >
            <span>📍 الأقرب</span>
          </button>
          <button
            onClick={() => setFilterTab('on_duty')}
            className={`py-1.5 rounded-xl font-bold transition flex items-center justify-center gap-1 ${
              filterTab === 'on_duty'
                ? 'bg-white text-sky-900 shadow-xs'
                : 'text-sky-200 hover:text-white'
            }`}
          >
            <span>🌙 المناوبين</span>
          </button>
          <button
            onClick={() => setFilterTab('favorites')}
            className={`py-1.5 rounded-xl font-bold transition flex items-center justify-center gap-1 ${
              filterTab === 'favorites'
                ? 'bg-white text-sky-900 shadow-xs'
                : 'text-sky-200 hover:text-white'
            }`}
          >
            <span>⭐ المفضلة</span>
          </button>
          <button
            onClick={() => setFilterTab('all')}
            className={`py-1.5 rounded-xl font-bold transition flex items-center justify-center gap-1 ${
              filterTab === 'all'
                ? 'bg-white text-sky-900 shadow-xs'
                : 'text-sky-200 hover:text-white'
            }`}
          >
            <span>📋 الكل</span>
          </button>
        </div>
      </div>

      {/* Search Input */}
      <div className="relative">
        <Search className="w-4 h-4 text-slate-400 absolute right-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
        <input
          type="text"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          placeholder="ابحث باسم الممرض، الحي، أو الخدمة (حقن، جروح)..."
          className="w-full bg-white pr-10 pl-9 py-2.5 rounded-2xl border border-slate-200 text-xs focus:outline-sky-600 shadow-2xs placeholder:text-slate-400 font-medium"
        />
        {searchQuery && (
          <button
            onClick={() => setSearchQuery('')}
            className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 text-xs font-bold"
          >
            مسح
          </button>
        )}
      </div>

      {/* Nurses List */}
      <div className="space-y-3">
        {filteredNurses.length === 0 ? (
          <div className="bg-white rounded-3xl p-7 text-center border border-slate-200 shadow-2xs space-y-2">
            <AlertCircle className="w-8 h-8 text-slate-300 mx-auto" />
            <p className="text-xs font-bold text-slate-700">
              {filterTab === 'on_duty'
                ? 'لا يوجد ممرضين مناوبين حالياً'
                : filterTab === 'favorites'
                ? 'لم تقم بحفظ أي ممرض في المفضلة بعد.'
                : 'لم يتم العثور على نتائج'}
            </p>
          </div>
        ) : (
          filteredNurses.map((nurse) => {
            const isDuty = nurse.isOnDuty;
            const distanceFmt = formatDistanceMetersOrKm(nurse.distanceKm);
            const isFav = favorites.includes(nurse.id);

            return (
              <div
                key={nurse.id}
                onClick={() =>
                  onSelectOnMap({
                    id: nurse.id,
                    type: 'nurse',
                    name: nurse.name,
                    latitude: nurse.latitude,
                    longitude: nurse.longitude,
                    distanceKm: nurse.distanceKm,
                    district: nurse.district
                  })
                }
                className={`bg-white rounded-3xl p-4 border transition-all cursor-pointer shadow-2xs hover:border-sky-600 space-y-2.5 ${
                  isDuty ? 'border-sky-400 ring-2 ring-sky-100 shadow-sm' : 'border-slate-200'
                }`}
              >
                <div className="flex items-start justify-between gap-2">
                  <div className="space-y-1 flex-1">
                    <div className="flex items-center gap-1.5 flex-wrap">
                      <h3 className="font-black text-slate-900 text-sm">
                        {nurse.name}
                      </h3>

                      {nurse.isVerified && (
                        <span className="inline-flex items-center gap-0.5 text-[10px] font-bold bg-sky-50 text-sky-700 border border-sky-200 px-1.5 py-0.5 rounded-md">
                          <ShieldCheck className="w-3 h-3 text-sky-600" />
                          <span>مرخص</span>
                        </span>
                      )}

                      {isDuty ? (
                        <span className="inline-flex items-center gap-1 text-[10px] font-black bg-cyan-100 text-cyan-800 px-2 py-0.5 rounded-md">
                          <span className="w-1.5 h-1.5 rounded-full bg-cyan-600 animate-pulse" />
                          <span>مناوب وجاهز للزيارة</span>
                        </span>
                      ) : (
                        <span className="text-[10px] font-bold bg-slate-100 text-slate-600 px-2 py-0.5 rounded-md">
                          متاح بالاتصال
                        </span>
                      )}
                    </div>

                    <p className="text-xs font-bold text-sky-800">
                      {nurse.title} • خبرة {nurse.experienceYears} سنوات
                    </p>

                    <p className="text-xs text-slate-500 flex items-center gap-1">
                      <MapPin className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                      <span>{nurse.district}</span>
                    </p>
                  </div>

                  <div className="flex items-center gap-1.5 shrink-0">
                    <button
                      type="button"
                      onClick={(e) => handleShareNurse(nurse, e)}
                      title="مشاركة بيانات الممرض عبر واتساب / وسائل التواصل (Feature 12)"
                      className="p-1.5 rounded-xl transition text-sky-700 bg-sky-50 hover:bg-sky-100 border border-sky-200 shadow-2xs active:scale-95"
                    >
                      <Share2 className="w-3.5 h-3.5" />
                    </button>

                    <button
                      type="button"
                      onClick={(e) => handleToggleFavorite(nurse.id, e)}
                      title={isFav ? 'إزالة من المفضلة' : 'إضافة إلى المفضلة'}
                      className={`p-1.5 rounded-xl transition ${
                        isFav
                          ? 'text-amber-500 bg-amber-50 border border-amber-200'
                          : 'text-slate-400 bg-slate-50 hover:bg-slate-100 border border-slate-100'
                      }`}
                    >
                      <Star className={`w-3.5 h-3.5 ${isFav ? 'fill-amber-400' : ''}`} />
                    </button>

                    <div className="text-left bg-sky-50 border border-sky-100 px-2 py-1 rounded-xl">
                      <span className="text-xs font-black text-sky-900 block">
                        {distanceFmt.full}
                      </span>
                      <span className="text-[9px] text-sky-600 font-semibold block">
                        عنك
                      </span>
                    </div>
                  </div>
                </div>

                {/* Services */}
                <div className="flex flex-wrap gap-1 pt-0.5">
                  {nurse.services.map((srv, idx) => (
                    <span
                      key={idx}
                      className="text-[10px] font-medium text-slate-600 bg-slate-100 px-2 py-0.5 rounded-lg"
                    >
                      {srv}
                    </span>
                  ))}
                </div>

                {/* Action Buttons */}
                <div className="pt-1 flex items-center justify-between border-t border-slate-100 text-xs">
                  <div className="flex items-center gap-2">
                    <a
                      href={`tel:${nurse.phone}`}
                      onClick={(e) => e.stopPropagation()}
                      className="inline-flex items-center gap-1.5 bg-sky-700 hover:bg-sky-800 text-white font-black text-xs px-3 py-1.5 rounded-xl shadow-2xs active:scale-95 transition"
                    >
                      <Phone className="w-3.5 h-3.5" />
                      <span>اتصال</span>
                    </a>

                    {/* Rating button */}
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        onOpenRatingModal?.({
                          id: nurse.id,
                          name: nurse.name,
                          type: 'nurse',
                          currentRating: nurse.rating
                        });
                      }}
                      className="inline-flex items-center gap-1 text-[11px] font-bold text-amber-700 hover:text-amber-800 bg-amber-50 px-2 py-1 rounded-xl border border-amber-200 transition"
                    >
                      <Star className="w-3 h-3 fill-amber-400 text-amber-500" />
                      <span>{nurse.rating} ({nurse.ratingsCount || 18}) • تقييم</span>
                    </button>
                  </div>

                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        onOpenCommunityReport({
                          id: nurse.id,
                          name: nurse.name,
                          type: 'nurse',
                          district: nurse.district,
                          currentPhone: nurse.phone,
                          isOnDuty: nurse.isOnDuty
                        });
                      }}
                      className="p-1.5 rounded-xl bg-slate-100 hover:bg-sky-50 text-slate-600 hover:text-sky-800 text-xs font-bold transition border border-slate-200"
                      title="مشاركة تحديث"
                    >
                      <MessageSquarePlus className="w-3.5 h-3.5 text-sky-700" />
                    </button>

                    <span className="text-slate-400 flex items-center text-[11px]">
                      <ChevronLeft className="w-3.5 h-3.5" />
                    </span>
                  </div>
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
};
