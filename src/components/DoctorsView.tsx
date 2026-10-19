import React, { useState, useMemo } from 'react';
import { Doctor } from '../types';
import { Stethoscope, MapPin, Phone, Search, Star, Compass, ShieldCheck } from 'lucide-react';

interface DoctorsViewProps {
  doctors: Doctor[];
  onSelectOnMap: (target: {
    id: string;
    type: 'doctor';
    name: string;
    latitude: number;
    longitude: number;
    district: string;
    distanceKm?: number;
  }) => void;
  onOpenRatingModal?: (target: {
    id: string;
    name: string;
    type: 'doctor';
    currentRating?: number;
  }) => void;
}

export const DoctorsView: React.FC<DoctorsViewProps> = ({
  doctors,
  onSelectOnMap,
  onOpenRatingModal
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedSpecialty, setSelectedSpecialty] = useState<string>('all');

  const specialties = useMemo(() => {
    const set = new Set<string>();
    doctors.forEach((d) => {
      if (d.specialty) set.add(d.specialty);
    });
    return Array.from(set);
  }, [doctors]);

  const filteredDoctors = useMemo(() => {
    let list = [...doctors];

    if (selectedSpecialty !== 'all') {
      list = list.filter((d) => d.specialty === selectedSpecialty);
    }

    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase().trim();
      list = list.filter(
        (d) =>
          d.name.toLowerCase().includes(q) ||
          d.specialty.toLowerCase().includes(q) ||
          d.district.toLowerCase().includes(q) ||
          d.clinicAddress.toLowerCase().includes(q)
      );
    }

    return list.sort((a, b) => {
      if (a.distanceKm !== undefined && b.distanceKm !== undefined) {
        return a.distanceKm - b.distanceKm;
      }
      return (b.rating || 4.8) - (a.rating || 4.8);
    });
  }, [doctors, searchQuery, selectedSpecialty]);

  return (
    <div className="pb-24 md:pb-12 px-3 sm:px-4 lg:px-6 pt-3 max-w-6xl mx-auto space-y-3.5">
      {/* Header Card */}
      <div className="bg-gradient-to-br from-teal-800 to-emerald-950 text-white rounded-3xl p-4 shadow-sm space-y-3">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-xl font-black tracking-tight mb-1">أطباء وعيادات دير حافر</h2>
            <p className="text-xs text-teal-100 font-medium">
              دليل الأطباء الاختصاصيين • عناوين العيادات وأوقات الدوام
            </p>
          </div>

          <span className="bg-white/15 px-3 py-1.5 rounded-full text-xs font-black backdrop-blur-xs flex items-center gap-1.5">
            <Stethoscope className="w-4 h-4 text-teal-300" />
            <span>{doctors.length} طبيب</span>
          </span>
        </div>

        {/* Search Input */}
        <div className="relative">
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="بحث باسم الطبيب، الاختصاص، أو الحي..."
            className="w-full bg-teal-950/60 border border-teal-700/60 rounded-2xl px-4 py-2.5 pr-10 text-xs font-bold text-white placeholder-teal-300/70 focus:outline-none focus:ring-2 focus:ring-teal-400"
          />
          <Search className="w-4 h-4 text-teal-300 absolute right-3.5 top-3" />
        </div>

        {/* Specialties Filter Pills */}
        <div className="flex items-center gap-1.5 overflow-x-auto no-scrollbar pt-1 text-xs">
          <button
            onClick={() => setSelectedSpecialty('all')}
            className={`px-3 py-1.5 rounded-xl font-black transition shrink-0 cursor-pointer ${
              selectedSpecialty === 'all'
                ? 'bg-white text-teal-950 shadow-xs'
                : 'bg-teal-950/50 text-teal-100 hover:bg-teal-900 border border-teal-700/40'
            }`}
          >
            جميع الاختصاصات ({doctors.length})
          </button>
          {specialties.map((spec) => (
            <button
              key={spec}
              onClick={() => setSelectedSpecialty(spec)}
              className={`px-3 py-1.5 rounded-xl font-black transition shrink-0 cursor-pointer ${
                selectedSpecialty === spec
                  ? 'bg-white text-teal-950 shadow-xs'
                  : 'bg-teal-950/50 text-teal-100 hover:bg-teal-900 border border-teal-700/40'
              }`}
            >
              {spec}
            </button>
          ))}
        </div>
      </div>

      {/* Doctors List */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
        {filteredDoctors.map((doc) => (
          <div
            key={doc.id}
            onClick={() =>
              onSelectOnMap({
                id: doc.id,
                type: 'doctor',
                name: doc.name,
                latitude: doc.latitude,
                longitude: doc.longitude,
                district: doc.district,
                distanceKm: doc.distanceKm
              })
            }
            className="bg-white rounded-3xl p-4 shadow-sm hover:shadow-md border border-slate-200/80 transition-all cursor-pointer space-y-3 group"
          >
            {/* Top Row: Name, Specialty & Availability */}
            <div className="flex items-start justify-between gap-2">
              <div>
                <div className="flex items-center gap-2 flex-wrap">
                  <h3 className="text-base font-black text-slate-900 group-hover:text-teal-800 transition-colors">
                    {doc.name}
                  </h3>
                  <span className="inline-flex items-center gap-1 text-[10px] font-black bg-teal-50 text-teal-800 px-2 py-0.5 rounded-full border border-teal-200">
                    <ShieldCheck className="w-3 h-3 text-teal-600 shrink-0" />
                    <span>{doc.specialty}</span>
                  </span>
                </div>
                <p className="text-xs text-slate-500 font-medium mt-1 flex items-center gap-1">
                  <MapPin className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                  <span>{doc.district} - {doc.clinicAddress}</span>
                </p>
              </div>

              <div className="flex flex-col items-end gap-1 shrink-0">
                <span
                  className={`px-2.5 py-1 rounded-full text-[10px] font-black inline-flex items-center gap-1 shadow-2xs ${
                    doc.isAvailableToday
                      ? 'bg-emerald-100 text-emerald-800 border border-emerald-300'
                      : 'bg-slate-100 text-slate-600 border border-slate-200'
                  }`}
                >
                  <span
                    className={`w-1.5 h-1.5 rounded-full ${
                      doc.isAvailableToday ? 'bg-emerald-600 animate-pulse' : 'bg-slate-400'
                    }`}
                  />
                  <span>{doc.isAvailableToday ? 'مستقبل اليوم' : 'غير متواجد اليوم'}</span>
                </span>
                {doc.distanceKm !== undefined && (
                  <span className="text-[10px] font-bold text-slate-500 bg-slate-100 px-2 py-0.5 rounded-lg">
                    يبعد {doc.distanceKm.toFixed(1)} كم
                  </span>
                )}
              </div>
            </div>

            {/* Working Hours & Fees */}
            <div className="bg-slate-50 rounded-2xl p-2.5 border border-slate-200/60 text-xs space-y-1 font-semibold text-slate-700">
              <div className="flex items-center justify-between">
                <span className="text-slate-500 text-[11px]">أوقات العيادة:</span>
                <span className="text-slate-900 font-bold">{doc.workingHours}</span>
              </div>
              {doc.consultationFee && (
                <div className="flex items-center justify-between border-t border-slate-200/60 pt-1">
                  <span className="text-slate-500 text-[11px]">سعر الكشفية:</span>
                  <span className="text-teal-700 font-black">{doc.consultationFee}</span>
                </div>
              )}
            </div>

            {/* Actions Row */}
            <div className="pt-1 flex items-center justify-between gap-2 border-t border-slate-100">
              <div className="flex items-center gap-2">
                <span className="text-teal-700 font-black flex items-center gap-1 bg-teal-50 px-2.5 py-1 rounded-xl border border-teal-200/80 text-xs">
                  <Compass className="w-3.5 h-3.5 shrink-0" />
                  <span>مسار الخريطة</span>
                </span>

                {doc.phone && (
                  <a
                    href={`tel:${doc.phone}`}
                    onClick={(e) => e.stopPropagation()}
                    className="inline-flex items-center gap-1 bg-teal-700 hover:bg-teal-800 text-white font-black text-xs px-2.5 py-1 rounded-xl shadow-2xs active:scale-95 transition cursor-pointer"
                    title="اتصال هاتفي بالعيادة"
                  >
                    <Phone className="w-3 h-3 text-white shrink-0" />
                    <span>اتصال</span>
                  </a>
                )}
              </div>

              {/* Star Rating Button */}
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  onOpenRatingModal?.({
                    id: doc.id,
                    name: doc.name,
                    type: 'doctor',
                    currentRating: doc.rating
                  });
                }}
                className="inline-flex items-center gap-1 text-[11px] font-bold text-amber-700 hover:text-amber-800 bg-amber-50 hover:bg-amber-100 px-2 py-1 rounded-xl border border-amber-200 transition cursor-pointer"
              >
                <Star className="w-3 h-3 fill-amber-400 text-amber-500 shrink-0" />
                <span>{doc.rating || 4.8} ({doc.ratingsCount || 20})</span>
              </button>
            </div>
          </div>
        ))}

        {filteredDoctors.length === 0 && (
          <div className="col-span-full py-12 text-center text-slate-500 space-y-2 bg-white rounded-3xl border border-slate-200">
            <Stethoscope className="w-10 h-10 text-slate-300 mx-auto" />
            <p className="font-bold text-sm">لا توجد نتائج مطابقة لبحثك</p>
          </div>
        )}
      </div>
    </div>
  );
};
