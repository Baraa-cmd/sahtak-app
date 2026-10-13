import React, { useState, useMemo, useEffect } from 'react';
import {
  Search,
  MapPin,
  Clock,
  Compass,
  AlertCircle,
  Timer,
  ChevronLeft,
  MessageSquarePlus,
  CheckCircle2,
  Star,
  ShieldCheck,
  Activity,
  Heart,
  Droplet,
  Share2
} from 'lucide-react';
import { Pharmacy, SelectedRouteTarget, DutyScheduleConfig } from '../types';
import {
  formatArabicTime,
  formatDistanceMetersOrKm,
  calculateRemainingDutyTime,
  DEFAULT_DUTY_SCHEDULE,
  getDutyShiftInfo
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

type FilterTab = 'nearest' | 'on_duty' | 'favorites' | 'all';

export const PharmaciesView: React.FC<PharmaciesViewProps> = ({
  pharmacies,
  onSelectOnMap,
  onOpenCommunityReport,
  onOpenRatingModal,
  dutySchedule = DEFAULT_DUTY_SCHEDULE
}) => {
  const [filterTab, setFilterTab] = useState<FilterTab>('nearest');
  const [searchQuery, setSearchQuery] = useState('');
  const [favorites, setFavorites] = useState<string[]>(() => offlineStorage.getFavorites());

  // Live timer tick for duty countdown (Feature 3)
  const [, setTick] = useState(0);
  useEffect(() => {
    const interval = setInterval(() => setTick((t) => t + 1), 1000);
    return () => clearInterval(interval);
  }, []);

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

  // Helper to determine real-time status (Feature 11 & Admin Configured Schedule)
  const getSmartStatus = (pharmacy: Pharmacy) => {
    if (pharmacy.isOnDuty) {
      // 24-hour continuous emergency duty
      if (pharmacy.dutyHours?.includes('24') || pharmacy.dutyEndTime?.includes('24')) {
        return {
          label: 'مناوبة مستمرة 24 ساعة 🟢',
          badgeClass: 'bg-emerald-100 text-emerald-800 border-emerald-300',
          dotClass: 'bg-emerald-600 animate-pulse',
          isOpen: true
        };
      }

      if (currentShiftInfo.isWithinShift) {
        return {
          label: `${currentShiftInfo.shiftName} مفتوحة الآن`,
          badgeClass: 'bg-emerald-100 text-emerald-800 border-emerald-300',
          dotClass: 'bg-emerald-600 animate-pulse',
          isOpen: true
        };
      } else if (currentShiftInfo.isShiftEnded) {
        return {
          label: `مناوبة منتهية (انتهت ${currentShiftInfo.closingTimeArabic})`,
          badgeClass: 'bg-rose-50 text-rose-800 border-rose-200',
          dotClass: 'bg-rose-500',
          isOpen: false
        };
      } else if (currentShiftInfo.isBeforeShift) {
        return {
          label: `مناوبة اليوم (تبدأ ${currentShiftInfo.isFriday ? '9:00 ص' : '9:00 م'})`,
          badgeClass: 'bg-amber-50 text-amber-800 border-amber-200',
          dotClass: 'bg-amber-500',
          isOpen: false
        };
      } else {
        return {
          label: `مناوبة منتهية (${currentShiftInfo.closingTimeArabic})`,
          badgeClass: 'bg-slate-100 text-slate-700 border-slate-200',
          dotClass: 'bg-slate-400',
          isOpen: false
        };
      }
    }

    const currentHour = new Date().getHours();
    // Regular business hours in Dayr Hafir (8:00 AM to 9:00 PM)
    const isDayTime = currentHour >= 8 && currentHour < 21;

    if (pharmacy.isOpen || isDayTime) {
      return {
        label: 'مفتوحة الآن (دوام اعتيادي)',
        badgeClass: 'bg-teal-50 text-teal-700 border-teal-200',
        dotClass: 'bg-teal-500',
        isOpen: true
      };
    }

    return {
      label: 'مغلقة حالياً (تفتح 8:00 ص)',
      badgeClass: 'bg-rose-50 text-rose-700 border-rose-200',
      dotClass: 'bg-rose-500',
      isOpen: false
    };
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
    if (filterTab === 'on_duty') {
      return list.filter((p) => p.isOnDuty);
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

  // Active duty count: 0 if shift ended (unless 24/7), actual count if within shift
  const activeNowCount = useMemo(() => {
    if (currentShiftInfo.isWithinShift) {
      return pharmacies.filter((p) => p.isOnDuty).length;
    }
    // If shift ended or before shift, only 24-hour pharmacies are actively open on duty
    return pharmacies.filter((p) => p.isOnDuty && (p.dutyHours?.includes('24') || p.dutyEndTime?.includes('24'))).length;
  }, [pharmacies, currentShiftInfo]);

  const scheduledCount = useMemo(
    () => pharmacies.filter((p) => p.isOnDuty).length,
    [pharmacies]
  );

  return (
    <div className="pb-24 md:pb-12 px-3 sm:px-4 lg:px-6 pt-3 max-w-6xl mx-auto space-y-3.5">
      {/* Header Card */}
      <div className="bg-gradient-to-br from-emerald-800 via-emerald-800 to-teal-900 text-white rounded-3xl p-4 shadow-sm space-y-2.5">
        <div className="flex items-center justify-between">
          <span className="text-[11px] font-bold bg-white/15 px-2.5 py-0.5 rounded-full backdrop-blur-xs">
            منطقة دير حافر • ريف حلب
          </span>
          <button
            onClick={() => setFilterTab('on_duty')}
            className={`flex items-center gap-1.5 text-xs font-black px-3 py-1 rounded-full border transition active:scale-95 shadow-2xs ${
              currentShiftInfo.isWithinShift
                ? 'bg-emerald-950/70 hover:bg-emerald-950 border-emerald-400/40 text-emerald-200'
                : currentShiftInfo.isShiftEnded
                ? 'bg-slate-900/80 hover:bg-slate-900 border-rose-400/40 text-rose-200'
                : 'bg-amber-950/70 hover:bg-amber-950 border-amber-400/40 text-amber-200'
            }`}
          >
            {currentShiftInfo.isWithinShift ? (
              <>
                <span className="w-2 h-2 rounded-full bg-emerald-300 animate-ping" />
                <span>{activeNowCount} صيدليات مناوبة الآن</span>
              </>
            ) : currentShiftInfo.isShiftEnded ? (
              <>
                <span className="w-2 h-2 rounded-full bg-rose-400" />
                <span>انتهت مناوبة الليلة ({currentShiftInfo.closingTimeArabic})</span>
              </>
            ) : (
              <>
                <span className="w-2 h-2 rounded-full bg-amber-400" />
                <span>{scheduledCount} صيدليات مناوبة الليلة</span>
              </>
            )}
          </button>
        </div>

        <div>
          <h2 className="text-xl font-black tracking-tight">صيدليات دير حافر</h2>
          <p className="text-xs text-emerald-100 font-medium">
            تحديث مباشر للمناوبات الليلية • أوقات الدوام والمسافة
          </p>
        </div>

        {/* Duty Schedule Info Banner (Regular: 9:00 PM - 12:00 AM | Friday: 9:00 AM - 12:00 PM) */}
        <div className="bg-emerald-950/50 p-2.5 rounded-2xl border border-emerald-600/40 text-xs space-y-1">
          <div className="flex items-center justify-between font-black">
            <span className="flex items-center gap-1.5 text-amber-300 text-xs">
              <span>⏰</span>
              <span>{currentShiftInfo.isFriday ? 'مناوبة يوم الجمعة' : 'المناوبة الليلية المعتمدة'}</span>
            </span>
            <span
              className={`text-[10px] px-2 py-0.5 rounded-full font-black ${
                currentShiftInfo.isWithinShift
                  ? 'bg-emerald-400 text-emerald-950 animate-pulse'
                  : currentShiftInfo.isShiftEnded
                  ? 'bg-rose-500/30 text-rose-200 border border-rose-400/30'
                  : 'bg-amber-500/30 text-amber-200 border border-amber-400/30'
              }`}
            >
              {currentShiftInfo.isWithinShift
                ? 'مفتوحة الآن 🟢'
                : currentShiftInfo.isShiftEnded
                ? `انتهت المناوبة (${currentShiftInfo.closingTimeArabic}) 🌙`
                : 'بانتظار بدء المناوبة ⏳'}
            </span>
          </div>

          <div className="text-[11px] text-emerald-100 font-medium">
            {currentShiftInfo.isFriday ? (
              <span>يوم الجمعة: <strong className="text-white">{dutySchedule.fridayLabel}</strong></span>
            ) : (
              <span>الأيام الاعتيادية: <strong className="text-white">{dutySchedule.regularLabel}</strong></span>
            )}
          </div>

          <div className="text-[10px] text-emerald-300/80">
            {currentShiftInfo.isFriday ? (
              <span>(باقي أيام الأسبوع: {dutySchedule.regularLabel})</span>
            ) : (
              <span>(ويوم الجمعة: {dutySchedule.fridayLabel})</span>
            )}
          </div>
        </div>

        {/* Clean Filter Tabs (Feature 16 & 26) */}
        <div className="grid grid-cols-4 gap-1.5 bg-emerald-950/40 p-1 rounded-2xl border border-emerald-700/50 text-xs">
          <button
            onClick={() => setFilterTab('nearest')}
            className={`py-1.5 rounded-xl font-bold transition flex items-center justify-center gap-1 ${
              filterTab === 'nearest'
                ? 'bg-white text-emerald-900 shadow-xs'
                : 'text-emerald-200 hover:text-white'
            }`}
          >
            <span>📍 الأقرب</span>
          </button>
          <button
            onClick={() => setFilterTab('on_duty')}
            className={`py-1.5 rounded-xl font-bold transition flex items-center justify-center gap-1 ${
              filterTab === 'on_duty'
                ? 'bg-white text-emerald-900 shadow-xs'
                : 'text-emerald-200 hover:text-white'
            }`}
          >
            <span>🌙 المناوبة</span>
          </button>
          <button
            onClick={() => setFilterTab('favorites')}
            className={`py-1.5 rounded-xl font-bold transition flex items-center justify-center gap-1 ${
              filterTab === 'favorites'
                ? 'bg-white text-emerald-900 shadow-xs'
                : 'text-emerald-200 hover:text-white'
            }`}
          >
            <span>⭐ المفضلة</span>
          </button>
          <button
            onClick={() => setFilterTab('all')}
            className={`py-1.5 rounded-xl font-bold transition flex items-center justify-center gap-1 ${
              filterTab === 'all'
                ? 'bg-white text-emerald-900 shadow-xs'
                : 'text-emerald-200 hover:text-white'
            }`}
          >
            <span>📋 الكل</span>
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
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3.5">
        {filteredPharmacies.length === 0 ? (
          <div className="col-span-full bg-white rounded-3xl p-7 text-center border border-slate-200 shadow-2xs space-y-2">
            <AlertCircle className="w-8 h-8 text-slate-300 mx-auto" />
            <p className="text-xs font-bold text-slate-700">
              {filterTab === 'on_duty'
                ? 'لا توجد صيدليات مناوبة حالياً'
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
                className={`bg-white rounded-3xl p-4 border transition-all cursor-pointer shadow-2xs hover:border-emerald-600 space-y-2.5 relative ${
                  isDuty
                    ? 'border-emerald-400 ring-2 ring-emerald-100 shadow-sm'
                    : 'border-slate-200'
                }`}
              >
                {/* Top Row: Name, Verified Badge, Favorite Button, Distance */}
                <div className="flex items-start justify-between gap-2">
                  <div className="space-y-1 flex-1">
                    <div className="flex items-center gap-1.5 flex-wrap">
                      <h3 className="font-black text-slate-900 text-sm">
                        {pharmacy.name}
                      </h3>

                      {/* Feature 29: نقابة الصيادلة - شارة التوثيق */}
                      {pharmacy.isVerified && (
                        <span
                          className="inline-flex items-center gap-0.5 text-[10px] font-bold bg-sky-50 text-sky-700 border border-sky-200/80 px-1.5 py-0.5 rounded-md"
                          title="صيدلية مرخصة وموثقة رسمياً في نقابة الصيادلة"
                        >
                          <ShieldCheck className="w-3 h-3 text-sky-600" />
                          <span>معتمدة</span>
                        </span>
                      )}

                      {/* Feature 11: مؤشر ذكي مفتوح / مغلق */}
                      <span
                        className={`inline-flex items-center gap-1 text-[10px] font-black border px-2 py-0.5 rounded-md ${statusInfo.badgeClass}`}
                      >
                        <span className={`w-1.5 h-1.5 rounded-full ${statusInfo.dotClass}`} />
                        <span>{statusInfo.label}</span>
                      </span>

                      {pharmacy.communityVerifiedAt && (
                        <span className="inline-flex items-center gap-1 text-[10px] font-bold bg-amber-50 text-amber-800 border border-amber-200/60 px-1.5 py-0.5 rounded-md">
                          <CheckCircle2 className="w-3 h-3 text-amber-600" />
                          <span>مؤكد مجتمعياً</span>
                        </span>
                      )}
                    </div>

                    <p className="text-xs text-slate-500 flex items-center gap-1">
                      <MapPin className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                      <span>{pharmacy.district} - {pharmacy.address}</span>
                    </p>
                  </div>

                  {/* Actions: Share ↗️, Favorite ⭐ and Distance (Feature 12 & 16) */}
                  <div className="flex items-center gap-1.5 shrink-0">
                    <button
                      type="button"
                      onClick={(e) => handleSharePharmacy(pharmacy, e)}
                      title="مشاركة الصيدلية عبر واتساب / وسائل التواصل (Feature 12)"
                      className="p-1.5 rounded-xl transition text-emerald-700 bg-emerald-50 hover:bg-emerald-100 border border-emerald-200 shadow-2xs active:scale-95"
                    >
                      <Share2 className="w-3.5 h-3.5" />
                    </button>

                    <button
                      type="button"
                      onClick={(e) => handleToggleFavorite(pharmacy.id, e)}
                      title={isFav ? 'إزالة من المفضلة' : 'إضافة إلى المفضلة'}
                      className={`p-1.5 rounded-xl transition ${
                        isFav
                          ? 'text-amber-500 bg-amber-50 border border-amber-200'
                          : 'text-slate-400 bg-slate-50 hover:bg-slate-100 border border-slate-100'
                      }`}
                    >
                      <Star className={`w-3.5 h-3.5 ${isFav ? 'fill-amber-400' : ''}`} />
                    </button>

                    <div className="text-left bg-emerald-50/70 border border-emerald-100 px-2 py-1 rounded-xl">
                      <span className="text-xs font-black text-emerald-900 block leading-tight">
                        {distanceFmt.full}
                      </span>
                      <span className="text-[9px] text-emerald-600 font-bold block">
                        عنك
                      </span>
                    </div>
                  </div>
                </div>

                {/* Duty Hours & Feature 3 Smart Duty Status & Countdown */}
                <div className="flex items-center justify-between text-[11px] bg-slate-50 rounded-2xl px-3 py-2 border border-slate-100 text-slate-600 flex-wrap gap-1.5">
                  <div className="flex items-center gap-1 font-medium">
                    <Clock className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                    <span>{formatArabicTime(pharmacy.dutyHours || (isDuty ? currentShiftInfo.scheduleLabel : 'دوام اعتيادي'))}</span>
                  </div>

                  {isDuty && countdown && (
                    <>
                      {countdown.state === 'active' && (
                        <div className="flex items-center gap-1 bg-emerald-50 text-emerald-900 border border-emerald-300 px-2 py-0.5 rounded-lg font-black text-[11px] animate-pulse">
                          <Timer className="w-3.5 h-3.5 text-emerald-600" />
                          <span>المناوبة جارية - ينتهي الدوام بعد: {countdown.text}</span>
                        </div>
                      )}

                      {countdown.state === 'before' && (
                        <div className="flex items-center gap-1 bg-amber-50 text-amber-900 border border-amber-200 px-2 py-0.5 rounded-lg font-bold text-[11px]">
                          <Timer className="w-3.5 h-3.5 text-amber-600" />
                          <span>تبدأ المناوبة بعد: {countdown.text} (الساعة {countdown.startTimeArabic})</span>
                        </div>
                      )}

                      {countdown.state === 'ended' && (
                        <div className="flex items-center gap-1 bg-slate-100 text-slate-600 border border-slate-200 px-2 py-0.5 rounded-lg font-bold text-[10px]">
                          <Clock className="w-3 h-3 text-slate-400" />
                          <span>انتهت المناوبة عند {countdown.endTimeArabic}</span>
                        </div>
                      )}
                    </>
                  )}

                  {!isDuty && pharmacy.dutyEndTime && (
                    <div className="flex items-center gap-1 text-slate-500 font-bold">
                      <Timer className="w-3 h-3" />
                      <span>حتى {formatArabicTime(pharmacy.dutyEndTime)}</span>
                    </div>
                  )}
                </div>

                {/* Feature 40: مؤشرات الخدمات الطبية (قياس ضغط وسكر مجاني) */}
                <div className="flex items-center gap-1.5 flex-wrap pt-0.5">
                  {pharmacy.hasFreeBloodPressureCheck && (
                    <span className="inline-flex items-center gap-1 text-[10px] font-bold bg-emerald-50 text-emerald-800 border border-emerald-200 px-2 py-0.5 rounded-lg">
                      <Activity className="w-3 h-3 text-emerald-600" />
                      <span>قياس ضغط (مجاني)</span>
                    </span>
                  )}
                  {pharmacy.hasFreeGlucoseCheck && (
                    <span className="inline-flex items-center gap-1 text-[10px] font-bold bg-teal-50 text-teal-800 border border-teal-200 px-2 py-0.5 rounded-lg">
                      <Droplet className="w-3 h-3 text-teal-600" />
                      <span>فحص سكري متاح</span>
                    </span>
                  )}
                  {pharmacy.services.slice(0, 2).map((srv, idx) => (
                    <span
                      key={idx}
                      className="text-[10px] text-slate-600 bg-slate-100 px-2 py-0.5 rounded-lg"
                    >
                      {srv}
                    </span>
                  ))}
                </div>

                {/* Bottom Row Actions: Route button, Rating button, Community Update */}
                <div className="flex items-center justify-between pt-1 border-t border-slate-100 text-xs">
                  <div className="flex items-center gap-3">
                    <span className="text-emerald-700 font-black flex items-center gap-1">
                      <Compass className="w-3.5 h-3.5" />
                      <span>مسار الخريطة</span>
                    </span>

                    {/* Feature 19: زر التقييم بالنجوم */}
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        onOpenRatingModal?.({
                          id: pharmacy.id,
                          name: pharmacy.name,
                          type: 'pharmacy',
                          currentRating: pharmacy.rating
                        });
                      }}
                      className="inline-flex items-center gap-1 text-[11px] font-bold text-amber-700 hover:text-amber-800 bg-amber-50 hover:bg-amber-100 px-2 py-0.5 rounded-lg border border-amber-200 transition"
                    >
                      <Star className="w-3 h-3 fill-amber-400 text-amber-500" />
                      <span>{pharmacy.rating || 4.8} ({pharmacy.ratingsCount || 20}) • تقييم</span>
                    </button>
                  </div>

                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        onOpenCommunityReport({
                          id: pharmacy.id,
                          name: pharmacy.name,
                          type: 'pharmacy',
                          district: pharmacy.district,
                          isOnDuty: pharmacy.isOnDuty
                        });
                      }}
                      title="مشاركة تحديث أو تصحيح معلومة حول هذه الصيدلية"
                      className="text-slate-600 hover:text-emerald-800 font-bold flex items-center gap-1 text-[11px] bg-slate-100 hover:bg-emerald-50 px-2 py-1 rounded-xl border border-slate-200/80 transition-colors"
                    >
                      <MessageSquarePlus className="w-3 h-3 text-emerald-700" />
                      <span>تحديث</span>
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
