export interface Pharmacy {
  id: string;
  name: string;
  address: string;
  district: string;
  latitude: number;
  longitude: number;
  isOpen: boolean;
  isOnDuty: boolean;
  dutyEndTime?: string; // ISO string or time string e.g. "08:00 AM"
  dutyHours: string;
  services: string[];
  updatedAt?: string;
  distanceKm?: number;
  communityVerifiedAt?: string;
  communityNote?: string;
  lastDutyBroadcastAt?: string;
  phone?: string;
  rating?: number;
  ratingsCount?: number;
  isVerified?: boolean; // Feature 29: شارة توثيق نقابة الصيادلة
  hasFreeBloodPressureCheck?: boolean; // Feature 40: قياس ضغط مجاني
  hasFreeGlucoseCheck?: boolean; // Feature 40: فحص سكري مجاني/متاح
}

export interface Nurse {
  id: string;
  name: string;
  title: string;
  district: string;
  latitude: number;
  longitude: number;
  isAvailable: boolean;
  isOnDuty: boolean;
  dutyEndTime?: string;
  services: string[];
  phone: string;
  experienceYears: number;
  rating: number;
  ratingsCount?: number;
  isVerified?: boolean;
  updatedAt?: string;
  distanceKm?: number;
  communityVerifiedAt?: string;
  communityNote?: string;
}

export interface Hospital {
  id: string;
  name: string;
  type: string; // مستشفى حكومي، تخصصي، خاص
  district: string;
  latitude: number;
  longitude: number;
  emergency24h: boolean;
  emergencyPhone: string;
  services: string[];
  updatedAt?: string;
  distanceKm?: number;
  communityVerifiedAt?: string;
  communityNote?: string;
  isVerified?: boolean;
  rating?: number;
  ratingsCount?: number;
}

// Feature 48: مراكز الأشعة والتحاليل الطبية
export interface MedicalLab {
  id: string;
  name: string;
  type: 'laboratory' | 'radiology' | 'comprehensive';
  typeName: string; // "مخبر تحاليل طبية" | "مركز تصوير شعاعي وإيكو"
  address: string;
  district: string;
  latitude: number;
  longitude: number;
  workingHours: string;
  isOpen: boolean;
  emergencyOnCall: boolean;
  phone: string;
  services: string[];
  rating?: number;
  ratingsCount?: number;
  isVerified?: boolean;
  distanceKm?: number;
}

// Feature 6: سجل حملات ونداءات التبرع بالدم العاجلة
export type BloodGroup = 'O+' | 'O-' | 'A+' | 'A-' | 'B+' | 'B-' | 'AB+' | 'AB-';

export interface BloodDonationRequest {
  id: string;
  patientName: string;
  bloodType: BloodGroup;
  unitsNeeded: number;
  urgency: 'critical' | 'urgent' | 'moderate'; // حرجة جداً | عاجلة | عادية
  hospitalName: string;
  contactPhone: string;
  contactName: string;
  notes?: string;
  createdAt: string;
  isFulfilled?: boolean;
}

// Feature 19: نظام التقييمات والمراجعات
export interface RatingReview {
  id: string;
  targetId: string;
  targetType: 'pharmacy' | 'nurse' | 'hospital' | 'lab';
  rating: number; // 1 to 5
  comment?: string;
  tag?: string; // "معاملة ممتازة" | "استجابة سريعة ليلاً" | "متوفر كافة الأدوية"
  createdAt: string;
}

export type CommunityReportType =
  | 'duty_confirm'
  | 'duty_closed'
  | 'phone_update'
  | 'medicine_note'
  | 'location_fix'
  | 'general_note';

export interface CommunityReport {
  id: string;
  targetId: string;
  targetName: string;
  targetType: 'pharmacy' | 'nurse' | 'hospital' | 'lab';
  reportType: CommunityReportType;
  details: string;
  suggestedPhone?: string;
  reporterName?: string;
  createdAt: string;
}

export type LocationSource = 'gps' | 'manual' | 'preset' | 'ip' | 'default';

export interface UserLocation {
  latitude: number;
  longitude: number;
  districtName: string;
  isAuto: boolean;
  source?: LocationSource;
}

export type ActiveTab = 'pharmacies' | 'nurses' | 'labs' | 'hospitals' | 'map';

export type MapStyleMode = 'default' | 'satellite';

export interface MapLayerState {
  pharmacies: boolean;
  nurses: boolean;
  hospitals: boolean;
  labs?: boolean;
}

export interface SelectedRouteTarget {
  id: string;
  type: 'pharmacy' | 'nurse' | 'hospital' | 'lab';
  name: string;
  latitude: number;
  longitude: number;
  distanceKm?: number;
  district: string;
}

export type UserRole = 'admin' | 'pharmacist' | 'nurse';

export interface AppUser {
  id: string;
  username: string;
  password: string;
  role: UserRole;
  targetId?: string; // ID of linked Pharmacy or Nurse
  targetName?: string; // Display name of linked Pharmacy or Nurse
  displayName?: string;
  createdAt?: string;
  updatedAt?: string;
}

export interface AuthSession {
  user: AppUser;
  loginTime: string;
}

export interface DutyScheduleConfig {
  regularStartHour: number; // default 21 (09:00 PM)
  regularStartMinute: number; // default 0
  regularEndHour: number; // default 24 / 0 (12:00 AM midnight)
  regularEndMinute: number; // default 0
  regularLabel: string; // "09:00 مساءً حتى 12:00 ليلاً"

  fridayStartHour: number; // default 9 (09:00 AM)
  fridayStartMinute: number; // default 0
  fridayEndHour: number; // default 12 (12:00 PM noon)
  fridayEndMinute: number; // default 0
  fridayLabel: string; // "09:00 صباحاً حتى 12:00 ظهراً"

  notes?: string;
  updatedAt?: string;
}

export interface AppUpdateInfo {
  version: string;
  releaseNotes: string[];
  apkUrl: string;
  forceUpdate: boolean;
}
