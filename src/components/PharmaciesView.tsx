import React, { useState, useMemo, useEffect } from 'react';
import {
  Search,
  MapPin,
  Clock,
  Compass,
  AlertCircle,
  Timer,
  ChevronLeft,
  ChevronDown,
  ChevronUp,
  MessageSquarePlus,
  CheckCircle2,
  Star,
  ShieldCheck,
  Activity,
  Heart,
  Droplet,
  Share2,
  Calendar,
  Moon,
  Phone
} from 'lucide-react';
import { Pharmacy, SelectedRouteTarget, DutyScheduleConfig } from '../types';
import {
  formatArabicTime,
  formatDistanceMetersOrKm,
  calculateRemainingDutyTime,
  DEFAULT_DUTY_SCHEDULE,
  getDutyShiftInfo,
  getPharmacyLiveStatus,
  isPharmacyOnDutyToday,
  getTodayArabicName,
  ALL_WEEKDAYS_ARABIC
} from '../lib/initialData';
import { offlineStorage } from '../lib/offlineStorage';

interface PharmaciesViewProps {
  pharmacies: Pharmacy[];
  onSelectOnMap: (target: SelectedRouteTarget) => void;
  onOpenCommunityReport: (target: {
    id: string;
    name: string;
    type: 'pharmacy';
    district?: string;
    isOnDuty?: boolean;
  }) => void;
  onOpenRatingModal?: (target: {
    id: string;
    name: string;
    type: 'pharmacy';
    currentRating?: number;
  }) => void;
  dutySchedule?: DutyScheduleConfig;
}

type FilterTab = 'all' | 'regular_duty' | 'night_duty' | 'nearest' | 'favorites' | 'on_duty';

export const PharmaciesView: React.FC<PharmaciesViewProps> = ({
  pharmacies,
  onSelectOnMap,
  onOpenCommunityReport,
  onOpenRatingModal,
  dutySchedule = DEFAULT_DUTY_SCHEDULE
}) => {
  const [filterTab, setFilterTab] = useState<FilterTab>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [favorites, setFavorites] = useState<string[]>(() => offlineStorage.getFavorites());

  // Live timer tick for duty countdown (Feature 3)
  const [, setTick] = useState(0);
  useEffect(() => {
    const interval = setInterval(() => setTick((t) => t + 1), 1000);
    return () => clearInterval(interval);
  }, []);

  const [isScheduleSectionExpanded, setIsScheduleSectionExpanded] = useState(true);

  // Pharmacies on duty for today
  const todaysDutyPharmacies = useMemo(() => {
    const todayName = getTodayArabicName();
    return pharmacies.filter((p) => {
      if (p.dutyDays && p.dutyDays.length > 0) {
        return p.dutyDays.includes(todayName);
      }
      return p.isOnDuty;
    });
  }, [pharmacies]);

  const currentShiftInfo = useMemo(() => {
    return getDutyShiftInfo(dutySchedule);
  }, [dutySchedule]);

  const handleToggleFavorite = (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    offlineStorage.toggleFavorite(id);
    setFavorites(offlineStorage.getFavorites());
  };

  // Feature 12: مشاركة تفاصيل الصيدلية المناوبة وموقعها عبر واتساب / وسائل التواصل بنقرة واحدة
  const handleSharePharmacy = (pharmacy: Pharmacy, e: React.MouseEvent) => {
    e.stopPropagation();
    const dutyStatus = pharmacy.isOnDuty
      ? `🌙 مناوبة (${currentShiftInfo.scheduleLabel}) حتى ${pharmacy.dutyEndTime || currentShiftInfo.closingTimeArabic}`
      : pharmacy.isOpen
      ? '🟢 مفتوحة الآن'
      : '⚪ مغلقة حالياً';

    const text = `🏥 *${pharmacy.name}* - منصة صحتك (دير حافر)
📍 *الموقع:* ${pharmacy.district} - ${pharmacy.address}
⏰ *الحالة:* ${dutyStatus}
🕒 *أوقات الدوام:* ${pharmacy.dutyHours || currentShiftInfo.scheduleLabel}
${pharmacy.phone ? `📞 *الهاتف:* ${pharmacy.phone}\n` : ''}🗺️ *الخريطة:* https://www.google.com/maps?q=${pharmacy.latitude},${pharmacy.longitude}`;

    if (navigator.share) {
      navigator.share({
        title: pharmacy.name,
        text: text
      }).catch(() => {});
    } else {
      window.open(`https://wa.me/?text=${encodeURIComponent(text)}`, '_blank');
    }
  };

  // Helper to determine real-time status using unified schedule rules
  const getSmartStatus = (pharmacy: Pharmacy) => {
    return getPharmacyLiveStatus(pharmacy);
  };

  // Sorted and filtered list
  const filteredPharmacies = useMemo(() => {
    let list = [...pharmacies];

    // Filter by search query if user typed
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase().trim();
      list = list.filter(
        (p) =>
          p.name.toLowerCase().includes(q) ||
          p.district.toLowerCase().includes(q) ||
          p.address.toLowerCase().includes(q) ||
          p.services.some((s) => s.toLowerCase().includes(q))
      );
    }

    // Filter by Tab
    if (filterTab === 'night_duty') {
      return list.filter((p) => {
        const live = getPharmacyLiveStatus(p);
        return live.isOnDutyToday || live.isDutyActiveNow || p.isOnDuty;
      });
    } else if (filterTab === 'regular_duty') {
      return list.filter((p) => {
        const live = getPharmacyLiveStatus(p);
        // Regular shift: not on night duty today or explicitly regular
        return !p.isOnDuty || !live.isOnDutyToday;
      });
    } else if (filterTab === 'favorites') {
      return list.filter((p) => favorites.includes(p.id));
    } else if (filterTab === 'nearest') {
      // Sort strictly by distance ascending (Feature 16)
      list.sort((a, b) => (a.distanceKm ?? 999) - (b.distanceKm ?? 999));
      if (!searchQuery.trim()) {
        return list.slice(0, 4);
      }
      return list;
    } else {
      // 'all'
      return list.sort((a, b) => (a.distanceKm ?? 999) - (b.distanceKm ?? 999));
    }
  }, [pharmacies, filterTab, searchQuery, favorites]);

  // Active duty count & scheduled today count using real live status
  const activeNowCount = useMemo(() => {
    return pharmacies.filter((p) => getPharmacyLiveStatus(p).isDutyActiveNow).length;
  }, [pharmacies]);

  const scheduledCount = useMemo(() => {
    return pharmacies.filter((p) => getPharmacyLiveStatus(p).isOnDutyToday).length;
  }, [pharmacies]);

  return (
    <div className="pb-24 md:pb-12 px-3 sm:px-4 lg:px-6 pt-3 max-w-6xl mx-auto space-y-3.5">
      {/* Header Card */}
      <div className="bg-gradient-to-br from-emerald-800 to-teal-900 text-white rounded-3xl p-4 shadow-sm space-y-3">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-xl font-black tracking-tight mb-1">صيدليات دير حافر</h2>
            <p className="text-xs text-emerald-100 font-bold flex flex-wrap items-center gap-2.5 leading-normal">
              <span className="bg-white/10 px-2 py-0.5 rounded-lg">دوام اعتيادي: 8:00 ص - 6:00 م</span>
              <span className="bg-white/10 px-2 py-0.5 rounded-lg">المناوبة: 9:00 م - 12:00 لـيلاً</span>
            </p>
          </div>

          <button
            onClick={() => setFilterTab('on_duty')}
            className={`flex items-center gap-1.5 text-xs font-black px-3.5 py-2 rounded-2xl border transition active:scale-95 shadow-2xs cursor-pointer shrink-0 ${
              activeNowCount > 0
                ? 'bg-emerald-950/80 hover:bg-emerald-950 border-emerald-400/50 text-emerald-200'
                : 'bg-amber-950/80 hover:bg-amber-950 border-amber-400/50 text-amber-200'
            }`}
          >
            {activeNowCount > 0 ? (
              <span className="flex items-center gap-1.5 whitespace-nowrap">
                <span className="w-2 h-2 rounded-full bg-emerald-300 animate-ping shrink-0" />
                <span>{activeNowCount} مناوبة 🟢</span>
              </span>
            ) : (
              <span className="flex items-center gap-1.5 whitespace-nowrap">
                <span className="w-2 h-2 rounded-full bg-amber-400 shrink-0" />
                <span>{scheduledCount} مناوبة 🌙</span>
              </span>
            )}
          </button>
        </div>

        {/* Ready-made Filter Buttons */}
        <div className="flex items-center gap-1.5 overflow-x-auto no-scrollbar pt-1 text-xs">
          <button
            onClick={() => setFilterTab('all')}
            className={`px-3 py-1.5 rounded-xl font-black transition shrink-0 flex items-center gap-1.5 cursor-pointer ${
              filterTab === 'all'
                ? 'bg-white text-emerald-950 shadow-xs'
                : 'bg-emerald-950/50 text-emerald-100 hover:bg-emerald-900 border border-emerald-700/40'
            }`}
          >
            <span>📋</span>
            <span>الكل ({pharmacies.length})</span>
          </button>

          <button
            onClick={() => setFilterTab('regular_duty')}
            className={`px-3 py-1.5 rounded-xl font-black transition shrink-0 flex items-center gap-1.5 cursor-pointer ${
              filterTab === 'regular_duty'
                ? 'bg-white text-emerald-950 shadow-xs'
                : 'bg-emerald-950/50 text-emerald-100 hover:bg-emerald-900 border border-emerald-700/40'
            }`}
          >
            <span>🟢</span>
            <span>دوام اعتيادي</span>
          </button>

          <button
            onClick={() => setFilterTab('night_duty')}
            className={`px-3.5 py-1.5 rounded-xl font-black transition shrink-0 flex items-center gap-1.5 cursor-pointer ${
              filterTab === 'night_duty'
                ? 'bg-white text-emerald-950 shadow-xs ring-2 ring-emerald-300/60'
                : 'bg-emerald-950/50 text-emerald-100 hover:bg-emerald-900 border border-emerald-700/40'
            }`}
          >
            <span>🌙</span>
            <span>مناوبة</span>
          </button>

          <button
            onClick={() => setFilterTab('nearest')}
            className={`px-3 py-1.5 rounded-xl font-black transition shrink-0 flex items-center gap-1.5 cursor-pointer ${
              filterTab === 'nearest'
                ? 'bg-white text-emerald-950 shadow-xs'
                : 'bg-emerald-950/50 text-emerald-100 hover:bg-emerald-900 border border-emerald-700/40'
            }`}
          >
            <span>📍</span>
            <span>الأقرب</span>
          </button>

          <button
            onClick={() => setFilterTab('favorites')}
            className={`px-3 py-1.5 rounded-xl font-black transition shrink-0 flex items-center gap-1.5 cursor-pointer ${
              filterTab === 'favorites'
                ? 'bg-white text-emerald-950 shadow-xs'
                : 'bg-emerald-950/50 text-emerald-100 hover:bg-emerald-900 border border-emerald-700/40'
            }`}
          >
            <span>⭐</span>
            <span>المفضلة ({favorites.length})</span>
          </button>
        </div>
      </div>



      {/* Search Input Bar */}
      <div className="relative">
        <Search className="w-4 h-4 text-slate-400 absolute right-3.5 top-1/2 -translate-y-1/2" />
        <input
          type="text"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          placeholder="ابحث باسم الصيدلية، الحي، أو دواء معين..."
          className="w-full bg-white pr-10 pl-9 py-2.5 rounded-2xl border border-slate-200 text-xs focus:outline-emerald-600 shadow-2xs placeholder:text-slate-400 font-medium"
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

      {/* List Header Label */}
      <div className="flex items-center justify-between text-xs font-bold text-slate-600 px-1 pt-1">
        <span>
          {filterTab === 'on_duty'
            ? 'الصيدليات المناوبة فقط في دير حافر:'
            : filterTab === 'favorites'
            ? 'صيدلياتك المفضلة:'
            : filterTab === 'nearest'
            ? 'أقرب الصيدليات إلى موقعك الفعلي:'
            : 'دليل كافة الصيدليات:'}
        </span>
        <span className="text-slate-500 font-semibold">{filteredPharmacies.length} صيدلية</span>
      </div>

      {/* Alert banner when night duty shift has ended */}
      {filterTab === 'on_duty' && currentShiftInfo.isShiftEnded && (
        <div className="bg-rose-50 border border-rose-200 rounded-2xl p-3.5 text-xs text-rose-900 flex items-start gap-2.5 shadow-2xs">
          <AlertCircle className="w-4 h-4 text-rose-600 shrink-0 mt-0.5" />
          <div className="space-y-1">
            <div className="font-black text-rose-950">
              انتهت فترة المناوبة الليلية المعتمدة ({currentShiftInfo.closingTimeArabic})
            </div>
            <div className="text-[11px] text-rose-800 leading-relaxed font-medium">
              الصيدليات أدناه كانت مناوبة الليلة الماضية وانتهت مناوبتها عند الساعة 12:00 ليلاً. للحالات الإسعافية الطارئة الآن، يرجى التوجه إلى نقطة الإسعاف أو المشافي (طوارئ 24/7).
            </div>
          </div>
        </div>
      )}

      {/* Pharmacies List */}
      <div className="grid grid-cols-2 gap-2.5 sm:gap-3.5">
        {filteredPharmacies.length === 0 ? (
          <div className="col-span-full bg-white rounded-3xl p-7 text-center border border-slate-200 shadow-2xs space-y-2">
            <AlertCircle className="w-8 h-8 text-slate-300 mx-auto" />
            <p className="text-xs font-bold text-slate-700">
              {filterTab === 'night_duty'
                ? 'لا توجد صيدليات مناوبة الليلة مسجلة حالياً'
                : filterTab === 'regular_duty'
                ? 'لا توجد صيدليات بالدوام الاعتيادي مطابقة للبحث'
                : filterTab === 'favorites'
                ? 'لم تقم بإضافة صيدليات للمفضلة بعد. اضغط على رمز ⭐ لحفظ أي صيدلية هنا.'
                : 'لم يتم العثور على صيدليات مطابقة'}
            </p>
            {filterTab !== 'all' && (
              <button
                onClick={() => setFilterTab('all')}
                className="text-xs text-emerald-700 font-bold underline"
              >
                عرض جميع صيدليات دير حافر
              </button>
            )}
          </div>
        ) : (
          filteredPharmacies.map((pharmacy) => {
            const isDuty = pharmacy.isOnDuty;
            const distanceFmt = formatDistanceMetersOrKm(pharmacy.distanceKm);
            const statusInfo = getSmartStatus(pharmacy);
            const isFav = favorites.includes(pharmacy.id);

            // Feature 3: Live Countdown Calculation with dutySchedule
            const countdown = isDuty ? calculateRemainingDutyTime(pharmacy.dutyEndTime, dutySchedule) : null;

            return (
              <div
                key={pharmacy.id}
                onClick={() =>
                  onSelectOnMap({
                    id: pharmacy.id,
                    type: 'pharmacy',
                    name: pharmacy.name,
                    latitude: pharmacy.latitude,
                    longitude: pharmacy.longitude,
                    distanceKm: pharmacy.distanceKm,
                    district: pharmacy.district
                  })
                }
                className={`bg-white rounded-2xl p-3 border transition-all cursor-pointer shadow-2xs hover:border-emerald-600 space-y-2 relative flex flex-col justify-between ${
                  isDuty
                    ? 'border-blue-400 ring-2 ring-blue-100/80 shadow-xs'
                    : 'border-slate-200'
                }`}
              >
                {/* Header: Name, Distance & Favorite */}
                <div className="space-y-1">
                  <div className="flex items-start justify-between gap-1">
                    <h3 className="font-black text-slate-900 text-xs sm:text-sm line-clamp-1 leading-snug">
                      {pharmacy.name}
                    </h3>

                    <button
                      type="button"
                      onClick={(e) => handleToggleFavorite(pharmacy.id, e)}
                      title={isFav ? 'إزالة من المفضلة' : 'إضافة إلى المفضلة'}
                      className="p-1 rounded-lg text-slate-400 hover:text-amber-500 shrink-0 cursor-pointer"
                    >
                      <Star className={`w-3.5 h-3.5 ${isFav ? 'fill-amber-400 text-amber-500' : ''}`} />
                    </button>
                  </div>

                  <p className="text-[11px] text-slate-500 font-medium flex items-center gap-1 line-clamp-1">
                    <MapPin className="w-3 h-3 text-slate-400 shrink-0" />
                    <span>{pharmacy.district} • {distanceFmt.full}</span>
                  </p>
                </div>

                {/* Status Badges */}
                <div className="flex items-center gap-1 flex-wrap">
                  {pharmacy.isOpen ? (
                    <span className="inline-flex items-center gap-1 text-[10px] font-bold bg-emerald-50 text-emerald-800 border border-emerald-200 px-2 py-0.5 rounded-md">
                      <span className="w-1.5 h-1.5 rounded-full bg-emerald-600 shrink-0 animate-pulse" />
                      <span>مفتوحة</span>
                    </span>
                  ) : (
                    <span className="inline-flex items-center gap-1 text-[10px] font-bold bg-slate-100 text-slate-600 border border-slate-200 px-2 py-0.5 rounded-md">
                      <span className="w-1.5 h-1.5 rounded-full bg-slate-400 shrink-0" />
                      <span>مغلقة</span>
                    </span>
                  )}

                  {(pharmacy.isOnDuty || statusInfo.isOnDutyToday || statusInfo.isDutyActiveNow) && (
                    <span className="inline-flex items-center gap-1 text-[10px] font-black bg-blue-600 text-white px-2 py-0.5 rounded-md shadow-2xs">
                      <Moon className="w-3 h-3 text-blue-100 shrink-0" />
                      <span>مناوبة</span>
                    </span>
                  )}
                </div>

                {/* Bottom Row Actions */}
                <div className="pt-1.5 border-t border-slate-100 flex items-center justify-between gap-1 text-xs">
                  <div className="flex items-center gap-1">
                    {pharmacy.phone && (
                      <a
                        href={`tel:${pharmacy.phone}`}
                        onClick={(e) => e.stopPropagation()}
                        className="inline-flex items-center gap-1 bg-emerald-700 hover:bg-emerald-800 text-white font-bold text-[11px] px-2 py-1 rounded-lg active:scale-95 transition"
                      >
                        <Phone className="w-3 h-3" />
                        <span>اتصال</span>
                      </a>
                    )}
                    <span className="inline-flex items-center gap-0.5 text-emerald-800 bg-emerald-50 hover:bg-emerald-100 font-bold text-[11px] px-2 py-1 rounded-lg border border-emerald-200/60">
                      <Compass className="w-3 h-3" />
                      <span>الخريطة</span>
                    </span>
                  </div>

                  <span className="inline-flex items-center gap-0.5 text-[10px] font-bold text-amber-700 bg-amber-50 px-1.5 py-0.5 rounded-md border border-amber-200/50">
                    <Star className="w-3 h-3 fill-amber-400 text-amber-500 shrink-0" />
                    <span>{pharmacy.rating || 4.8}</span>
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
