import React, { useState, useEffect } from 'react';
import {
  Pharmacy,
  Nurse,
  Hospital,
  MedicalLab,
  UserLocation,
  ActiveTab,
  SelectedRouteTarget,
  AppUser,
  AuthSession,
  RatingReview,
  CommunityReport,
  AppUpdateInfo,
  DutyScheduleConfig,
  Doctor
} from '../types';
import {
  subscribeToPharmacies,
  subscribeToNurses,
  subscribeToHospitals,
  subscribeToAppUpdate,
  subscribeToUsers,
  updatePharmacyStatus,
  savePharmacy,
  saveCommunityReportToFirestore,
  saveReviewToFirestore
} from '../lib/firebase';
import {
  DAYR_HAFIR_DEFAULT,
  calculateDistanceKm,
  PresetDistrict,
  DEFAULT_DUTY_SCHEDULE,
  getDutyShiftInfo,
  getPharmacyLiveStatus,
  INITIAL_PHARMACIES,
  INITIAL_DOCTORS
} from '../lib/initialData';
import { offlineStorage, CURRENT_APP_VERSION } from '../lib/offlineStorage';
import { detectRealLocationAutomatically } from '../lib/locationDetector';
import { Header } from './Header';
import { BottomNav } from './BottomNav';
import { PharmaciesView } from './PharmaciesView';
import { NursesView } from './NursesView';
import { HospitalsView } from './HospitalsView';
import { LabsView } from './LabsView';
import { DoctorsView } from './DoctorsView';
import { MapView } from './MapView';
import { LocationModal } from './LocationModal';
import { RatingModal } from './RatingModal';
import { CommunityReportModal } from './CommunityReportModal';
import { AuthModal } from './AuthModal';
import { UpdateModal } from './UpdateModal';
import { ArrowRight, Shield } from 'lucide-react';

interface UserAppProps {
  onBackToAdmin?: () => void;
  onOpenAdminLogin?: () => void;
  isAdmin?: boolean;
}

export const UserApp: React.FC<UserAppProps> = ({ onBackToAdmin, onOpenAdminLogin, isAdmin }) => {
  const [activeTab, setActiveTab] = useState<ActiveTab>('pharmacies');

  // Live Data States with offline fallback
  const [pharmacies, setPharmacies] = useState<Pharmacy[]>(() => {
    const cached = offlineStorage.getPharmacies();
    if (cached && cached.length > 0) return cached;
    return INITIAL_PHARMACIES;
  });
  const [nurses, setNurses] = useState<Nurse[]>(() => offlineStorage.getNurses() || []);
  const [hospitals, setHospitals] = useState<Hospital[]>(() => offlineStorage.getHospitals() || []);
  const [labs] = useState<MedicalLab[]>(() => offlineStorage.getLabs() || []);
  const [appUpdate, setAppUpdate] = useState<AppUpdateInfo>(() => offlineStorage.getAppUpdate());
  const [users, setUsers] = useState<AppUser[]>(() => offlineStorage.getUsers() || []);
  const [dutySchedule] = useState<DutyScheduleConfig>(DEFAULT_DUTY_SCHEDULE);

  // User location state
  const [userLocation, setUserLocation] = useState<UserLocation>(() => {
    const cached = offlineStorage.getUserLocation();
    if (cached) return cached;
    return {
      latitude: DAYR_HAFIR_DEFAULT.latitude,
      longitude: DAYR_HAFIR_DEFAULT.longitude,
      districtName: DAYR_HAFIR_DEFAULT.districtName,
      isAuto: false,
      source: 'default'
    };
  });
  const [isLocating, setIsLocating] = useState(false);

  // Map route target
  const [selectedRouteTarget, setSelectedRouteTarget] = useState<SelectedRouteTarget | null>(null);

  // Modals state
  const [isLocationModalOpen, setIsLocationModalOpen] = useState(false);
  const [isProviderModalOpen, setIsProviderModalOpen] = useState(false);
  const [isUpdateModalOpen, setIsUpdateModalOpen] = useState(false);
  const [ratingTarget, setRatingTarget] = useState<{
    id: string;
    name: string;
    type: 'pharmacy' | 'nurse' | 'hospital' | 'lab' | 'doctor';
    currentRating?: number;
  } | null>(null);
  const [reportTarget, setReportTarget] = useState<{
    id: string;
    name: string;
    type: 'pharmacy' | 'nurse' | 'hospital' | 'lab';
    district?: string;
    currentPhone?: string;
    isOnDuty?: boolean;
  } | null>(null);

  // Auth session for provider
  const [session, setSession] = useState<AuthSession | null>(() => offlineStorage.getAuthSession());
  const [isOnline, setIsOnline] = useState(navigator.onLine);
  const [notificationsEnabled, setNotificationsEnabled] = useState(false);

  // Listen to network status
  useEffect(() => {
    const handleOnline = () => setIsOnline(true);
    const handleOffline = () => setIsOnline(false);
    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);
    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  // Subscribe to real-time updates from Firestore
  useEffect(() => {
    const unsubPh = subscribeToPharmacies((data) => setPharmacies(data));
    const unsubNu = subscribeToNurses((data) => setNurses(data));
    const unsubHp = subscribeToHospitals((data) => setHospitals(data));
    const unsubUs = subscribeToUsers((data) => setUsers(data));
    const unsubUp = subscribeToAppUpdate((data) => {
      setAppUpdate(data);
    });

    return () => {
      unsubPh();
      unsubNu();
      unsubHp();
      unsubUs();
      unsubUp();
    };
  }, []);

  // Recalculate distances when user location changes
  const pharmaciesWithDistance = React.useMemo(() => {
    return pharmacies.map((p) => ({
      ...p,
      distanceKm: calculateDistanceKm(
        userLocation.latitude,
        userLocation.longitude,
        p.latitude,
        p.longitude
      )
    }));
  }, [pharmacies, userLocation]);

  const nursesWithDistance = React.useMemo(() => {
    return nurses.map((n) => ({
      ...n,
      distanceKm: calculateDistanceKm(
        userLocation.latitude,
        userLocation.longitude,
        n.latitude,
        n.longitude
      )
    }));
  }, [nurses, userLocation]);

  const hospitalsWithDistance = React.useMemo(() => {
    return hospitals.map((h) => ({
      ...h,
      distanceKm: calculateDistanceKm(
        userLocation.latitude,
        userLocation.longitude,
        h.latitude,
        h.longitude
      )
    }));
  }, [hospitals, userLocation]);

  const [doctors] = useState<Doctor[]>(() => INITIAL_DOCTORS);
  const doctorsWithDistance = React.useMemo(() => {
    return doctors.map((d) => ({
      ...d,
      distanceKm: calculateDistanceKm(
        userLocation.latitude,
        userLocation.longitude,
        d.latitude,
        d.longitude
      )
    }));
  }, [doctors, userLocation]);

  // Current duty shift info to calculate accurate on-duty counts
  const currentShiftInfo = React.useMemo(() => {
    return getDutyShiftInfo(dutySchedule);
  }, [dutySchedule]);

  // Accurate duty count using real-time schedule rules
  const onDutyPharmaciesCount = React.useMemo(() => {
    return pharmacies.filter((p) => {
      const status = getPharmacyLiveStatus(p);
      return status.isDutyActiveNow || status.isOnDutyToday;
    }).length;
  }, [pharmacies]);

  const onDutyNursesCount = React.useMemo(() => {
    return nurses.filter((n) => n.isOnDuty && n.isAvailable).length;
  }, [nurses]);

  // Handle map selection
  const handleSelectOnMap = (target: SelectedRouteTarget) => {
    setSelectedRouteTarget(target);
    setActiveTab('map');
  };

  // Location handlers
  const handleDetectGps = async () => {
    setIsLocating(true);
    try {
      const loc = await detectRealLocationAutomatically();
      setUserLocation(loc);
      offlineStorage.saveUserLocation(loc);
    } catch (err) {
      console.warn('GPS detection failed:', err);
    } finally {
      setIsLocating(false);
      setIsLocationModalOpen(false);
    }
  };

  const handleSelectPreset = (preset: PresetDistrict) => {
    const loc: UserLocation = {
      latitude: preset.latitude,
      longitude: preset.longitude,
      districtName: preset.name,
      isAuto: false,
      source: 'preset'
    };
    setUserLocation(loc);
    offlineStorage.saveUserLocation(loc);
    setIsLocationModalOpen(false);
  };

  // Community report handler
  const handleCommunityReportSubmit = async (
    report: CommunityReport,
    autoUpdateDuty?: boolean | null
  ) => {
    try {
      await saveCommunityReportToFirestore(report);
    } catch (err) {
      console.warn('Could not save community report to firestore:', err);
    }

    if (autoUpdateDuty !== undefined && autoUpdateDuty !== null && report.targetType === 'pharmacy') {
      try {
        await updatePharmacyStatus(report.targetId, { isOnDuty: autoUpdateDuty });
      } catch (err) {
        console.warn('Could not update status from report:', err);
      }
    }
  };

  return (
    <div className="min-h-screen bg-slate-100 text-slate-800 flex flex-col font-sans selection:bg-emerald-500 selection:text-white" dir="rtl">

      {/* Admin Return Banner if viewing from Admin */}
      {onBackToAdmin && (
        <div className="bg-slate-900 border-b border-slate-800 text-white px-4 py-2 flex items-center justify-between text-xs sticky top-0 z-50">
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
            <span className="font-bold">معاينة تطبيق المستخدمين الحية</span>
            <span className="text-slate-400 text-[11px]">(كما يظهر للمستخدمين على هواتفهم)</span>
          </div>
          <button
            onClick={onBackToAdmin}
            className="flex items-center gap-1.5 bg-emerald-600 hover:bg-emerald-500 text-white font-bold px-3 py-1 rounded-xl text-xs transition cursor-pointer"
          >
            <span>العودة للوحة تحكم المشرف</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>
      )}

      {/* Top Header */}
      <Header
        userLocation={userLocation}
        isLocating={isLocating}
        onRefreshLocation={handleDetectGps}
        onOpenLocationModal={() => setIsLocationModalOpen(true)}
        isOnline={isOnline}
        notificationsEnabled={notificationsEnabled}
        onRequestNotifications={() => setNotificationsEnabled(true)}
        onOpenProviderLogin={() => setIsProviderModalOpen(true)}
        onOpenAdminLogin={onOpenAdminLogin}
        session={session}
        activeTab={activeTab}
        onChangeTab={(t) => setActiveTab(t)}
        onDutyPharmaciesCount={onDutyPharmaciesCount}
        onDutyNursesCount={onDutyNursesCount}
      />

      {/* Main View Area */}
      <main className="flex-1">
        {activeTab === 'pharmacies' && (
          <PharmaciesView
            pharmacies={pharmaciesWithDistance}
            onSelectOnMap={handleSelectOnMap}
            onOpenCommunityReport={(t) => setReportTarget(t)}
            onOpenRatingModal={(t) => setRatingTarget(t)}
            dutySchedule={dutySchedule}
          />
        )}

        {activeTab === 'nurses' && (
          <NursesView
            nurses={nursesWithDistance}
            onSelectOnMap={handleSelectOnMap}
            onOpenCommunityReport={(t) => setReportTarget(t)}
            onOpenRatingModal={(t) => setRatingTarget(t)}
          />
        )}

        {activeTab === 'labs' && (
          <LabsView
            labs={labs}
            onSelectOnMap={handleSelectOnMap}
            onOpenCommunityReport={(t) => setReportTarget(t)}
            onOpenRatingModal={(t) => setRatingTarget(t)}
          />
        )}

        {activeTab === 'hospitals' && (
          <HospitalsView
            hospitals={hospitalsWithDistance}
            onSelectOnMap={handleSelectOnMap}
            onOpenCommunityReport={(t) => setReportTarget(t)}
            onOpenRatingModal={(t) => setRatingTarget(t)}
          />
        )}

        {activeTab === 'doctors' && (
          <DoctorsView
            doctors={doctorsWithDistance}
            onSelectOnMap={handleSelectOnMap}
            onOpenRatingModal={(t) => setRatingTarget(t)}
          />
        )}

        {activeTab === 'map' && (
          <MapView
            userLocation={userLocation}
            pharmacies={pharmaciesWithDistance}
            nurses={nursesWithDistance}
            hospitals={hospitalsWithDistance}
            labs={labs}
            selectedTarget={selectedRouteTarget}
            onClearSelectedTarget={() => setSelectedRouteTarget(null)}
            onSelectTarget={(t) => setSelectedRouteTarget(t)}
            onOpenLocationModal={() => setIsLocationModalOpen(true)}
          />
        )}
      </main>

      {/* Bottom Navigation */}
      <BottomNav
        activeTab={activeTab}
        onChangeTab={(t) => setActiveTab(t)}
        onDutyPharmaciesCount={onDutyPharmaciesCount}
        onDutyNursesCount={onDutyNursesCount}
      />

      {/* Location Modal */}
      <LocationModal
        isOpen={isLocationModalOpen}
        onClose={() => setIsLocationModalOpen(false)}
        userLocation={userLocation}
        isLocating={isLocating}
        onDetectGps={handleDetectGps}
        onSelectPreset={handleSelectPreset}
      />

      {/* Rating Modal */}
      <RatingModal
        isOpen={!!ratingTarget}
        onClose={() => setRatingTarget(null)}
        target={ratingTarget}
        onSubmitRating={async (review: RatingReview) => {
          try {
            await saveReviewToFirestore(review);
          } catch (err) {
            console.warn('Could not save review to Firestore:', err);
          }
          offlineStorage.saveReview(review);
          setRatingTarget(null);
        }}
      />

      {/* Community Report Modal */}
      <CommunityReportModal
        isOpen={!!reportTarget}
        onClose={() => setReportTarget(null)}
        target={reportTarget}
        onSubmitReport={handleCommunityReportSubmit}
      />

      {/* Auth & Provider Login Modal */}
      <AuthModal
        isOpen={isProviderModalOpen}
        onClose={() => setIsProviderModalOpen(false)}
        session={session}
        onLogin={(s) => setSession(s)}
        onLogout={() => {
          setSession(null);
          offlineStorage.clearAuthSession();
        }}
        users={users}
        pharmacies={pharmacies}
        nurses={nurses}
        onPharmacyUpdated={(ph) => {
          setPharmacies((prev) => prev.map((p) => (p.id === ph.id ? ph : p)));
        }}
        onNurseUpdated={(nr) => {
          setNurses((prev) => prev.map((n) => (n.id === nr.id ? nr : n)));
        }}
        dutySchedule={dutySchedule}
      />

      {/* OTA Update Modal */}
      <UpdateModal
        updateInfo={appUpdate}
        currentVersion={CURRENT_APP_VERSION}
        isAdmin={isAdmin}
        isOpen={isUpdateModalOpen}
        onClose={() => setIsUpdateModalOpen(false)}
      />
    </div>
  );
};
