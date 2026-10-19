import React, { useState, useEffect } from 'react';
import {
  Shield,
  Activity,
  Plus,
  Trash2,
  Edit2,
  Save,
  CheckCircle2,
  RefreshCw,
  Bell,
  Sparkles,
  Smartphone,
  MapPin,
  Phone,
  Clock,
  LogOut,
  Zap,
  Globe,
  X,
  AlertTriangle,
  Eye,
  Check,
  Moon,
  Sun,
  MessageSquare,
  Users,
  UserPlus,
  UserCheck,
  UserX,
  Key,
  Lock,
  Search,
  ShieldCheck,
  Star,
  RotateCcw
} from 'lucide-react';
import {
  Pharmacy,
  Nurse,
  Hospital,
  MedicalLab,
  AppUpdateInfo,
  DutyScheduleConfig,
  CommunityReport,
  RatingReview,
  AppUser,
  UserRole
} from '../types';
import {
  subscribeToPharmacies,
  subscribeToNurses,
  subscribeToHospitals,
  savePharmacy,
  deletePharmacyFromFirestore,
  updatePharmacyStatus,
  saveNurse,
  deleteNurseFromFirestore,
  updateNurseStatus,
  saveHospital,
  deleteHospitalFromFirestore,
  subscribeToCommunityReports,
  deleteCommunityReportFromFirestore,
  subscribeToReviews,
  deleteReviewFromFirestore,
  restoreDefaultSeedData,
  clearAllData,
  subscribeToUsers,
  saveUserAccount,
  deleteUserAccount
} from '../lib/firebase';
import {
  offlineStorage,
  CURRENT_APP_VERSION
} from '../lib/offlineStorage';
import {
  DEFAULT_DUTY_SCHEDULE,
  getDutyShiftInfo,
  DAYR_HAFIR_DEFAULT,
  DAYR_HAFIR_PRESETS,
  ALL_WEEKDAYS_ARABIC,
  INITIAL_PHARMACIES
} from '../lib/initialData';

interface AdminDashboardProps {
  onLogout?: () => void;
  onPreviewUserApp?: () => void;
}

export const AdminDashboard: React.FC<AdminDashboardProps> = ({
  onLogout,
  onPreviewUserApp
}) => {
  const [activeTab, setActiveTab] = useState<'pharmacies' | 'nurses' | 'hospitals' | 'reports' | 'accounts' | 'schedule'>('pharmacies');

  // Real-time Firestore synchronized states
  const [pharmacies, setPharmacies] = useState<Pharmacy[]>(() => {
    const cached = offlineStorage.getPharmacies();
    if (cached && cached.length > 0) return cached;
    return INITIAL_PHARMACIES;
  });
  const [nurses, setNurses] = useState<Nurse[]>(() => offlineStorage.getNurses() || []);
  const [hospitals, setHospitals] = useState<Hospital[]>(() => offlineStorage.getHospitals() || []);
  const [communityReports, setCommunityReports] = useState<CommunityReport[]>(() => offlineStorage.getCommunityReports() || []);
  const [reviews, setReviews] = useState<RatingReview[]>(() => offlineStorage.getAllRatings() || []);
  const [users, setUsers] = useState<AppUser[]>(() => offlineStorage.getUsers() || []);
  const [reportsSubTab, setReportsSubTab] = useState<'reports' | 'reviews'>('reports');
  const [dutySchedule, setDutySchedule] = useState<DutyScheduleConfig>(DEFAULT_DUTY_SCHEDULE);

  // Accounts Management States
  const [accountSearchQuery, setAccountSearchQuery] = useState('');
  const [accountRoleFilter, setAccountRoleFilter] = useState<'all' | UserRole | 'blocked'>('all');
  const [isAccountModalOpen, setIsAccountModalOpen] = useState(false);
  const [editingAccount, setEditingAccount] = useState<AppUser | null>(null);
  const [accountFormData, setAccountFormData] = useState<{
    displayName: string;
    username: string;
    password: string;
    role: UserRole;
    phone: string;
    targetId: string;
    isBlocked: boolean;
  }>({
    displayName: '',
    username: '',
    password: '',
    role: 'pharmacist',
    phone: '',
    targetId: '',
    isBlocked: false
  });

  const [saving, setSaving] = useState(false);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  // Danger Zone Modals (In-App Confirmations)
  const [isClearAllModalOpen, setIsClearAllModalOpen] = useState(false);
  const [isRestoreModalOpen, setIsRestoreModalOpen] = useState(false);

  // Pharmacy Modals
  const [isPharmacyModalOpen, setIsPharmacyModalOpen] = useState(false);
  const [editingPharmacy, setEditingPharmacy] = useState<Pharmacy | null>(null);
  const [pharmacyFormData, setPharmacyFormData] = useState<Partial<Pharmacy>>({
    name: '',
    district: 'الشارع العام',
    address: '',
    phone: '',
    isOnDuty: false,
    dutyHours: 'مناوبة ليلية 9:00 م - 12:00 ليلاً',
    dutyEndTime: '12:00 ليلاً',
    services: ['أدوية طوارئ وإسعاف', 'مستلزمات طبية'],
    hasFreeBloodPressureCheck: true,
    hasFreeGlucoseCheck: false,
    latitude: DAYR_HAFIR_DEFAULT.latitude,
    longitude: DAYR_HAFIR_DEFAULT.longitude
  });

  // Nurse Modals
  const [isNurseModalOpen, setIsNurseModalOpen] = useState(false);
  const [editingNurse, setEditingNurse] = useState<Nurse | null>(null);
  const [nurseFormData, setNurseFormData] = useState<Partial<Nurse>>({
    name: '',
    title: 'أخصائي تمريض ورعاية منزلية',
    district: 'الشارع العام - دير حافر',
    phone: '',
    experienceYears: 5,
    isAvailable: true,
    isOnDuty: true,
    dutyEndTime: '7:00 صباحاً',
    services: ['تركيب كانيولا ومحاليل', 'حقن عضل ووريد', 'غيار جروح وحروق'],
    latitude: DAYR_HAFIR_DEFAULT.latitude,
    longitude: DAYR_HAFIR_DEFAULT.longitude
  });

  // Hospital Modals
  const [isHospitalModalOpen, setIsHospitalModalOpen] = useState(false);
  const [editingHospital, setEditingHospital] = useState<Hospital | null>(null);
  const [hospitalFormData, setHospitalFormData] = useState<Partial<Hospital>>({
    name: '',
    type: 'مركز صحي حكومي - نقطة طوارئ',
    district: 'شارع المستوصف',
    emergencyPhone: '110',
    emergency24h: true,
    services: ['إسعاف أولي 24 ساعة', 'تضميد وإسعاف حوادث', 'أطباء مناوبون'],
    latitude: DAYR_HAFIR_DEFAULT.latitude,
    longitude: DAYR_HAFIR_DEFAULT.longitude
  });

  // Delete Confirmation Modal
  const [deleteConfirmation, setDeleteConfirmation] = useState<{
    isOpen: boolean;
    type: 'pharmacy' | 'nurse' | 'hospital' | 'user';
    id: string;
    name: string;
  }>({
    isOpen: false,
    type: 'pharmacy',
    id: '',
    name: ''
  });

  // Real-time subscriptions
  useEffect(() => {
    const unsubPh = subscribeToPharmacies((data) => setPharmacies(data));
    const unsubNu = subscribeToNurses((data) => setNurses(data));
    const unsubHp = subscribeToHospitals((data) => setHospitals(data));
    const unsubRep = subscribeToCommunityReports((data) => setCommunityReports(data));
    const unsubRev = subscribeToReviews((data) => setReviews(data));
    const unsubUsers = subscribeToUsers((data) => setUsers(data));

    return () => {
      unsubPh();
      unsubNu();
      unsubHp();
      unsubRep();
      unsubRev();
      unsubUsers();
    };
  }, []);

  const showNotification = (msg: string, isError = false) => {
    if (isError) {
      setErrorMessage(msg);
      setTimeout(() => setErrorMessage(null), 4000);
    } else {
      setSuccessMessage(msg);
      setTimeout(() => setSuccessMessage(null), 3500);
    }
  };

  // Shift & Duty Info
  const shiftInfo = React.useMemo(() => {
    return getDutyShiftInfo(dutySchedule);
  }, [dutySchedule]);

  const activePharmaciesNowCount = pharmacies.filter((p) => {
    if (!p.isOnDuty) return false;
    if (p.dutyHours?.includes('24') || p.dutyEndTime?.includes('24')) return true;
    return shiftInfo.isWithinShift;
  }).length;

  const scheduledPharmaciesCount = pharmacies.filter((p) => p.isOnDuty).length;
  const onDutyNursesCount = nurses.filter((n) => n.isOnDuty && n.isAvailable).length;

  // ==========================================
  // PHARMACY CRUD HANDLERS (Direct Firestore Sync)
  // ==========================================
  const handleOpenAddPharmacy = () => {
    setEditingPharmacy(null);
    setPharmacyFormData({
      name: '',
      district: 'الشارع العام',
      address: '',
      phone: '',
      isOnDuty: true,
      dutyDays: [...ALL_WEEKDAYS_ARABIC],
      dutyStartTime: '20:00',
      dutyEndTime: '00:00',
      regularClosingHour: 18,
      dutyHours: 'دوام حتى 6:00 م • مناوبة 8:00 م - 12:00 ليلاً',
      services: ['أدوية طوارئ وإسعاف', 'مستلزمات طبية'],
      hasFreeBloodPressureCheck: true,
      hasFreeGlucoseCheck: false,
      latitude: DAYR_HAFIR_DEFAULT.latitude,
      longitude: DAYR_HAFIR_DEFAULT.longitude
    });
    setIsPharmacyModalOpen(true);
  };

  const handleOpenEditPharmacy = (pharmacy: Pharmacy) => {
    setEditingPharmacy(pharmacy);
    setPharmacyFormData({
      ...pharmacy,
      dutyDays: pharmacy.dutyDays && pharmacy.dutyDays.length > 0 ? [...pharmacy.dutyDays] : [...ALL_WEEKDAYS_ARABIC],
      dutyStartTime: pharmacy.dutyStartTime || '20:00',
      dutyEndTime: pharmacy.dutyEndTime || '00:00',
      regularClosingHour: pharmacy.regularClosingHour || 18,
      dutyHours: pharmacy.dutyHours || 'دوام حتى 6:00 م • مناوبة 8:00 م - 12:00 ليلاً'
    });
    setIsPharmacyModalOpen(true);
  };

  const handleSavePharmacy = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!pharmacyFormData.name?.trim()) {
      showNotification('يرجى إدخال اسم الصيدلية', true);
      return;
    }

    setSaving(true);
    try {
      const id = editingPharmacy ? editingPharmacy.id : `ph-${Date.now()}`;
      const payload: Pharmacy = {
        id,
        name: pharmacyFormData.name.trim(),
        district: pharmacyFormData.district || 'الشارع العام',
        address: pharmacyFormData.address || 'دير حافر',
        latitude: Number(pharmacyFormData.latitude) || DAYR_HAFIR_DEFAULT.latitude,
        longitude: Number(pharmacyFormData.longitude) || DAYR_HAFIR_DEFAULT.longitude,
        isOpen: pharmacyFormData.isOpen ?? true,
        isOnDuty: pharmacyFormData.isOnDuty ?? false,
        dutyDays: pharmacyFormData.dutyDays && pharmacyFormData.dutyDays.length > 0 ? pharmacyFormData.dutyDays : [...ALL_WEEKDAYS_ARABIC],
        dutyStartTime: pharmacyFormData.dutyStartTime || '20:00',
        dutyEndTime: pharmacyFormData.dutyEndTime || '00:00',
        regularClosingHour: 18,
        dutyHours: pharmacyFormData.dutyHours || `دوام حتى 6:00 م • مناوبة ${pharmacyFormData.dutyStartTime || '20:00'} حتى ${pharmacyFormData.dutyEndTime || '00:00'}`,
        phone: pharmacyFormData.phone || '',
        services: pharmacyFormData.services && pharmacyFormData.services.length > 0 ? pharmacyFormData.services : ['أدوية طوارئ وإسعاف'],
        hasFreeBloodPressureCheck: pharmacyFormData.hasFreeBloodPressureCheck ?? true,
        hasFreeGlucoseCheck: pharmacyFormData.hasFreeGlucoseCheck ?? false,
        rating: editingPharmacy ? editingPharmacy.rating : 4.8,
        ratingsCount: editingPharmacy ? editingPharmacy.ratingsCount : 1,
        isVerified: true,
        updatedAt: new Date().toISOString()
      };

      await savePharmacy(payload);
      setIsPharmacyModalOpen(false);
      showNotification(editingPharmacy ? 'تم تعديل بيانات الصيدلية وحفظها سحابياً فوراً! ✅' : 'تمت إضافة الصيدلية الجديدة بنجاح للمنظومة! 🎉');
    } catch (err) {
      console.error(err);
      showNotification('حدث خطأ أثناء حفظ الصيدلية، تم الحفظ محلياً مؤقتاً.', true);
    } finally {
      setSaving(false);
    }
  };

  const handleSetPharmacyDutyMode = async (id: string, isOnDuty: boolean) => {
    try {
      const ph = pharmacies.find((p) => p.id === id);
      const start = ph?.dutyStartTime || '20:00';
      const end = ph?.dutyEndTime || '00:00';
      const dutyHours = isOnDuty
        ? `دوام اعتيادي حتى 6:00 م + مناوبة الليلة (${start} حتى ${end})`
        : 'دوام اعتيادي (يومياً حتى 6:00 مساءً)';

      await updatePharmacyStatus(id, {
        isOnDuty,
        dutyHours,
        dutyEndTime: isOnDuty ? end : ''
      });
      showNotification(
        isOnDuty
          ? `تم اعتماد: دوام اعتيادي + مناوبة الليلة لـ (${ph?.name || 'الصيدلية'}) 🌙`
          : `تم اعتماد: دوام اعتيادي لـ (${ph?.name || 'الصيدلية'}) 🟢`
      );
    } catch (err) {
      console.error(err);
      showNotification('تعذر التحديث الفوري، تم تطبيق التعديل محلياً.', true);
    }
  };

  const handleTogglePharmacyDuty = async (id: string, currentStatus: boolean) => {
    await handleSetPharmacyDutyMode(id, !currentStatus);
  };

  // Bulk: End duty for all pharmacies (One-click night shift wrap up)
  const handleEndAllDuties = async () => {
    if (!window.confirm('هل أنت متأكد من إنهاء المناوبة لجميع الصيدليات فوراً؟ سيتم إلغاء حالة المناوبة لكافة الصيدليات ومزامنتها لحظياً لجميع المستخدمين.')) {
      return;
    }
    setSaving(true);
    try {
      for (const ph of pharmacies) {
        if (ph.isOnDuty) {
          await updatePharmacyStatus(ph.id, { isOnDuty: false });
        }
      }
      showNotification('تم إنهاء المناوبة وتفريغ جدول الصيدليات بنجاح لكافة المستخدمين! 🌙');
    } catch (err) {
      console.error(err);
      showNotification('حدث خطأ أثناء التحديث الجماعي.', true);
    } finally {
      setSaving(false);
    }
  };

  // Bulk: Activate selected pharmacies for night duty
  const handleActivateAllDefaultDuties = async () => {
    if (!window.confirm('هل تريد تفعيل المناوبة الليلية لجميع الصيدليات المسجلة في القائمة دفعة واحدة؟')) {
      return;
    }
    setSaving(true);
    try {
      for (const ph of pharmacies) {
        await updatePharmacyStatus(ph.id, { isOnDuty: true });
      }
      showNotification('تم تفعيل المناوبة لجميع الصيدليات بنجاح! 🟢');
    } catch (err) {
      console.error(err);
      showNotification('حدث خطأ أثناء التفعيل الجماعي.', true);
    } finally {
      setSaving(false);
    }
  };

  // ==========================================
  // NURSE CRUD HANDLERS
  // ==========================================
  const handleOpenAddNurse = () => {
    setEditingNurse(null);
    setNurseFormData({
      name: '',
      title: 'أخصائي تمريض ورعاية منزلية',
      district: 'الشارع العام - دير حافر',
      phone: '',
      experienceYears: 5,
      isAvailable: true,
      isOnDuty: true,
      dutyEndTime: '7:00 صباحاً',
      services: ['تركيب كانيولا ومحاليل', 'حقن عضل ووريد', 'غيار جروح وحروق'],
      latitude: DAYR_HAFIR_DEFAULT.latitude,
      longitude: DAYR_HAFIR_DEFAULT.longitude
    });
    setIsNurseModalOpen(true);
  };

  const handleOpenEditNurse = (nurse: Nurse) => {
    setEditingNurse(nurse);
    setNurseFormData({ ...nurse });
    setIsNurseModalOpen(true);
  };

  const handleSaveNurse = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!nurseFormData.name?.trim()) {
      showNotification('يرجى إدخال اسم الممرض', true);
      return;
    }

    setSaving(true);
    try {
      const id = editingNurse ? editingNurse.id : `nr-${Date.now()}`;
      const payload: Nurse = {
        id,
        name: nurseFormData.name.trim(),
        title: nurseFormData.title || 'أخصائي تمريض منزلي',
        district: nurseFormData.district || 'دير حافر',
        latitude: Number(nurseFormData.latitude) || DAYR_HAFIR_DEFAULT.latitude,
        longitude: Number(nurseFormData.longitude) || DAYR_HAFIR_DEFAULT.longitude,
        phone: nurseFormData.phone || '',
        experienceYears: Number(nurseFormData.experienceYears) || 5,
        isAvailable: nurseFormData.isAvailable ?? true,
        isOnDuty: nurseFormData.isOnDuty ?? true,
        dutyEndTime: nurseFormData.dutyEndTime || '7:00 صباحاً',
        services: nurseFormData.services && nurseFormData.services.length > 0 ? nurseFormData.services : ['رعاية منزلية وحقن'],
        rating: editingNurse ? editingNurse.rating : 4.9,
        ratingsCount: editingNurse ? editingNurse.ratingsCount : 1,
        isVerified: true,
        updatedAt: new Date().toISOString()
      };

      await saveNurse(payload);
      setIsNurseModalOpen(false);
      showNotification(editingNurse ? 'تم تحديث بيانات الممرض بنجاح! ✅' : 'تمت إضافة الممرض الجديد للمنظومة بنجاح! 🎉');
    } catch (err) {
      console.error(err);
      showNotification('حدث خطأ أثناء حفظ بيانات الممرض.', true);
    } finally {
      setSaving(false);
    }
  };

  const handleToggleNurseDuty = async (id: string, currentStatus: boolean) => {
    try {
      await updateNurseStatus(id, { isOnDuty: !currentStatus });
      showNotification(!currentStatus ? 'تم تفعيل جاهزية ومناوبة الممرض 🩺' : 'تم إيقاف مناوبة الممرض');
    } catch (err) {
      console.error(err);
      showNotification('تعذر التحديث الفوري.', true);
    }
  };

  // ==========================================
  // HOSPITAL CRUD HANDLERS
  // ==========================================
  const handleOpenAddHospital = () => {
    setEditingHospital(null);
    setHospitalFormData({
      name: '',
      type: 'مركز صحي حكومي - نقطة طوارئ',
      district: 'شارع المستوصف',
      emergencyPhone: '110',
      emergency24h: true,
      services: ['إسعاف أولي 24 ساعة', 'تضميد وإسعاف حوادث', 'أطباء مناوبون'],
      latitude: DAYR_HAFIR_DEFAULT.latitude,
      longitude: DAYR_HAFIR_DEFAULT.longitude
    });
    setIsHospitalModalOpen(true);
  };

  const handleOpenEditHospital = (hospital: Hospital) => {
    setEditingHospital(hospital);
    setHospitalFormData({ ...hospital });
    setIsHospitalModalOpen(true);
  };

  const handleSaveHospital = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!hospitalFormData.name?.trim()) {
      showNotification('يرجى إدخال اسم المشفى أو المركز', true);
      return;
    }

    setSaving(true);
    try {
      const id = editingHospital ? editingHospital.id : `hp-${Date.now()}`;
      const payload: Hospital = {
        id,
        name: hospitalFormData.name.trim(),
        type: hospitalFormData.type || 'نقطة طبية وإسعاف',
        district: hospitalFormData.district || 'دير حافر',
        latitude: Number(hospitalFormData.latitude) || DAYR_HAFIR_DEFAULT.latitude,
        longitude: Number(hospitalFormData.longitude) || DAYR_HAFIR_DEFAULT.longitude,
        emergency24h: hospitalFormData.emergency24h ?? true,
        emergencyPhone: hospitalFormData.emergencyPhone || '110',
        services: hospitalFormData.services && hospitalFormData.services.length > 0 ? hospitalFormData.services : ['طوارئ وإسعاف'],
        isVerified: true,
        updatedAt: new Date().toISOString()
      };

      await saveHospital(payload);
      setIsHospitalModalOpen(false);
      showNotification(editingHospital ? 'تم تعديل بيانات المشفى بنجاح! ✅' : 'تمت إضافة المشفى الجديد بنجاح! 🎉');
    } catch (err) {
      console.error(err);
      showNotification('حدث خطأ أثناء حفظ بيانات المشفى.', true);
    } finally {
      setSaving(false);
    }
  };

  // ==========================================
  // DELETE CONFIRMATION HANDLER (PERMANENT & INSTANT)
  // ==========================================
  const handleConfirmDelete = async () => {
    const { type, id, name } = deleteConfirmation;
    setSaving(true);
    try {
      if (type === 'pharmacy') {
        // Optimistic instant removal from UI
        setPharmacies(prev => prev.filter(p => p.id !== id));
        await deletePharmacyFromFirestore(id);
        showNotification(`تم حذف صيدلية "${name}" نهائياً من قاعدة البيانات وتطبيقات المستخدمين.`);
      } else if (type === 'nurse') {
        setNurses(prev => prev.filter(n => n.id !== id));
        await deleteNurseFromFirestore(id);
        showNotification(`تم حذف الممرض "${name}" بنجاح.`);
      } else if (type === 'hospital') {
        setHospitals(prev => prev.filter(h => h.id !== id));
        await deleteHospitalFromFirestore(id);
        showNotification(`تم حذف مشفى "${name}" بنجاح.`);
      } else if (type === 'user') {
        setUsers(prev => prev.filter(u => u.id !== id));
        await deleteUserAccount(id);
        showNotification(`تم حذف الحساب "${name}" بنجاح.`);
      }
      setDeleteConfirmation({ isOpen: false, type: 'pharmacy', id: '', name: '' });
    } catch (err) {
      console.error(err);
      showNotification('حدث خطأ أثناء الحذف.', true);
    } finally {
      setSaving(false);
    }
  };

  // ==========================================
  // RESTORE DEFAULT DATA HANDLER
  // ==========================================
  const executeRestoreDefaults = async () => {
    setIsRestoreModalOpen(false);
    setSaving(true);
    try {
      await restoreDefaultSeedData();
      showNotification('تمت استعادة كافة بيانات دير حافر الأصلية بنجاح ومزامنتها لحظياً! 🔄');
    } catch (err) {
      console.error(err);
      showNotification('حدث خطأ أثناء استعادة البيانات.', true);
    } finally {
      setSaving(false);
    }
  };

  // ==========================================
  // CLEAR ALL DATA HANDLER (RESET ALL COUNTERS TO ZERO)
  // ==========================================
  const executeClearAllData = async () => {
    setIsClearAllModalOpen(false);
    setSaving(true);
    try {
      await clearAllData();
      setPharmacies([]);
      setNurses([]);
      setHospitals([]);
      setCommunityReports([]);
      setReviews([]);
      showNotification('تم مسح وتصفير كافة البيانات بنجاح! جميع العدادات أصبحت الآن 0 ✅');
    } catch (err) {
      console.error(err);
      showNotification('حدث خطأ أثناء مسح البيانات.', true);
    } finally {
      setSaving(false);
    }
  };

  // ==========================================
  // ACCOUNTS MANAGEMENT HANDLERS (FULL CRUD & BLOCK)
  // ==========================================
  const handleOpenAddAccount = () => {
    setEditingAccount(null);
    setAccountFormData({
      displayName: '',
      username: '',
      password: '',
      role: 'pharmacist',
      phone: '',
      targetId: pharmacies[0]?.id || '',
      isBlocked: false
    });
    setIsAccountModalOpen(true);
  };

  const handleOpenEditAccount = (user: AppUser) => {
    setEditingAccount(user);
    setAccountFormData({
      displayName: user.displayName || '',
      username: user.username,
      password: user.password,
      role: user.role,
      phone: user.phone || '',
      targetId: user.targetId || '',
      isBlocked: user.isBlocked ?? false
    });
    setIsAccountModalOpen(true);
  };

  const handleSaveAccount = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!accountFormData.username.trim() || !accountFormData.password.trim()) {
      showNotification('يرجى إدخال اسم المستخدم وكلمة المرور.', true);
      return;
    }

    // Check duplicate username if creating
    if (!editingAccount) {
      const exists = users.some(
        u => u.username.toLowerCase() === accountFormData.username.trim().toLowerCase()
      );
      if (exists) {
        showNotification('اسم المستخدم هذا مستخدم بالفعل! اختر اسماً آخر.', true);
        return;
      }
    }

    setSaving(true);
    try {
      const id = editingAccount ? editingAccount.id : `usr-${Date.now()}`;
      
      let targetName: string | undefined = undefined;
      if (accountFormData.role === 'pharmacist') {
        const ph = pharmacies.find(p => p.id === accountFormData.targetId);
        targetName = ph?.name;
      } else if (accountFormData.role === 'nurse') {
        const nr = nurses.find(n => n.id === accountFormData.targetId);
        targetName = nr?.name;
      }

      const payload: AppUser = {
        id,
        username: accountFormData.username.trim(),
        password: accountFormData.password.trim(),
        displayName: accountFormData.displayName.trim() || accountFormData.username.trim(),
        role: accountFormData.role,
        phone: accountFormData.phone.trim() || undefined,
        targetId: accountFormData.targetId || undefined,
        targetName,
        isBlocked: accountFormData.isBlocked,
        updatedAt: new Date().toISOString()
      };

      await saveUserAccount(payload);
      setIsAccountModalOpen(false);
      showNotification(editingAccount ? 'تم تحديث بيانات الحساب بنجاح! ✅' : 'تم إنشاء الحساب الجديد بنجاح! 🎉');
    } catch (err) {
      console.error(err);
      showNotification('حدث خطأ أثناء حفظ الحساب.', true);
    } finally {
      setSaving(false);
    }
  };

  const handleToggleBlockAccount = async (user: AppUser) => {
    if (user.role === 'admin' && user.id === 'admin_root') {
      showNotification('لا يمكن حظر حساب المدير العام الرئيسي!', true);
      return;
    }

    setSaving(true);
    try {
      const updated: AppUser = {
        ...user,
        isBlocked: !user.isBlocked,
        updatedAt: new Date().toISOString()
      };
      await saveUserAccount(updated);
      showNotification(
        updated.isBlocked
          ? `تم حظر الحساب "${user.displayName || user.username}" بنجاح 🚫`
          : `تم إلغاء حظر الحساب "${user.displayName || user.username}" بنجاح 🟢`
      );
    } catch (err) {
      console.error(err);
      showNotification('حدث خطأ أثناء تعديل حالة الحساب.', true);
    } finally {
      setSaving(false);
    }
  };

  const handleDeleteAccountClick = (user: AppUser) => {
    if (user.role === 'admin' && user.id === 'admin_root') {
      showNotification('لا يمكن حذف حساب المدير العام الأساسي!', true);
      return;
    }
    setDeleteConfirmation({
      isOpen: true,
      type: 'user',
      id: user.id,
      name: user.displayName || user.username
    });
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col selection:bg-emerald-500 selection:text-white overflow-x-hidden font-sans" dir="rtl">
      
      {/* Notifications Floating Bar */}
      {successMessage && (
        <div className="fixed top-4 left-1/2 -translate-x-1/2 z-50 bg-emerald-600 text-white px-5 py-3 rounded-2xl shadow-2xl flex items-center gap-2.5 text-xs font-black animate-bounce border border-emerald-400">
          <CheckCircle2 className="w-4 h-4 shrink-0" />
          <span>{successMessage}</span>
        </div>
      )}
      {errorMessage && (
        <div className="fixed top-4 left-1/2 -translate-x-1/2 z-50 bg-rose-600 text-white px-5 py-3 rounded-2xl shadow-2xl flex items-center gap-2.5 text-xs font-black border border-rose-400">
          <AlertTriangle className="w-4 h-4 shrink-0" />
          <span>{errorMessage}</span>
        </div>
      )}

      {/* Top Admin Header */}
      <header className="bg-slate-900 border-b border-slate-800 sticky top-0 z-40 px-3.5 md:px-6 py-3 md:py-4 shadow-xl">
        <div className="max-w-6xl mx-auto flex flex-col md:flex-row items-start md:items-center justify-between gap-3 md:gap-4">
          
          {/* Logo & Title */}
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-emerald-600 to-teal-500 flex items-center justify-center shadow-lg shadow-emerald-950/60 shrink-0">
              <Shield className="w-5 h-5 text-white" />
            </div>
            <div>
              <div className="flex items-center gap-2 flex-wrap">
                <h1 className="text-base md:text-lg font-black text-white tracking-tight">
                  لوحة تحكم المشرف المركزي
                </h1>
                <span className="text-[10px] font-bold bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 px-2 py-0.5 rounded-full flex items-center gap-1">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                  <span>متصل سحابياً مع Firestore</span>
                </span>
              </div>
              <p className="text-[11px] text-slate-400 font-medium">
                إدارة فورية لكافة الصيدليات والمناوبات والمشافي • مزامنة لحظية مع هواتف المستخدمين
              </p>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex items-center gap-2 self-stretch sm:self-auto justify-end flex-wrap">
            <button
              onClick={() => setIsRestoreModalOpen(true)}
              disabled={saving}
              className="flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-bold bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white border border-slate-700 transition cursor-pointer"
              title="استعادة الصيدليات والمراكز الأصلية الأساسية إذا رغبت بإعادة تعيينها"
            >
              <RotateCcw className="w-3.5 h-3.5 text-amber-400" />
              <span>استعادة البيانات الافتراضية</span>
            </button>

            {/* Clear All Data Button (Reset To Zero) */}
            <button
              onClick={() => setIsClearAllModalOpen(true)}
              disabled={saving}
              className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-black bg-rose-600 hover:bg-rose-500 text-white shadow-md shadow-rose-950/60 border border-rose-400/80 transition cursor-pointer active:scale-95"
              title="مسح وتصفير كافة بيانات الصيدليات والمشافي والبلاغات نهائياً من قاعدة البيانات"
            >
              <Trash2 className="w-3.5 h-3.5" />
              <span>مسح كافة البيانات (تصفير)</span>
            </button>

            {onPreviewUserApp && (
              <button
                onClick={onPreviewUserApp}
                className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-black bg-emerald-600 hover:bg-emerald-500 text-white shadow-md shadow-emerald-950/50 transition cursor-pointer"
              >
                <Eye className="w-4 h-4" />
                <span>معاينة تطبيق المستخدمين</span>
              </button>
            )}

            {onLogout && (
              <button
                onClick={onLogout}
                className="flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-bold bg-slate-800 hover:bg-rose-900/60 text-slate-300 hover:text-rose-200 border border-slate-700 transition cursor-pointer"
              >
                <LogOut className="w-3.5 h-3.5" />
                <span>خروج</span>
              </button>
            )}
          </div>
        </div>
      </header>

      {/* Main Content Container */}
      <main className="max-w-6xl mx-auto w-full p-3.5 md:p-6 space-y-5 flex-1">
        
        {/* Quick Stats Banner (4 Responsive Cards) */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 md:gap-4">
          
          {/* Card 1: Currently Active On Duty */}
          <div className="bg-slate-900/80 border border-slate-800 rounded-2xl p-4 space-y-1">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-slate-400">مناوبة نشطة الآن</span>
              <span className={`w-2.5 h-2.5 rounded-full ${activePharmaciesNowCount > 0 ? 'bg-emerald-400 animate-pulse' : 'bg-slate-500'}`} />
            </div>
            <div className="text-2xl font-black text-white flex items-baseline gap-1">
              <span>{activePharmaciesNowCount}</span>
              <span className="text-xs text-slate-400 font-normal">صيدلية مفتوحة</span>
            </div>
            <p className="text-[10px] text-slate-400 font-medium">
              {shiftInfo.isWithinShift
                ? 'وفق توقيت المناوبة الحالية (مفتوحة)'
                : `المناوبة انتهت عند ${shiftInfo.closingTimeArabic}`}
            </p>
          </div>

          {/* Card 2: Registered On Duty Tonight */}
          <div className="bg-slate-900/80 border border-slate-800 rounded-2xl p-4 space-y-1">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-slate-400">مسجلة بجدول المناوبة</span>
              <span className="text-sm">🌙</span>
            </div>
            <div className="text-2xl font-black text-emerald-400 flex items-baseline gap-1">
              <span>{scheduledPharmaciesCount}</span>
              <span className="text-xs text-slate-400 font-normal">من {pharmacies.length}</span>
            </div>
            <p className="text-[10px] text-slate-400 font-medium">
              صيدليات معتمدة في المنظومة
            </p>
          </div>

          {/* Card 3: Nurses Available */}
          <div className="bg-slate-900/80 border border-slate-800 rounded-2xl p-4 space-y-1">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-slate-400">الكوادر التمريضية</span>
              <span className="text-sm">🩺</span>
            </div>
            <div className="text-2xl font-black text-teal-400 flex items-baseline gap-1">
              <span>{onDutyNursesCount}</span>
              <span className="text-xs text-slate-400 font-normal">من {nurses.length}</span>
            </div>
            <p className="text-[10px] text-slate-400 font-medium">
              جاهزون للاستجابة المنزلية
            </p>
          </div>

          {/* Card 4: Hospitals 24/7 */}
          <div className="bg-slate-900/80 border border-slate-800 rounded-2xl p-4 space-y-1">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-slate-400">المشافي والمراكز</span>
              <span className="text-sm">🏥</span>
            </div>
            <div className="text-2xl font-black text-indigo-400 flex items-baseline gap-1">
              <span>{hospitals.length}</span>
              <span className="text-xs text-slate-400 font-normal">مراكز طوارئ</span>
            </div>
            <p className="text-[10px] text-slate-400 font-medium">
              طوارئ وإسعاف على مدار الساعة
            </p>
          </div>

        </div>

        {/* Database Quick Actions Bar */}
        <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-3.5 flex flex-col sm:flex-row sm:items-center justify-between gap-3 shadow-md">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl bg-rose-500/10 border border-rose-500/30 flex items-center justify-center text-rose-400 shrink-0">
              <Trash2 className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-xs font-black text-white">إدارة قاعدة البيانات السحابية الحية (Firestore)</h3>
              <p className="text-[11px] text-slate-400">
                يمكنك تصفير قاعدة البيانات للبدء من الصفر (عدادات 0) أو استعادة البيانات التأسيسية بضغطة زر.
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2 shrink-0 flex-wrap">
            <button
              onClick={() => setIsRestoreModalOpen(true)}
              disabled={saving}
              className="px-3 py-1.5 rounded-xl text-xs font-bold bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 transition cursor-pointer flex items-center gap-1.5"
            >
              <RotateCcw className="w-3.5 h-3.5 text-amber-400" />
              <span>استعادة البيانات الافتراضية</span>
            </button>
            <button
              onClick={() => setIsClearAllModalOpen(true)}
              disabled={saving}
              className="px-4 py-2 rounded-xl text-xs font-black bg-rose-600 hover:bg-rose-500 text-white shadow-lg shadow-rose-950/60 border border-rose-500/60 transition cursor-pointer flex items-center gap-1.5 active:scale-95"
            >
              <Trash2 className="w-3.5 h-3.5" />
              <span>مسح جميع البيانات (تصفير العدادات إلى 0)</span>
            </button>
          </div>
        </div>

        {/* Tab Navigation Bar */}
        <div className="flex items-center gap-1.5 md:gap-2 border-b border-slate-800 pb-3 overflow-x-auto scrollbar-none">
          <button
            onClick={() => setActiveTab('pharmacies')}
            className={`px-4 py-2.5 rounded-xl text-xs font-extrabold transition cursor-pointer flex items-center gap-2 whitespace-nowrap shrink-0 ${
              activeTab === 'pharmacies'
                ? 'bg-emerald-600 text-white shadow-lg shadow-emerald-950/50'
                : 'bg-slate-900 text-slate-400 hover:text-white hover:bg-slate-800 border border-slate-800'
            }`}
          >
            <span>💊 إدارة الصيدليات ({pharmacies.length})</span>
          </button>

          <button
            onClick={() => setActiveTab('nurses')}
            className={`px-4 py-2.5 rounded-xl text-xs font-extrabold transition cursor-pointer flex items-center gap-2 whitespace-nowrap shrink-0 ${
              activeTab === 'nurses'
                ? 'bg-emerald-600 text-white shadow-lg shadow-emerald-950/50'
                : 'bg-slate-900 text-slate-400 hover:text-white hover:bg-slate-800 border border-slate-800'
            }`}
          >
            <span>🩺 الممرضين والتمريض ({nurses.length})</span>
          </button>

          <button
            onClick={() => setActiveTab('hospitals')}
            className={`px-4 py-2.5 rounded-xl text-xs font-extrabold transition cursor-pointer flex items-center gap-2 whitespace-nowrap shrink-0 ${
              activeTab === 'hospitals'
                ? 'bg-emerald-600 text-white shadow-lg shadow-emerald-950/50'
                : 'bg-slate-900 text-slate-400 hover:text-white hover:bg-slate-800 border border-slate-800'
            }`}
          >
            <span>🏥 المشافي والمراكز ({hospitals.length})</span>
          </button>

          <button
            onClick={() => setActiveTab('reports')}
            className={`px-4 py-2.5 rounded-xl text-xs font-extrabold transition cursor-pointer flex items-center gap-2 whitespace-nowrap shrink-0 ${
              activeTab === 'reports'
                ? 'bg-emerald-600 text-white shadow-lg shadow-emerald-950/50'
                : 'bg-slate-900 text-slate-400 hover:text-white hover:bg-slate-800 border border-slate-800'
            }`}
          >
            <span className="flex items-center gap-1.5">
              <span>💬 المساهمة المجتمعية والآراء</span>
              {(communityReports.length + reviews.length) > 0 && (
                <span className="px-1.5 py-0.5 rounded-full text-[10px] bg-amber-500 text-slate-950 font-black">
                  {communityReports.length + reviews.length}
                </span>
              )}
            </span>
          </button>

          <button
            onClick={() => setActiveTab('accounts')}
            className={`px-4 py-2.5 rounded-xl text-xs font-extrabold transition cursor-pointer flex items-center gap-2 whitespace-nowrap shrink-0 ${
              activeTab === 'accounts'
                ? 'bg-emerald-600 text-white shadow-lg shadow-emerald-950/50'
                : 'bg-slate-900 text-slate-400 hover:text-white hover:bg-slate-800 border border-slate-800'
            }`}
          >
            <span>👥 إدارة الحسابات والكوادر</span>
          </button>
        </div>

        {/* ======================================================== */}
        {/* TAB 1: PHARMACIES MANAGEMENT (FULL CRUD & DUTY CONTROLS) */}
        {/* ======================================================== */}
        {activeTab === 'pharmacies' && (
          <div className="space-y-4">
            
            {/* Top Toolbar */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-slate-900/60 border border-slate-800 p-4 rounded-2xl">
              <div className="space-y-1">
                <h2 className="text-base font-black text-white flex items-center gap-2">
                  <span>💊 إدارة الصيدليات والمناوبات (إضافة • تعديل • حذف)</span>
                </h2>
                <p className="text-xs text-slate-400 font-medium">
                  أي تعديل، إضافة، أو تبديل مناوبة يتم حفظه سحابياً في Firestore ومزامنته فوراً لكافة المستخدمين.
                </p>
              </div>

              {/* Action Buttons */}
              <div className="flex items-center gap-2 flex-wrap self-start sm:self-auto">
                <button
                  onClick={handleOpenAddPharmacy}
                  className="px-3.5 py-2 rounded-xl text-xs font-black bg-emerald-600 hover:bg-emerald-500 text-white shadow-md shadow-emerald-950/60 transition cursor-pointer flex items-center gap-1.5"
                >
                  <Plus className="w-4 h-4" />
                  <span>إضافة صيدلية جديدة</span>
                </button>

                <button
                  onClick={handleEndAllDuties}
                  disabled={saving || scheduledPharmaciesCount === 0}
                  className="px-3 py-2 rounded-xl text-xs font-bold bg-slate-800 hover:bg-amber-900/40 text-amber-300 hover:text-amber-200 border border-slate-700 transition cursor-pointer flex items-center gap-1.5 disabled:opacity-40"
                  title="إنهاء مناوبة جميع الصيدليات عند منتصف الليل بضغطة زر واحدة"
                >
                  <Moon className="w-3.5 h-3.5" />
                  <span>إنهاء مناوبة الجميع</span>
                </button>
              </div>
            </div>

            {/* Pharmacies List: Mobile Card View */}
            <div className="grid grid-cols-1 gap-3 md:hidden">
              {pharmacies.map((ph) => {
                const isActiveNow = ph.isOnDuty && (shiftInfo.isWithinShift || ph.dutyHours?.includes('24'));
                return (
                  <div
                    key={ph.id}
                    className={`bg-slate-900 border rounded-2xl p-4 space-y-3 transition-all shadow-md ${
                      ph.isOnDuty
                        ? 'border-emerald-500/50 bg-gradient-to-b from-slate-900 to-emerald-950/20'
                        : 'border-slate-800'
                    }`}
                  >
                    {/* Header Row: Name & Quick Duty Toggle */}
                    <div className="flex items-center justify-between gap-2">
                      <div className="flex items-center gap-2 min-w-0">
                        <span className="text-lg shrink-0">💊</span>
                        <div className="min-w-0">
                          <h3 className="font-extrabold text-sm text-white truncate">{ph.name}</h3>
                          <span className="text-[10px] text-slate-400 font-medium">{ph.district}</span>
                        </div>
                      </div>

                      {/* Ready-made Mode Selector Buttons (No text box) */}
                      <div className="flex items-center gap-1 bg-slate-950/90 p-1 rounded-xl border border-slate-800 shrink-0">
                        <button
                          type="button"
                          onClick={() => handleSetPharmacyDutyMode(ph.id, false)}
                          className={`px-2.5 py-1.5 rounded-lg text-[11px] font-black transition cursor-pointer flex items-center gap-1 ${
                            !ph.isOnDuty
                              ? 'bg-emerald-600 text-white shadow-xs'
                              : 'text-slate-400 hover:text-white hover:bg-slate-800'
                          }`}
                          title="دوام اعتيادي يومياً حتى 6:00 م"
                        >
                          <span>🟢</span>
                          <span>دوام اعتيادي</span>
                        </button>
                        <button
                          type="button"
                          onClick={() => handleSetPharmacyDutyMode(ph.id, true)}
                          className={`px-2.5 py-1.5 rounded-lg text-[11px] font-black transition cursor-pointer flex items-center gap-1 ${
                            ph.isOnDuty
                              ? 'bg-gradient-to-r from-emerald-600 to-teal-600 text-white shadow-xs ring-1 ring-emerald-400/40'
                              : 'text-slate-400 hover:text-white hover:bg-slate-800'
                          }`}
                          title="دوام اعتيادي حتى 6:00 م ثم مناوبة الليلة"
                        >
                          <span>🌙</span>
                          <span>دوام اعتيادي + مناوبة الليلة</span>
                        </button>
                      </div>
                    </div>

                    {/* Details Row */}
                    <div className="space-y-1.5 pt-2 border-t border-slate-800/80 text-xs">
                      <div className="flex items-center justify-between text-[11px] text-slate-300">
                        <span>العنوان: {ph.address}</span>
                        {ph.phone && (
                          <a href={`tel:${ph.phone}`} className="font-mono text-emerald-400 font-bold" dir="ltr">
                            {ph.phone}
                          </a>
                        )}
                      </div>

                      {/* Duty Days & Shift Hours */}
                      <div className="space-y-1 pt-1">

                        <div className="flex items-center justify-between text-[10px] text-slate-400 font-medium">
                          <span>ساعة المناوبة: {ph.dutyStartTime || '20:00'} حتى {ph.dutyEndTime || '00:00'}</span>
                          <span className="text-emerald-500 font-bold">دوام حتى 6:00 م</span>
                        </div>
                      </div>

                      <div className="flex items-center justify-between pt-1">
                        <span className="text-[10px] bg-slate-800/80 text-slate-300 px-2 py-0.5 rounded-md font-medium">
                          {ph.dutyHours}
                        </span>
                        <span
                          className={`text-[10px] font-bold px-2 py-0.5 rounded-md ${
                            isActiveNow
                              ? 'bg-emerald-500/20 text-emerald-300'
                              : ph.isOnDuty
                              ? 'bg-amber-500/20 text-amber-300'
                              : 'bg-slate-800 text-slate-400'
                          }`}
                        >
                          {isActiveNow
                            ? 'مفتوحة الآن 🟢'
                            : ph.isOnDuty
                            ? 'مسجلة بالمناوبة ⏳'
                            : 'متوقفة'}
                        </span>
                      </div>
                    </div>

                    {/* Actions Row: Edit & Delete */}
                    <div className="pt-2 border-t border-slate-800/80 flex items-center justify-end gap-2">
                      <button
                        onClick={() => handleOpenEditPharmacy(ph)}
                        className="px-3 py-1.5 rounded-lg text-xs font-bold bg-slate-800 hover:bg-slate-700 text-slate-200 transition flex items-center gap-1 cursor-pointer"
                      >
                        <Edit2 className="w-3.5 h-3.5 text-sky-400" />
                        <span>تعديل</span>
                      </button>
                      <button
                        onClick={() =>
                          setDeleteConfirmation({
                            isOpen: true,
                            type: 'pharmacy',
                            id: ph.id,
                            name: ph.name
                          })
                        }
                        className="px-3 py-1.5 rounded-lg text-xs font-bold bg-rose-950/40 hover:bg-rose-900/60 text-rose-300 border border-rose-900/40 transition flex items-center gap-1 cursor-pointer"
                      >
                        <Trash2 className="w-3.5 h-3.5 text-rose-400" />
                        <span>حذف</span>
                      </button>
                    </div>

                  </div>
                );
              })}
            </div>

            {/* Pharmacies List: Desktop Table View */}
            <div className="hidden md:block bg-slate-900 border border-slate-800 rounded-3xl overflow-hidden shadow-xl">
              <div className="overflow-x-auto">
                <table className="w-full text-right text-xs">
                  <thead className="bg-slate-800/80 text-slate-400 border-b border-slate-700">
                    <tr>
                      <th className="p-4">اسم الصيدلية</th>
                      <th className="p-4">المنطقة / العنوان</th>
                      <th className="p-4">أوقات المناوبة والدوام</th>
                      <th className="p-4">الهاتف</th>
                      <th className="p-4 text-center">حالة المناوبة</th>
                      <th className="p-4 text-center">إجراءات التحكم</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-800/80">
                    {pharmacies.map((ph) => {
                      const isActiveNow = ph.isOnDuty && (shiftInfo.isWithinShift || ph.dutyHours?.includes('24'));
                      return (
                        <tr key={ph.id} className="hover:bg-slate-800/40 transition">
                          <td className="p-4 font-black text-white flex items-center gap-2">
                            <span>💊</span>
                            <span>{ph.name}</span>
                          </td>
                          <td className="p-4 text-slate-300 font-medium">
                            {ph.district} • {ph.address}
                          </td>
                          <td className="p-4 text-slate-400 font-medium space-y-1">
                            {ph.dutyDays && ph.dutyDays.length > 0 && (
                              <div className="text-[10px] bg-slate-800 text-emerald-400 px-2 py-0.5 rounded-md font-bold inline-block max-w-[220px] truncate">
                                🗓️ {ph.dutyDays.join(' • ')}
                              </div>
                            )}
                            <div className="text-[11px] text-slate-300">
                              <span>مناوبة: {ph.dutyStartTime || '20:00'} - {ph.dutyEndTime || '00:00'}</span>
                              <span className="text-slate-500 text-[10px] mr-2">(دوام حتى 6:00 م)</span>
                            </div>
                          </td>
                          <td className="p-4 font-mono text-emerald-400 font-bold" dir="ltr">
                            {ph.phone || '-'}
                          </td>
                          <td className="p-4 text-center">
                            {/* Ready-made Mode Selector Buttons (No text box) */}
                            <div className="inline-flex items-center gap-1.5 p-1 bg-slate-950/80 rounded-xl border border-slate-800">
                              <button
                                type="button"
                                onClick={() => handleSetPharmacyDutyMode(ph.id, false)}
                                className={`px-2.5 py-1.5 rounded-lg text-xs font-black transition cursor-pointer flex items-center gap-1 ${
                                  !ph.isOnDuty
                                    ? 'bg-emerald-600 text-white shadow-xs'
                                    : 'text-slate-400 hover:text-white hover:bg-slate-800'
                                }`}
                                title="دوام اعتيادي يومياً حتى 6:00 م (ليست مناوبة الليلة)"
                              >
                                <span>🟢</span>
                                <span>دوام اعتيادي</span>
                              </button>
                              <button
                                type="button"
                                onClick={() => handleSetPharmacyDutyMode(ph.id, true)}
                                className={`px-2.5 py-1.5 rounded-lg text-xs font-black transition cursor-pointer flex items-center gap-1 ${
                                  ph.isOnDuty
                                    ? 'bg-gradient-to-r from-emerald-600 to-teal-600 text-white shadow-xs ring-1 ring-emerald-400/40'
                                    : 'text-slate-400 hover:text-white hover:bg-slate-800'
                                }`}
                                title="دوام اعتيادي حتى 6:00 م ثم مناوبة الليلة"
                              >
                                <span>🌙</span>
                                <span>دوام اعتيادي + مناوبة الليلة</span>
                              </button>
                            </div>
                          </td>
                          <td className="p-4 text-center">
                            <div className="flex items-center justify-center gap-2">
                              <button
                                onClick={() => handleOpenEditPharmacy(ph)}
                                className="p-2 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 transition cursor-pointer"
                                title="تعديل بيانات الصيدلية"
                              >
                                <Edit2 className="w-3.5 h-3.5 text-sky-400" />
                              </button>
                              <button
                                onClick={() =>
                                  setDeleteConfirmation({
                                    isOpen: true,
                                    type: 'pharmacy',
                                    id: ph.id,
                                    name: ph.name
                                  })
                                }
                                className="p-2 rounded-lg bg-rose-950/40 hover:bg-rose-900/60 text-rose-300 border border-rose-900/40 transition cursor-pointer"
                                title="حذف الصيدلية نهائياً"
                              >
                                <Trash2 className="w-3.5 h-3.5 text-rose-400" />
                              </button>
                            </div>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </div>

          </div>
        )}

        {/* ======================================================== */}
        {/* TAB 2: NURSES MANAGEMENT (FULL CRUD & AVAILABILITY)      */}
        {/* ======================================================== */}
        {activeTab === 'nurses' && (
          <div className="space-y-4">
            
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-slate-900/60 border border-slate-800 p-4 rounded-2xl">
              <div className="space-y-1">
                <h2 className="text-base font-black text-white flex items-center gap-2">
                  <span>🩺 إدارة الممرضين والممرضات المناوبين</span>
                </h2>
                <p className="text-xs text-slate-400 font-medium">
                  التحكم في ظهور الممرضين للرعاية المنزلية وإعطاء الحقن والمحاليل.
                </p>
              </div>

              <button
                onClick={handleOpenAddNurse}
                className="px-3.5 py-2 rounded-xl text-xs font-black bg-emerald-600 hover:bg-emerald-500 text-white shadow-md shadow-emerald-950/60 transition cursor-pointer flex items-center gap-1.5 self-start sm:self-auto"
              >
                <Plus className="w-4 h-4" />
                <span>إضافة ممرض جديد</span>
              </button>
            </div>

            {/* Nurses Cards / Table */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              {nurses.map((nr) => (
                <div
                  key={nr.id}
                  className={`bg-slate-900 border rounded-2xl p-4 space-y-3 transition-all shadow-md ${
                    nr.isOnDuty
                      ? 'border-teal-500/50 bg-gradient-to-b from-slate-900 to-teal-950/20'
                      : 'border-slate-800'
                  }`}
                >
                  <div className="flex items-center justify-between gap-3">
                    <div className="flex items-center gap-2 min-w-0">
                      <span className="text-lg shrink-0">🩺</span>
                      <div className="min-w-0">
                        <h3 className="font-extrabold text-sm text-white truncate">{nr.name}</h3>
                        <p className="text-[11px] text-teal-400 font-medium">{nr.title}</p>
                      </div>
                    </div>

                    <button
                      onClick={() => handleToggleNurseDuty(nr.id, nr.isOnDuty)}
                      className={`px-3 py-1.5 rounded-xl text-xs font-black transition cursor-pointer shrink-0 flex items-center gap-1.5 ${
                        nr.isOnDuty
                          ? 'bg-teal-600 text-white hover:bg-teal-500 shadow-md'
                          : 'bg-slate-800 text-slate-400 hover:bg-slate-700 hover:text-white border border-slate-700'
                      }`}
                    >
                      {nr.isOnDuty ? 'مناوب الآن' : 'غير مناوب'}
                    </button>
                  </div>

                  <div className="space-y-1 pt-2 border-t border-slate-800 text-xs text-slate-300">
                    <div className="flex items-center justify-between">
                      <span>المنطقة: {nr.district}</span>
                      <span className="font-mono text-emerald-400 font-bold" dir="ltr">{nr.phone}</span>
                    </div>
                    <div className="text-[11px] text-slate-400">
                      الخدمات: {nr.services.join(' • ')}
                    </div>
                  </div>

                  <div className="pt-2 border-t border-slate-800/80 flex items-center justify-end gap-2">
                    <button
                      onClick={() => handleOpenEditNurse(nr)}
                      className="px-3 py-1.5 rounded-lg text-xs font-bold bg-slate-800 hover:bg-slate-700 text-slate-200 transition flex items-center gap-1 cursor-pointer"
                    >
                      <Edit2 className="w-3.5 h-3.5 text-sky-400" />
                      <span>تعديل</span>
                    </button>
                    <button
                      onClick={() =>
                        setDeleteConfirmation({
                          isOpen: true,
                          type: 'nurse',
                          id: nr.id,
                          name: nr.name
                        })
                      }
                      className="px-3 py-1.5 rounded-lg text-xs font-bold bg-rose-950/40 hover:bg-rose-900/60 text-rose-300 border border-rose-900/40 transition flex items-center gap-1 cursor-pointer"
                    >
                      <Trash2 className="w-3.5 h-3.5 text-rose-400" />
                      <span>حذف</span>
                    </button>
                  </div>
                </div>
              ))}
            </div>

          </div>
        )}

        {/* ======================================================== */}
        {/* TAB 3: HOSPITALS & MEDICAL CENTERS (FULL CRUD)           */}
        {/* ======================================================== */}
        {activeTab === 'hospitals' && (
          <div className="space-y-4">
            
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-slate-900/60 border border-slate-800 p-4 rounded-2xl">
              <div className="space-y-1">
                <h2 className="text-base font-black text-white flex items-center gap-2">
                  <span>🏥 المشافي والمراكز الطبية ونقاط الإسعاف</span>
                </h2>
                <p className="text-xs text-slate-400 font-medium">
                  إدارة نقاط الإسعاف الأولي والمستوصفات الحكومية والخاصة بدير حافر.
                </p>
              </div>

              <button
                onClick={handleOpenAddHospital}
                className="px-3.5 py-2 rounded-xl text-xs font-black bg-emerald-600 hover:bg-emerald-500 text-white shadow-md shadow-emerald-950/60 transition cursor-pointer flex items-center gap-1.5 self-start sm:self-auto"
              >
                <Plus className="w-4 h-4" />
                <span>إضافة مشفى أو مركز</span>
              </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {hospitals.map((hp) => (
                <div key={hp.id} className="bg-slate-900 border border-slate-800 p-5 rounded-3xl shadow-lg space-y-3">
                  <div className="flex items-center justify-between">
                    <h3 className="text-sm font-black text-white flex items-center gap-2">
                      <span>🏥</span>
                      <span>{hp.name}</span>
                    </h3>
                    <span className="bg-indigo-500/20 text-indigo-300 text-[10px] font-bold px-2 py-0.5 rounded-full border border-indigo-500/30">
                      {hp.emergency24h ? 'طوارئ 24/7' : 'دوام رسمي'}
                    </span>
                  </div>

                  <p className="text-xs text-slate-300 font-medium">{hp.district}</p>
                  <div className="text-xs font-mono text-emerald-400 font-bold" dir="ltr">{hp.emergencyPhone}</div>

                  <div className="pt-2 border-t border-slate-800/80 flex items-center justify-end gap-2">
                    <button
                      onClick={() => handleOpenEditHospital(hp)}
                      className="px-3 py-1.5 rounded-lg text-xs font-bold bg-slate-800 hover:bg-slate-700 text-slate-200 transition flex items-center gap-1 cursor-pointer"
                    >
                      <Edit2 className="w-3.5 h-3.5 text-sky-400" />
                      <span>تعديل</span>
                    </button>
                    <button
                      onClick={() =>
                        setDeleteConfirmation({
                          isOpen: true,
                          type: 'hospital',
                          id: hp.id,
                          name: hp.name
                        })
                      }
                      className="px-3 py-1.5 rounded-lg text-xs font-bold bg-rose-950/40 hover:bg-rose-900/60 text-rose-300 border border-rose-900/40 transition flex items-center gap-1 cursor-pointer"
                    >
                      <Trash2 className="w-3.5 h-3.5 text-rose-400" />
                      <span>حذف</span>
                    </button>
                  </div>
                </div>
              ))}
            </div>

          </div>
        )}

        {/* ======================================================== */}
        {/* TAB 4: ACCOUNTS & STAFF MANAGEMENT (CRUD & BLOCK/UNBLOCK) */}
        {/* ======================================================== */}
        {activeTab === 'accounts' && (
          <div className="space-y-4">
            
            {/* Top Toolbar */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-slate-900/60 border border-slate-800 p-4 rounded-2xl">
              <div className="space-y-1">
                <h2 className="text-base font-black text-white flex items-center gap-2">
                  <Users className="w-5 h-5 text-emerald-400" />
                  <span>👥 إدارة حسابات الكوادر والمنظومة</span>
                </h2>
                <p className="text-xs text-slate-400">
                  إدارة وصلاحيات حسابات الصيادلة، الممرضين، المشرفين، والتقنيين (إضافة، تعديل، حظر، وحذف).
                </p>
              </div>

              <button
                onClick={handleOpenAddAccount}
                className="flex items-center justify-center gap-1.5 bg-emerald-600 hover:bg-emerald-500 text-white font-extrabold px-4 py-2.5 rounded-xl text-xs shadow-md shadow-emerald-950/60 transition cursor-pointer active:scale-95 shrink-0"
              >
                <UserPlus className="w-4 h-4" />
                <span>إضافة حساب جديد</span>
              </button>
            </div>

            {/* Search & Role Filters Bar */}
            <div className="flex flex-col md:flex-row items-stretch md:items-center gap-3">
              <div className="relative flex-1">
                <Search className="w-4 h-4 text-slate-400 absolute right-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
                <input
                  type="text"
                  value={accountSearchQuery}
                  onChange={(e) => setAccountSearchQuery(e.target.value)}
                  placeholder="ابحث باسم المستخدم، الاسم المعروض، أو رقم الهاتف..."
                  className="w-full bg-slate-900/80 border border-slate-800 rounded-2xl pr-10 pl-4 py-2.5 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-emerald-500"
                />
              </div>

              <div className="flex items-center gap-1.5 overflow-x-auto pb-1 md:pb-0">
                {(
                  [
                    { id: 'all', label: 'الكل' },
                    { id: 'pharmacist', label: '💊 صيادلة' },
                    { id: 'nurse', label: '🩺 ممرضين' },
                    { id: 'supervisor', label: '👤 مشرفين' },
                    { id: 'technician', label: '⚙️ تقنيين' },
                    { id: 'admin', label: '🛡️ مدير' },
                    { id: 'blocked', label: '🚫 محظورين' }
                  ] as const
                ).map((rf) => (
                  <button
                    key={rf.id}
                    onClick={() => setAccountRoleFilter(rf.id)}
                    className={`px-3 py-1.5 rounded-xl text-[11px] font-bold transition whitespace-nowrap cursor-pointer ${
                      accountRoleFilter === rf.id
                        ? 'bg-emerald-600 text-white shadow-md'
                        : 'bg-slate-900/80 text-slate-400 hover:text-white border border-slate-800'
                    }`}
                  >
                    {rf.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Accounts Cards Grid */}
            {(() => {
              const filteredUsers = users.filter((u) => {
                // Search query filter
                if (accountSearchQuery.trim()) {
                  const q = accountSearchQuery.toLowerCase().trim();
                  const matchName = (u.displayName || '').toLowerCase().includes(q);
                  const matchUser = u.username.toLowerCase().includes(q);
                  const matchPhone = (u.phone || '').includes(q);
                  const matchTarget = (u.targetName || '').toLowerCase().includes(q);
                  if (!matchName && !matchUser && !matchPhone && !matchTarget) return false;
                }

                // Role filter
                if (accountRoleFilter === 'blocked') return u.isBlocked === true;
                if (accountRoleFilter !== 'all') return u.role === accountRoleFilter;

                return true;
              });

              if (filteredUsers.length === 0) {
                return (
                  <div className="bg-slate-900/60 border border-slate-800 rounded-3xl p-12 text-center space-y-3">
                    <Users className="w-12 h-12 text-slate-600 mx-auto" />
                    <p className="text-sm font-bold text-slate-300">لا توجد حسابات تطابق البحث أو الفلتر المحدد</p>
                    <button
                      onClick={handleOpenAddAccount}
                      className="text-xs text-emerald-400 font-bold hover:underline"
                    >
                      + إنشاء حساب جديد الآن
                    </button>
                  </div>
                );
              }

              return (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3.5">
                  {filteredUsers.map((u) => {
                    const isRootAdmin = u.role === 'admin' && u.id === 'admin_root';
                    
                    // Role badge styling
                    const roleBadge = (() => {
                      switch (u.role) {
                        case 'pharmacist':
                          return { text: '💊 صيدلي', bg: 'bg-emerald-500/15 text-emerald-300 border-emerald-500/30' };
                        case 'nurse':
                          return { text: '🩺 ممرض', bg: 'bg-teal-500/15 text-teal-300 border-teal-500/30' };
                        case 'supervisor':
                          return { text: '👤 مشرف', bg: 'bg-purple-500/15 text-purple-300 border-purple-500/30' };
                        case 'technician':
                          return { text: '⚙️ تقني', bg: 'bg-amber-500/15 text-amber-300 border-amber-500/30' };
                        case 'admin':
                          return { text: '🛡️ مدير النظام', bg: 'bg-rose-500/15 text-rose-300 border-rose-500/30' };
                        default:
                          return { text: u.role, bg: 'bg-slate-800 text-slate-300 border-slate-700' };
                      }
                    })();

                    return (
                      <div
                        key={u.id}
                        className={`bg-slate-900/90 border rounded-2xl p-4 space-y-3 transition shadow-sm ${
                          u.isBlocked
                            ? 'border-rose-800/60 bg-rose-950/20'
                            : 'border-slate-800 hover:border-slate-700'
                        }`}
                      >
                        {/* Header: Name, Role, Status */}
                        <div className="flex items-start justify-between gap-2">
                          <div className="space-y-1 min-w-0">
                            <div className="flex items-center gap-1.5 flex-wrap">
                              <h3 className="font-black text-sm text-white truncate">
                                {u.displayName || u.username}
                              </h3>
                              <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full border ${roleBadge.bg}`}>
                                {roleBadge.text}
                              </span>
                            </div>
                            <p className="text-xs text-slate-400 font-mono flex items-center gap-1" dir="ltr">
                              <span>@{u.username}</span>
                            </p>
                          </div>

                          {/* Blocked or Active Status Badge */}
                          {u.isBlocked ? (
                            <span className="shrink-0 text-[10px] font-black bg-rose-900/60 text-rose-300 border border-rose-700 px-2 py-0.5 rounded-full flex items-center gap-1">
                              <UserX className="w-3 h-3" />
                              <span>محظور</span>
                            </span>
                          ) : (
                            <span className="shrink-0 text-[10px] font-black bg-emerald-900/40 text-emerald-300 border border-emerald-700/60 px-2 py-0.5 rounded-full flex items-center gap-1">
                              <UserCheck className="w-3 h-3" />
                              <span>نشط</span>
                            </span>
                          )}
                        </div>

                        {/* Details (Target Entity, Phone, Password) */}
                        <div className="bg-slate-950/60 rounded-xl p-2.5 space-y-1.5 border border-slate-800/60 text-xs">
                          {u.targetName && (
                            <div className="flex items-center justify-between text-slate-300">
                              <span className="text-[11px] text-slate-400">الجهة التابعة:</span>
                              <span className="font-bold text-emerald-400 truncate max-w-[170px]">{u.targetName}</span>
                            </div>
                          )}

                          {u.phone && (
                            <div className="flex items-center justify-between text-slate-300">
                              <span className="text-[11px] text-slate-400">الهاتف:</span>
                              <span className="font-mono text-slate-200" dir="ltr">{u.phone}</span>
                            </div>
                          )}

                          <div className="flex items-center justify-between text-slate-300">
                            <span className="text-[11px] text-slate-400">كلمة المرور:</span>
                            <span className="font-mono text-amber-300 bg-slate-900 px-1.5 py-0.5 rounded text-[11px]">
                              {u.password}
                            </span>
                          </div>
                        </div>

                        {/* Action Buttons */}
                        <div className="flex items-center gap-1.5 pt-1 border-t border-slate-800/80">
                          {/* Toggle Block / Unblock */}
                          {!isRootAdmin && (
                            <button
                              type="button"
                              onClick={() => handleToggleBlockAccount(u)}
                              className={`flex-1 py-1.5 px-2 rounded-xl text-xs font-bold transition flex items-center justify-center gap-1 cursor-pointer active:scale-95 ${
                                u.isBlocked
                                  ? 'bg-emerald-950/70 hover:bg-emerald-900 text-emerald-300 border border-emerald-800'
                                  : 'bg-amber-950/70 hover:bg-amber-900 text-amber-300 border border-amber-800'
                              }`}
                              title={u.isBlocked ? 'إلغاء حظر هذا الحساب' : 'حظر هذا الحساب من الدخول'}
                            >
                              {u.isBlocked ? (
                                <>
                                  <UserCheck className="w-3.5 h-3.5" />
                                  <span>فك الحظر</span>
                                </>
                              ) : (
                                <>
                                  <UserX className="w-3.5 h-3.5" />
                                  <span>حظر</span>
                                </>
                              )}
                            </button>
                          )}

                          {/* Edit Account */}
                          <button
                            type="button"
                            onClick={() => handleOpenEditAccount(u)}
                            className="flex-1 py-1.5 px-2 rounded-xl text-xs font-bold bg-slate-800 hover:bg-slate-700 text-white border border-slate-700 transition flex items-center justify-center gap-1 cursor-pointer active:scale-95"
                          >
                            <Edit2 className="w-3.5 h-3.5 text-blue-400" />
                            <span>تعديل</span>
                          </button>

                          {/* Delete Account */}
                          {!isRootAdmin && (
                            <button
                              type="button"
                              onClick={() => handleDeleteAccountClick(u)}
                              className="p-2 rounded-xl text-xs font-bold bg-slate-800 hover:bg-rose-950/60 text-slate-400 hover:text-rose-300 border border-slate-700 hover:border-rose-800 transition cursor-pointer active:scale-95"
                              title="حذف الحساب نهائياً"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>
              );
            })()}
          </div>
        )}

        {/* ======================================================== */}
        {/* TAB: COMMUNITY REPORTS & USER CONTRIBUTIONS              */}
        {/* ======================================================== */}
        {/* ======================================================== */}
        {/* TAB: COMMUNITY REPORTS & USER CONTRIBUTIONS & REVIEWS    */}
        {/* ======================================================== */}
        {activeTab === 'reports' && (
          <div className="space-y-4">
            {/* Header info */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-slate-900/60 border border-slate-800 p-4 rounded-2xl">
              <div className="space-y-1">
                <h2 className="text-base font-black text-white flex items-center gap-2">
                  <MessageSquare className="w-5 h-5 text-amber-400" />
                  <span>💬 المساهمة المجتمعية • بلاغات، تحديثات، وآراء المستخدمين</span>
                </h2>
                <p className="text-xs text-slate-400 font-medium">
                  هنا تجد كافة البلاغات والاقتراحات وتحديثات الهواتف والآراء والتقييمات المرسلة من أهالي دير حافر عبر التطبيق لحظة بلحظة.
                </p>
              </div>

              {/* Sub-tab Switcher & Manual Refresh */}
              <div className="flex items-center gap-2 flex-wrap self-start sm:self-auto">
                <button
                  onClick={() => {
                    const localReps = offlineStorage.getCommunityReports();
                    setCommunityReports(localReps);
                    showNotification('تم تحديث قائمة البلاغات فوراً! 🔄');
                  }}
                  className="px-3 py-1.5 rounded-xl text-xs font-bold bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 transition cursor-pointer flex items-center gap-1.5"
                  title="تحديث البلاغات من السحابة والتخزين المحلي"
                >
                  <RefreshCw className="w-3.5 h-3.5 text-emerald-400" />
                  <span>تحديث البلاغات 🔄</span>
                </button>

                <div className="flex items-center gap-1.5 bg-slate-950 p-1 rounded-xl border border-slate-800">
                  <button
                    onClick={() => setReportsSubTab('reports')}
                    className={`px-3 py-1.5 rounded-lg text-xs font-bold transition cursor-pointer flex items-center gap-1.5 ${
                      reportsSubTab === 'reports'
                        ? 'bg-amber-500 text-slate-950 font-black shadow-sm'
                        : 'text-slate-400 hover:text-white'
                    }`}
                  >
                    <span>📬 طلبات وبلاغات الأهالي ({communityReports.length})</span>
                  </button>
                  <button
                    onClick={() => setReportsSubTab('reviews')}
                    className={`px-3 py-1.5 rounded-lg text-xs font-bold transition cursor-pointer flex items-center gap-1.5 ${
                      reportsSubTab === 'reviews'
                        ? 'bg-amber-500 text-slate-950 font-black shadow-sm'
                        : 'text-slate-400 hover:text-white'
                    }`}
                  >
                    <span>⭐ تقييمات وآراء المرضى ({reviews.length})</span>
                  </button>
                </div>
              </div>
            </div>

            {/* Sub-tab 1: Community Reports */}
            {reportsSubTab === 'reports' && (
              <>
                {communityReports.length === 0 ? (
                  <div className="bg-slate-900 border border-slate-800 rounded-3xl p-12 text-center space-y-3">
                    <div className="w-14 h-14 rounded-2xl bg-slate-800 text-slate-400 flex items-center justify-center mx-auto text-2xl">
                      📬
                    </div>
                    <h3 className="font-extrabold text-white text-sm">لا توجد بلاغات أو مساهمات مجتمعية جديدة حالياً</h3>
                    <p className="text-xs text-slate-400 max-w-md mx-auto">
                      عندما يقوم أي مواطن بإرسال بلاغ (تأكيد مناوبة صيدلية، إبلاغ عن إغلاق، اقتراح رقم هاتف، أو ملاحظة أدوية) سيظهر مباشرة هنا مع زر لتطبيق التعديل بضغطة زر واحدة.
                    </p>
                  </div>
                ) : (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5">
                    {communityReports.map((rep) => {
                      const getReportBadge = (type: string) => {
                        switch (type) {
                          case 'duty_confirm':
                            return { text: 'تأكيد مناوبة مفتوحة 🌙', color: 'bg-emerald-950/60 text-emerald-300 border-emerald-800' };
                          case 'duty_closed':
                            return { text: 'إبلاغ عن إغلاق ⚪', color: 'bg-rose-950/60 text-rose-300 border-rose-800' };
                          case 'phone_update':
                            return { text: 'تحديث رقم هاتف 📞', color: 'bg-blue-950/60 text-blue-300 border-blue-800' };
                          case 'location_fix':
                            return { text: 'تصحيح موقع جغرافي 📍', color: 'bg-amber-950/60 text-amber-300 border-amber-800' };
                          case 'medicine_note':
                            return { text: 'توفر أدوية 💊', color: 'bg-purple-950/60 text-purple-300 border-purple-800' };
                          default:
                            return { text: 'ملاحظة عامة 📝', color: 'bg-slate-800 text-slate-300 border-slate-700' };
                        }
                      };

                      const badge = getReportBadge(rep.reportType);

                      return (
                        <div
                          key={rep.id}
                          className="bg-slate-900 border border-slate-800 rounded-2xl p-4 space-y-3 shadow-md hover:border-slate-700 transition"
                        >
                          {/* Header Row */}
                          <div className="flex items-start justify-between gap-2">
                            <div className="space-y-1 min-w-0">
                              <div className="flex items-center gap-2 flex-wrap">
                                <span className="font-extrabold text-sm text-white truncate">
                                  {rep.targetName}
                                </span>
                                <span className="text-[10px] text-slate-400 bg-slate-800 px-2 py-0.5 rounded-full font-mono">
                                  {rep.targetType === 'pharmacy' ? 'صيدلية' : rep.targetType === 'nurse' ? 'تمريض' : 'مشفى/مركز'}
                                </span>
                              </div>
                              <div className="flex items-center gap-2 text-[11px] text-slate-400">
                                <span>👤 {rep.reporterName || 'أحد الأهالي'}</span>
                                <span>•</span>
                                <span>🕒 {new Date(rep.createdAt).toLocaleString('ar-SY', { dateStyle: 'short', timeStyle: 'short' })}</span>
                              </div>
                            </div>

                            {/* Delete report action */}
                            <button
                              onClick={async () => {
                                try {
                                  await deleteCommunityReportFromFirestore(rep.id);
                                  setCommunityReports(prev => prev.filter(r => r.id !== rep.id));
                                  showNotification('تمت معالجة وحذف التقرير بنجاح! ✅');
                                } catch (e) {
                                  showNotification('حدث خطأ أثناء معالجة التقرير', true);
                                }
                              }}
                              className="p-1.5 rounded-lg bg-slate-800 hover:bg-rose-950/50 text-slate-400 hover:text-rose-300 border border-slate-700 hover:border-rose-800 transition cursor-pointer"
                              title="تمت المراجعة وحذف البلاغ"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          </div>

                          {/* Badge */}
                          <div>
                            <span className={`inline-block px-2.5 py-1 rounded-xl text-[11px] font-bold border ${badge.color}`}>
                              {badge.text}
                            </span>
                          </div>

                          {/* Details / Text */}
                          <div className="bg-slate-950/50 border border-slate-800/80 rounded-xl p-3 text-xs text-slate-200 leading-relaxed font-medium">
                            {rep.details}
                          </div>

                          {/* Suggested phone if any */}
                          {rep.suggestedPhone && (
                            <div className="flex items-center justify-between gap-2 text-xs bg-emerald-950/30 border border-emerald-900/40 rounded-xl p-2.5 text-emerald-300 font-mono">
                              <div className="flex items-center gap-2" dir="ltr">
                                <Phone className="w-3.5 h-3.5 text-emerald-400" />
                                <span className="font-bold">{rep.suggestedPhone}</span>
                              </div>
                              <a
                                href={`tel:${rep.suggestedPhone}`}
                                className="text-[10px] text-emerald-400 hover:underline font-sans"
                              >
                                اتصال للتحقق
                              </a>
                            </div>
                          )}

                          {/* Quick action buttons for Admin */}
                          <div className="flex items-center gap-2 pt-2 border-t border-slate-800/60 flex-wrap">
                            {rep.suggestedPhone && rep.targetType === 'pharmacy' && (
                              <button
                                onClick={async () => {
                                  try {
                                    await updatePharmacyStatus(rep.targetId, { phone: rep.suggestedPhone });
                                    showNotification(`تم اعتماد رقم الهاتف الجديد (${rep.suggestedPhone}) ومزامنته فوراً! 📞`);
                                  } catch (e) {
                                    showNotification('تعذر تحديث رقم الهاتف', true);
                                  }
                                }}
                                className="px-3 py-1.5 rounded-lg text-xs font-bold bg-emerald-700 hover:bg-emerald-600 text-white transition cursor-pointer flex items-center gap-1.5 shadow-sm"
                              >
                                <Phone className="w-3 h-3" />
                                <span>اعتماد وتحديث الهاتف للصيدلية</span>
                              </button>
                            )}

                            {rep.targetType === 'pharmacy' && rep.reportType === 'duty_confirm' && (
                              <button
                                onClick={async () => {
                                  try {
                                    await updatePharmacyStatus(rep.targetId, { isOnDuty: true });
                                    showNotification('تم تفعيل مناوبة الصيدلية بناءً على بلاغ الأهالي 🌙');
                                  } catch (e) {
                                    showNotification('تعذر تفعيل المناوبة', true);
                                  }
                                }}
                                className="px-3 py-1.5 rounded-lg text-xs font-bold bg-teal-800 hover:bg-teal-700 text-white transition cursor-pointer flex items-center gap-1.5 shadow-sm"
                              >
                                <Moon className="w-3 h-3 text-emerald-300" />
                                <span>تأكيد وتفعيل المناوبة الآن</span>
                              </button>
                            )}

                            {rep.targetType === 'pharmacy' && rep.reportType === 'duty_closed' && (
                              <button
                                onClick={async () => {
                                  try {
                                    await updatePharmacyStatus(rep.targetId, { isOnDuty: false });
                                    showNotification('تم إيقاف مناوبة الصيدلية بناءً على بلاغ الإغلاق ⚪');
                                  } catch (e) {
                                    showNotification('تعذر إيقاف المناوبة', true);
                                  }
                                }}
                                className="px-3 py-1.5 rounded-lg text-xs font-bold bg-rose-900/80 hover:bg-rose-800 text-rose-100 transition cursor-pointer flex items-center gap-1.5 shadow-sm"
                              >
                                <X className="w-3 h-3" />
                                <span>إيقاف المناوبة (مغلقة)</span>
                              </button>
                            )}
                          </div>

                        </div>
                      );
                    })}
                  </div>
                )}
              </>
            )}

            {/* Sub-tab 2: Patient Ratings & Reviews */}
            {reportsSubTab === 'reviews' && (
              <>
                {reviews.length === 0 ? (
                  <div className="bg-slate-900 border border-slate-800 rounded-3xl p-12 text-center space-y-3">
                    <div className="w-14 h-14 rounded-2xl bg-slate-800 text-slate-400 flex items-center justify-center mx-auto text-2xl">
                      ⭐
                    </div>
                    <h3 className="font-extrabold text-white text-sm">لا توجد تقييمات أو مراجعات مسجلة حتى الآن</h3>
                    <p className="text-xs text-slate-400 max-w-md mx-auto">
                      عندما يقوم المرضى أو المستخدمون بتقييم صيدلية أو ممرض أو مشفى (مع النجوم والتعليق)، ستظهر مراجعاتهم هنا مع إمكانية حذف أو إدارة التقييمات.
                    </p>
                  </div>
                ) : (
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3.5">
                    {reviews.map((rev) => {
                      const targetPh = pharmacies.find(p => p.id === rev.targetId);
                      const targetNr = nurses.find(n => n.id === rev.targetId);
                      const targetHp = hospitals.find(h => h.id === rev.targetId);
                      const entityName = targetPh?.name || targetNr?.name || targetHp?.name || 'منشأة صحية';

                      return (
                        <div
                          key={rev.id}
                          className="bg-slate-900 border border-slate-800 rounded-2xl p-4 space-y-3 shadow-md hover:border-slate-700 transition flex flex-col justify-between"
                        >
                          <div className="space-y-2">
                            {/* Top info */}
                            <div className="flex items-start justify-between gap-2">
                              <div>
                                <h4 className="font-black text-sm text-white">{entityName}</h4>
                                <span className="text-[10px] text-slate-400">
                                  {rev.targetType === 'pharmacy' ? '💊 صيدلية' : rev.targetType === 'nurse' ? '🩺 تمريض' : '🏥 مشفى'}
                                </span>
                              </div>

                              {/* Delete review button */}
                              <button
                                onClick={async () => {
                                  try {
                                    await deleteReviewFromFirestore(rev.id);
                                    setReviews(prev => prev.filter(r => r.id !== rev.id));
                                    showNotification('تم حذف التقييم بنجاح! 🗑️');
                                  } catch (e) {
                                    showNotification('حدث خطأ أثناء حذف التقييم', true);
                                  }
                                }}
                                className="p-1.5 rounded-lg bg-slate-800 hover:bg-rose-950/60 text-slate-400 hover:text-rose-300 border border-slate-700 hover:border-rose-800 transition cursor-pointer"
                                title="حذف هذا التقييم"
                              >
                                <Trash2 className="w-3.5 h-3.5" />
                              </button>
                            </div>

                            {/* Stars */}
                            <div className="flex items-center gap-1">
                              {[1, 2, 3, 4, 5].map((starVal) => (
                                <Star
                                  key={starVal}
                                  className={`w-4 h-4 ${
                                    starVal <= rev.rating
                                      ? 'text-amber-400 fill-amber-400'
                                      : 'text-slate-700'
                                  }`}
                                />
                              ))}
                              <span className="text-xs font-black text-amber-400 mr-1.5">
                                {rev.rating} / 5
                              </span>
                            </div>

                            {/* Tag */}
                            {rev.tag && (
                              <div>
                                <span className="inline-block text-[11px] font-bold bg-amber-950/40 text-amber-300 border border-amber-900/40 px-2.5 py-0.5 rounded-lg">
                                  {rev.tag}
                                </span>
                              </div>
                            )}

                            {/* Comment */}
                            {rev.comment && (
                              <p className="text-xs text-slate-300 bg-slate-950/40 p-2.5 rounded-xl border border-slate-800/80 leading-relaxed">
                                &ldquo;{rev.comment}&rdquo;
                              </p>
                            )}
                          </div>

                          {/* Footer date */}
                          <div className="pt-2 border-t border-slate-800 text-[10px] text-slate-400">
                            {new Date(rev.createdAt).toLocaleString('ar-SY', { dateStyle: 'medium', timeStyle: 'short' })}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}
              </>
            )}

          </div>
        )}

      </main>

      {/* ======================================================== */}
      {/* MODAL: ADD / EDIT PHARMACY                               */}
      {/* ======================================================== */}
      {isPharmacyModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4 overflow-y-auto" dir="rtl">
          <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 w-full max-w-lg shadow-2xl space-y-4 my-8">
            <div className="flex items-center justify-between pb-2 border-b border-slate-800">
              <h3 className="text-base font-black text-white flex items-center gap-2">
                <span>💊</span>
                <span>{editingPharmacy ? 'تعديل بيانات الصيدلية' : 'إضافة صيدلية جديدة'}</span>
              </h3>
              <button
                onClick={() => setIsPharmacyModalOpen(false)}
                className="text-slate-400 hover:text-white p-1 text-lg font-bold cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSavePharmacy} className="space-y-3.5">
              <div>
                <label className="block text-xs font-bold text-slate-300 mb-1">اسم الصيدلية *</label>
                <input
                  type="text"
                  value={pharmacyFormData.name || ''}
                  onChange={(e) => setPharmacyFormData({ ...pharmacyFormData, name: e.target.value })}
                  placeholder="مثال: صيدلية الأمل المركزية"
                  className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3.5 py-2.5 text-xs text-white focus:outline-none focus:border-emerald-500"
                  required
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-300 mb-1">الحي / المنطقة</label>
                  <select
                    value={pharmacyFormData.district || 'الشارع العام'}
                    onChange={(e) => setPharmacyFormData({ ...pharmacyFormData, district: e.target.value })}
                    className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-emerald-500"
                  >
                    {DAYR_HAFIR_PRESETS.map((d) => (
                      <option key={d.id} value={d.name}>{d.name}</option>
                    ))}
                    <option value="الشارع العام">الشارع العام</option>
                    <option value="دوار السوق">دوار السوق</option>
                    <option value="طريق حلب - الرقة">طريق حلب - الرقة</option>
                    <option value="الحي الشمالي">الحي الشمالي</option>
                    <option value="الحي الجنوبي">الحي الجنوبي</option>
                    <option value="شارع المدارس">شارع المدارس</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-300 mb-1">رقم الهاتف للتواصل</label>
                  <input
                    type="text"
                    value={pharmacyFormData.phone || ''}
                    onChange={(e) => setPharmacyFormData({ ...pharmacyFormData, phone: e.target.value })}
                    placeholder="+9639xxxxxxxx"
                    className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-xs text-white font-mono focus:outline-none focus:border-emerald-500"
                    dir="ltr"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-300 mb-1">العنوان بالتفصيل</label>
                <input
                  type="text"
                  value={pharmacyFormData.address || ''}
                  onChange={(e) => setPharmacyFormData({ ...pharmacyFormData, address: e.target.value })}
                  placeholder="مثال: الشارع الرئيسي - مقابل المركز الثقافي"
                  className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3.5 py-2.5 text-xs text-white focus:outline-none focus:border-emerald-500"
                />
              </div>

              {/* Section: Duty Days and Shift Schedule */}
              <div className="bg-slate-950/70 p-3.5 rounded-2xl border border-emerald-500/30 space-y-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="text-emerald-400 text-sm">🌙</span>
                    <span className="text-xs font-black text-white">جدول وأيام المناوبة الليلية</span>
                  </div>
                  <span className="text-[10px] bg-emerald-950 text-emerald-300 border border-emerald-500/30 px-2 py-0.5 rounded-full font-bold">
                    إدارة المدير
                  </span>
                </div>

                <div className="bg-slate-900/90 p-2.5 rounded-xl border border-slate-800 text-[11px] text-slate-300 leading-relaxed space-y-1">
                  <div className="font-bold text-amber-300 flex items-center gap-1.5">
                    <span>📌</span>
                    <span>نظام الدوام والمناوبة المعتمد:</span>
                  </div>
                  <p>
                    الدوام اليومي لكافة الصيدليات حتى <strong className="text-white">6:00 مساءً</strong> • ساعات المناوبة من <strong className="text-amber-300">9:00 مساءً</strong> حتى <strong className="text-amber-300">12:00 منتصف الليل</strong>.
                  </p>
                </div>



                {/* Duty Hours: Start and End */}
                <div className="grid grid-cols-2 gap-3 pt-1">
                  <div>
                    <label className="block text-xs font-bold text-slate-300 mb-1">
                      ساعة بداية المناوبة ⏰
                    </label>
                    <select
                      value={pharmacyFormData.dutyStartTime || '21:00'}
                      onChange={(e) => {
                        const val = e.target.value;
                        const end = pharmacyFormData.dutyEndTime || '00:00';
                        setPharmacyFormData({
                          ...pharmacyFormData,
                          dutyStartTime: val,
                          dutyHours: `دوام حتى 6:00 م • مناوبة ${val} حتى ${end}`
                        });
                      }}
                      className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-emerald-500 font-mono"
                    >
                      <option value="21:00">21:00 (09:00 مساءً - المعتمد)</option>
                      <option value="20:00">20:00 (08:00 مساءً)</option>
                      <option value="18:00">18:00 (06:00 مساءً - بعد الإغلاق فوراً)</option>
                      <option value="19:00">19:00 (07:00 مساءً)</option>
                      <option value="20:30">20:30 (08:30 مساءً)</option>
                      <option value="22:00">22:00 (10:00 مساءً)</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-300 mb-1">
                      ساعة انتهاء المناوبة 🌙
                    </label>
                    <select
                      value={pharmacyFormData.dutyEndTime || '00:00'}
                      onChange={(e) => {
                        const val = e.target.value;
                        const start = pharmacyFormData.dutyStartTime || '20:00';
                        setPharmacyFormData({
                          ...pharmacyFormData,
                          dutyEndTime: val,
                          dutyHours: `دوام حتى 6:00 م • مناوبة ${start} حتى ${val}`
                        });
                      }}
                      className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-emerald-500 font-mono"
                    >
                      <option value="23:00">23:00 (11:00 مساءً)</option>
                      <option value="00:00">00:00 (12:00 منتصف الليل - الافتراضي)</option>
                      <option value="01:00">01:00 (01:00 بعد منتصف الليل)</option>
                      <option value="02:00">02:00 (02:00 فجراً)</option>
                      <option value="06:00">06:00 (06:00 صباحاً)</option>
                      <option value="08:00">08:00 (08:00 صباحاً - حتى الصباح)</option>
                      <option value="24 ساعة">24 ساعة (طوارئ مستمرة)</option>
                    </select>
                  </div>
                </div>

                {/* Ready-made Mode Selector Buttons (No text box) */}
                <div className="space-y-2 pt-1">
                  <label className="block text-xs font-black text-slate-200">
                    نظام الدوام والمناوبة للصيدلية (اختر بضغطة زر):
                  </label>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                    {/* Button 1: دوام اعتيادي */}
                    <button
                      type="button"
                      onClick={() => {
                        setPharmacyFormData({
                          ...pharmacyFormData,
                          isOnDuty: false,
                          dutyHours: 'دوام اعتيادي (يومياً حتى 6:00 مساءً)'
                        });
                      }}
                      className={`p-3 rounded-2xl border text-right transition-all cursor-pointer flex items-center justify-between gap-2 ${
                        !pharmacyFormData.isOnDuty
                          ? 'bg-emerald-600/25 border-emerald-500 text-white ring-2 ring-emerald-500/50 shadow-md'
                          : 'bg-slate-900 border-slate-800 text-slate-400 hover:bg-slate-850 hover:text-slate-200'
                      }`}
                    >
                      <div>
                        <div className="flex items-center gap-1.5 font-black text-xs text-white">
                          <span>🟢</span>
                          <span>دوام اعتيادي</span>
                        </div>
                        <div className="text-[10px] text-slate-400 mt-0.5 font-medium">
                          تفتح يومياً حتى 6:00 م • ليست مناوبة الليلة
                        </div>
                      </div>
                      {!pharmacyFormData.isOnDuty && (
                        <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                      )}
                    </button>

                    {/* Button 2: دوام اعتيادي + مناوبة الليلة */}
                    <button
                      type="button"
                      onClick={() => {
                        const start = pharmacyFormData.dutyStartTime || '20:00';
                        const end = pharmacyFormData.dutyEndTime || '00:00';
                        setPharmacyFormData({
                          ...pharmacyFormData,
                          isOnDuty: true,
                          dutyHours: `دوام اعتيادي حتى 6:00 م + مناوبة الليلة (${start} حتى ${end})`
                        });
                      }}
                      className={`p-3 rounded-2xl border text-right transition-all cursor-pointer flex items-center justify-between gap-2 ${
                        pharmacyFormData.isOnDuty
                          ? 'bg-gradient-to-r from-emerald-950/70 to-emerald-900/50 border-emerald-400 text-white ring-2 ring-emerald-400/50 shadow-md shadow-emerald-950/50'
                          : 'bg-slate-900 border-slate-800 text-slate-400 hover:bg-slate-850 hover:text-slate-200'
                      }`}
                    >
                      <div>
                        <div className="flex items-center gap-1.5 font-black text-xs text-emerald-300">
                          <span>🌙</span>
                          <span>دوام اعتيادي + مناوبة الليلة</span>
                        </div>
                        <div className="text-[10px] text-slate-400 mt-0.5 font-medium">
                          تغلق 6:00 م وتفتح لمناوبتها في الوقت المحدد
                        </div>
                      </div>
                      {pharmacyFormData.isOnDuty && (
                        <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                      )}
                    </button>
                  </div>
                </div>
              </div>

              {/* Status Extras */}
              <div className="bg-slate-800/60 p-3.5 rounded-2xl border border-slate-700/60 space-y-2.5">

                <label className="flex items-center justify-between cursor-pointer">
                  <span className="text-xs font-bold text-slate-200">قياس ضغط مجاني:</span>
                  <input
                    type="checkbox"
                    checked={pharmacyFormData.hasFreeBloodPressureCheck ?? true}
                    onChange={(e) => setPharmacyFormData({ ...pharmacyFormData, hasFreeBloodPressureCheck: e.target.checked })}
                    className="w-5 h-5 accent-emerald-500 rounded cursor-pointer"
                  />
                </label>

                <label className="flex items-center justify-between cursor-pointer">
                  <span className="text-xs font-bold text-slate-200">فحص سكري متاح:</span>
                  <input
                    type="checkbox"
                    checked={pharmacyFormData.hasFreeGlucoseCheck ?? false}
                    onChange={(e) => setPharmacyFormData({ ...pharmacyFormData, hasFreeGlucoseCheck: e.target.checked })}
                    className="w-5 h-5 accent-emerald-500 rounded cursor-pointer"
                  />
                </label>
              </div>

              <div className="flex items-center gap-3 pt-2">
                <button
                  type="submit"
                  disabled={saving}
                  className="flex-1 bg-emerald-600 hover:bg-emerald-500 text-white font-black py-3 rounded-xl text-xs transition cursor-pointer flex items-center justify-center gap-2"
                >
                  {saving ? <RefreshCw className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
                  <span>{editingPharmacy ? 'حفظ التعديلات سحابياً' : 'إضافة الصيدلية وحفظها'}</span>
                </button>
                <button
                  type="button"
                  onClick={() => setIsPharmacyModalOpen(false)}
                  className="px-4 py-3 bg-slate-800 hover:bg-slate-700 text-slate-300 font-bold rounded-xl text-xs transition cursor-pointer"
                >
                  إلغاء
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ======================================================== */}
      {/* MODAL: ADD / EDIT NURSE                                  */}
      {/* ======================================================== */}
      {isNurseModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4 overflow-y-auto" dir="rtl">
          <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 w-full max-w-lg shadow-2xl space-y-4 my-8">
            <div className="flex items-center justify-between pb-2 border-b border-slate-800">
              <h3 className="text-base font-black text-white flex items-center gap-2">
                <span>🩺</span>
                <span>{editingNurse ? 'تعديل بيانات الممرض' : 'إضافة ممرض جديد'}</span>
              </h3>
              <button
                onClick={() => setIsNurseModalOpen(false)}
                className="text-slate-400 hover:text-white p-1 text-lg font-bold cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveNurse} className="space-y-3.5">
              <div>
                <label className="block text-xs font-bold text-slate-300 mb-1">اسم الممرض / الممرضة *</label>
                <input
                  type="text"
                  value={nurseFormData.name || ''}
                  onChange={(e) => setNurseFormData({ ...nurseFormData, name: e.target.value })}
                  placeholder="مثال: أحمد المصطفى"
                  className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3.5 py-2.5 text-xs text-white focus:outline-none focus:border-emerald-500"
                  required
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-300 mb-1">الاختصاص والوصف</label>
                <input
                  type="text"
                  value={nurseFormData.title || ''}
                  onChange={(e) => setNurseFormData({ ...nurseFormData, title: e.target.value })}
                  placeholder="مثال: أخصائي تمريض منزلي ورعاية جروح"
                  className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3.5 py-2.5 text-xs text-white focus:outline-none focus:border-emerald-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-300 mb-1">الحي / المنطقة</label>
                  <input
                    type="text"
                    value={nurseFormData.district || ''}
                    onChange={(e) => setNurseFormData({ ...nurseFormData, district: e.target.value })}
                    placeholder="دير حافر - الشارع العام"
                    className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-emerald-500"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-300 mb-1">رقم الهاتف</label>
                  <input
                    type="text"
                    value={nurseFormData.phone || ''}
                    onChange={(e) => setNurseFormData({ ...nurseFormData, phone: e.target.value })}
                    placeholder="+9639xxxxxxxx"
                    className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-xs text-white font-mono focus:outline-none focus:border-emerald-500"
                    dir="ltr"
                    required
                  />
                </div>
              </div>

              <div className="bg-slate-800/60 p-3.5 rounded-2xl border border-slate-700/60 space-y-2">
                <label className="flex items-center justify-between cursor-pointer">
                  <span className="text-xs font-bold text-slate-200">حالة المناوبة والجاهزية:</span>
                  <input
                    type="checkbox"
                    checked={nurseFormData.isOnDuty ?? true}
                    onChange={(e) => setNurseFormData({ ...nurseFormData, isOnDuty: e.target.checked })}
                    className="w-5 h-5 accent-emerald-500 rounded cursor-pointer"
                  />
                </label>
              </div>

              <div className="flex items-center gap-3 pt-2">
                <button
                  type="submit"
                  disabled={saving}
                  className="flex-1 bg-emerald-600 hover:bg-emerald-500 text-white font-black py-3 rounded-xl text-xs transition cursor-pointer flex items-center justify-center gap-2"
                >
                  {saving ? <RefreshCw className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
                  <span>{editingNurse ? 'حفظ التعديلات' : 'إضافة الممرض'}</span>
                </button>
                <button
                  type="button"
                  onClick={() => setIsNurseModalOpen(false)}
                  className="px-4 py-3 bg-slate-800 hover:bg-slate-700 text-slate-300 font-bold rounded-xl text-xs transition cursor-pointer"
                >
                  إلغاء
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ======================================================== */}
      {/* MODAL: ADD / EDIT HOSPITAL                               */}
      {/* ======================================================== */}
      {isHospitalModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4 overflow-y-auto" dir="rtl">
          <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 w-full max-w-lg shadow-2xl space-y-4 my-8">
            <div className="flex items-center justify-between pb-2 border-b border-slate-800">
              <h3 className="text-base font-black text-white flex items-center gap-2">
                <span>🏥</span>
                <span>{editingHospital ? 'تعديل بيانات المركز أو المشفى' : 'إضافة مركز طبي جديد'}</span>
              </h3>
              <button
                onClick={() => setIsHospitalModalOpen(false)}
                className="text-slate-400 hover:text-white p-1 text-lg font-bold cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveHospital} className="space-y-3.5">
              <div>
                <label className="block text-xs font-bold text-slate-300 mb-1">اسم المشفى أو المركز *</label>
                <input
                  type="text"
                  value={hospitalFormData.name || ''}
                  onChange={(e) => setHospitalFormData({ ...hospitalFormData, name: e.target.value })}
                  placeholder="مثال: المركز الصحي العام (مستوصف دير حافر)"
                  className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3.5 py-2.5 text-xs text-white focus:outline-none focus:border-emerald-500"
                  required
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-300 mb-1">نوع المركز / التصنيف</label>
                <input
                  type="text"
                  value={hospitalFormData.type || ''}
                  onChange={(e) => setHospitalFormData({ ...hospitalFormData, type: e.target.value })}
                  placeholder="مركز صحي حكومي - نقطة طوارئ"
                  className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3.5 py-2.5 text-xs text-white focus:outline-none focus:border-emerald-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-300 mb-1">المنطقة / الشارع</label>
                  <input
                    type="text"
                    value={hospitalFormData.district || ''}
                    onChange={(e) => setHospitalFormData({ ...hospitalFormData, district: e.target.value })}
                    placeholder="شارع المستوصف"
                    className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-emerald-500"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-300 mb-1">هاتف الطوارئ</label>
                  <input
                    type="text"
                    value={hospitalFormData.emergencyPhone || ''}
                    onChange={(e) => setHospitalFormData({ ...hospitalFormData, emergencyPhone: e.target.value })}
                    placeholder="110 أو رقم هاتف"
                    className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-xs text-white font-mono focus:outline-none focus:border-emerald-500"
                    dir="ltr"
                  />
                </div>
              </div>

              <div className="bg-slate-800/60 p-3.5 rounded-2xl border border-slate-700/60">
                <label className="flex items-center justify-between cursor-pointer">
                  <span className="text-xs font-bold text-slate-200">طوارئ 24/7 على مدار الساعة:</span>
                  <input
                    type="checkbox"
                    checked={hospitalFormData.emergency24h ?? true}
                    onChange={(e) => setHospitalFormData({ ...hospitalFormData, emergency24h: e.target.checked })}
                    className="w-5 h-5 accent-emerald-500 rounded cursor-pointer"
                  />
                </label>
              </div>

              <div className="flex items-center gap-3 pt-2">
                <button
                  type="submit"
                  disabled={saving}
                  className="flex-1 bg-emerald-600 hover:bg-emerald-500 text-white font-black py-3 rounded-xl text-xs transition cursor-pointer flex items-center justify-center gap-2"
                >
                  {saving ? <RefreshCw className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
                  <span>{editingHospital ? 'حفظ التعديلات' : 'إضافة المركز'}</span>
                </button>
                <button
                  type="button"
                  onClick={() => setIsHospitalModalOpen(false)}
                  className="px-4 py-3 bg-slate-800 hover:bg-slate-700 text-slate-300 font-bold rounded-xl text-xs transition cursor-pointer"
                >
                  إلغاء
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ======================================================== */}
      {/* MODAL: DELETE CONFIRMATION DIALOG                        */}
      {/* ======================================================== */}
      {deleteConfirmation.isOpen && (
        <div className="fixed inset-0 z-50 bg-black/85 backdrop-blur-sm flex items-center justify-center p-4" dir="rtl">
          <div className="bg-slate-900 border border-rose-500/40 rounded-3xl p-6 w-full max-w-sm shadow-2xl text-center space-y-4">
            <div className="w-12 h-12 rounded-2xl bg-rose-500/20 text-rose-400 border border-rose-500/30 flex items-center justify-center mx-auto shadow-inner">
              <Trash2 className="w-6 h-6" />
            </div>

            <div className="space-y-1.5">
              <h4 className="font-extrabold text-base text-white">
                تأكيد الحذف النهائي
              </h4>
              <p className="text-xs text-slate-300 font-medium leading-relaxed">
                هل أنت متأكد من حذف <strong className="text-white font-bold">"{deleteConfirmation.name}"</strong> نهائياً من قاعدة البيانات السحابية؟ سيختفي هذا العنصر فوراً من هواتف وتطبيقات كافة المستخدمين.
              </p>
            </div>

            <div className="flex items-center gap-2 pt-2">
              <button
                onClick={handleConfirmDelete}
                disabled={saving}
                className="flex-1 bg-rose-600 hover:bg-rose-500 text-white font-black py-2.5 rounded-xl text-xs shadow-lg shadow-rose-950/60 transition cursor-pointer flex items-center justify-center gap-1.5"
              >
                {saving ? <RefreshCw className="w-4 h-4 animate-spin" /> : <Trash2 className="w-4 h-4" />}
                <span>نعم، حذف نهائي</span>
              </button>
              <button
                onClick={() => setDeleteConfirmation({ isOpen: false, type: 'pharmacy', id: '', name: '' })}
                className="px-4 py-2.5 bg-slate-800 hover:bg-slate-700 text-slate-300 font-bold rounded-xl text-xs transition cursor-pointer"
              >
                تراجع
              </button>
            </div>
          </div>
        </div>
      )}
      {/* ======================================================== */}
      {/* MODAL: ADD / EDIT ACCOUNT (STAFF & SYSTEM ROLES)         */}
      {/* ======================================================== */}
      {isAccountModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4 overflow-y-auto" dir="rtl">
          <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 w-full max-w-lg shadow-2xl space-y-4 my-8">
            <div className="flex items-center justify-between pb-2 border-b border-slate-800">
              <h3 className="text-base font-black text-white flex items-center gap-2">
                <Users className="w-5 h-5 text-emerald-400" />
                <span>{editingAccount ? 'تعديل بيانات الحساب' : 'إنشاء حساب كادر / مسؤول جديد'}</span>
              </h3>
              <button
                type="button"
                onClick={() => setIsAccountModalOpen(false)}
                className="text-slate-400 hover:text-white p-1 text-lg font-bold cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveAccount} className="space-y-3.5">
              {/* Role Selection */}
              <div>
                <label className="block text-xs font-bold text-slate-300 mb-1.5">نوع الحساب والصلاحية *</label>
                <div className="grid grid-cols-3 sm:grid-cols-5 gap-1.5">
                  {(
                    [
                      { id: 'pharmacist', label: '💊 صيدلي' },
                      { id: 'nurse', label: '🩺 ممرض' },
                      { id: 'supervisor', label: '👤 مشرف' },
                      { id: 'technician', label: '⚙️ تقني' },
                      { id: 'admin', label: '🛡️ مدير' }
                    ] as const
                  ).map((r) => (
                    <button
                      key={r.id}
                      type="button"
                      onClick={() => setAccountFormData({ ...accountFormData, role: r.id })}
                      className={`py-2 px-1.5 rounded-xl text-xs font-bold border transition text-center cursor-pointer ${
                        accountFormData.role === r.id
                          ? 'bg-emerald-600 border-emerald-500 text-white shadow-sm'
                          : 'bg-slate-800 border-slate-700 text-slate-300 hover:border-slate-600'
                      }`}
                    >
                      {r.label}
                    </button>
                  ))}
                </div>
              </div>

              {/* Linked entity if pharmacist */}
              {accountFormData.role === 'pharmacist' && (
                <div>
                  <label className="block text-xs font-bold text-slate-300 mb-1">الصيدلية التابعة لهذا الحساب *</label>
                  <select
                    value={accountFormData.targetId}
                    onChange={(e) => setAccountFormData({ ...accountFormData, targetId: e.target.value })}
                    className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3.5 py-2.5 text-xs text-white focus:outline-none focus:border-emerald-500 cursor-pointer"
                    required
                  >
                    <option value="" disabled>اختر الصيدلية المعتمدة...</option>
                    {pharmacies.map((ph) => (
                      <option key={ph.id} value={ph.id}>
                        {ph.name} ({ph.district})
                      </option>
                    ))}
                  </select>
                </div>
              )}

              {/* Linked entity if nurse */}
              {accountFormData.role === 'nurse' && (
                <div>
                  <label className="block text-xs font-bold text-slate-300 mb-1">الممرض التابع لهذا الحساب *</label>
                  <select
                    value={accountFormData.targetId}
                    onChange={(e) => setAccountFormData({ ...accountFormData, targetId: e.target.value })}
                    className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3.5 py-2.5 text-xs text-white focus:outline-none focus:border-emerald-500 cursor-pointer"
                    required
                  >
                    <option value="" disabled>اختر الممرض المعتمد...</option>
                    {nurses.map((nr) => (
                      <option key={nr.id} value={nr.id}>
                        {nr.name} ({nr.district})
                      </option>
                    ))}
                  </select>
                </div>
              )}

              {/* Display Name */}
              <div>
                <label className="block text-xs font-bold text-slate-300 mb-1">الاسم الكامل أو المعروض *</label>
                <input
                  type="text"
                  value={accountFormData.displayName}
                  onChange={(e) => setAccountFormData({ ...accountFormData, displayName: e.target.value })}
                  placeholder="مثال: د. صيدلية المركز / م. خالد"
                  className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3.5 py-2.5 text-xs text-white focus:outline-none focus:border-emerald-500"
                  required
                />
              </div>

              {/* Username & Password */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-300 mb-1">اسم المستخدم للدخول (Username) *</label>
                  <input
                    type="text"
                    value={accountFormData.username}
                    onChange={(e) => setAccountFormData({ ...accountFormData, username: e.target.value })}
                    placeholder="pharmacy_center"
                    className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-xs text-white font-mono focus:outline-none focus:border-emerald-500"
                    dir="ltr"
                    required
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-300 mb-1">كلمة المرور (Password) *</label>
                  <input
                    type="text"
                    value={accountFormData.password}
                    onChange={(e) => setAccountFormData({ ...accountFormData, password: e.target.value })}
                    placeholder="••••••••"
                    className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-xs text-white font-mono focus:outline-none focus:border-emerald-500"
                    dir="ltr"
                    required
                  />
                </div>
              </div>

              {/* Phone */}
              <div>
                <label className="block text-xs font-bold text-slate-300 mb-1">رقم الهاتف (اختياري)</label>
                <input
                  type="text"
                  value={accountFormData.phone}
                  onChange={(e) => setAccountFormData({ ...accountFormData, phone: e.target.value })}
                  placeholder="+9639xxxxxxxx"
                  className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3.5 py-2.5 text-xs text-white font-mono focus:outline-none focus:border-emerald-500"
                  dir="ltr"
                />
              </div>

              {/* Blocked Checkbox */}
              <div className="bg-slate-800/60 p-3.5 rounded-2xl border border-slate-700/60">
                <label className="flex items-center justify-between cursor-pointer">
                  <div className="space-y-0.5">
                    <span className="text-xs font-bold text-slate-200 block">حظر هذا الحساب من الدخول:</span>
                    <span className="text-[10px] text-slate-400 block">عند التفعيل، لن يتمكن صاحب الحساب من تسجيل الدخول للنظام</span>
                  </div>
                  <input
                    type="checkbox"
                    checked={accountFormData.isBlocked}
                    onChange={(e) => setAccountFormData({ ...accountFormData, isBlocked: e.target.checked })}
                    className="w-5 h-5 accent-rose-500 rounded cursor-pointer"
                  />
                </label>
              </div>

              {/* Action Buttons */}
              <div className="flex items-center gap-3 pt-2">
                <button
                  type="submit"
                  disabled={saving}
                  className="flex-1 bg-emerald-600 hover:bg-emerald-500 text-white font-black py-3 rounded-xl text-xs transition cursor-pointer flex items-center justify-center gap-2"
                >
                  {saving ? <RefreshCw className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
                  <span>{editingAccount ? 'حفظ التعديلات' : 'إنشاء الحساب الآن'}</span>
                </button>
                <button
                  type="button"
                  onClick={() => setIsAccountModalOpen(false)}
                  className="px-4 py-3 bg-slate-800 hover:bg-slate-700 text-slate-300 font-bold rounded-xl text-xs transition cursor-pointer"
                >
                  إلغاء
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Clear All Data In-App Modal */}
      {isClearAllModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-rose-500/50 rounded-3xl p-6 max-w-md w-full shadow-2xl space-y-4 animate-in fade-in duration-200">
            <div className="w-14 h-14 rounded-2xl bg-rose-600/20 border border-rose-500/40 flex items-center justify-center text-rose-400 mx-auto">
              <Trash2 className="w-7 h-7 text-rose-400" />
            </div>
            <div className="text-center space-y-2">
              <h3 className="text-base font-black text-white">مسح وتصفير كافة البيانات نهائياً؟</h3>
              <p className="text-xs text-slate-300 leading-relaxed font-medium">
                تحذير: سيتم حذف كافة الصيدليات، المشافي، الممرضين، بلاغات المجتمع والتقييمات من قاعدة البيانات السحابية (Firestore) والذاكرة المحلية.
              </p>
              <div className="p-3 bg-rose-950/60 border border-rose-800/80 rounded-xl text-xs text-rose-300 font-black">
                ستصبح جميع العدادات على الصفحة الرئيسية صفر (0) فوراً.
              </div>
            </div>
            <div className="flex items-center gap-3 pt-2">
              <button
                type="button"
                onClick={executeClearAllData}
                disabled={saving}
                className="flex-1 bg-rose-600 hover:bg-rose-500 active:scale-95 text-white font-black py-3 rounded-xl text-xs transition cursor-pointer flex items-center justify-center gap-2 shadow-lg shadow-rose-950/60"
              >
                {saving ? <RefreshCw className="w-4 h-4 animate-spin" /> : <Trash2 className="w-4 h-4" />}
                <span>نعم، امسح كل البيانات وصفر العدادات</span>
              </button>
              <button
                type="button"
                onClick={() => setIsClearAllModalOpen(false)}
                className="px-5 py-3 bg-slate-800 hover:bg-slate-700 text-slate-300 font-bold rounded-xl text-xs transition cursor-pointer"
              >
                إلغاء التراجع
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Restore Defaults In-App Modal */}
      {isRestoreModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-amber-500/50 rounded-3xl p-6 max-w-md w-full shadow-2xl space-y-4 animate-in fade-in duration-200">
            <div className="w-14 h-14 rounded-2xl bg-amber-600/20 border border-amber-500/40 flex items-center justify-center text-amber-400 mx-auto">
              <RotateCcw className="w-7 h-7 text-amber-400" />
            </div>
            <div className="text-center space-y-2">
              <h3 className="text-base font-black text-white">استعادة البيانات الافتراضية؟</h3>
              <p className="text-xs text-slate-300 leading-relaxed font-medium">
                سيتم إعادة تحميل وتغذية الصيدليات والمشافي والمراكز التأسيسية لدير حافر في قاعدة البيانات السحابية.
              </p>
            </div>
            <div className="flex items-center gap-3 pt-2">
              <button
                type="button"
                onClick={executeRestoreDefaults}
                disabled={saving}
                className="flex-1 bg-amber-600 hover:bg-amber-500 active:scale-95 text-white font-black py-3 rounded-xl text-xs transition cursor-pointer flex items-center justify-center gap-2 shadow-lg shadow-amber-950/60"
              >
                {saving ? <RefreshCw className="w-4 h-4 animate-spin" /> : <RotateCcw className="w-4 h-4" />}
                <span>نعم، استعد البيانات الافتراضية</span>
              </button>
              <button
                type="button"
                onClick={() => setIsRestoreModalOpen(false)}
                className="px-5 py-3 bg-slate-800 hover:bg-slate-700 text-slate-300 font-bold rounded-xl text-xs transition cursor-pointer"
              >
                إلغاء
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
};
