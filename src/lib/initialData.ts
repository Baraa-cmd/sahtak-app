import { Pharmacy, Nurse, Hospital, MedicalLab, BloodDonationRequest, DutyScheduleConfig } from '../types';

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
    dutyEndTime: '8:00 صباحاً',
    dutyHours: 'مناوبة 24 ساعة',
    phone: '+963944111222',
    services: ['أدوية طوارئ وإسعاف', 'مستلزمات طبية', 'حليب وأغذية أطفال'],
    rating: 4.9,
    ratingsCount: 38,
    isVerified: true,
    hasFreeBloodPressureCheck: true,
    hasFreeGlucoseCheck: true
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
    dutyEndTime: '6:30 صباحاً',
    dutyHours: 'مناوبة ليلية حتى الصباح',
    phone: '+963955333444',
    services: ['أدوية الأمراض المزمنة', 'محاليل وإبر أنسولين', 'مسكنات طارئة'],
    rating: 4.8,
    ratingsCount: 26,
    isVerified: true,
    hasFreeBloodPressureCheck: true,
    hasFreeGlucoseCheck: false
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
    dutyEndTime: '',
    dutyHours: 'دوام اعتيادي 8:00 صباحاً - 10:00 مساءً',
    phone: '+963966555666',
    services: ['صرف وصفات', 'فيتامينات ومقويات', 'قياس ضغط وسكر'],
    rating: 4.7,
    ratingsCount: 19,
    isVerified: true,
    hasFreeBloodPressureCheck: true,
    hasFreeGlucoseCheck: true
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
    dutyEndTime: '7:00 صباحاً',
    dutyHours: 'مناوبة ليلية',
    phone: '+963988777888',
    services: ['مضادات حيوية', 'ضمادات وحروق', 'أدوية أطفال'],
    rating: 4.8,
    ratingsCount: 22,
    isVerified: true,
    hasFreeBloodPressureCheck: false,
    hasFreeGlucoseCheck: true
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
    dutyEndTime: '',
    dutyHours: 'مفتوحة نهاراً 8:30 صباحاً - 9:00 مساءً',
    phone: '+963999888999',
    services: ['عناية شخصية', 'أجهزة تنفس وبخار'],
    rating: 4.6,
    ratingsCount: 15,
    isVerified: true,
    hasFreeBloodPressureCheck: true,
    hasFreeGlucoseCheck: false
  },
  {
    id: 'ph-6',
    name: 'صيدلية تبارك',
    district: 'شارع المدارس',
    address: 'قرب مجمع المدارس الثانوي',
    latitude: 36.1590,
    longitude: 37.7015,
    isOpen: false,
    isOnDuty: false,
    dutyEndTime: '',
    dutyHours: 'مغلقة حالياً - تفتح 8:00 صباحاً',
    phone: '+963933222111',
    services: ['مستلزمات إسعاف أولية'],
    rating: 4.5,
    ratingsCount: 12,
    isVerified: false,
    hasFreeBloodPressureCheck: false,
    hasFreeGlucoseCheck: false
  }
];

export const INITIAL_NURSES: Nurse[] = [
  {
    id: 'nr-1',
    name: 'أحمد المصطفى',
    title: 'أخصائي تمريض منزلي ورعاية جروح',
    district: 'الشارع العام - دير حافر',
    latitude: 36.1578,
    longitude: 37.7055,
    isAvailable: true,
    isOnDuty: true,
    dutyEndTime: '7:00 صباحاً',
    services: ['تركيب كانيولا ومحاليل', 'حقن عضل ووريد', 'غيار جروح وحروق'],
    phone: '+963944123456',
    experienceYears: 9,
    rating: 4.9,
    ratingsCount: 31,
    isVerified: true
  },
  {
    id: 'nr-2',
    name: 'محمود العبدالله',
    title: 'ممرض عام وطوارئ ميدانية',
    district: 'الحي الشمالي - دير حافر',
    latitude: 36.1615,
    longitude: 37.7045,
    isAvailable: true,
    isOnDuty: true,
    dutyEndTime: '6:00 صباحاً',
    services: ['إعطاء محاليل وريدية', 'سحب عينات دم منزلي', 'تخفيض حرارة أطفال'],
    phone: '+963933987654',
    experienceYears: 7,
    rating: 4.8,
    ratingsCount: 24,
    isVerified: true
  },
  {
    id: 'nr-3',
    name: 'فاطمة العلي',
    title: 'قابلة وممرضة رعاية أمومة وأطفال',
    district: 'قرب المركز الصحي - دير حافر',
    latitude: 36.1560,
    longitude: 37.7080,
    isAvailable: true,
    isOnDuty: true,
    dutyEndTime: '8:00 صباحاً',
    services: ['رعاية حديثي ولادة', 'جلسات رذاذ وبخار', 'حقن منزلية'],
    phone: '+963966554433',
    experienceYears: 8,
    rating: 5.0,
    ratingsCount: 42,
    isVerified: true
  }
];

export const INITIAL_HOSPITALS: Hospital[] = [
  {
    id: 'hp-1',
    name: 'المركز الصحي العام (مستوصف دير حافر)',
    type: 'مركز صحي حكومي - نقطة طوارئ',
    district: 'شارع المستوصف',
    latitude: 36.1565,
    longitude: 37.7088,
    emergency24h: true,
    emergencyPhone: '110',
    services: ['إسعافات أولية 24/7', 'ضماد وتجبير', 'قسم أطفال ولقاحات'],
    isVerified: true,
    rating: 4.7,
    ratingsCount: 54
  },
  {
    id: 'hp-2',
    name: 'نقطة الهلال الأحمر والإسعاف الطرقي',
    type: 'نقطة إسعاف طوارئ',
    district: 'طريق حلب الدولي - مدخل دير حافر',
    latitude: 36.1540,
    longitude: 37.7020,
    emergency24h: true,
    emergencyPhone: '133',
    services: ['سيارات إسعاف سريعة', 'إنعاش فوري', 'نقل حالات حرجة'],
    isVerified: true,
    rating: 4.9,
    ratingsCount: 80
  },
  {
    id: 'hp-3',
    name: 'مجمع العيادات والطوارئ الطبية',
    district: 'دوار البلدية',
    type: 'مجمع طبي متكامل',
    latitude: 36.1588,
    longitude: 37.7060,
    emergency24h: true,
    emergencyPhone: '021789123',
    services: ['طوارئ وإسعافات', 'مخبر تحاليل', 'عيادة أسنان وطب عام'],
    isVerified: true,
    rating: 4.6,
    ratingsCount: 39
  }
];

// Feature 48: مختبرات التحاليل ومراكز الأشعة في دير حافر
export const INITIAL_LABS: MedicalLab[] = [
  {
    id: 'lab-1',
    name: 'مخبر دير حافر التخصصي للتحاليل الطبية',
    type: 'laboratory',
    typeName: 'مخبر تحاليل دم ومناعة',
    address: 'الشارع الرئيسي - مقابل دار البلدية',
    district: 'الشارع العام',
    latitude: 36.1580,
    longitude: 37.7060,
    workingHours: '8:00 صباحاً - 9:00 مساءً (مناوبة طوارئ بالاتصال)',
    isOpen: true,
    emergencyOnCall: true,
    phone: '+963944778899',
    services: ['تحاليل دم شاملة (CBC)', 'سكر تراكمي ووظائف كلى وكبد', 'فحص هرمونات ومناعة', 'زمر دموية وتوافق'],
    rating: 4.9,
    ratingsCount: 29,
    isVerified: true
  },
  {
    id: 'lab-2',
    name: 'مركز الأمل للتصوير الشعاعي والإيكو',
    type: 'radiology',
    typeName: 'مركز أشعة وإيكوغرافي',
    address: 'ساحة السوق التجاري - بناء النور',
    district: 'دوار السوق',
    latitude: 36.1605,
    longitude: 37.7080,
    workingHours: '9:00 صباحاً - 7:00 مساءً (استقبال كسور طارئة)',
    isOpen: true,
    emergencyOnCall: true,
    phone: '+963955667788',
    services: ['أشعة سينية رقمية للكسور (X-Ray)', 'إيكو دوبلر للأوعية والبطن', 'إيكو حمل وتوليد'],
    rating: 4.8,
    ratingsCount: 21,
    isVerified: true
  },
  {
    id: 'lab-3',
    name: 'مخبر الشفاء الحديث',
    type: 'comprehensive',
    typeName: 'مخبر تحاليل وطوارئ سريرية',
    address: 'شارع المركز الثقافي القديم',
    district: 'الحي الشمالي',
    latitude: 36.1625,
    longitude: 37.7045,
    workingHours: '8:30 صباحاً - 8:30 مساءً',
    isOpen: true,
    emergencyOnCall: false,
    phone: '+963933445566',
    services: ['تحاليل بول وراسب', 'سرعة التثفل والالتهابات (CRP)', 'تحاليل أطفال عاجلة'],
    rating: 4.7,
    ratingsCount: 16,
    isVerified: true
  }
];

// Feature 6: سجل نداءات التبرع العاجل بالدم
export const INITIAL_BLOOD_REQUESTS: BloodDonationRequest[] = [
  {
    id: 'bld-1',
    patientName: 'مريض بحاجة عملية جراحية طارئة',
    bloodType: 'O-',
    unitsNeeded: 3,
    urgency: 'critical',
    hospitalName: 'مشفى دير حافر / نقطة الإسعاف',
    contactPhone: '+963944111222',
    contactName: 'أبو أحمد (مرافق المريض)',
    notes: 'حالة نزف حاد بعد حادث سير - مطلوب زمرة O سالبة بشكل فوري ومستعجل.',
    createdAt: new Date(Date.now() - 1000 * 60 * 45).toISOString(),
    isFulfilled: false
  },
  {
    id: 'bld-2',
    patientName: 'مريضة في قسم التوليد',
    bloodType: 'A+',
    unitsNeeded: 2,
    urgency: 'urgent',
    hospitalName: 'المركز الصحي بدير حافر',
    contactPhone: '+963955333444',
    contactName: 'إدارة نقطة التبرع',
    notes: 'تحضير لعملية قيصرية إسعافية.',
    createdAt: new Date(Date.now() - 1000 * 60 * 180).toISOString(),
    isFulfilled: false
  },
  {
    id: 'bld-3',
    patientName: 'طفل مصاب بفقر دم حاد (تلاسيميا)',
    bloodType: 'B+',
    unitsNeeded: 1,
    urgency: 'moderate',
    hospitalName: 'مجمع العيادات بدير حافر',
    contactPhone: '+963966555666',
    contactName: 'والد الطفل',
    notes: 'تبديل دم دوري.',
    createdAt: new Date(Date.now() - 1000 * 60 * 360).toISOString(),
    isFulfilled: false
  }
];

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
    const targetDate = new Date(now);
    targetDate.setHours(config.fridayEndHour, config.fridayEndMinute, 0, 0);

    return {
      isFriday: true,
      dayName: 'يوم الجمعة',
      shiftName: 'مناوبة يوم الجمعة',
      scheduleLabel: config.fridayLabel,
      isWithinShift,
      isBeforeShift,
      startHour: config.fridayStartHour,
      endHour: config.fridayEndHour,
      targetEndDate: targetDate,
      closingTimeArabic: '12:00 ظهراً'
    };
  } else {
    const startMin = config.regularStartHour * 60 + config.regularStartMinute;
    const endHour = (config.regularEndHour === 0 || config.regularEndHour === 24) ? 24 : config.regularEndHour;
    const endMin = endHour * 60 + config.regularEndMinute;
    const isWithinShift = currentTotalMinutes >= startMin && currentTotalMinutes < endMin;
    const isBeforeShift = currentTotalMinutes < startMin;

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
