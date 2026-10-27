import React, { useState, useMemo } from 'react';
import {
  FlaskConical,
  PhoneCall,
  MapPin,
  Compass,
  Search,
  Star,
  Clock,
  Share2,
  ShieldCheck,
  ChevronLeft,
  MessageSquarePlus,
  AlertCircle,
  Scan,
  Activity
} from 'lucide-react';
import { MedicalLab, SelectedRouteTarget } from '../types';
import { formatDistanceMetersOrKm } from '../lib/initialData';
import { offlineStorage } from '../lib/offlineStorage';

interface LabsViewProps {
  labs: MedicalLab[];
  onSelectOnMap: (target: SelectedRouteTarget) => void;
  onOpenCommunityReport: (target: {
    id: string;
    name: string;
    type: 'lab';
    district?: string;
    currentPhone?: string;
  }) => void;
  onOpenRatingModal?: (target: {
    id: string;
    name: string;
    type: 'lab';
    currentRating?: number;
  }) => void;
}

type LabFilterTab = 'nearest' | 'laboratory' | 'radiology' | 'favorites' | 'all';

export const LabsView: React.FC<LabsViewProps> = ({
  labs,
  onSelectOnMap,
  onOpenCommunityReport,
  onOpenRatingModal
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [filterTab, setFilterTab] = useState<LabFilterTab>('nearest');
  const [favorites, setFavorites] = useState<string[]>(() => offlineStorage.getFavorites());

  const handleToggleFavorite = (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    offlineStorage.toggleFavorite(id);
    setFavorites(offlineStorage.getFavorites());
  };

  // Feature 12: مشاركة بيانات المخبر / مركز الأشعة عبر واتساب بنقرة واحدة
  const handleShareLab = (l: MedicalLab, e: React.MouseEvent) => {
    e.stopPropagation();
    const text = `🔬 *${l.name}* (${l.typeName}) - منصة صحتك (دير حافر)
📍 *الموقع:* دير حافر - ${l.district} - ${l.address}
⏰ *ساعات العمل:* ${l.workingHours}
${l.emergencyOnCall ? '🚨 *طوارئ:* متاح بالاتصال عند الحالات الحرجة\n' : ''}📞 *رقم الهاتف:* ${l.phone}
🛠️ *التحاليل والخدمات:* ${l.services.join('، ')}
🗺️ *الموقع على الخريطة:* https://www.google.com/maps?q=${l.latitude},${l.longitude}`;

    if (navigator.share) {
      navigator.share({ title: l.name, text }).catch(() => {});
    } else {
      window.open(`https://wa.me/?text=${encodeURIComponent(text)}`, '_blank');
    }
  };

  const filteredLabs = useMemo(() => {
    let list = [...labs];

    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase().trim();
      list = list.filter(
        (l) =>
          l.name.toLowerCase().includes(q) ||
          l.district.toLowerCase().includes(q) ||
          l.address.toLowerCase().includes(q) ||
          l.typeName.toLowerCase().includes(q) ||
          l.services.some((s) => s.toLowerCase().includes(q))
      );
    }

    if (filterTab === 'laboratory') {
      list = list.filter((l) => l.type === 'laboratory' || l.type === 'comprehensive');
    } else if (filterTab === 'radiology') {
      list = list.filter((l) => l.type === 'radiology' || l.type === 'comprehensive');
    } else if (filterTab === 'favorites') {
      list = list.filter((l) => favorites.includes(l.id));
    }

    // Sort by nearest distance
    return list.sort((a, b) => (a.distanceKm ?? 999) - (b.distanceKm ?? 999));
  }, [labs, searchQuery, filterTab, favorites]);

  return (
    <div className="pb-24 md:pb-12 px-3 sm:px-4 lg:px-6 pt-3 max-w-6xl mx-auto space-y-3.5">
      {/* Header Card */}
      <div className="bg-gradient-to-br from-teal-800 via-teal-900 to-emerald-950 text-white rounded-3xl p-4 shadow-sm space-y-2.5">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-1.5 text-[11px] font-bold bg-white/15 px-2.5 py-0.5 rounded-full w-fit backdrop-blur-xs">
            <FlaskConical className="w-3.5 h-3.5 text-teal-300" />
            <span>المختبرات والتشخيص الطبي</span>
          </div>

          <span className="text-xs font-black bg-teal-950/70 px-2.5 py-1 rounded-full border border-teal-500/40 text-teal-200">
            {labs.length} مراكز معتمدة
          </span>
        </div>

        <div>
          <h2 className="text-xl font-black tracking-tight">المخابر ومراكز الأشعة</h2>
          <p className="text-xs text-teal-100 font-medium">
            مخابر التحاليل الطبية • التصوير الشعاعي والإيكو • دير حافر
          </p>
        </div>

        {/* Clean Filter Tabs */}
        <div className="grid grid-cols-5 gap-1 bg-teal-950/50 p-1 rounded-2xl border border-teal-700/40 text-[11px]">
          <button
            onClick={() => setFilterTab('nearest')}
            className={`py-1.5 rounded-xl font-bold transition flex items-center justify-center gap-0.5 ${
              filterTab === 'nearest'
                ? 'bg-white text-teal-950 shadow-xs'
                : 'text-teal-200 hover:text-white'
            }`}
          >
            <span>📍 الأقرب</span>
          </button>
          <button
            onClick={() => setFilterTab('laboratory')}
            className={`py-1.5 rounded-xl font-bold transition flex items-center justify-center gap-0.5 ${
              filterTab === 'laboratory'
                ? 'bg-white text-teal-950 shadow-xs'
                : 'text-teal-200 hover:text-white'
            }`}
          >
            <span>🔬 تحاليل</span>
          </button>
          <button
            onClick={() => setFilterTab('radiology')}
            className={`py-1.5 rounded-xl font-bold transition flex items-center justify-center gap-0.5 ${
              filterTab === 'radiology'
                ? 'bg-white text-teal-950 shadow-xs'
                : 'text-teal-200 hover:text-white'
            }`}
          >
            <span>🩻 أشعة</span>
          </button>
          <button
            onClick={() => setFilterTab('favorites')}
            className={`py-1.5 rounded-xl font-bold transition flex items-center justify-center gap-0.5 ${
              filterTab === 'favorites'
                ? 'bg-white text-teal-950 shadow-xs'
                : 'text-teal-200 hover:text-white'
            }`}
          >
            <span>⭐ المفضلة</span>
          </button>
          <button
            onClick={() => setFilterTab('all')}
            className={`py-1.5 rounded-xl font-bold transition flex items-center justify-center gap-0.5 ${
              filterTab === 'all'
                ? 'bg-white text-teal-950 shadow-xs'
                : 'text-teal-200 hover:text-white'
            }`}
          >
            <span>📋 الكل</span>
          </button>
        </div>
      </div>

      {/* Search Input Bar */}
      <div className="relative">
        <Search className="w-4 h-4 text-slate-400 absolute right-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
        <input
          type="text"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          placeholder="ابحث باسم المخبر، الفحص (دم، سكر، هرمونات، أشعة)..."
          className="w-full bg-white pr-10 pl-9 py-2.5 rounded-2xl border border-slate-200 text-xs focus:outline-teal-600 shadow-2xs placeholder:text-slate-400 font-medium"
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

      {/* Labs List */}
      <div className="grid grid-cols-2 gap-2.5 sm:gap-3.5">
        {filteredLabs.length === 0 ? (
          <div className="col-span-full bg-white rounded-3xl p-7 text-center border border-slate-200 shadow-2xs space-y-2">
            <AlertCircle className="w-8 h-8 text-slate-300 mx-auto" />
            <p className="text-xs font-bold text-slate-700">
              {filterTab === 'favorites'
                ? 'لم تقم بحفظ أي مخبر أو مركز أشعة في المفضلة بعد.'
                : 'لم يتم العثور على أي نتائج تطابق البحث.'}
            </p>
          </div>
        ) : (
          filteredLabs.map((lab) => {
            const distanceFmt = formatDistanceMetersOrKm(lab.distanceKm);
            const isFav = favorites.includes(lab.id);
            const isRadiology = lab.type === 'radiology';

            return (
              <div
                key={lab.id}
                onClick={() =>
                  onSelectOnMap({
                    id: lab.id,
                    type: 'lab',
                    name: lab.name,
                    latitude: lab.latitude,
                    longitude: lab.longitude,
                    distanceKm: lab.distanceKm,
                    district: lab.district
                  })
                }
                className="bg-white rounded-2xl p-3 border border-slate-200/90 shadow-2xs hover:border-teal-600 transition-all space-y-2 cursor-pointer relative flex flex-col justify-between"
              >
                {/* Header: Name, Distance & Favorite */}
                <div className="space-y-1">
                  <div className="flex items-start justify-between gap-1">
                    <h3 className="font-black text-slate-900 text-xs sm:text-sm line-clamp-1 leading-snug">
                      {lab.name}
                    </h3>

                    <button
                      type="button"
                      onClick={(e) => handleToggleFavorite(lab.id, e)}
                      title={isFav ? 'إزالة من المفضلة' : 'إضافة إلى المفضلة'}
                      className="p-1 rounded-lg text-slate-400 hover:text-amber-500 shrink-0 cursor-pointer"
                    >
                      <Star className={`w-3.5 h-3.5 ${isFav ? 'fill-amber-400 text-amber-500' : ''}`} />
                    </button>
                  </div>

                  <p className="text-[11px] text-slate-500 font-medium flex items-center gap-1 line-clamp-1">
                    <MapPin className="w-3 h-3 text-slate-400 shrink-0" />
                    <span>{lab.district} • {distanceFmt.full}</span>
                  </p>
                </div>

                {/* Type Badge */}
                <div className="flex items-center gap-1">
                  <span className={`px-2 py-0.5 rounded-md text-[10px] font-bold ${
                    isRadiology
                      ? 'bg-indigo-50 text-indigo-800 border border-indigo-200'
                      : 'bg-teal-50 text-teal-800 border border-teal-200'
                  }`}>
                    {lab.typeName}
                  </span>
                </div>

                {/* Actions Row */}
                <div className="pt-1.5 border-t border-slate-100 flex items-center justify-between gap-1 text-xs">
                  <div className="flex items-center gap-1">
                    {lab.phone && (
                      <a
                        href={`tel:${lab.phone}`}
                        onClick={(e) => e.stopPropagation()}
                        className="inline-flex items-center gap-1 bg-teal-700 hover:bg-teal-800 text-white font-bold text-[11px] px-2 py-1 rounded-lg active:scale-95 transition"
                      >
                        <PhoneCall className="w-3 h-3" />
                        <span>اتصال</span>
                      </a>
                    )}
                    <span className="inline-flex items-center gap-0.5 text-teal-800 bg-teal-50 hover:bg-teal-100 font-bold text-[11px] px-2 py-1 rounded-lg border border-teal-200/60">
                      <Compass className="w-3 h-3 text-teal-700" />
                      <span>الخريطة</span>
                    </span>
                  </div>

                  <span className="inline-flex items-center gap-0.5 text-[10px] font-bold text-amber-700 bg-amber-50 px-1.5 py-0.5 rounded-md border border-amber-200/50">
                    <Star className="w-3 h-3 fill-amber-400 text-amber-500 shrink-0" />
                    <span>{lab.rating || 4.8}</span>
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
