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
import { DEFAULT_DUTY_SCHEDULE, normalizePharmacy } from './initialData';

export const CURRENT_APP_VERSION = '1.1.0';

export const DEFAULT_APP_UPDATE: AppUpdateInfo = {
  version: CURRENT_APP_VERSION,
  releaseNotes: [
    'النسخة المنقحة v1.1: الربط المتكامل والمباشر مع قاعدة البيانات السحابية الحية',
    'إعادة تمهيد شاشة تسجيل دخول الكوادر بالأمان الكامل وتحديث روابط التحميل',
    'مزامنة حية ومباشرة بين لوحة تحكم المدير وتطبيق المستخدمين'
  ],
  apkUrl: 'https://github.com/Baraa-cmd/sahtak-app/releases/download/v1.1/Sahtak-Dierhafer.apk',
  forceUpdate: false
};

const CACHE_KEYS = {
  PHARMACIES: 'sehatuk_cached_pharmacies_v2',
  NURSES: 'sehatuk_cached_nurses_v2',
  HOSPITALS: 'sehatuk_cached_hospitals_v2',
  LABS: 'sehatuk_cached_labs_v2',
  BLOOD_REQUESTS: 'sehatuk_cached_blood_requests_v2',
  FAVORITES: 'sehatuk_user_favorites_v2',
  RATINGS: 'sehatuk_user_ratings_v2',
  USER_LOCATION: 'sehatuk_cached_user_location_v2',
  COMMUNITY_REPORTS: 'sehatuk_community_reports_v2',
  AUTH_USERS: 'sehatuk_cached_users_v2',
  AUTH_SESSION: 'sehatuk_auth_session_v2',
  LAST_SYNC: 'sehatuk_last_sync_timestamp',
  DELETED_IDS: 'sehatuk_deleted_item_ids_v2'
};

// Automatic legacy cache purge to ensure stale deleted items are wiped across user devices
export const purgeLegacyCache = () => {
  if (typeof window === 'undefined' || typeof localStorage === 'undefined') return;
  try {
    const versionKey = 'sehatuk_app_cache_version';
    const lastVersion = localStorage.getItem(versionKey);
    if (lastVersion !== CURRENT_APP_VERSION) {
      localStorage.removeItem('sehatuk_cached_pharmacies_v1');
      localStorage.removeItem('sehatuk_cached_nurses_v1');
      localStorage.removeItem('sehatuk_cached_hospitals_v1');
      localStorage.removeItem('sehatuk_cached_labs_v1');
      localStorage.removeItem('sehatuk_cached_blood_requests_v1');
      localStorage.removeItem('sehatuk_cached_pharmacies_v2');
      localStorage.removeItem(CACHE_KEYS.PHARMACIES);
      localStorage.removeItem(CACHE_KEYS.NURSES);
      localStorage.removeItem(CACHE_KEYS.HOSPITALS);
      localStorage.setItem(versionKey, CURRENT_APP_VERSION);
    }
  } catch (e) {
    console.warn('Cache purge check:', e);
  }
};
purgeLegacyCache();

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

  clearAuthSession(): void {
    try {
      localStorage.removeItem(CACHE_KEYS.AUTH_SESSION);
    } catch (e) {
      console.warn('Could not clear auth session:', e);
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
      const deletedIds = this.getDeletedIds();
      const filtered = data.filter(p => !deletedIds.includes(p.id));
      localStorage.setItem(CACHE_KEYS.PHARMACIES, JSON.stringify(filtered));
      localStorage.setItem(CACHE_KEYS.LAST_SYNC, new Date().toISOString());
    } catch (e) {
      console.warn('Could not cache pharmacies:', e);
    }
  },

  getPharmacies(): Pharmacy[] | null {
    try {
      const cached = localStorage.getItem(CACHE_KEYS.PHARMACIES);
      if (!cached) return null;
      const parsed: Pharmacy[] = JSON.parse(cached);
      const deletedIds = this.getDeletedIds();
      return parsed
        .filter(p => !deletedIds.includes(p.id))
        .map(p => normalizePharmacy(p));
    } catch {
      return null;
    }
  },

  saveNurses(data: Nurse[]): void {
    try {
      const deletedIds = this.getDeletedIds();
      const filtered = data.filter(n => !deletedIds.includes(n.id));
      localStorage.setItem(CACHE_KEYS.NURSES, JSON.stringify(filtered));
    } catch (e) {
      console.warn('Could not cache nurses:', e);
    }
  },

  getNurses(): Nurse[] | null {
    try {
      const cached = localStorage.getItem(CACHE_KEYS.NURSES);
      if (!cached) return null;
      const parsed: Nurse[] = JSON.parse(cached);
      const deletedIds = this.getDeletedIds();
      return parsed.filter(n => !deletedIds.includes(n.id));
    } catch {
      return null;
    }
  },

  saveHospitals(data: Hospital[]): void {
    try {
      const deletedIds = this.getDeletedIds();
      const filtered = data.filter(h => !deletedIds.includes(h.id));
      localStorage.setItem(CACHE_KEYS.HOSPITALS, JSON.stringify(filtered));
    } catch (e) {
      console.warn('Could not cache hospitals:', e);
    }
  },

  getHospitals(): Hospital[] | null {
    try {
      const cached = localStorage.getItem(CACHE_KEYS.HOSPITALS);
      if (!cached) return null;
      const parsed: Hospital[] = JSON.parse(cached);
      const deletedIds = this.getDeletedIds();
      return parsed.filter(h => !deletedIds.includes(h.id));
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

  saveReview(review: RatingReview): void {
    this.saveRating(review);
  },

  getRatingsForTarget(targetId: string): RatingReview[] {
    return this.getAllRatings().filter(r => r.targetId === targetId);
  },

  getLastSyncTime(): string | null {
    return localStorage.getItem(CACHE_KEYS.LAST_SYNC);
  },

  markAsDeleted(id: string): void {
    try {
      const deleted = this.getDeletedIds();
      if (!deleted.includes(id)) {
        deleted.push(id);
        localStorage.setItem(CACHE_KEYS.DELETED_IDS, JSON.stringify(deleted));
      }
    } catch (e) {
      console.warn('Could not mark as deleted:', e);
    }
  },

  unmarkDeleted(id: string): void {
    try {
      const deleted = this.getDeletedIds().filter(dId => dId !== id);
      localStorage.setItem(CACHE_KEYS.DELETED_IDS, JSON.stringify(deleted));
    } catch (e) {
      console.warn('Could not unmark deleted:', e);
    }
  },

  getDeletedIds(): string[] {
    try {
      const cached = localStorage.getItem(CACHE_KEYS.DELETED_IDS);
      return cached ? JSON.parse(cached) : [];
    } catch {
      return [];
    }
  },

  isDeleted(id: string): boolean {
    return this.getDeletedIds().includes(id);
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
  },

  clearAllData(): void {
    try {
      localStorage.removeItem(CACHE_KEYS.PHARMACIES);
      localStorage.removeItem(CACHE_KEYS.NURSES);
      localStorage.removeItem(CACHE_KEYS.HOSPITALS);
      localStorage.removeItem(CACHE_KEYS.LABS);
      localStorage.removeItem(CACHE_KEYS.BLOOD_REQUESTS);
      localStorage.removeItem(CACHE_KEYS.COMMUNITY_REPORTS);
      localStorage.removeItem(CACHE_KEYS.RATINGS);
      localStorage.removeItem(CACHE_KEYS.DELETED_IDS);
      localStorage.removeItem('sehatuk_community_reports_v1');
    } catch (e) {
      console.warn('Could not clear local storage caches:', e);
    }
  }
};
