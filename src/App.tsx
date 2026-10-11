import React, { useState, useEffect, useMemo, useCallback, useRef } from 'react';
import { X, BellRing } from 'lucide-react';
import {
  Pharmacy,
  Nurse,
  Hospital,
  MedicalLab,
  BloodDonationRequest,
  RatingReview,
  UserLocation,
  ActiveTab,
  SelectedRouteTarget,
  CommunityReport,
  AppUser,
  AuthSession,
  DutyScheduleConfig
} from './types';
import {
  INITIAL_PHARMACIES,
  INITIAL_NURSES,
  INITIAL_HOSPITALS,
  INITIAL_LABS,
  INITIAL_BLOOD_REQUESTS,
  DAYR_HAFIR_DEFAULT,
  calculateDistanceKm,
  PresetDistrict,
  DEFAULT_DUTY_SCHEDULE
} from './lib/initialData';
import {
  detectRealLocationAutomatically
} from './lib/locationDetector';
import {
  subscribeToPharmacies,
  subscribeToNurses,
  subscribeToHospitals,
  subscribeToUsers,
  seedInitialDataIfEmpty
} from './lib/firebase';
import { offlineStorage, DEFAULT_ADMIN_USER, CURRENT_APP_VERSION } from './lib/offlineStorage';
import { notificationService } from './lib/notifications';
import { Header } from './components/Header';
import { BottomNav } from './components/BottomNav';
import { PharmaciesView } from './components/PharmaciesView';
import { NursesView } from './components/NursesView';
import { LabsView } from './components/LabsView';
import { HospitalsView } from './components/HospitalsView';
import { MapView } from './components/MapView';
import { AuthModal } from './components/AuthModal';
import { LocationModal } from './components/LocationModal';
import { CommunityReportModal } from './components/CommunityReportModal';
import { OfflineIndicator } from './components/OfflineIndicator';
import { SplashScreen } from './components/SplashScreen';
import { RatingModal } from './components/RatingModal';
import { UpdateModal } from './components/UpdateModal';

export default function App() {
  const [showSplash, setShowSplash] = useState(true);
  // Navigation
  const [activeTab, setActiveTab] = useState<ActiveTab>('pharmacies');

  // User Location (Centered in Dayr Hafir or restored from cache)
  const [userLocation, setUserLocation] = useState<UserLocation>(() => {
    const cached = offlineStorage.getUserLocation();
    if (cached && typeof cached.latitude === 'number' && typeof cached.longitude === 'number') {
      return cached;
    }
    return {
      latitude: DAYR_HAFIR_DEFAULT.latitude,
      longitude: DAYR_HAFIR_DEFAULT.longitude,
      districtName: DAYR_HAFIR_DEFAULT.districtName,
      isAuto: false,
      source: 'default'
    };
  });
  const [isLocating, setIsLocating] = useState(false);
  const [isLocationModalOpen, setIsLocationModalOpen] = useState(false);

  // Auth & Roles State
  const [authSession, setAuthSession] = useState<AuthSession | null>(() => {
    return offlineStorage.getAuthSession();
  });
  const [users, setUsers] = useState<AppUser[]>(() => {
    return offlineStorage.getUsers() || [DEFAULT_ADMIN_USER];
  });
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);

  // Network Online/Offline state
  const [isOnline, setIsOnline] = useState<boolean>(navigator.onLine);

  // Notifications state
  const [notificationsEnabled, setNotificationsEnabled] = useState<boolean>(false);
  const [dismissedNotificationBanner, setDismissedNotificationBanner] = useState<boolean>(false);

  // Duty Schedule state (Manager configurable, Default: 9:00 PM - 12:00 AM | Friday: 9:00 AM - 12:00 PM)
  const [dutySchedule, setDutySchedule] = useState<DutyScheduleConfig>(() =>
    offlineStorage.getDutySchedule() || DEFAULT_DUTY_SCHEDULE
  );

  const handleUpdateDutySchedule = (newConfig: DutyScheduleConfig) => {
    setDutySchedule(newConfig);
    offlineStorage.saveDutySchedule(newConfig);
    setCommunityToast('تم حفظ وتطبيق أوقات المناوبة المعتمدة بنجاح! ⏰');
    setTimeout(() => setCommunityToast(null), 3500);
  };

  // Auto-request notifications on initial app mount (Native APK & Web)
  useEffect(() => {
    let timer: ReturnType<typeof setTimeout>;
    const initNotifications = async () => {
      try {
        const perm = await notificationService.getPermission();
        if (perm === 'granted') {
          setNotificationsEnabled(true);
          return;
        }

        // Prompt automatically after 1.2s to let app mount smoothly
        timer = setTimeout(async () => {
          try {
            const res = await notificationService.requestPermission();
            const granted = res === 'granted';
            setNotificationsEnabled(granted);
            if (granted) {
              notificationService.sendNotification('منصة صحتك - دير حافر 🩺', {
                body: 'تم تفعيل التنبيهات اللحظية للمناوبات والطوارئ بنجاح.'
              });
            }
          } catch (e) {
            console.warn('Auto notification request error:', e);
          }
        }, 1200);
      } catch (err) {
        console.warn('Init notifications error:', err);
      }
    };

    initNotifications();
    return () => clearTimeout(timer);
  }, []);

  // Provider Modal state
  const [isProviderModalOpen, setIsProviderModalOpen] = useState(false);

  // Community Reporting state
  const [communityModalTarget, setCommunityModalTarget] = useState<{
    id: string;
    name: string;
    type: 'pharmacy' | 'nurse' | 'hospital' | 'lab';
    district?: string;
    currentPhone?: string;
    isOnDuty?: boolean;
  } | null>(null);
  const [communityToast, setCommunityToast] = useState<string | null>(null);

  // Duty Alert Toast state & refs for tracking on-duty changes
  const [dutyToast, setDutyToast] = useState<{
    id: string;
    title: string;
    pharmacyName: string;
    district?: string;
    dutyEndTime?: string;
  } | null>(null);
  const isInitialPharmaciesLoadRef = useRef(true);
  const previousOnDutyPharmaciesRef = useRef<Map<string, boolean>>(new Map());

  // Selected Target for direct map routing
  const [selectedRouteTarget, setSelectedRouteTarget] = useState<SelectedRouteTarget | null>(null);

  // Data states
  const [rawPharmacies, setRawPharmacies] = useState<Pharmacy[]>(() => {
    return offlineStorage.getPharmacies() || INITIAL_PHARMACIES;
  });

  const [rawNurses, setRawNurses] = useState<Nurse[]>(() => {
    return offlineStorage.getNurses() || INITIAL_NURSES;
  });

  const [rawHospitals, setRawHospitals] = useState<Hospital[]>(() => {
    return offlineStorage.getHospitals() || INITIAL_HOSPITALS;
  });

  // Feature 48: Medical Labs & Radiology Centers
  const [rawLabs, setRawLabs] = useState<MedicalLab[]>(() => {
    return offlineStorage.getLabs() || INITIAL_LABS;
  });



  // Feature 19: Patient Ratings & Reviews
  const [ratingModalTarget, setRatingModalTarget] = useState<{
    id: string;
    name: string;
    type: 'pharmacy' | 'nurse' | 'hospital' | 'lab';
    currentRating?: number;
  } | null>(null);
  const [isRatingModalOpen, setIsRatingModalOpen] = useState(false);

  // Feature 18: Proximity alert toast & tracker (triggers within 200m)
  const [proximityToast, setProximityToast] = useState<{
    name: string;
    distanceMeters: number;
  } | null>(null);
  const notifiedProximityRef = useRef<Set<string>>(new Set());

  // Track online / offline events
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

  // Choose preset district in Dayr Hafir
  const handleSelectPresetDistrict = useCallback((preset: PresetDistrict) => {
    const newLoc: UserLocation = {
      latitude: preset.latitude,
      longitude: preset.longitude,
      districtName: `دير حافر - ${preset.name}`,
      isAuto: false,
      source: 'preset'
    };
    setUserLocation(newLoc);
    offlineStorage.saveUserLocation(newLoc);
  }, []);

  const [detectionNotice, setDetectionNotice] = useState<string | null>(null);

  // Automatic multi-tier location detector (GPS + IP Fallback + Arabic Reverse Geocode)
  const handleDetectLocation = useCallback(async () => {
    setIsLocating(true);
    setDetectionNotice('جاري تحديد موقعك الفعلي تلقائياً...');
    try {
      const detected = await detectRealLocationAutomatically((interim) => {
        setUserLocation(interim);
        offlineStorage.saveUserLocation(interim);
      });
      setUserLocation(detected);
      offlineStorage.saveUserLocation(detected);
      if (detected.source === 'gps') {
        setDetectionNotice(`📍 تم تحديد موقعك الدقيق عبر GPS: ${detected.districtName}`);
      } else if (detected.source === 'ip') {
        setDetectionNotice(`🌐 تم تحديد موقعك تلقائياً عبر الشبكة: ${detected.districtName}`);
      } else {
        setDetectionNotice(`📍 الموقع الافتراضي: ${detected.districtName}`);
      }
      setTimeout(() => setDetectionNotice(null), 5000);
    } catch (err) {
      console.warn('Auto location detection error:', err);
      setDetectionNotice(null);
    } finally {
      setIsLocating(false);
    }
  }, []);

  // Run automatic location detection immediately on initial mount
  useEffect(() => {
    handleDetectLocation();
  }, [handleDetectLocation]);

  // Continuous background GPS watcher (silently locks to high accuracy when available)
  useEffect(() => {
    if (!navigator.geolocation) return;
    const watchId = navigator.geolocation.watchPosition(
      (pos) => {
        const { latitude, longitude } = pos.coords;
        setUserLocation((current) => {
          // If within 15 meters, skip update to avoid unnecessary re-renders
          if (
            current.source === 'gps' &&
            Math.abs(current.latitude - latitude) < 0.00015 &&
            Math.abs(current.longitude - longitude) < 0.00015
          ) {
            return current;
          }
          const updated: UserLocation = {
            latitude,
            longitude,
            districtName: current.source === 'gps' && current.districtName ? current.districtName : 'موقعك الفعلي المباشر (GPS)',
            isAuto: true,
            source: 'gps'
          };
          offlineStorage.saveUserLocation(updated);
          return updated;
        });
      },
      () => {},
      { enableHighAccuracy: true, maximumAge: 15000 }
    );
    return () => {
      navigator.geolocation.clearWatch(watchId);
    };
  }, []);

  // Seed and subscribe to Firebase Firestore
  useEffect(() => {
    seedInitialDataIfEmpty();

    const unsubPharmacies = subscribeToPharmacies((data) => {
      if (isInitialPharmaciesLoadRef.current) {
        // Initialize reference map on first load without triggering alerts
        isInitialPharmaciesLoadRef.current = false;
        const initialMap = new Map<string, boolean>();
        data.forEach((p) => {
          initialMap.set(p.id, !!p.isOnDuty);
        });
        previousOnDutyPharmaciesRef.current = initialMap;
        setRawPharmacies(data);
        return;
      }

      // Check for any pharmacy that became on-duty (e.g. updated by admin/manager)
      const prevMap = previousOnDutyPharmaciesRef.current;
      const newlyOnDutyList = data.filter((p) => {
        const wasOnDuty = prevMap.get(p.id) ?? false;
        return p.isOnDuty && !wasOnDuty;
      });

      // Update map for future real-time diffing
      const updatedMap = new Map<string, boolean>();
      data.forEach((p) => {
        updatedMap.set(p.id, !!p.isOnDuty);
      });
      previousOnDutyPharmaciesRef.current = updatedMap;

      // Broadcast push notifications and banner to users
      newlyOnDutyList.forEach((p) => {
        const cleanName = notificationService.formatPharmacyName(p.name);

        // Send Web/PWA Push Notification: "تناوب الليلة : صيدلية كذا"
        notificationService.sendDutyNotification(p.name, p.dutyEndTime, p.district);

        setDutyToast({
          id: p.id,
          title: `تناوب الليلة : ${cleanName}`,
          pharmacyName: cleanName,
          district: p.district,
          dutyEndTime: p.dutyEndTime
        });

        setTimeout(() => {
          setDutyToast((current) => (current?.id === p.id ? null : current));
        }, 7000);
      });

      setRawPharmacies(data);
    });

    const unsubNurses = subscribeToNurses((data) => {
      setRawNurses(data);
    });

    const unsubHospitals = subscribeToHospitals((data) => {
      setRawHospitals(data);
    });

    const unsubUsers = subscribeToUsers((data) => {
      setUsers(data);
    });

    return () => {
      unsubPharmacies();
      unsubNurses();
      unsubHospitals();
      unsubUsers();
    };
  }, []);

  // Request notifications permission (Feature 10: plays medical alert chord)
  const handleRequestNotifications = async () => {
    if (notificationsEnabled) {
      notificationService.playEmergencyMedicalAlert();
      setCommunityToast('🔔 تم اختبار النغمة الطبية الإسعافية - الإشعارات مفعلة ونشطة');
      setTimeout(() => setCommunityToast(null), 3000);
      return;
    }
    const perm = await notificationService.requestPermission();
    const granted = perm === 'granted';
    setNotificationsEnabled(granted);
    if (granted) {
      notificationService.playEmergencyMedicalAlert();
      notificationService.sendNotification('منصة صحتك - دير حافر 🩺', {
        body: 'تم تفعيل التنبيهات اللحظية للمناوبات والطوارئ بنجاح.'
      });
      setCommunityToast('تم تفعيل نغمة وإشعارات المناوبة الليلية بنجاح! 🔔');
      setTimeout(() => setCommunityToast(null), 3500);
    }
  };

  // Compute live distances for all items
  const pharmaciesWithDistance = useMemo(() => {
    return rawPharmacies.map((p) => ({
      ...p,
      distanceKm: calculateDistanceKm(
        userLocation.latitude,
        userLocation.longitude,
        p.latitude,
        p.longitude
      )
    }));
  }, [rawPharmacies, userLocation]);

  const nursesWithDistance = useMemo(() => {
    return rawNurses.map((n) => ({
      ...n,
      distanceKm: calculateDistanceKm(
        userLocation.latitude,
        userLocation.longitude,
        n.latitude,
        n.longitude
      )
    }));
  }, [rawNurses, userLocation]);

  const hospitalsWithDistance = useMemo(() => {
    return rawHospitals.map((h) => ({
      ...h,
      distanceKm: calculateDistanceKm(
        userLocation.latitude,
        userLocation.longitude,
        h.latitude,
        h.longitude
      )
    }));
  }, [rawHospitals, userLocation]);

  // Feature 48: Labs & Radiology with live distance
  const labsWithDistance = useMemo(() => {
    return rawLabs.map((l) => ({
      ...l,
      distanceKm: calculateDistanceKm(
        userLocation.latitude,
        userLocation.longitude,
        l.latitude,
        l.longitude
      )
    }));
  }, [rawLabs, userLocation]);

  // Feature 18: Watch proximity to nearest on-duty pharmacy (within 200m)
  useEffect(() => {
    if (!userLocation.latitude || !userLocation.longitude) return;
    const dutyPharmacies = pharmaciesWithDistance.filter((p) => p.isOnDuty);
    for (const pharmacy of dutyPharmacies) {
      if (typeof pharmacy.distanceKm === 'number' && pharmacy.distanceKm <= 0.22) {
        if (!notifiedProximityRef.current.has(pharmacy.id)) {
          notifiedProximityRef.current.add(pharmacy.id);
          notificationService.playProximityAlert();
          setProximityToast({
            name: pharmacy.name,
            distanceMeters: Math.round(pharmacy.distanceKm * 1000)
          });
          setTimeout(() => setProximityToast(null), 5000);
          break;
        }
      }
    }
  }, [pharmaciesWithDistance, userLocation]);

  // Handle selecting a target for route drawing on map
  const handleSelectOnMap = (target: SelectedRouteTarget) => {
    setSelectedRouteTarget(target);
    setActiveTab('map');
  };

  // Quick SOS Action (110)
  const handleEmergencySOS = () => {
    window.location.href = 'tel:110';
  };

  // Open Community Report modal for an entity
  const handleOpenCommunityReport = useCallback(
    (target: {
      id: string;
      name: string;
      type: 'pharmacy' | 'nurse' | 'hospital' | 'lab';
      district?: string;
      currentPhone?: string;
      isOnDuty?: boolean;
    }) => {
      setCommunityModalTarget(target);
    },
    []
  );

  // Submit community report and update state/cache
  const handleSubmitCommunityReport = useCallback(
    (report: CommunityReport, autoUpdateDuty?: boolean | null) => {
      offlineStorage.saveCommunityReport(report);

      if (report.targetType === 'pharmacy') {
        setRawPharmacies((prev) => {
          const updated = prev.map((p) => {
            if (p.id === report.targetId) {
              return {
                ...p,
                isOnDuty:
                  autoUpdateDuty !== null && autoUpdateDuty !== undefined
                    ? autoUpdateDuty
                    : p.isOnDuty,
                isOpen: autoUpdateDuty === true ? true : p.isOpen,
                communityVerifiedAt: new Date().toISOString()
              };
            }
            return p;
          });
          offlineStorage.savePharmacies(updated);
          return updated;
        });
      } else if (report.targetType === 'nurse') {
        setRawNurses((prev) => {
          const updated = prev.map((n) => {
            if (n.id === report.targetId) {
              return {
                ...n,
                isOnDuty:
                  autoUpdateDuty !== null && autoUpdateDuty !== undefined
                    ? autoUpdateDuty
                    : n.isOnDuty,
                phone: report.suggestedPhone ? report.suggestedPhone : n.phone,
                communityVerifiedAt: new Date().toISOString()
              };
            }
            return n;
          });
          offlineStorage.saveNurses(updated);
          return updated;
        });
      } else if (report.targetType === 'hospital') {
        setRawHospitals((prev) => {
          const updated = prev.map((h) => {
            if (h.id === report.targetId) {
              return {
                ...h,
                emergencyPhone: report.suggestedPhone
                  ? report.suggestedPhone
                  : h.emergencyPhone,
                communityVerifiedAt: new Date().toISOString()
              };
            }
            return h;
          });
          offlineStorage.saveHospitals(updated);
          return updated;
        });
      }

      setCommunityToast(
        `تم تسجيل وتوثيق تحديثك حول ${report.targetName} بنجاح! شكراً لمساهمتك في خدمة أهالي دير حافر 🌟`
      );
      setTimeout(() => setCommunityToast(null), 5000);
    },
    []
  );

  // Feature 19: Patient Ratings & Reviews Handler
  const handleOpenRatingModal = useCallback(
    (target: {
      id: string;
      name: string;
      type: 'pharmacy' | 'nurse' | 'hospital' | 'lab';
      currentRating?: number;
    }) => {
      setRatingModalTarget(target);
      setIsRatingModalOpen(true);
    },
    []
  );

  const handleSubmitRating = useCallback(
    (review: RatingReview) => {
      offlineStorage.saveRating(review);
      if (review.targetType === 'pharmacy') {
        setRawPharmacies((prev) =>
          prev.map((p) => {
            if (p.id === review.targetId) {
              const currentRating = p.rating || 4.7;
              const currentCount = p.ratingsCount || 20;
              const newCount = currentCount + 1;
              const newRating = Number(((currentRating * currentCount + review.rating) / newCount).toFixed(1));
              return { ...p, rating: newRating, ratingsCount: newCount };
            }
            return p;
          })
        );
      } else if (review.targetType === 'nurse') {
        setRawNurses((prev) =>
          prev.map((n) => {
            if (n.id === review.targetId) {
              const currentRating = n.rating || 4.9;
              const currentCount = n.ratingsCount || 15;
              const newCount = currentCount + 1;
              const newRating = Number(((currentRating * currentCount + review.rating) / newCount).toFixed(1));
              return { ...n, rating: newRating, ratingsCount: newCount };
            }
            return n;
          })
        );
      } else if (review.targetType === 'hospital') {
        setRawHospitals((prev) =>
          prev.map((h) => {
            if (h.id === review.targetId) {
              const currentRating = h.rating || 4.6;
              const currentCount = h.ratingsCount || 25;
              const newCount = currentCount + 1;
              const newRating = Number(((currentRating * currentCount + review.rating) / newCount).toFixed(1));
              return { ...h, rating: newRating, ratingsCount: newCount };
            }
            return h;
          })
        );
      } else if (review.targetType === 'lab') {
        setRawLabs((prev) =>
          prev.map((l) => {
            if (l.id === review.targetId) {
              const currentRating = l.rating || 4.8;
              const currentCount = l.ratingsCount || 14;
              const newCount = currentCount + 1;
              const newRating = Number(((currentRating * currentCount + review.rating) / newCount).toFixed(1));
              return { ...l, rating: newRating, ratingsCount: newCount };
            }
            return l;
          })
        );
      }
      setCommunityToast(`تم تسجيل تقييمك (${review.rating} ⭐) بنجاح. شكراً لمشاركتك!`);
      setTimeout(() => setCommunityToast(null), 3500);
    },
    []
  );



  // Counts of on-duty items
  const onDutyPharmaciesCount = useMemo(
    () => rawPharmacies.filter((p) => p.isOnDuty).length,
    [rawPharmacies]
  );
  const onDutyNursesCount = useMemo(
    () => rawNurses.filter((n) => n.isOnDuty).length,
    [rawNurses]
  );

  return (
    <div className="min-h-screen bg-slate-100 flex justify-center selection:bg-emerald-500 selection:text-white">
      {/* Mobile-First Shell */}
      <div className="w-full max-w-md bg-slate-50 min-h-screen shadow-xl flex flex-col relative overflow-x-hidden">
        {/* Sticky Header */}
        <Header
          userLocation={userLocation}
          isLocating={isLocating}
          onRefreshLocation={handleDetectLocation}
          onOpenLocationModal={() => setIsLocationModalOpen(true)}
          isOnline={isOnline}
          notificationsEnabled={notificationsEnabled}
          onRequestNotifications={handleRequestNotifications}
          onOpenAuthModal={() => setIsAuthModalOpen(true)}
          session={authSession}
          onEmergencySOS={handleEmergencySOS}
        />

        {/* Feature 18: Proximity Alert Toast (Triggered when user is within 200m of on-duty facility) */}
        {proximityToast && (
          <div className="bg-gradient-to-r from-emerald-900 to-teal-900 text-white text-xs px-3.5 py-2.5 flex items-center justify-between shadow-lg animate-fadeIn z-35 shrink-0 border-b-2 border-emerald-400">
            <div className="flex items-center gap-2">
              <span className="text-base animate-bounce">📍</span>
              <div>
                <span className="font-black text-emerald-200">أنت قريب جداً ({proximityToast.distanceMeters}م):</span>{' '}
                <span className="font-bold">{proximityToast.name} (مناوبة ليلية)</span>
              </div>
            </div>
            <button
              onClick={() => setProximityToast(null)}
              className="text-emerald-300 hover:text-white mr-1 text-sm font-bold"
            >
              ×
            </button>
          </div>
        )}

        {/* Automatic Location Notification Toast */}
        {detectionNotice && (
          <div className="bg-emerald-800 text-white text-xs px-3.5 py-1.5 flex items-center justify-between shadow-sm animate-fadeIn z-30 shrink-0">
            <span className="truncate font-medium">{detectionNotice}</span>
            <button
              onClick={() => setDetectionNotice(null)}
              className="text-emerald-200 hover:text-white mr-2 text-base font-bold leading-none"
            >
              ×
            </button>
          </div>
        )}

        {/* Real-time Duty Push Notification In-App Toast: "تناوب الليلة : صيدلية كذا" */}
        {dutyToast && (
          <div className="bg-gradient-to-r from-emerald-950 via-emerald-900 to-emerald-950 text-white text-xs px-4 py-3 flex items-center justify-between shadow-xl animate-fadeIn z-35 shrink-0 border-b-2 border-amber-400">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-xl bg-amber-400 text-amber-950 flex items-center justify-center font-black text-sm shrink-0 shadow-sm animate-pulse">
                🌙
              </div>
              <div>
                <div className="font-black text-amber-300 text-xs">
                  {dutyToast.title}
                </div>
                <div className="text-[11px] text-emerald-100 font-medium">
                  {dutyToast.dutyEndTime ? `المناوبة حتى ${dutyToast.dutyEndTime}` : 'متاحة الآن طوال الليل'}
                  {dutyToast.district ? ` • ${dutyToast.district}` : ''}
                </div>
              </div>
            </div>
            <button
              onClick={() => setDutyToast(null)}
              className="p-1 rounded-lg text-emerald-300 hover:text-white hover:bg-emerald-800/60 transition-colors"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        )}

        {/* Community Toast Notification */}
        {communityToast && (
          <div className="bg-emerald-800 text-white text-xs px-3.5 py-2 flex items-center justify-between shadow-md animate-fadeIn z-30 shrink-0 border-b border-emerald-600/40">
            <span className="font-bold">{communityToast}</span>
            <button
              onClick={() => setCommunityToast(null)}
              className="text-emerald-200 hover:text-white mr-2 text-base font-bold leading-none"
            >
              ×
            </button>
          </div>
        )}

        {/* Main Content Area */}
        <main className="flex-1 overflow-y-auto">
          {/* Notifications Activation Banner (single top banner, shown when notifications not yet permitted) */}
          {!notificationsEnabled && !dismissedNotificationBanner && (
            <div className="bg-gradient-to-r from-emerald-800 via-teal-800 to-emerald-900 text-white p-3.5 mx-4 mt-3 rounded-2xl shadow-md border border-emerald-600/50 flex items-center justify-between gap-3 text-xs animate-fadeIn">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-xl bg-amber-400 text-amber-950 flex items-center justify-center font-bold text-base shrink-0 shadow-xs animate-bounce">
                  🔔
                </div>
                <div>
                  <p className="font-black text-amber-300">تفعيل إشعارات المناوبة</p>
                  <p className="text-emerald-100 text-[11px] font-medium leading-tight">
                    اضغط لتصلك الصيدلية المناوبة فور اعتمادها ليلاً
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-2 shrink-0">
                <button
                  onClick={handleRequestNotifications}
                  className="bg-amber-400 hover:bg-amber-300 active:scale-95 text-amber-950 font-black px-3 py-1.5 rounded-xl shadow-xs transition-all text-xs"
                >
                  تفعيل الآن
                </button>
                <button
                  onClick={() => setDismissedNotificationBanner(true)}
                  className="text-emerald-300 hover:text-white p-1 text-sm font-bold leading-none"
                  title="إغلاق التنبيه"
                >
                  ×
                </button>
              </div>
            </div>
          )}

          {activeTab === 'pharmacies' && (
            <PharmaciesView
              pharmacies={pharmaciesWithDistance}
              onSelectOnMap={handleSelectOnMap}
              onOpenCommunityReport={handleOpenCommunityReport}
              onOpenRatingModal={handleOpenRatingModal}
              dutySchedule={dutySchedule}
            />
          )}

          {activeTab === 'nurses' && (
            <NursesView
              nurses={nursesWithDistance}
              onSelectOnMap={handleSelectOnMap}
              onOpenCommunityReport={handleOpenCommunityReport}
              onOpenRatingModal={handleOpenRatingModal}
            />
          )}

          {activeTab === 'labs' && (
            <LabsView
              labs={labsWithDistance}
              onSelectOnMap={handleSelectOnMap}
              onOpenCommunityReport={handleOpenCommunityReport}
              onOpenRatingModal={handleOpenRatingModal}
            />
          )}

          {activeTab === 'hospitals' && (
            <HospitalsView
              hospitals={hospitalsWithDistance}
              onSelectOnMap={handleSelectOnMap}
              onOpenCommunityReport={handleOpenCommunityReport}
              onOpenRatingModal={handleOpenRatingModal}
            />
          )}

          {activeTab === 'map' && (
            <MapView
              userLocation={userLocation}
              pharmacies={pharmaciesWithDistance}
              nurses={nursesWithDistance}
              hospitals={hospitalsWithDistance}
              labs={labsWithDistance}
              selectedTarget={selectedRouteTarget}
              onClearSelectedTarget={() => setSelectedRouteTarget(null)}
              onSelectTarget={(target) => setSelectedRouteTarget(target)}
              onOpenLocationModal={() => setIsLocationModalOpen(true)}
            />
          )}
        </main>

        {/* Fixed Bottom Navigation */}
        <BottomNav
          activeTab={activeTab}
          onChangeTab={setActiveTab}
          onDutyPharmaciesCount={onDutyPharmaciesCount}
          onDutyNursesCount={onDutyNursesCount}
        />

        {/* Offline Indicator Banner */}
        <OfflineIndicator />

        {/* Location Picker & Troubleshoot Modal */}
        <LocationModal
          isOpen={isLocationModalOpen}
          onClose={() => setIsLocationModalOpen(false)}
          userLocation={userLocation}
          isLocating={isLocating}
          onDetectGps={handleDetectLocation}
          onSelectPreset={handleSelectPresetDistrict}
        />

        {/* Community Report & Update Modal */}
        <CommunityReportModal
          isOpen={!!communityModalTarget}
          onClose={() => setCommunityModalTarget(null)}
          target={communityModalTarget}
          onSubmitReport={handleSubmitCommunityReport}
        />

        {/* Authentication & Role-Based Control Modal (Lock Screen / Provider Portal) */}
        <AuthModal
          isOpen={isAuthModalOpen}
          onClose={() => setIsAuthModalOpen(false)}
          session={authSession}
          onLogin={(sess) => setAuthSession(sess)}
          onLogout={() => {
            setAuthSession(null);
            offlineStorage.saveAuthSession(null);
          }}
          users={users}
          pharmacies={rawPharmacies}
          nurses={rawNurses}
          dutySchedule={dutySchedule}
          onUpdateDutySchedule={handleUpdateDutySchedule}
          onPharmacyUpdated={(updated) => {
            // Update previousOnDuty reference immediately to prevent duplicate alerts from Firestore echo
            previousOnDutyPharmaciesRef.current.set(updated.id, !!updated.isOnDuty);

            setRawPharmacies((prev) =>
              prev.map((item) => (item.id === updated.id ? updated : item))
            );

            if (updated.isOnDuty) {
              const cleanName = notificationService.formatPharmacyName(updated.name);
              notificationService.sendDutyNotification(
                updated.name,
                updated.dutyEndTime,
                updated.district
              );

              setDutyToast({
                id: updated.id,
                title: `تناوب الليلة : ${cleanName}`,
                pharmacyName: cleanName,
                district: updated.district,
                dutyEndTime: updated.dutyEndTime
              });
              setTimeout(() => {
                setDutyToast((current) => (current?.id === updated.id ? null : current));
              }, 7000);
            }
          }}
          onNurseUpdated={(updated) => {
            setRawNurses((prev) =>
              prev.map((item) => (item.id === updated.id ? updated : item))
            );
          }}
        />



        {/* Feature 19: Patient Rating & Review Modal */}
        <RatingModal
          isOpen={isRatingModalOpen}
          onClose={() => {
            setIsRatingModalOpen(false);
            setRatingModalTarget(null);
          }}
          target={ratingModalTarget}
          onSubmitRating={handleSubmitRating}
        />

        {/* Professional Medical Splash Screen Overlay */}
        {showSplash && <SplashScreen onFinish={() => setShowSplash(false)} />}

        {/* Mandatory App Update Modal */}
        <UpdateModal
          updateInfo={offlineStorage.getAppUpdate()}
          currentVersion={CURRENT_APP_VERSION}
          isAdmin={authSession?.user?.role === 'admin'}
        />
      </div>
    </div>
  );
}
