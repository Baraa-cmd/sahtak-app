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

        {/* Specialties Select Dropdown */}
        <div className="relative pt-1">
          <select
            value={selectedSpecialty}
            onChange={(e) => setSelectedSpecialty(e.target.value)}
            className="w-full bg-teal-950/70 border border-teal-700/70 rounded-2xl px-4 py-2.5 text-xs font-black text-white focus:outline-none focus:ring-2 focus:ring-teal-400 cursor-pointer appearance-none"
          >
            <option value="all" className="bg-teal-900 text-white font-bold">
              جميع الاختصاصات الطبية ({doctors.length})
            </option>
            {specialties.map((spec) => (
              <option key={spec} value={spec} className="bg-teal-900 text-white font-bold">
                {spec}
              </option>
            ))}
          </select>
          <div className="absolute left-3.5 top-3.5 pointer-events-none text-teal-300 text-xs font-bold">
            ▼
          </div>
        </div>
      </div>

      {/* Doctors List */}
      <div className="grid grid-cols-2 gap-2.5 sm:gap-3">
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
            className="bg-white rounded-2xl p-3 border border-slate-200/90 shadow-2xs hover:border-teal-600 transition-all cursor-pointer space-y-2 flex flex-col justify-between"
          >
            {/* Header: Name, Specialty & Location */}
            <div className="space-y-1">
              <div className="flex items-start justify-between gap-1">
                <h3 className="font-black text-slate-900 text-xs sm:text-sm line-clamp-1 leading-snug">
                  {doc.name}
                </h3>
                <span className="text-[10px] font-bold text-teal-800 bg-teal-50 px-1.5 py-0.5 rounded-md border border-teal-200/60 shrink-0">
                  {doc.specialty}
                </span>
              </div>

              <p className="text-[11px] text-slate-500 font-medium flex items-center gap-1 line-clamp-1">
                <MapPin className="w-3 h-3 text-slate-400 shrink-0" />
                <span>{doc.district} • {doc.distanceKm !== undefined ? `${doc.distanceKm.toFixed(1)} كم` : 'دير حافر'}</span>
              </p>
            </div>

            {/* Availability Badge */}
            <div className="flex items-center gap-1">
              <span
                className={`px-2 py-0.5 rounded-md text-[10px] font-bold inline-flex items-center gap-1 ${
                  doc.isAvailableToday
                    ? 'bg-emerald-50 text-emerald-800 border border-emerald-200'
                    : 'bg-slate-100 text-slate-600 border border-slate-200'
                }`}
              >
                <span
                  className={`w-1.5 h-1.5 rounded-full ${
                    doc.isAvailableToday ? 'bg-emerald-600 animate-pulse' : 'bg-slate-400'
                  }`}
                />
                <span>{doc.isAvailableToday ? 'متواجد اليوم' : 'غير متواجد'}</span>
              </span>
            </div>

            {/* Actions Row */}
            <div className="pt-1.5 border-t border-slate-100 flex items-center justify-between gap-1 text-xs">
              <div className="flex items-center gap-1">
                {doc.phone && (
                  <a
                    href={`tel:${doc.phone}`}
                    onClick={(e) => e.stopPropagation()}
                    className="inline-flex items-center gap-1 bg-teal-700 hover:bg-teal-800 text-white font-bold text-[11px] px-2 py-1 rounded-lg active:scale-95 transition"
                  >
                    <Phone className="w-3 h-3" />
                    <span>اتصال</span>
                  </a>
                )}
                <span className="inline-flex items-center gap-0.5 text-teal-800 bg-teal-50 hover:bg-teal-100 font-bold text-[11px] px-2 py-1 rounded-lg border border-teal-200/60">
                  <Compass className="w-3 h-3" />
                  <span>الخريطة</span>
                </span>
              </div>

              <span className="inline-flex items-center gap-0.5 text-[10px] font-bold text-amber-700 bg-amber-50 px-1.5 py-0.5 rounded-md border border-amber-200/50">
                <Star className="w-3 h-3 fill-amber-400 text-amber-500 shrink-0" />
                <span>{doc.rating || 4.8}</span>
              </span>
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
