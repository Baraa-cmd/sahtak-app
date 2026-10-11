import {
  Pharmacy,
  Nurse,
  Hospital,
  MedicalLab,
  BloodDonationRequest,
  RatingReview,
  UserLocation,
  CommunityReport,
  AppUser,
  AuthSession,
  DutyScheduleConfig,
  AppUpdateInfo
} from '../types';
import { DEFAULT_DUTY_SCHEDULE } from './initialData';

export const CURRENT_APP_VERSION = '1.6.75';

export const DEFAULT_APP_UPDATE: AppUpdateInfo = {
  version: '1.6.75',
  releaseNotes: [
    'المبيعات صارت مطابقة على كل الأجهزة: البيع يُرسل فوراً، والإلغاء من جهاز يظهر على الآخر، ولا تتكرر الدفعة',
    'سداد الديون (كامل أو جزئي) يظهر على كل الأجهزة',
    'بطاقات الهوتسبوت تنقطع تلقائياً عند انتهاء مدتها حتى لو كان المشترك متصلاً',
    'إصلاح نغمة الإشعارات وجعلها تنبه بصوت واضح',
    'إزالة زر التثبيت اليدوي والتبرع بالدم لتخفيف الواجهة'
  ],
  apkUrl: 'https://github.com/Baraa-cmd/sahtak-app/releases/download/v1.0-apk/Sahtak-Dierhafer.apk',
  forceUpdate: true
};

const CACHE_KEYS = {
  PHARMACIES: 'sehatuk_cached_pharmacies_v1',
  NURSES: 'sehatuk_cached_nurses_v1',
  HOSPITALS: 'sehatuk_cached_hospitals_v1',
  LABS: 'sehatuk_cached_labs_v1',
  BLOOD_REQUESTS: 'sehatuk_cached_blood_requests_v1',
  FAVORITES: 'sehatuk_user_favorites_v1',
  RATINGS: 'sehatuk_user_ratings_v1',
  USER_LOCATION: 'sehatuk_cached_user_location_v1',
  COMMUNITY_REPORTS: 'sehatuk_community_reports_v1',
  AUTH_USERS: 'sehatuk_cached_users_v1',
  AUTH_SESSION: 'sehatuk_auth_session_v1',
  LAST_SYNC: 'sehatuk_last_sync_timestamp'
};

export const DEFAULT_ADMIN_USER: AppUser = {
  id: 'admin_root',
  username: 'admin',
  password: 'admin123',
  role: 'admin',
  displayName: 'مدير المنصة (الأدمن)',
  createdAt: new Date().toISOString()
};

export const offlineStorage = {
  saveAuthSession(session: AuthSession | null): void {
    try {
      if (session) {
        localStorage.setItem(CACHE_KEYS.AUTH_SESSION, JSON.stringify(session));
      } else {
        localStorage.removeItem(CACHE_KEYS.AUTH_SESSION);
      }
    } catch (e) {
      console.warn('Could not cache auth session:', e);
    }
  },

  getAuthSession(): AuthSession | null {
    try {
      const cached = localStorage.getItem(CACHE_KEYS.AUTH_SESSION);
      return cached ? JSON.parse(cached) : null;
    } catch {
      return null;
    }
  },

  saveUsers(users: AppUser[]): void {
    try {
      localStorage.setItem(CACHE_KEYS.AUTH_USERS, JSON.stringify(users));
    } catch (e) {
      console.warn('Could not cache users:', e);
    }
  },

  getUsers(): AppUser[] {
    try {
      const cached = localStorage.getItem(CACHE_KEYS.AUTH_USERS);
      if (cached) {
        const parsed = JSON.parse(cached);
        if (Array.isArray(parsed) && parsed.length > 0) return parsed;
      }
      return [DEFAULT_ADMIN_USER];
    } catch {
      return [DEFAULT_ADMIN_USER];
    }
  },

  saveUserLocation(loc: UserLocation): void {
    try {
      localStorage.setItem(CACHE_KEYS.USER_LOCATION, JSON.stringify(loc));
    } catch (e) {
      console.warn('Could not cache user location:', e);
    }
  },

  getUserLocation(): UserLocation | null {
    try {
      const cached = localStorage.getItem(CACHE_KEYS.USER_LOCATION);
      return cached ? JSON.parse(cached) : null;
    } catch {
      return null;
    }
  },

  savePharmacies(data: Pharmacy[]): void {
    try {
      localStorage.setItem(CACHE_KEYS.PHARMACIES, JSON.stringify(data));
      localStorage.setItem(CACHE_KEYS.LAST_SYNC, new Date().toISOString());
    } catch (e) {
      console.warn('Could not cache pharmacies:', e);
    }
  },

  getPharmacies(): Pharmacy[] | null {
    try {
      const cached = localStorage.getItem(CACHE_KEYS.PHARMACIES);
      return cached ? JSON.parse(cached) : null;
    } catch {
      return null;
    }
  },

  saveNurses(data: Nurse[]): void {
    try {
      localStorage.setItem(CACHE_KEYS.NURSES, JSON.stringify(data));
    } catch (e) {
      console.warn('Could not cache nurses:', e);
    }
  },

  getNurses(): Nurse[] | null {
    try {
      const cached = localStorage.getItem(CACHE_KEYS.NURSES);
      return cached ? JSON.parse(cached) : null;
    } catch {
      return null;
    }
  },

  saveHospitals(data: Hospital[]): void {
    try {
      localStorage.setItem(CACHE_KEYS.HOSPITALS, JSON.stringify(data));
    } catch (e) {
      console.warn('Could not cache hospitals:', e);
    }
  },

  getHospitals(): Hospital[] | null {
    try {
      const cached = localStorage.getItem(CACHE_KEYS.HOSPITALS);
      return cached ? JSON.parse(cached) : null;
    } catch {
      return null;
    }
  },

  // Feature 48: Medical Labs
  saveLabs(data: MedicalLab[]): void {
    try {
      localStorage.setItem(CACHE_KEYS.LABS, JSON.stringify(data));
    } catch (e) {
      console.warn('Could not cache labs:', e);
    }
  },

  getLabs(): MedicalLab[] | null {
    try {
      const cached = localStorage.getItem(CACHE_KEYS.LABS);
      return cached ? JSON.parse(cached) : null;
    } catch {
      return null;
    }
  },

  // Feature 6: Blood Donation Requests
  saveBloodRequests(data: BloodDonationRequest[]): void {
    try {
      localStorage.setItem(CACHE_KEYS.BLOOD_REQUESTS, JSON.stringify(data));
    } catch (e) {
      console.warn('Could not cache blood requests:', e);
    }
  },

  getBloodRequests(): BloodDonationRequest[] {
    try {
      const cached = localStorage.getItem(CACHE_KEYS.BLOOD_REQUESTS);
      return cached ? JSON.parse(cached) : [];
    } catch {
      return [];
    }
  },

  addBloodRequest(req: BloodDonationRequest): BloodDonationRequest[] {
    const list = [req, ...this.getBloodRequests().filter(r => r.id !== req.id)];
    this.saveBloodRequests(list);
    return list;
  },

  // Feature 26: Favorites System
  getFavorites(): string[] {
    try {
      const cached = localStorage.getItem(CACHE_KEYS.FAVORITES);
      return cached ? JSON.parse(cached) : [];
    } catch {
      return [];
    }
  },

  isFavorite(id: string): boolean {
    return this.getFavorites().includes(id);
  },

  toggleFavorite(id: string): boolean {
    const favs = this.getFavorites();
    let updated: string[];
    let isNowFav = false;
    if (favs.includes(id)) {
      updated = favs.filter(f => f !== id);
    } else {
      updated = [...favs, id];
      isNowFav = true;
    }
    try {
      localStorage.setItem(CACHE_KEYS.FAVORITES, JSON.stringify(updated));
    } catch (e) {
      console.warn('Could not save favorites:', e);
    }
    return isNowFav;
  },

  // Feature 19: Patient Ratings
  getAllRatings(): RatingReview[] {
    try {
      const cached = localStorage.getItem(CACHE_KEYS.RATINGS);
      return cached ? JSON.parse(cached) : [];
    } catch {
      return [];
    }
  },

  saveRating(review: RatingReview): void {
    try {
      const list = [review, ...this.getAllRatings().filter(r => r.id !== review.id)];
      localStorage.setItem(CACHE_KEYS.RATINGS, JSON.stringify(list));
    } catch (e) {
      console.warn('Could not save rating:', e);
    }
  },

  getRatingsForTarget(targetId: string): RatingReview[] {
    return this.getAllRatings().filter(r => r.targetId === targetId);
  },

  getLastSyncTime(): string | null {
    return localStorage.getItem(CACHE_KEYS.LAST_SYNC);
  },

  saveCommunityReport(report: CommunityReport): void {
    try {
      const existing = this.getCommunityReports();
      const updated = [report, ...existing.filter(r => r.id !== report.id)].slice(0, 100);
      localStorage.setItem(CACHE_KEYS.COMMUNITY_REPORTS, JSON.stringify(updated));
    } catch (e) {
      console.warn('Could not cache community report:', e);
    }
  },

  getCommunityReports(): CommunityReport[] {
    try {
      const cached = localStorage.getItem(CACHE_KEYS.COMMUNITY_REPORTS);
      return cached ? JSON.parse(cached) : [];
    } catch {
      return [];
    }
  },

  getReportsForTarget(targetId: string): CommunityReport[] {
    return this.getCommunityReports().filter(r => r.targetId === targetId);
  },

  saveDutySchedule(config: DutyScheduleConfig): void {
    try {
      localStorage.setItem('sehatuk_duty_schedule_config_v1', JSON.stringify(config));
    } catch (e) {
      console.warn('Could not save duty schedule:', e);
    }
  },

  getDutySchedule(): DutyScheduleConfig {
    try {
      const cached = localStorage.getItem('sehatuk_duty_schedule_config_v1');
      return cached ? JSON.parse(cached) : DEFAULT_DUTY_SCHEDULE;
    } catch {
      return DEFAULT_DUTY_SCHEDULE;
    }
  },

  getAppUpdate(): AppUpdateInfo {
    try {
      const cached = localStorage.getItem('sehatuk_app_update_info_v1');
      return cached ? JSON.parse(cached) : DEFAULT_APP_UPDATE;
    } catch {
      return DEFAULT_APP_UPDATE;
    }
  },

  saveAppUpdate(info: AppUpdateInfo): void {
    try {
      localStorage.setItem('sehatuk_app_update_info_v1', JSON.stringify(info));
    } catch (e) {
      console.warn('Could not save app update info:', e);
    }
  }
};
