import { Pharmacy, Nurse, Hospital, MedicalLab, BloodDonationRequest, DutyScheduleConfig, Doctor } from '../types';

// Default center coordinates for Dayr Hafir (دير حافر)
export const DAYR_HAFIR_DEFAULT = {
  latitude: 36.1575,
  longitude: 37.7058,
  districtName: 'دير حافر - الشارع العام'
};

export interface PresetDistrict {
  id: string;
  name: string;
  description: string;
  latitude: number;
  longitude: number;
}

export const DAYR_HAFIR_PRESETS: PresetDistrict[] = [
  {
    id: 'center',
    name: 'الشارع العام ودوار البلدية',
    description: 'وسط دير حافر - قرب مبنى دار البلدية',
    latitude: 36.1575,
    longitude: 37.7058
  },
  {
    id: 'market',
    name: 'دوار السوق المركزي',
    description: 'ساحة السوق والمحلات التجارية',
    latitude: 36.1601,
    longitude: 37.7085
  },
  {
    id: 'north',
    name: 'الحي الشمالي',
    description: 'شارع المركز الثقافي القديم والمنازل الشمالية',
    latitude: 36.1630,
    longitude: 37.7040
  },
  {
    id: 'south',
    name: 'الحي الجنوبي',
    description: 'قرب جامع دير حافر الكبير',
    latitude: 36.1520,
    longitude: 37.7070
  },
  {
    id: 'highway',
    name: 'طريق حلب - الرقة الدولي',
    description: 'مدخل دير حافر الغربي ونقطة الإسعاف',
    latitude: 36.1554,
    longitude: 37.7031
  },
  {
    id: 'health-center',
    name: 'شارع المستوصف والمركز الصحي',
    description: 'قرب مستوصف دير حافر الحكومي',
    latitude: 36.1565,
    longitude: 37.7088
  },
  {
    id: 'schools',
    name: 'شارع المدارس الثانوي',
    description: 'مجمع الثانويات والمدارس',
    latitude: 36.1590,
    longitude: 37.7015
  }
];

export const INITIAL_PHARMACIES: Pharmacy[] = [
  {
    id: 'ph-1',
    name: 'صيدلية دير حافر المركزية',
    district: 'الشارع العام',
    address: 'الشارع الرئيسي - مقابل دار البلدية',
    latitude: 36.1582,
    longitude: 37.7062,
    isOpen: true,
    isOnDuty: true,
    dutyDays: ['الجمعة', 'السبت'],
    dutyStartTime: '19:00',
    dutyEndTime: '06:00',
    regularClosingHour: 18,
    dutyHours: 'دوام يومي حتى 6:00 م • مناوبة الجمعة والسبت من 7:00 م حتى 6:00 ص',
    phone: '0944123456',
    services: ['أدوية طوارئ وإسعاف', 'مستلزمات طبية', 'حليب وأغذية أطفال'],
    hasFreeBloodPressureCheck: true,
    hasFreeGlucoseCheck: true,
    rating: 4.9,
    ratingsCount: 28,
    isVerified: true
  },
  {
    id: 'ph-2',
    name: 'صيدلية الشفاء',
    district: 'طريق حلب - الرقة',
    address: 'طريق حلب الدولي - مفرق السوق',
    latitude: 36.1554,
    longitude: 37.7031,
    isOpen: true,
    isOnDuty: true,
    dutyDays: ['الأحد', 'الأربعاء'],
    dutyStartTime: '20:00',
    dutyEndTime: '06:30',
    regularClosingHour: 18,
    dutyHours: 'دوام يومي حتى 6:00 م • مناوبة الأحد والأربعاء من 8:00 م حتى 6:30 ص',
    phone: '0955678901',
    services: ['أدوية الأمراض المزمنة', 'محاليل وإبر أنسولين', 'مسكنات'],
    hasFreeBloodPressureCheck: true,
    hasFreeGlucoseCheck: false,
    rating: 4.8,
    ratingsCount: 19,
    isVerified: true
  },
  {
    id: 'ph-4',
    name: 'صيدلية النور',
    district: 'الحي الشمالي',
    address: 'شارع المركز الثقافي القديم',
    latitude: 36.1630,
    longitude: 37.7040,
    isOpen: true,
    isOnDuty: true,
    dutyDays: ['الإثنين', 'الخميس'],
    dutyStartTime: '20:00',
    dutyEndTime: '07:00',
    regularClosingHour: 18,
    dutyHours: 'دوام يومي حتى 6:00 م • مناوبة الإثنين والخميس من 8:00 م حتى 7:00 ص',
    phone: '0933789012',
    services: ['مضادات حيوية', 'ضمادات وحروق', 'أدوية أطفال'],
    hasFreeBloodPressureCheck: true,
    hasFreeGlucoseCheck: true,
    rating: 4.7,
    ratingsCount: 15,
    isVerified: true
  },
  {
    id: 'ph-1791815686886',
    name: 'صيدلية النسيم',
    district: 'الشارع العام',
    address: 'وسط دير حافر - جانب الساحة',
    latitude: 36.1575,
    longitude: 37.7058,
    isOpen: true,
    isOnDuty: true,
    dutyDays: ['الثلاثاء'],
    dutyStartTime: '20:00',
    dutyEndTime: '00:00',
    regularClosingHour: 18,
    dutyHours: 'دوام يومي حتى 6:00 م • مناوبة الثلاثاء من 8:00 م حتى 12:00 ليلاً',
    phone: '0966456789',
    services: ['أدوية طوارئ وإسعاف', 'مستلزمات طبية'],
    hasFreeBloodPressureCheck: true,
    hasFreeGlucoseCheck: false,
    rating: 4.8,
    ratingsCount: 12,
    isVerified: true
  },
  {
    id: 'ph-1791815638244',
    name: 'صيدلية البراء',
    district: 'الشارع العام',
    address: 'الشارع العام - جانب البريد',
    latitude: 36.1575,
    longitude: 37.7058,
    isOpen: true,
    isOnDuty: false,
    dutyDays: ['السبت', 'الثلاثاء'],
    dutyStartTime: '19:30',
    dutyEndTime: '01:00',
    regularClosingHour: 18,
    dutyHours: 'دوام يومي حتى 6:00 م • مناوبة السبت والثلاثاء من 7:30 م حتى 1:00 ليلاً',
    phone: '0939318271',
    services: ['أدوية طوارئ وإسعاف', 'مستلزمات طبية'],
    hasFreeBloodPressureCheck: true,
    hasFreeGlucoseCheck: false,
    rating: 4.8,
    ratingsCount: 14,
    isVerified: true
  },
  {
    id: 'ph-3',
    name: 'صيدلية السلام',
    district: 'دوار السوق',
    address: 'ساحة السوق التجاري',
    latitude: 36.1601,
    longitude: 37.7085,
    isOpen: true,
    isOnDuty: false,
    dutyDays: ['الأحد', 'الخميس'],
    dutyStartTime: '20:00',
    dutyEndTime: '02:00',
    regularClosingHour: 18,
    dutyHours: 'دوام يومي حتى 6:00 م • مناوبة الأحد والخميس من 8:00 م حتى 2:00 ليلاً',
    phone: '0944567890',
    services: ['صرف وصفات', 'فيتامينات ومقويات', 'قياس ضغط وسكر'],
    hasFreeBloodPressureCheck: true,
    hasFreeGlucoseCheck: true,
    rating: 4.6,
    ratingsCount: 22,
    isVerified: true
  },
  {
    id: 'ph-5',
    name: 'صيدلية الأمل',
    district: 'الحي الجنوبي',
    address: 'قرب جامع دير حافر الكبير',
    latitude: 36.1520,
    longitude: 37.7070,
    isOpen: true,
    isOnDuty: false,
    dutyDays: ['الإثنين', 'الأربعاء'],
    dutyStartTime: '20:00',
    dutyEndTime: '00:00',
    regularClosingHour: 18,
    dutyHours: 'دوام يومي حتى 6:00 م • مناوبة الإثنين والأربعاء من 8:00 م حتى 12:00 ليلاً',
    phone: '0988123456',
    services: ['عناية شخصية', 'أجهزة تنفس وبخار'],
    hasFreeBloodPressureCheck: false,
    hasFreeGlucoseCheck: false,
    rating: 4.7,
    ratingsCount: 11,
    isVerified: true
  },
  {
    id: 'ph-6',
    name: 'صيدلية تبارك',
    district: 'شارع المدارس',
    address: 'قرب مجمع المدارس الثانوي',
    latitude: 36.1590,
    longitude: 37.7015,
    isOpen: true,
    isOnDuty: false,
    dutyDays: ['الجمعة'],
    dutyStartTime: '18:00',
    dutyEndTime: '00:00',
    regularClosingHour: 18,
    dutyHours: 'دوام يومي حتى 6:00 م • مناوبة الجمعة من 6:00 م حتى 12:00 ليلاً',
    phone: '0999345678',
    services: ['مستلزمات إسعاف أولية'],
    hasFreeBloodPressureCheck: true,
    hasFreeGlucoseCheck: false,
    rating: 4.5,
    ratingsCount: 8,
    isVerified: true
  }
];

export const INITIAL_DOCTORS: Doctor[] = [
  {
    id: 'doc-1',
    name: 'الدكتور محمد العلي',
    specialty: 'أطباء الأطفال وحديثي الولادة',
    clinicAddress: 'الشارع العام - فوق صيدلية دير حافر المركزية',
    district: 'الشارع العام',
    latitude: 36.1582,
    longitude: 37.7062,
    workingHours: 'السبت إلى الخميس: 10:00 صباحاً - 2:00 ظهراً',
    phone: '0944987654',
    consultationFee: '15,000 ل.س',
    isAvailableToday: true,
    rating: 4.9,
    ratingsCount: 34
  },
  {
    id: 'doc-2',
    name: 'الدكتورة فاطمة المحمود',
    specialty: 'النسائية والتوليد وجراحة العقم',
    clinicAddress: 'دوار السوق المركزي - جانب مخبر الشفاء',
    district: 'دوار السوق',
    latitude: 36.1601,
    longitude: 37.7085,
    workingHours: 'يومياً ما عدا الجمعة: 9:00 صباحاً - 3:00 عصراً',
    phone: '0955123789',
    consultationFee: '20,000 ل.س',
    isAvailableToday: true,
    rating: 4.8,
    ratingsCount: 42
  },
  {
    id: 'doc-3',
    name: 'الدكتور أحمد السليمان',
    specialty: 'أمراض الباطنية والقلبية والسكري',
    clinicAddress: 'شارع المستوصف - قرب المركز الصحي',
    district: 'شارع المستوصف',
    latitude: 36.1565,
    longitude: 37.7088,
    workingHours: 'السبت، الإثنين، الأربعاء: 11:00 صباحاً - 5:00 عصراً',
    phone: '0933456123',
    consultationFee: '18,000 ل.س',
    isAvailableToday: false,
    rating: 4.7,
    ratingsCount: 25
  },
  {
    id: 'doc-4',
    name: 'الدكتور خالد العمر',
    specialty: 'الجراحة العامة وجراحة العظام',
    clinicAddress: 'طريق حلب - الرقة الدولي - بناء العيادات التخصصية',
    district: 'طريق حلب - الرقة',
    latitude: 36.1554,
    longitude: 37.7031,
    workingHours: 'يومياً: 4:00 عصراً - 8:00 مساءً',
    phone: '0988789456',
    consultationFee: '20,000 ل.س',
    isAvailableToday: true,
    rating: 4.9,
    ratingsCount: 31
  }
];

export const INITIAL_NURSES: Nurse[] = [];

export const INITIAL_HOSPITALS: Hospital[] = [];

// Feature 48: مختبرات التحاليل ومراكز الأشعة في دير حافر
export const INITIAL_LABS: MedicalLab[] = [];

// Feature 6: سجل نداءات التبرع العاجل بالدم
export const INITIAL_BLOOD_REQUESTS: BloodDonationRequest[] = [];

// Haversine distance in kilometers
export function calculateDistanceKm(lat1: number, lon1: number, lat2: number, lon2: number): number {
  const R = 6371;
  const dLat = (lat2 - lat1) * (Math.PI / 180);
  const dLon = (lon2 - lon1) * (Math.PI / 180);
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(lat1 * (Math.PI / 180)) * Math.cos(lat2 * (Math.PI / 180)) *
    Math.sin(dLon / 2) * Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  const d = R * c;
  return Math.round(d * 10) / 10;
}

// Feature 16: تنسيق المسافة بالأمتار أو الكيلومترات بذكاء
export function formatDistanceMetersOrKm(km?: number): { value: string; unit: string; full: string } {
  if (km === undefined || km === null) {
    return { value: '400', unit: 'متر', full: '400 م' };
  }
  if (km < 1) {
    const meters = Math.round(km * 1000);
    return { value: `${meters}`, unit: 'متر', full: `${meters} م` };
  }
  return { value: `${km}`, unit: 'كم', full: `${km} كم` };
}

// Duty Schedule Defaults & Helper (Regular: 09:00 PM to 12:00 AM Midnight | Friday: 09:00 AM to 12:00 PM Noon)
export const DEFAULT_DUTY_SCHEDULE: DutyScheduleConfig = {
  regularStartHour: 21, // 09:00 PM
  regularStartMinute: 0,
  regularEndHour: 24, // 12:00 AM midnight
  regularEndMinute: 0,
  regularLabel: '09:00 مساءً حتى 12:00 ليلاً',

  fridayStartHour: 9, // 09:00 AM
  fridayStartMinute: 0,
  fridayEndHour: 12, // 12:00 PM noon
  fridayEndMinute: 0,
  fridayLabel: '09:00 صباحاً حتى 12:00 ظهراً',

  notes: 'المناوبة الليلية: 09:00 م حتى 12:00 ليلاً • يوم الجمعة: 09:00 ص حتى 12:00 ظهراً'
};

export function getDutyShiftInfo(config: DutyScheduleConfig = DEFAULT_DUTY_SCHEDULE, now = new Date()) {
  const isFriday = now.getDay() === 5; // 5 is Friday
  const currentTotalMinutes = now.getHours() * 60 + now.getMinutes();

  if (isFriday) {
    const startMin = config.fridayStartHour * 60 + config.fridayStartMinute;
    const endMin = config.fridayEndHour * 60 + config.fridayEndMinute;
    const isWithinShift = currentTotalMinutes >= startMin && currentTotalMinutes < endMin;
    const isBeforeShift = currentTotalMinutes < startMin;
    const isShiftEnded = currentTotalMinutes >= endMin;
    const targetDate = new Date(now);
    targetDate.setHours(config.fridayEndHour, config.fridayEndMinute, 0, 0);

    return {
      isFriday: true,
      dayName: 'يوم الجمعة',
      shiftName: 'مناوبة يوم الجمعة',
      scheduleLabel: config.fridayLabel,
      isWithinShift,
      isBeforeShift,
      isShiftEnded,
      startHour: config.fridayStartHour,
      endHour: config.fridayEndHour,
      targetEndDate: targetDate,
      closingTimeArabic: '12:00 ظهراً'
    };
  } else {
    const startMin = config.regularStartHour * 60 + config.regularStartMinute;
    const endHour = (config.regularEndHour === 0 || config.regularEndHour === 24) ? 24 : config.regularEndHour;
    const endMin = endHour * 60 + config.regularEndMinute;
    
    // Regular shift is 9:00 PM to 12:00 AM midnight
    const isWithinShift = currentTotalMinutes >= startMin && currentTotalMinutes < endMin;
    
    // Between midnight and 6:00 AM (e.g. 2:00 AM): the night shift has ended
    const isAfterMidnightEnded = currentTotalMinutes < 360;
    
    // Between 6:00 AM and 9:00 PM: before tonight's shift
    const isBeforeShift = currentTotalMinutes >= 360 && currentTotalMinutes < startMin;
    
    const isShiftEnded = isAfterMidnightEnded;

    const targetDate = new Date(now);
    if (endHour === 24) {
      targetDate.setHours(23, 59, 59, 999);
    } else {
      targetDate.setHours(endHour, config.regularEndMinute, 0, 0);
    }

    return {
      isFriday: false,
      dayName: 'الأيام الاعتيادية',
      shiftName: 'المناوبة الليلية',
      scheduleLabel: config.regularLabel,
      isWithinShift,
      isBeforeShift,
      isShiftEnded,
      isAfterMidnightEnded,
      startHour: config.regularStartHour,
      endHour: config.regularEndHour,
      targetEndDate: targetDate,
      closingTimeArabic: '12:00 ليلاً'
    };
  }
}

export interface DutyCountdownResult {
  state: 'before' | 'active' | 'ended';
  hours: number;
  minutes: number;
  text: string;
  badgeText: string;
  shiftName: string;
  isWithinShift: boolean;
  startTimeArabic: string;
  endTimeArabic: string;
}

// Feature 3: حساب الوقت المتبقي لبدء أو انتهاء المناوبة بذكاء وبدون أي لبس
export function calculateDutyCountdown(
  dutyEndTime?: string,
  scheduleConfig: DutyScheduleConfig = DEFAULT_DUTY_SCHEDULE,
  now = new Date()
): DutyCountdownResult {
  const isFriday = now.getDay() === 5;
  const currentTotalMinutes = now.getHours() * 60 + now.getMinutes();

  if (isFriday) {
    const startMin = scheduleConfig.fridayStartHour * 60 + scheduleConfig.fridayStartMinute;
    const endMin = scheduleConfig.fridayEndHour * 60 + scheduleConfig.fridayEndMinute;
    const startHourDisplay = scheduleConfig.fridayStartHour;
    const endHourDisplay = scheduleConfig.fridayEndHour > 12 ? scheduleConfig.fridayEndHour - 12 : scheduleConfig.fridayEndHour;
    const startTimeArabic = `${String(startHourDisplay).padStart(2, '0')}:${String(scheduleConfig.fridayStartMinute).padStart(2, '0')} صباحاً`;
    const endTimeArabic = `${String(endHourDisplay).padStart(2, '0')}:${String(scheduleConfig.fridayEndMinute).padStart(2, '0')} ظهراً`;

    if (currentTotalMinutes < startMin) {
      // قبل بدء المناوبة الصباحية ليوم الجمعة
      const diffMinutes = startMin - currentTotalMinutes;
      const hours = Math.floor(diffMinutes / 60);
      const minutes = diffMinutes % 60;
      const text = hours > 0 ? `${hours} س و ${minutes} د` : `${minutes} دقيقة`;
      return {
        state: 'before',
        hours,
        minutes,
        text,
        badgeText: `تبدأ المناوبة بعد: ${text} (الساعة ${startTimeArabic})`,
        shiftName: 'مناوبة يوم الجمعة',
        isWithinShift: false,
        startTimeArabic,
        endTimeArabic
      };
    } else if (currentTotalMinutes < endMin) {
      // أثناء مناوبة يوم الجمعة
      const diffMinutes = endMin - currentTotalMinutes;
      const hours = Math.floor(diffMinutes / 60);
      const minutes = diffMinutes % 60;
      const text = hours > 0 ? `${hours} س و ${minutes} د` : `${minutes} دقيقة`;
      return {
        state: 'active',
        hours,
        minutes,
        text,
        badgeText: `مناوبة جارية - ينتهي الدوام بعد: ${text}`,
        shiftName: 'مناوبة يوم الجمعة',
        isWithinShift: true,
        startTimeArabic,
        endTimeArabic
      };
    } else {
      // بعد انتهاء مناوبة يوم الجمعة
      return {
        state: 'ended',
        hours: 0,
        minutes: 0,
        text: 'انتهت',
        badgeText: `انتهت مناوبة الجمعة عند الساعة ${endTimeArabic}`,
        shiftName: 'مناوبة يوم الجمعة',
        isWithinShift: false,
        startTimeArabic,
        endTimeArabic
      };
    }
  } else {
    // الأيام الاعتيادية: 09:00 مساءً (21:00) حتى 12:00 ليلاً (24:00)
    const startMin = scheduleConfig.regularStartHour * 60 + scheduleConfig.regularStartMinute; // 1260
    const endHour = (scheduleConfig.regularEndHour === 0 || scheduleConfig.regularEndHour === 24) ? 24 : scheduleConfig.regularEndHour;
    const endMin = endHour * 60 + scheduleConfig.regularEndMinute; // 1440
    const startHourDisplay = scheduleConfig.regularStartHour > 12 ? scheduleConfig.regularStartHour - 12 : scheduleConfig.regularStartHour;
    const startTimeArabic = `${String(startHourDisplay).padStart(2, '0')}:${String(scheduleConfig.regularStartMinute).padStart(2, '0')} مساءً`;
    const endTimeArabic = endHour === 24 || endHour === 0 ? '12:00 ليلاً' : `${String(endHour).padStart(2, '0')}:00`;

    // إذا كان الوقت قبل الساعة 9:00 مساءً (مثلاً في الصباح أو بعد الظهر)
    if (currentTotalMinutes >= 360 && currentTotalMinutes < startMin) {
      const diffMinutes = startMin - currentTotalMinutes;
      const hours = Math.floor(diffMinutes / 60);
      const minutes = diffMinutes % 60;
      const text = hours > 0 ? `${hours} س و ${minutes} د` : `${minutes} دقيقة`;
      return {
        state: 'before',
        hours,
        minutes,
        text,
        badgeText: `تبدأ المناوبة بعد: ${text} (الساعة ${startTimeArabic})`,
        shiftName: 'المناوبة الليلية',
        isWithinShift: false,
        startTimeArabic,
        endTimeArabic
      };
    } else if (currentTotalMinutes >= startMin && currentTotalMinutes < endMin) {
      // أثناء المناوبة الليلية (بين 9:00 م و 12:00 منتصف الليل)
      const diffMinutes = endMin - currentTotalMinutes;
      const hours = Math.floor(diffMinutes / 60);
      const minutes = diffMinutes % 60;
      const text = hours > 0 ? `${hours} س و ${minutes} د` : `${minutes} دقيقة`;
      return {
        state: 'active',
        hours,
        minutes,
        text,
        badgeText: `مناوبة جارية - ينتهي الدوام بعد: ${text}`,
        shiftName: 'المناوبة الليلية',
        isWithinShift: true,
        startTimeArabic,
        endTimeArabic
      };
    } else {
      // بعد منتصف الليل (بين 12:00 ليلاً و 6:00 صباحاً) - انتهت مناوبة الليلة
      return {
        state: 'ended',
        hours: 0,
        minutes: 0,
        text: 'انتهت',
        badgeText: `انتهت مناوبة الليلة عند الساعة ${endTimeArabic}`,
        shiftName: 'المناوبة الليلية',
        isWithinShift: false,
        startTimeArabic,
        endTimeArabic
      };
    }
  }
}

// Backward-compatible wrapper
export function calculateRemainingDutyTime(
  dutyEndTime?: string,
  scheduleConfig: DutyScheduleConfig = DEFAULT_DUTY_SCHEDULE
): DutyCountdownResult {
  return calculateDutyCountdown(dutyEndTime, scheduleConfig);
}

// Convert any AM / PM or English times to Arabic صباحاً and مساءً
export function formatArabicTime(text?: string): string {
  if (!text) return '';
  return text
    .replace(/\b12:00\s*PM\b/gi, '12:00 ظهراً')
    .replace(/\b12:00\s*AM\b/gi, '12:00 منتصف الليل')
    .replace(/\bAM\b/gi, 'صباحاً')
    .replace(/\bPM\b/gi, 'مساءً')
    .replace(/\bam\b/gi, 'صباحاً')
    .replace(/\bpm\b/gi, 'مساءً');
}

// ========================================================
// DAYS & PHARMACY DUTY TIME CALCULATION
// ========================================================
export const ALL_WEEKDAYS_ARABIC = [
  'السبت',
  'الأحد',
  'الإثنين',
  'الثلاثاء',
  'الأربعاء',
  'الخميس',
  'الجمعة'
] as const;

export const REGULAR_DAILY_OPENING_HOUR = 8; // 8:00 AM
export const REGULAR_DAILY_CLOSING_HOUR = 18; // 6:00 PM (18:00)

export function getTodayArabicName(date = new Date()): string {
  const dayIndex = date.getDay(); // 0 is Sunday, 6 is Saturday
  const map: Record<number, string> = {
    0: 'الأحد',
    1: 'الإثنين',
    2: 'الثلاثاء',
    3: 'الأربعاء',
    4: 'الخميس',
    5: 'الجمعة',
    6: 'السبت'
  };
  return map[dayIndex] || 'السبت';
}

export function normalizePharmacy(ph: Pharmacy): Pharmacy {
  const match = INITIAL_PHARMACIES.find((p) => p.id === ph.id || p.name === ph.name);

  const dutyDays = (ph.dutyDays && Array.isArray(ph.dutyDays) && ph.dutyDays.length > 0)
    ? ph.dutyDays
    : (match?.dutyDays && match.dutyDays.length > 0)
    ? match.dutyDays
    : (ph.isOnDuty ? ['الجمعة', 'السبت'] : ['السبت']);

  const dutyStartTime = ph.dutyStartTime || match?.dutyStartTime || '21:00';
  const dutyEndTime = ph.dutyEndTime || match?.dutyEndTime || '00:00';
  const regularClosingHour = ph.regularClosingHour || match?.regularClosingHour || 18;
  const dutyHours = ph.dutyHours || match?.dutyHours || `دوام يومي حتى 6:00 م • مناوبة ${dutyStartTime} حتى ${dutyEndTime}`;

  return {
    ...ph,
    dutyDays,
    dutyStartTime,
    dutyEndTime,
    regularClosingHour,
    dutyHours
  };
}

export function isPharmacyOnDutyToday(pharmacy: Pharmacy, now = new Date()): boolean {
  const normalized = normalizePharmacy(pharmacy);
  if (normalized.dutyDays && normalized.dutyDays.length > 0) {
    const todayName = getTodayArabicName(now);
    return normalized.dutyDays.includes(todayName);
  }
  return Boolean(normalized.isOnDuty);
}

export function parseTimeToMinutes(timeStr?: string, defaultHour = 20, defaultMinute = 0): number {
  if (!timeStr) return defaultHour * 60 + defaultMinute;
  const str = timeStr.trim().toLowerCase();

  if (str.includes('24') || str.includes('طوارئ')) return 24 * 60;

  // Pattern: "20:00" or "8:30" or "08:00 PM" or "8:00 م"
  const match = str.match(/(\d{1,2}):(\d{2})/);
  if (match) {
    let h = parseInt(match[1], 10);
    const m = parseInt(match[2], 10);
    if ((str.includes('م') || str.includes('pm')) && h < 12) {
      h += 12;
    } else if ((str.includes('ص') || str.includes('am')) && h === 12) {
      h = 0;
    }
    return h * 60 + m;
  }

  // Single hour: "20" or "8 مساءً" or "12 ليلاً"
  const hourMatch = str.match(/(\d{1,2})/);
  if (hourMatch) {
    let h = parseInt(hourMatch[1], 10);
    if ((str.includes('م') || str.includes('مساء')) && h < 12) {
      h += 12;
    } else if (str.includes('ليل') && (h === 12 || h === 0)) {
      h = 24;
    }
    return h * 60;
  }

  return defaultHour * 60 + defaultMinute;
}

export interface PharmacyLiveStatus {
  isOpen: boolean;
  isOnDutyToday: boolean;
  isDutyActiveNow: boolean;
  isClosedForDutyBreak: boolean; // Between 6:00 PM and duty start: closed at 6:00 PM and waiting for duty to start!
  isDaytimeRegular: boolean; // Between 8:00 AM and 6:00 PM
  label: string;
  badgeClass: string;
  dotClass: string;
  countdownText?: string | null;
  dutyStartTimeFormatted: string;
  dutyEndTimeFormatted: string;
}

export function getPharmacyLiveStatus(pharmacy: Pharmacy, now = new Date()): PharmacyLiveStatus {
  const currentTotalMinutes = now.getHours() * 60 + now.getMinutes();
  const isOnDutyToday = isPharmacyOnDutyToday(pharmacy, now);
  const is24h = Boolean(pharmacy.dutyHours?.includes('24') || pharmacy.dutyEndTime?.includes('24'));

  // 1. Continuous 24h duty
  if (is24h) {
    return {
      isOpen: true,
      isOnDutyToday: true,
      isDutyActiveNow: true,
      isClosedForDutyBreak: false,
      isDaytimeRegular: false,
      label: 'مناوبة مستمرة 24 ساعة 🟢',
      badgeClass: 'bg-emerald-100 text-emerald-800 border-emerald-300',
      dotClass: 'bg-emerald-600 animate-pulse',
      dutyStartTimeFormatted: '24 ساعة',
      dutyEndTimeFormatted: '24 ساعة'
    };
  }

  // Regular business hours for all pharmacies: 8:00 AM (480 min) to 6:00 PM (18:00 = 1080 min)
  const isDaytime = currentTotalMinutes >= 480 && currentTotalMinutes < 1080;

  // Duty start and end times in minutes
  const dutyStartMin = parseTimeToMinutes(pharmacy.dutyStartTime, 20, 0); // Default 8:00 PM (20:00)
  let dutyEndMin = parseTimeToMinutes(pharmacy.dutyEndTime, 24, 0); // Default 12:00 midnight (24:00)

  // Handle shifts past midnight (e.g. start at 20:00 = 1200, end at 02:00 = 120)
  const isPastMidnightShift = dutyEndMin <= dutyStartMin && dutyEndMin > 0;
  if (isPastMidnightShift) {
    dutyEndMin += 1440; // Add 24h
  }

  const startHourDisplay = Math.floor(dutyStartMin / 60);
  const startMinDisplay = dutyStartMin % 60;
  const startFmt = `${startHourDisplay > 12 ? startHourDisplay - 12 : startHourDisplay}:${String(startMinDisplay).padStart(2, '0')} ${startHourDisplay >= 12 ? 'مساءً' : 'صباحاً'}`;

  const rawEndHour = Math.floor((dutyEndMin > 1440 ? dutyEndMin - 1440 : dutyEndMin) / 60);
  const endMinDisplay = dutyEndMin % 60;
  const endFmt = (rawEndHour === 24 || rawEndHour === 0)
    ? '12:00 ليلاً'
    : `${rawEndHour > 12 ? rawEndHour - 12 : rawEndHour}:${String(endMinDisplay).padStart(2, '0')} ${rawEndHour >= 12 ? 'مساءً' : 'ليلاً/صباحاً'}`;

  // Adjusted minutes for past midnight check
  let adjustedCurrentMinutes = currentTotalMinutes;
  if (isPastMidnightShift && currentTotalMinutes < 360) {
    adjustedCurrentMinutes += 1440;
  }

  // 2. Daytime (8:00 AM to 6:00 PM): All pharmacies are open daily until 6:00 PM!
  if (isDaytime) {
    if (isOnDutyToday) {
      return {
        isOpen: true,
        isOnDutyToday: true,
        isDutyActiveNow: false,
        isClosedForDutyBreak: false,
        isDaytimeRegular: true,
        label: 'مفتوحة الآن • مناوبة الليلة 🌙',
        badgeClass: 'bg-emerald-100 text-emerald-900 border-emerald-300',
        dotClass: 'bg-emerald-600 animate-pulse',
        countdownText: `تغلق 6:00 م وتعاود الفتح للمناوبة ${startFmt}`,
        dutyStartTimeFormatted: startFmt,
        dutyEndTimeFormatted: endFmt
      };
    }

    return {
      isOpen: true,
      isOnDutyToday: false,
      isDutyActiveNow: false,
      isClosedForDutyBreak: false,
      isDaytimeRegular: true,
      label: 'مفتوحة الآن (دوام اعتيادي)',
      badgeClass: 'bg-teal-50 text-teal-800 border-teal-200',
      dotClass: 'bg-teal-600',
      countdownText: null,
      dutyStartTimeFormatted: startFmt,
      dutyEndTimeFormatted: endFmt
    };
  }

  // 3. Evening & Night (After 6:00 PM):
  // If not on duty today: closed (daytime shift ended at 6:00 PM)
  if (!isOnDutyToday) {
    return {
      isOpen: false,
      isOnDutyToday: false,
      isDutyActiveNow: false,
      isClosedForDutyBreak: false,
      isDaytimeRegular: false,
      label: 'مغلقة حالياً',
      badgeClass: 'bg-slate-100 text-slate-700 border-slate-200',
      dotClass: 'bg-slate-400',
      countdownText: 'تفتح غداً الساعة 8:00 صباحاً',
      dutyStartTimeFormatted: startFmt,
      dutyEndTimeFormatted: endFmt
    };
  }

  // If on duty today:
  // A. Between 6:00 PM (1080 min) and Duty Start Time (e.g. 20:00 / 8:00 PM):
  // Closed at 6:00 PM with all pharmacies, and is waiting to open for duty!
  if (currentTotalMinutes >= 1080 && currentTotalMinutes < dutyStartMin) {
    const diff = dutyStartMin - currentTotalMinutes;
    const diffH = Math.floor(diff / 60);
    const diffM = diff % 60;
    const countdown = diffH > 0 ? `${diffH} س و ${diffM} د` : `${diffM} دقيقة`;

    return {
      isOpen: false,
      isOnDutyToday: true,
      isDutyActiveNow: false,
      isClosedForDutyBreak: true,
      isDaytimeRegular: false,
      label: `مغلقة مؤقتاً (تفتح للمناوبة ${startFmt})`,
      badgeClass: 'bg-amber-50 text-amber-900 border-amber-300',
      dotClass: 'bg-amber-500 animate-pulse',
      countdownText: `أغلقت 6:00 م وتعاود الفتح بعد: ${countdown}`,
      dutyStartTimeFormatted: startFmt,
      dutyEndTimeFormatted: endFmt
    };
  }

  // B. Within Duty Shift (Duty Start Min <= adjustedCurrentMinutes < Duty End Min):
  if (adjustedCurrentMinutes >= dutyStartMin && adjustedCurrentMinutes < dutyEndMin) {
    const diff = dutyEndMin - adjustedCurrentMinutes;
    const diffH = Math.floor(diff / 60);
    const diffM = diff % 60;
    const countdown = diffH > 0 ? `${diffH} س و ${diffM} د` : `${diffM} دقيقة`;

    return {
      isOpen: true,
      isOnDutyToday: true,
      isDutyActiveNow: true,
      isClosedForDutyBreak: false,
      isDaytimeRegular: false,
      label: `مناوبة ليلية مفتوحة الآن 🌙`,
      badgeClass: 'bg-emerald-100 text-emerald-900 border-emerald-400 ring-2 ring-emerald-200',
      dotClass: 'bg-emerald-600 animate-ping',
      countdownText: `متبقي على انتهاء المناوبة: ${countdown}`,
      dutyStartTimeFormatted: startFmt,
      dutyEndTimeFormatted: endFmt
    };
  }

  // C. Duty Shift has ended (After Duty End Min until 8:00 AM morning):
  return {
    isOpen: false,
    isOnDutyToday: true,
    isDutyActiveNow: false,
    isClosedForDutyBreak: false,
    isDaytimeRegular: false,
    label: `انتهت المناوبة الليلية 🌙`,
    badgeClass: 'bg-rose-50 text-rose-800 border-rose-200',
    dotClass: 'bg-rose-500',
    countdownText: 'للطوارئ الإسعافية الآن يرجى مراجعة المشافي',
    dutyStartTimeFormatted: startFmt,
    dutyEndTimeFormatted: endFmt
  };
}

