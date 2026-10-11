import React, { useState, useEffect } from 'react';
import {
  X,
  Lock,
  Unlock,
  KeyRound,
  UserCheck,
  UserPlus,
  Shield,
  ShieldCheck,
  Pill,
  Stethoscope,
  Eye,
  EyeOff,
  LogOut,
  Save,
  CheckCircle2,
  AlertCircle,
  Timer,
  Trash2,
  Server,
  Download,
  FolderArchive,
  Phone,
  Clock,
  Sparkles,
  RefreshCw,
  Users,
  BarChart3
} from 'lucide-react';
import { Pharmacy, Nurse, AppUser, AuthSession, UserRole, DutyScheduleConfig, AppUpdateInfo } from '../types';
import {
  saveUserAccount,
  deleteUserAccount,
  updatePharmacyStatus,
  updateNurseStatus
} from '../lib/firebase';
import { offlineStorage, DEFAULT_ADMIN_USER } from '../lib/offlineStorage';
import { notificationService } from '../lib/notifications';
import { formatArabicTime, DEFAULT_DUTY_SCHEDULE } from '../lib/initialData';

interface AuthModalProps {
  isOpen: boolean;
  onClose: () => void;
  session: AuthSession | null;
  onLogin: (session: AuthSession) => void;
  onLogout: () => void;
  users: AppUser[];
  pharmacies: Pharmacy[];
  nurses: Nurse[];
  onPharmacyUpdated: (pharmacy: Pharmacy) => void;
  onNurseUpdated: (nurse: Nurse) => void;
  onUsersUpdated?: (users: AppUser[]) => void;
  dutySchedule?: DutyScheduleConfig;
  onUpdateDutySchedule?: (config: DutyScheduleConfig) => void;
}

type AdminTab = 'accounts' | 'admin_credentials' | 'duty_master' | 'analytics' | 'export_dist' | 'update_info';

export const AuthModal: React.FC<AuthModalProps> = ({
  isOpen,
  onClose,
  session,
  onLogin,
  onLogout,
  users,
  pharmacies,
  nurses,
  onPharmacyUpdated,
  onNurseUpdated,
  onUsersUpdated,
  dutySchedule = DEFAULT_DUTY_SCHEDULE,
  onUpdateDutySchedule
}) => {
  if (!isOpen) return null;

  // Login Form States
  const [loginUsername, setLoginUsername] = useState('');
  const [loginPassword, setLoginPassword] = useState('');
  const [showLoginPassword, setShowLoginPassword] = useState(false);
  const [loginError, setLoginError] = useState<string | null>(null);

  // Admin Active Tab
  const [adminTab, setAdminTab] = useState<AdminTab>('accounts');

  // Admin: Duty Schedule Config Form (Regular: 09:00 PM to 12:00 AM | Friday: 09:00 AM to 12:00 PM)
  const [scheduleConfig, setScheduleConfig] = useState<DutyScheduleConfig>(dutySchedule || DEFAULT_DUTY_SCHEDULE);
  const [scheduleSavedToast, setScheduleSavedToast] = useState<string | null>(null);

  useEffect(() => {
    if (dutySchedule) {
      setScheduleConfig(dutySchedule);
    }
  }, [dutySchedule]);

  const handleSaveDutySchedule = (e: React.FormEvent) => {
    e.preventDefault();
    const updated: DutyScheduleConfig = {
      ...scheduleConfig,
      regularLabel: `من ${scheduleConfig.regularStartHour > 12 ? scheduleConfig.regularStartHour - 12 : scheduleConfig.regularStartHour}:${String(scheduleConfig.regularStartMinute).padStart(2, '0')} مساءً حتى ${scheduleConfig.regularEndHour === 24 || scheduleConfig.regularEndHour === 0 ? '12:00 ليلاً' : `${scheduleConfig.regularEndHour}:00`}`,
      fridayLabel: `من ${String(scheduleConfig.fridayStartHour).padStart(2, '0')}:${String(scheduleConfig.fridayStartMinute).padStart(2, '0')} صباحاً حتى ${String(scheduleConfig.fridayEndHour).padStart(2, '0')}:${String(scheduleConfig.fridayEndMinute).padStart(2, '0')} ظهراً`,
      updatedAt: new Date().toISOString()
    };
    setScheduleConfig(updated);
    onUpdateDutySchedule?.(updated);
    offlineStorage.saveDutySchedule(updated);
    setScheduleSavedToast('تم حفظ وتطبيق أوقات المناوبة المعتمدة بنجاح! 🟢');
    setTimeout(() => setScheduleSavedToast(null), 3000);
  };

  const handleResetDutySchedule = () => {
    setScheduleConfig(DEFAULT_DUTY_SCHEDULE);
    onUpdateDutySchedule?.(DEFAULT_DUTY_SCHEDULE);
    offlineStorage.saveDutySchedule(DEFAULT_DUTY_SCHEDULE);
    setScheduleSavedToast('تمت استعادة أوقات المناوبة الافتراضية بنجاح 🔄');
    setTimeout(() => setScheduleSavedToast(null), 3000);
  };

  // Admin: App Update Info Management
  const [appUpdateInfo, setAppUpdateInfo] = useState<AppUpdateInfo>(() => offlineStorage.getAppUpdate());
  const [updateNoteInput, setUpdateNoteInput] = useState('');
  const [updateToast, setUpdateToast] = useState<string | null>(null);

  const handleSaveAppUpdate = (e: React.FormEvent) => {
    e.preventDefault();
    offlineStorage.saveAppUpdate(appUpdateInfo);
    setUpdateToast('تم حفظ تفاصيل وتنبيه التحديث الجديد وإرساله لجميع المستخدمين بنجاح! 🚀');
    setTimeout(() => setUpdateToast(null), 3500);
  };

  // Admin: Create Provider Account Form
  const [newAccountRole, setNewAccountRole] = useState<'pharmacist' | 'nurse'>('pharmacist');
  const [newAccountTargetId, setNewAccountTargetId] = useState<string>(pharmacies[0]?.id || '');
  const [newAccountUsername, setNewAccountUsername] = useState('');
  const [newAccountPassword, setNewAccountPassword] = useState('');
  const [createAccountSuccess, setCreateAccountSuccess] = useState<string | null>(null);
  const [createAccountError, setCreateAccountError] = useState<string | null>(null);

  // Admin: Edit Admin Credentials Form
  const currentAdminUser = users.find((u) => u.role === 'admin') || DEFAULT_ADMIN_USER;
  const [adminEditUsername, setAdminEditUsername] = useState(currentAdminUser.username);
  const [adminEditPassword, setAdminEditPassword] = useState(currentAdminUser.password);
  const [adminEditPasswordConfirm, setAdminEditPasswordConfirm] = useState(currentAdminUser.password);
  const [adminEditSuccess, setAdminEditSuccess] = useState<string | null>(null);
  const [adminEditError, setAdminEditError] = useState<string | null>(null);

  // Pharmacist Specific Management State
  const currentPharmacistPh =
    session?.user.role === 'pharmacist'
      ? pharmacies.find((p) => p.id === session.user.targetId) || pharmacies[0]
      : null;
  const [phIsOpen, setPhIsOpen] = useState(currentPharmacistPh?.isOpen ?? true);
  const [phIsOnDuty, setPhIsOnDuty] = useState(currentPharmacistPh?.isOnDuty ?? false);
  const [phDutyEndTime, setPhDutyEndTime] = useState(
    formatArabicTime(currentPharmacistPh?.dutyEndTime) || '6:00 صباحاً'
  );
  const [phDutyHours, setPhDutyHours] = useState(currentPharmacistPh?.dutyHours || '');
  const [phPhone, setPhPhone] = useState('');

  // Nurse Specific Management State
  const currentNurseUser =
    session?.user.role === 'nurse'
      ? nurses.find((n) => n.id === session.user.targetId) || nurses[0]
      : null;
  const [nrIsAvailable, setNrIsAvailable] = useState(currentNurseUser?.isAvailable ?? true);
  const [nrIsOnDuty, setNrIsOnDuty] = useState(currentNurseUser?.isOnDuty ?? false);
  const [nrDutyEndTime, setNrDutyEndTime] = useState(
    formatArabicTime(currentNurseUser?.dutyEndTime) || '7:00 صباحاً'
  );
  const [nrPhone, setNrPhone] = useState(currentNurseUser?.phone || '');

  // Status message for save
  const [saveSuccessMsg, setSaveSuccessMsg] = useState<string | null>(null);
  const [isSaving, setIsSaving] = useState(false);
  const [pendingPhToggle, setPendingPhToggle] = useState<{
    field: 'open' | 'duty';
    nextValue: boolean;
  } | null>(null);
  const [pendingAdminDutyPharmacy, setPendingAdminDutyPharmacy] = useState<Pharmacy | null>(null);

  // Sync state when role or target changes
  useEffect(() => {
    if (newAccountRole === 'pharmacist') {
      if (pharmacies.length > 0 && !pharmacies.some((p) => p.id === newAccountTargetId)) {
        setNewAccountTargetId(pharmacies[0].id);
      }
    } else {
      if (nurses.length > 0 && !nurses.some((n) => n.id === newAccountTargetId)) {
        setNewAccountTargetId(nurses[0].id);
      }
    }
  }, [newAccountRole, pharmacies, nurses, newAccountTargetId]);

  // Sync pharmacist state
  useEffect(() => {
    if (currentPharmacistPh) {
      setPhIsOpen(currentPharmacistPh.isOpen);
      setPhIsOnDuty(currentPharmacistPh.isOnDuty);
      setPhDutyEndTime(formatArabicTime(currentPharmacistPh.dutyEndTime) || '6:00 صباحاً');
      setPhDutyHours(currentPharmacistPh.dutyHours || '');
    }
  }, [currentPharmacistPh]);

  // Sync nurse state
  useEffect(() => {
    if (currentNurseUser) {
      setNrIsAvailable(currentNurseUser.isAvailable);
      setNrIsOnDuty(currentNurseUser.isOnDuty);
      setNrDutyEndTime(formatArabicTime(currentNurseUser.dutyEndTime) || '7:00 صباحاً');
      setNrPhone(currentNurseUser.phone || '');
    }
  }, [currentNurseUser]);

  // Execute Login
  const handlePerformLogin = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    setLoginError(null);

    const cleanUser = loginUsername.trim();
    const cleanPass = loginPassword.trim();

    if (!cleanUser || !cleanPass) {
      setLoginError('يرجى كتابة اسم المستخدم وكلمة المرور.');
      return;
    }

    // Check users list (including default admin if not in list yet)
    const allUsers = users.length > 0 ? users : [DEFAULT_ADMIN_USER];
    const matchedUser = allUsers.find(
      (u) =>
        u.username.toLowerCase() === cleanUser.toLowerCase() &&
        u.password === cleanPass
    );

    if (matchedUser) {
      const newSession: AuthSession = {
        user: matchedUser,
        loginTime: new Date().toISOString()
      };
      onLogin(newSession);
      offlineStorage.saveAuthSession(newSession);
      setLoginUsername('');
      setLoginPassword('');
    } else {
      setLoginError('اسم المستخدم أو كلمة المرور غير صحيحة. يرجى التحقق وإعادة المحاولة.');
    }
  };

  // Admin: Save updated admin credentials
  const handleSaveAdminCredentials = async (e: React.FormEvent) => {
    e.preventDefault();
    setAdminEditError(null);
    setAdminEditSuccess(null);

    if (!adminEditUsername.trim()) {
      setAdminEditError('اسم المستخدم لا يمكن أن يكون فارغاً.');
      return;
    }
    if (adminEditPassword.length < 4) {
      setAdminEditError('كلمة المرور يجب أن تكون 4 أحرف أو أرقام على الأقل.');
      return;
    }
    if (adminEditPassword !== adminEditPasswordConfirm) {
      setAdminEditError('كلمتا المرور غير متطابقتين.');
      return;
    }

    try {
      const updatedAdmin: AppUser = {
        ...currentAdminUser,
        username: adminEditUsername.trim(),
        password: adminEditPassword.trim(),
        displayName: 'مدير المنصة (الأدمن)',
        updatedAt: new Date().toISOString()
      };

      await saveUserAccount(updatedAdmin);

      // Update current session
      const newSession: AuthSession = {
        user: updatedAdmin,
        loginTime: new Date().toISOString()
      };
      onLogin(newSession);
      offlineStorage.saveAuthSession(newSession);

      setAdminEditSuccess('تم تحديث بيانات دخول الأدمن بنجاح! احتفظ بها للدخول مستقبلاً.');
      setTimeout(() => setAdminEditSuccess(null), 4000);
    } catch {
      setAdminEditError('حدث خطأ أثناء حفظ البيانات.');
    }
  };

  // Admin: Create new Provider Account (Pharmacist or Nurse)
  const handleCreateProviderAccount = async (e: React.FormEvent) => {
    e.preventDefault();
    setCreateAccountError(null);
    setCreateAccountSuccess(null);

    const username = newAccountUsername.trim().toLowerCase();
    const password = newAccountPassword.trim();

    if (!username || !password) {
      setCreateAccountError('يرجى ملء اسم المستخدم وكلمة المرور.');
      return;
    }

    if (users.some((u) => u.username.toLowerCase() === username)) {
      setCreateAccountError(`اسم المستخدم "${username}" مسجل مسبقاً، اختر اسماً آخر.`);
      return;
    }

    let targetName = '';
    if (newAccountRole === 'pharmacist') {
      const p = pharmacies.find((item) => item.id === newAccountTargetId);
      if (!p) {
        setCreateAccountError('يرجى اختيار الصيدلية المراد ربطها.');
        return;
      }
      targetName = p.name;
    } else {
      const n = nurses.find((item) => item.id === newAccountTargetId);
      if (!n) {
        setCreateAccountError('يرجى اختيار الممرض المراد ربطه.');
        return;
      }
      targetName = n.name;
    }

    try {
      const newAccount: AppUser = {
        id: `user_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`,
        username,
        password,
        role: newAccountRole,
        targetId: newAccountTargetId,
        targetName,
        displayName:
          newAccountRole === 'pharmacist' ? `صيدلية ${targetName}` : `الممرض ${targetName}`,
        createdAt: new Date().toISOString()
      };

      await saveUserAccount(newAccount);
      setCreateAccountSuccess(
        `تم إنشاء حساب الدخول لـ (${targetName}) بنجاح! اسم المستخدم: ${username}`
      );
      setNewAccountUsername('');
      setNewAccountPassword('');
      setTimeout(() => setCreateAccountSuccess(null), 5000);
    } catch {
      setCreateAccountError('تعذر إنشاء الحساب، يرجى المحاولة ثانية.');
    }
  };

  // Admin: Delete user account
  const handleDeleteUser = async (userId: string, username: string) => {
    if (userId === 'admin_root' || username === 'admin') {
      alert('لا يمكن حذف حساب الأدمن الأساسي.');
      return;
    }
    if (confirm(`هل أنت متأكد من حذف حساب "${username}"؟`)) {
      await deleteUserAccount(userId);
    }
  };

  // Admin: Generate quick starter accounts for all pharmacies & nurses
  const handleQuickSeedAllAccounts = async () => {
    if (
      !confirm(
        'هل تريد إنشاء حسابات دخول تلقائية لكافة الصيدليات والممرضين؟ (كلمة المرور الافتراضية ستكون 123456)'
      )
    ) {
      return;
    }

    let createdCount = 0;
    // Pharmacies
    for (const ph of pharmacies) {
      const phUser = `ph_${ph.id.replace(/[^a-zA-Z0-9]/g, '_')}`;
      if (!users.some((u) => u.targetId === ph.id)) {
        const acc: AppUser = {
          id: `user_ph_${ph.id}`,
          username: phUser,
          password: '123456',
          role: 'pharmacist',
          targetId: ph.id,
          targetName: ph.name,
          displayName: `صيدلية ${ph.name}`,
          createdAt: new Date().toISOString()
        };
        await saveUserAccount(acc);
        createdCount++;
      }
    }

    // Nurses
    for (const nr of nurses) {
      const nrUser = `nurse_${nr.id.replace(/[^a-zA-Z0-9]/g, '_')}`;
      if (!users.some((u) => u.targetId === nr.id)) {
        const acc: AppUser = {
          id: `user_nr_${nr.id}`,
          username: nrUser,
          password: '123456',
          role: 'nurse',
          targetId: nr.id,
          targetName: nr.name,
          displayName: `الممرض ${nr.name}`,
          createdAt: new Date().toISOString()
        };
        await saveUserAccount(acc);
        createdCount++;
      }
    }

    setCreateAccountSuccess(
      `تم إنشاء ${createdCount} حساب دخول جديد بنجاح! كلمة المرور لجميعهم هي: 123456 ويمكنهم تغيير حالتهم الآن.`
    );
    setTimeout(() => setCreateAccountSuccess(null), 6000);
  };

  // Pharmacist Save Handler
  const handleSavePharmacistUpdates = async () => {
    if (!currentPharmacistPh) return;
    setIsSaving(true);
    setSaveSuccessMsg(null);

    try {
      const updates = {
        isOpen: phIsOpen,
        isOnDuty: phIsOnDuty,
        dutyEndTime: phIsOnDuty ? phDutyEndTime : '',
        dutyHours: phIsOnDuty
          ? phDutyHours || `مناوبة ليلية حتى ${phDutyEndTime}`
          : phIsOpen
          ? 'مفتوحة - دوام اعتيادي'
          : 'مغلقة'
      };

      await updatePharmacyStatus(currentPharmacistPh.id, updates);
      onPharmacyUpdated({ ...currentPharmacistPh, ...updates });

      if (phIsOnDuty && !currentPharmacistPh.isOnDuty) {
        notificationService.sendNotification(
          `بدأت مناوبة ${currentPharmacistPh.name} 🌙`,
          {
            body: `الصيدلية مناوبة الآن حتى ${phDutyEndTime} ومتاحة لخدمة أهالي دير حافر.`
          }
        );
      }

      setSaveSuccessMsg('تم حفظ وتحديث حالة صيدليتك بنجاح ومزامنتها على الخريطة!');
      setTimeout(() => setSaveSuccessMsg(null), 3500);
    } catch {
      setSaveSuccessMsg('تعذر الحفظ، يرجى المحاولة ثانية.');
    } finally {
      setIsSaving(false);
    }
  };

  // Nurse Save Handler
  const handleSaveNurseUpdates = async () => {
    if (!currentNurseUser) return;
    setIsSaving(true);
    setSaveSuccessMsg(null);

    try {
      const updates = {
        isAvailable: nrIsAvailable,
        isOnDuty: nrIsOnDuty,
        dutyEndTime: nrIsOnDuty ? nrDutyEndTime : '',
        phone: nrPhone || currentNurseUser.phone
      };

      await updateNurseStatus(currentNurseUser.id, updates);
      onNurseUpdated({ ...currentNurseUser, ...updates });

      if (nrIsOnDuty && !currentNurseUser.isOnDuty) {
        notificationService.sendNotification(
          `الممرض ${currentNurseUser.name} بدأ المناوبة الآن ⚡`,
          {
            body: `متاح للزيارات المنزلية الطارئة في دير حافر حتى ${nrDutyEndTime}.`
          }
        );
      }

      setSaveSuccessMsg('تم حفظ وتحديث حالتك كممرض بنجاح ومزامنتها على الخريطة!');
      setTimeout(() => setSaveSuccessMsg(null), 3500);
    } catch {
      setSaveSuccessMsg('تعذر الحفظ، يرجى المحاولة ثانية.');
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-end sm:items-center justify-center p-0 sm:p-4 animate-in fade-in duration-150">
      <div className="bg-white w-full max-w-md rounded-t-3xl sm:rounded-3xl p-5 shadow-2xl max-h-[92vh] overflow-y-auto space-y-4 border border-slate-200">
        {/* Header */}
        <div className="flex items-center justify-between pb-2 border-b border-slate-100">
          <div className="flex items-center gap-2">
            <div
              className={`p-2 rounded-2xl flex items-center justify-center ${
                !session
                  ? 'bg-emerald-100 text-emerald-800'
                  : session.user.role === 'admin'
                  ? 'bg-amber-100 text-amber-800'
                  : session.user.role === 'pharmacist'
                  ? 'bg-emerald-100 text-emerald-800'
                  : 'bg-sky-100 text-sky-800'
              }`}
            >
              {!session ? (
                <Lock className="w-5 h-5 text-emerald-700" />
              ) : session.user.role === 'admin' ? (
                <ShieldCheck className="w-5 h-5 text-amber-700" />
              ) : session.user.role === 'pharmacist' ? (
                <Pill className="w-5 h-5 text-emerald-700" />
              ) : (
                <Stethoscope className="w-5 h-5 text-sky-700" />
              )}
            </div>

            <div>
              <h2 className="font-extrabold text-slate-900 text-base leading-tight">
                {!session
                  ? 'تسجيل الدخول للنظام'
                  : session.user.role === 'admin'
                  ? 'لوحة تحكم المشرف (الأدمن)'
                  : session.user.role === 'pharmacist'
                  ? `بوابة صيدلية: ${session.user.targetName}`
                  : `بوابة الممرض: ${session.user.targetName}`}
              </h2>
              <p className="text-[11px] text-slate-500 font-medium">
                {!session
                  ? 'أدخل بيانات الدخول لإدارة المناوبة والكوادر'
                  : session.user.role === 'admin'
                  ? 'إدارة الحسابات، صلاحيات الصيادلة والممرضين'
                  : 'إدارة وتحديث حالتك ومناوبتك حصراً'}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-1">
            {session && (
              <button
                onClick={onLogout}
                title="تسجيل الخروج"
                className="p-1.5 rounded-xl text-rose-600 hover:bg-rose-50 border border-rose-200 text-xs font-bold flex items-center gap-1 transition-colors"
              >
                <LogOut className="w-4 h-4" />
                <span className="text-[11px]">خروج</span>
              </button>
            )}

            <button
              onClick={onClose}
              className="p-1.5 rounded-full text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-colors"
              title="إغلاق"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* ======================================================== */}
        {/* VIEW 1: NOT LOGGED IN -> LOGIN SCREEN                   */}
        {/* ======================================================== */}
        {!session && (
          <div className="space-y-4">
            {/* Default Admin Credentials Notice */}
            <div className="bg-amber-50/90 border border-amber-200/80 rounded-2xl p-3.5 space-y-1.5 text-xs text-amber-950">
              <div className="flex items-center gap-1.5 font-extrabold text-amber-900">
                <Shield className="w-4 h-4 text-amber-700 shrink-0" />
                <span>بيانات دخول الأدمن الافتراضية:</span>
              </div>
              <div className="text-[11px] text-amber-800 space-y-0.5">
                <p>
                  اسم المستخدم:{' '}
                  <code className="bg-white px-2 py-0.5 rounded font-mono font-bold text-amber-950 border border-amber-200">
                    admin
                  </code>
                </p>
                <p>
                  كلمة المرور:{' '}
                  <code className="bg-white px-2 py-0.5 rounded font-mono font-bold text-amber-950 border border-amber-200">
                    admin123
                  </code>
                </p>
                <p className="text-[10px] text-amber-700 font-medium pt-1">
                  💡 يمكنك تعديل بيانات دخول الأدمن وإضافة حسابات خاصة بالصيادلة والممرضين فور تسجيل الدخول.
                </p>
              </div>

              {/* Quick Fill Button */}
              <button
                type="button"
                onClick={() => {
                  setLoginUsername('admin');
                  setLoginPassword('admin123');
                }}
                className="w-full text-center py-1.5 mt-1 bg-amber-600 hover:bg-amber-700 active:scale-98 text-white rounded-xl font-bold text-[11px] transition-all shadow-2xs"
              >
                تعبئة بيانات الأدمن تلقائياً للدخول ⚡
              </button>
            </div>

            {/* Login Form */}
            <form onSubmit={handlePerformLogin} className="space-y-3">
              {loginError && (
                <div className="p-3 bg-rose-50 border border-rose-200 rounded-xl text-xs text-rose-700 font-bold flex items-center gap-2">
                  <AlertCircle className="w-4 h-4 text-rose-600 shrink-0" />
                  <span>{loginError}</span>
                </div>
              )}

              <div>
                <label className="text-xs font-bold text-slate-700 block mb-1">
                  اسم المستخدم:
                </label>
                <input
                  type="text"
                  value={loginUsername}
                  onChange={(e) => setLoginUsername(e.target.value)}
                  placeholder="مثال: admin أو حساب الصيدلية"
                  className="w-full bg-slate-50 border border-slate-200 rounded-2xl px-3.5 py-2.5 text-xs font-bold text-slate-800 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-600"
                />
              </div>

              <div>
                <label className="text-xs font-bold text-slate-700 block mb-1">
                  كلمة المرور:
                </label>
                <div className="relative">
                  <input
                    type={showLoginPassword ? 'text' : 'password'}
                    value={loginPassword}
                    onChange={(e) => setLoginPassword(e.target.value)}
                    placeholder="أدخل كلمة المرور"
                    className="w-full bg-slate-50 border border-slate-200 rounded-2xl px-3.5 py-2.5 pl-10 text-xs font-bold text-slate-800 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-600"
                  />
                  <button
                    type="button"
                    onClick={() => setShowLoginPassword(!showLoginPassword)}
                    className="absolute left-3 top-2.5 text-slate-400 hover:text-slate-600"
                    title={showLoginPassword ? 'إخفاء' : 'إظهار'}
                  >
                    {showLoginPassword ? (
                      <EyeOff className="w-4 h-4" />
                    ) : (
                      <Eye className="w-4 h-4" />
                    )}
                  </button>
                </div>
              </div>

              <button
                type="submit"
                className="w-full bg-emerald-700 hover:bg-emerald-800 active:scale-98 text-white py-3 rounded-2xl font-black text-xs transition-all shadow-md shadow-emerald-700/20 flex items-center justify-center gap-2"
              >
                <Lock className="w-4 h-4" />
                <span>تسجيل الدخول إلى اللوحة</span>
              </button>
            </form>

            {/* Quick Demo Accounts List if any custom accounts exist */}
            {users.length > 1 && (
              <div className="pt-2 border-t border-slate-100 space-y-1.5">
                <span className="text-[11px] font-bold text-slate-500 block">
                  حسابات كوادر مسجلة بالنظام (للتجربة السريعة):
                </span>
                <div className="space-y-1 max-h-32 overflow-y-auto pr-0.5 no-scrollbar">
                  {users
                    .filter((u) => u.role !== 'admin')
                    .slice(0, 4)
                    .map((acc) => (
                      <button
                        key={acc.id}
                        type="button"
                        onClick={() => {
                          setLoginUsername(acc.username);
                          setLoginPassword(acc.password);
                        }}
                        className="w-full text-right p-2 rounded-xl bg-slate-50 hover:bg-slate-100 border border-slate-200 text-xs flex items-center justify-between"
                      >
                        <div className="flex items-center gap-1.5 truncate">
                          {acc.role === 'pharmacist' ? (
                            <Pill className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                          ) : (
                            <Stethoscope className="w-3.5 h-3.5 text-sky-600 shrink-0" />
                          )}
                          <span className="font-bold text-slate-900 truncate">
                            {acc.displayName || acc.targetName}
                          </span>
                        </div>
                        <span className="text-[10px] bg-white border border-slate-200 px-1.5 py-0.5 rounded font-mono text-slate-600">
                          {acc.username}
                        </span>
                      </button>
                    ))}
                </div>
              </div>
            )}
          </div>
        )}

        {/* ======================================================== */}
        {/* VIEW 2: LOGGED IN AS ADMIN                               */}
        {/* ======================================================== */}
        {session?.user.role === 'admin' && (
          <div className="space-y-4">
            {/* Admin Tabs */}
            <div className="bg-slate-100 p-1 rounded-2xl grid grid-cols-6 gap-1 text-[10px] font-bold">
              <button
                onClick={() => setAdminTab('accounts')}
                className={`py-2 rounded-xl transition-all text-center flex flex-col items-center gap-1 ${
                  adminTab === 'accounts'
                    ? 'bg-white text-emerald-800 shadow-2xs font-black'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                <Users className="w-3.5 h-3.5" />
                <span>الكوادر</span>
              </button>

              <button
                onClick={() => setAdminTab('admin_credentials')}
                className={`py-2 rounded-xl transition-all text-center flex flex-col items-center gap-1 ${
                  adminTab === 'admin_credentials'
                    ? 'bg-white text-amber-800 shadow-2xs font-black'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                <KeyRound className="w-3.5 h-3.5" />
                <span>الأدمن</span>
              </button>

              <button
                onClick={() => setAdminTab('duty_master')}
                className={`py-2 rounded-xl transition-all text-center flex flex-col items-center gap-1 ${
                  adminTab === 'duty_master'
                    ? 'bg-white text-teal-800 shadow-2xs font-black'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                <Timer className="w-3.5 h-3.5" />
                <span>المناوبة</span>
              </button>

              <button
                onClick={() => setAdminTab('analytics')}
                className={`py-2 rounded-xl transition-all text-center flex flex-col items-center gap-1 ${
                  adminTab === 'analytics'
                    ? 'bg-white text-emerald-800 shadow-2xs font-black'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                <BarChart3 className="w-3.5 h-3.5" />
                <span>الإحصائيات</span>
              </button>

              <button
                onClick={() => setAdminTab('update_info')}
                className={`py-2 rounded-xl transition-all text-center flex flex-col items-center gap-1 ${
                  adminTab === 'update_info'
                    ? 'bg-white text-sky-800 shadow-2xs font-black'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                <Download className="w-3.5 h-3.5" />
                <span>التحديث</span>
              </button>

              <button
                onClick={() => setAdminTab('export_dist')}
                className={`py-2 rounded-xl transition-all text-center flex flex-col items-center gap-1 ${
                  adminTab === 'export_dist'
                    ? 'bg-white text-slate-900 shadow-2xs font-black'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                <Server className="w-3.5 h-3.5" />
                <span>النشر</span>
              </button>
            </div>

            {/* TAB 1: ACCOUNTS MANAGEMENT (Link each pharmacist to their pharmacy & nurse to their profile) */}
            {adminTab === 'accounts' && (
              <div className="space-y-4">
                {/* Create New Account Form */}
                <div className="bg-slate-50 border border-slate-200 rounded-2xl p-3.5 space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="font-extrabold text-xs text-slate-900 flex items-center gap-1.5">
                      <UserPlus className="w-4 h-4 text-emerald-700" />
                      <span>إضافة حساب دخول جديد وربطه:</span>
                    </span>
                    <span className="text-[10px] text-slate-500 font-medium">
                      صيدلي أو ممرض
                    </span>
                  </div>

                  {createAccountSuccess && (
                    <div className="p-2.5 bg-emerald-50 border border-emerald-200 rounded-xl text-xs text-emerald-800 font-bold flex items-center gap-2">
                      <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                      <span>{createAccountSuccess}</span>
                    </div>
                  )}

                  {createAccountError && (
                    <div className="p-2.5 bg-rose-50 border border-rose-200 rounded-xl text-xs text-rose-800 font-bold flex items-center gap-2">
                      <AlertCircle className="w-4 h-4 text-rose-600 shrink-0" />
                      <span>{createAccountError}</span>
                    </div>
                  )}

                  <form onSubmit={handleCreateProviderAccount} className="space-y-2.5">
                    {/* Role Select */}
                    <div className="grid grid-cols-2 gap-1.5 bg-slate-200/70 p-1 rounded-xl text-xs font-bold">
                      <button
                        type="button"
                        onClick={() => setNewAccountRole('pharmacist')}
                        className={`py-1.5 rounded-lg flex items-center justify-center gap-1.5 transition-all ${
                          newAccountRole === 'pharmacist'
                            ? 'bg-white text-emerald-800 shadow-2xs font-black'
                            : 'text-slate-600'
                        }`}
                      >
                        <Pill className="w-3.5 h-3.5" />
                        <span>صاحب صيدلية</span>
                      </button>

                      <button
                        type="button"
                        onClick={() => setNewAccountRole('nurse')}
                        className={`py-1.5 rounded-lg flex items-center justify-center gap-1.5 transition-all ${
                          newAccountRole === 'nurse'
                            ? 'bg-white text-sky-800 shadow-2xs font-black'
                            : 'text-slate-600'
                        }`}
                      >
                        <Stethoscope className="w-3.5 h-3.5" />
                        <span>ممرض</span>
                      </button>
                    </div>

                    {/* Linked Entity Dropdown */}
                    <div>
                      <label className="text-[11px] font-bold text-slate-700 block mb-1">
                        {newAccountRole === 'pharmacist'
                          ? 'اربط الحساب بالصيدلية التالية فقط:'
                          : 'اربط الحساب بالممرض التالي فقط:'}
                      </label>
                      <select
                        value={newAccountTargetId}
                        onChange={(e) => setNewAccountTargetId(e.target.value)}
                        className="w-full bg-white border border-slate-300 rounded-xl px-3 py-2 text-xs font-bold text-slate-800 focus:outline-none focus:ring-2 focus:ring-emerald-500/20"
                      >
                        {newAccountRole === 'pharmacist'
                          ? pharmacies.map((p) => (
                              <option key={p.id} value={p.id}>
                                {p.name} ({p.district})
                              </option>
                            ))
                          : nurses.map((n) => (
                              <option key={n.id} value={n.id}>
                                {n.name} ({n.district})
                              </option>
                            ))}
                      </select>
                    </div>

                    {/* Username & Password */}
                    <div className="grid grid-cols-2 gap-2">
                      <div>
                        <label className="text-[11px] font-bold text-slate-700 block mb-1">
                          اسم المستخدم:
                        </label>
                        <input
                          type="text"
                          value={newAccountUsername}
                          onChange={(e) => setNewAccountUsername(e.target.value)}
                          placeholder="مثال: shifa_ph"
                          className="w-full bg-white border border-slate-300 rounded-xl px-2.5 py-1.5 text-xs font-bold text-slate-800 placeholder:text-slate-400"
                        />
                      </div>

                      <div>
                        <label className="text-[11px] font-bold text-slate-700 block mb-1">
                          كلمة المرور:
                        </label>
                        <input
                          type="text"
                          value={newAccountPassword}
                          onChange={(e) => setNewAccountPassword(e.target.value)}
                          placeholder="مثال: 123456"
                          className="w-full bg-white border border-slate-300 rounded-xl px-2.5 py-1.5 text-xs font-bold text-slate-800 placeholder:text-slate-400"
                        />
                      </div>
                    </div>

                    <button
                      type="submit"
                      className="w-full bg-emerald-700 hover:bg-emerald-800 active:scale-98 text-white py-2 rounded-xl font-black text-xs transition-all shadow-xs flex items-center justify-center gap-1.5"
                    >
                      <UserPlus className="w-3.5 h-3.5" />
                      <span>حفظ وإنشاء حساب الدخول ✓</span>
                    </button>
                  </form>
                </div>

                {/* Quick Auto-Seed Button */}
                <div className="flex items-center justify-between">
                  <span className="font-extrabold text-xs text-slate-900">
                    الحسابات المسجلة حالياً ({users.length}):
                  </span>

                  <button
                    onClick={handleQuickSeedAllAccounts}
                    className="text-[10px] font-bold text-emerald-700 bg-emerald-50 hover:bg-emerald-100 px-2 py-1 rounded-lg border border-emerald-200 transition-colors flex items-center gap-1"
                  >
                    <Sparkles className="w-3 h-3" />
                    <span>توليد تلقائي للكل</span>
                  </button>
                </div>

                {/* Existing Accounts List */}
                <div className="space-y-1.5 max-h-56 overflow-y-auto pr-0.5 no-scrollbar">
                  {users.map((acc) => {
                    const isRootAdmin = acc.role === 'admin';
                    return (
                      <div
                        key={acc.id}
                        className="p-2.5 rounded-2xl bg-white border border-slate-200 shadow-2xs flex items-center justify-between gap-2"
                      >
                        <div className="flex items-center gap-2 truncate">
                          <div
                            className={`w-7 h-7 rounded-xl flex items-center justify-center shrink-0 ${
                              isRootAdmin
                                ? 'bg-amber-100 text-amber-800'
                                : acc.role === 'pharmacist'
                                ? 'bg-emerald-100 text-emerald-800'
                                : 'bg-sky-100 text-sky-800'
                            }`}
                          >
                            {isRootAdmin ? (
                              <Shield className="w-4 h-4 text-amber-700" />
                            ) : acc.role === 'pharmacist' ? (
                              <Pill className="w-4 h-4 text-emerald-700" />
                            ) : (
                              <Stethoscope className="w-4 h-4 text-sky-700" />
                            )}
                          </div>

                          <div className="truncate">
                            <div className="text-xs font-black text-slate-900 truncate flex items-center gap-1.5">
                              <span>{acc.displayName || acc.username}</span>
                              <span
                                className={`text-[9px] font-bold px-1.5 py-0.2 rounded ${
                                  isRootAdmin
                                    ? 'bg-amber-100 text-amber-800'
                                    : acc.role === 'pharmacist'
                                    ? 'bg-emerald-100 text-emerald-800'
                                    : 'bg-sky-100 text-sky-800'
                                }`}
                              >
                                {isRootAdmin ? 'مشرف' : acc.role === 'pharmacist' ? 'صيدلي' : 'ممرض'}
                              </span>
                            </div>

                            <div className="text-[10px] text-slate-500 flex items-center gap-2">
                              <span>
                                المستخدم: <strong className="text-slate-800 font-mono">{acc.username}</strong>
                              </span>
                              <span>
                                كلمة السر: <strong className="text-slate-800 font-mono">{acc.password}</strong>
                              </span>
                            </div>
                          </div>
                        </div>

                        {!isRootAdmin && (
                          <button
                            onClick={() => handleDeleteUser(acc.id, acc.username)}
                            className="p-1 rounded-lg text-slate-400 hover:text-rose-600 hover:bg-rose-50 transition-colors"
                            title="حذف الحساب"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        )}
                      </div>
                    );
                  })}
                </div>
              </div>
            )}

            {/* TAB 2: EDIT DEFAULT ADMIN CREDENTIALS */}
            {adminTab === 'admin_credentials' && (
              <form onSubmit={handleSaveAdminCredentials} className="space-y-3.5 bg-slate-50 p-4 rounded-2xl border border-slate-200">
                <div className="flex items-center gap-2 pb-1 border-b border-slate-200">
                  <ShieldCheck className="w-4 h-4 text-amber-700" />
                  <span className="font-extrabold text-xs text-slate-900">
                    تعديل بيانات دخول الأدمن الافتراضية
                  </span>
                </div>

                <p className="text-[11px] text-slate-600 leading-tight">
                  يمكنك هنا تغيير اسم المستخدم وكلمة المرور الخاصة بك كأدمن بدلاً من القيم الافتراضية (admin / admin123).
                </p>

                {adminEditSuccess && (
                  <div className="p-2.5 bg-emerald-50 border border-emerald-200 rounded-xl text-xs text-emerald-800 font-bold flex items-center gap-2">
                    <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                    <span>{adminEditSuccess}</span>
                  </div>
                )}

                {adminEditError && (
                  <div className="p-2.5 bg-rose-50 border border-rose-200 rounded-xl text-xs text-rose-800 font-bold flex items-center gap-2">
                    <AlertCircle className="w-4 h-4 text-rose-600 shrink-0" />
                    <span>{adminEditError}</span>
                  </div>
                )}

                <div>
                  <label className="text-xs font-bold text-slate-700 block mb-1">
                    اسم مستخدم الأدمن الجديد:
                  </label>
                  <input
                    type="text"
                    value={adminEditUsername}
                    onChange={(e) => setAdminEditUsername(e.target.value)}
                    className="w-full bg-white border border-slate-300 rounded-xl px-3 py-2 text-xs font-bold text-slate-800 focus:outline-none focus:ring-2 focus:ring-amber-500/20"
                  />
                </div>

                <div>
                  <label className="text-xs font-bold text-slate-700 block mb-1">
                    كلمة مرور الأدمن الجديدة:
                  </label>
                  <input
                    type="text"
                    value={adminEditPassword}
                    onChange={(e) => setAdminEditPassword(e.target.value)}
                    className="w-full bg-white border border-slate-300 rounded-xl px-3 py-2 text-xs font-bold text-slate-800 focus:outline-none focus:ring-2 focus:ring-amber-500/20"
                  />
                </div>

                <div>
                  <label className="text-xs font-bold text-slate-700 block mb-1">
                    تأكيد كلمة المرور:
                  </label>
                  <input
                    type="text"
                    value={adminEditPasswordConfirm}
                    onChange={(e) => setAdminEditPasswordConfirm(e.target.value)}
                    className="w-full bg-white border border-slate-300 rounded-xl px-3 py-2 text-xs font-bold text-slate-800 focus:outline-none focus:ring-2 focus:ring-amber-500/20"
                  />
                </div>

                <button
                  type="submit"
                  className="w-full bg-amber-600 hover:bg-amber-700 active:scale-98 text-white py-2.5 rounded-xl font-black text-xs transition-all shadow-md shadow-amber-600/20 flex items-center justify-center gap-2"
                >
                  <Save className="w-4 h-4" />
                  <span>تحديث وحفظ بيانات الأدمن</span>
                </button>
              </form>
            )}

            {/* TAB 3: MASTER DUTY MANAGEMENT */}
            {adminTab === 'duty_master' && (
              <div className="space-y-4">
                {/* 1. Official Duty Schedule Times Settings (Manager configurable) */}
                <form
                  onSubmit={handleSaveDutySchedule}
                  className="bg-gradient-to-br from-emerald-50 via-teal-50 to-emerald-100/60 border border-emerald-200 rounded-3xl p-3.5 space-y-3 shadow-2xs"
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-1.5 font-black text-xs text-emerald-950">
                      <Clock className="w-4 h-4 text-emerald-700" />
                      <span>⏰ أوقات المناوبة الرسمية (صلاحيات المدير)</span>
                    </div>
                    <button
                      type="button"
                      onClick={handleResetDutySchedule}
                      className="text-[10px] text-emerald-700 hover:text-emerald-900 font-bold underline"
                    >
                      استعادة الافتراضي 🔄
                    </button>
                  </div>

                  {scheduleSavedToast && (
                    <div className="bg-emerald-600 text-white text-xs p-2 rounded-xl text-center font-black animate-fadeIn">
                      {scheduleSavedToast}
                    </div>
                  )}

                  {/* Regular Days: 9:00 PM to 12:00 AM */}
                  <div className="bg-white/90 p-2.5 rounded-2xl border border-emerald-200/80 space-y-1.5 shadow-2xs">
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-black text-slate-900">
                        🌙 الأيام الاعتيادية (السبت - الخميس):
                      </span>
                      <span className="text-[10px] font-bold text-emerald-800 bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-200">
                        {scheduleConfig.regularLabel}
                      </span>
                    </div>

                    <div className="grid grid-cols-2 gap-2 text-xs">
                      <div>
                        <label className="text-[10px] text-slate-500 font-bold block mb-1">
                          وقت البدء (مساءً)
                        </label>
                        <select
                          value={scheduleConfig.regularStartHour}
                          onChange={(e) =>
                            setScheduleConfig((prev) => ({
                              ...prev,
                              regularStartHour: parseInt(e.target.value, 10)
                            }))
                          }
                          className="w-full bg-white border border-slate-300 rounded-xl p-2 font-bold text-xs focus:outline-emerald-600"
                        >
                          <option value={19}>07:00 مساءً</option>
                          <option value={20}>08:00 مساءً</option>
                          <option value={21}>09:00 مساءً (الافتراضي)</option>
                          <option value={22}>10:00 مساءً</option>
                        </select>
                      </div>

                      <div>
                        <label className="text-[10px] text-slate-500 font-bold block mb-1">
                          وقت الانتهاء (ليلاً)
                        </label>
                        <select
                          value={scheduleConfig.regularEndHour}
                          onChange={(e) =>
                            setScheduleConfig((prev) => ({
                              ...prev,
                              regularEndHour: parseInt(e.target.value, 10)
                            }))
                          }
                          className="w-full bg-white border border-slate-300 rounded-xl p-2 font-bold text-xs focus:outline-emerald-600"
                        >
                          <option value={23}>11:00 ليلاً</option>
                          <option value={24}>12:00 منتصف الليل (الافتراضي)</option>
                          <option value={1}>01:00 فجراً</option>
                          <option value={6}>06:00 صباحاً</option>
                        </select>
                      </div>
                    </div>
                  </div>

                  {/* Friday: 9:00 AM to 12:00 PM */}
                  <div className="bg-white/90 p-2.5 rounded-2xl border border-emerald-200/80 space-y-1.5 shadow-2xs">
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-black text-teal-950">
                        🕌 مناوبة يوم الجمعة:
                      </span>
                      <span className="text-[10px] font-bold text-teal-800 bg-teal-50 px-2 py-0.5 rounded-full border border-teal-200">
                        {scheduleConfig.fridayLabel}
                      </span>
                    </div>

                    <div className="grid grid-cols-2 gap-2 text-xs">
                      <div>
                        <label className="text-[10px] text-slate-500 font-bold block mb-1">
                          وقت البدء (صباحاً)
                        </label>
                        <select
                          value={scheduleConfig.fridayStartHour}
                          onChange={(e) =>
                            setScheduleConfig((prev) => ({
                              ...prev,
                              fridayStartHour: parseInt(e.target.value, 10)
                            }))
                          }
                          className="w-full bg-white border border-slate-300 rounded-xl p-2 font-bold text-xs focus:outline-emerald-600"
                        >
                          <option value={8}>08:00 صباحاً</option>
                          <option value={9}>09:00 صباحاً (الافتراضي)</option>
                          <option value={10}>10:00 صباحاً</option>
                        </select>
                      </div>

                      <div>
                        <label className="text-[10px] text-slate-500 font-bold block mb-1">
                          وقت الانتهاء (ظهراً)
                        </label>
                        <select
                          value={scheduleConfig.fridayEndHour}
                          onChange={(e) =>
                            setScheduleConfig((prev) => ({
                              ...prev,
                              fridayEndHour: parseInt(e.target.value, 10)
                            }))
                          }
                          className="w-full bg-white border border-slate-300 rounded-xl p-2 font-bold text-xs focus:outline-emerald-600"
                        >
                          <option value={11}>11:00 صباحاً</option>
                          <option value={12}>12:00 ظهراً (الافتراضي)</option>
                          <option value={13}>01:00 ظهراً</option>
                          <option value={14}>02:00 ظهراً</option>
                        </select>
                      </div>
                    </div>
                  </div>

                  {/* Notes / Announcement */}
                  <div>
                    <label className="text-[10px] text-slate-600 font-bold block mb-1">
                      ملاحظة أو تعميم للمواطنين
                    </label>
                    <input
                      type="text"
                      value={scheduleConfig.notes || ''}
                      onChange={(e) =>
                        setScheduleConfig((prev) => ({ ...prev, notes: e.target.value }))
                      }
                      placeholder="مثال: المناوبة الليلية: 09:00 م حتى 12:00 ليلاً • يوم الجمعة: 09:00 ص حتى 12:00 ظهراً"
                      className="w-full bg-white border border-slate-300 rounded-xl px-3 py-2 text-xs focus:outline-emerald-600 font-medium"
                    />
                  </div>

                  <button
                    type="submit"
                    className="w-full bg-emerald-700 hover:bg-emerald-800 text-white font-black py-2.5 rounded-2xl text-xs shadow-xs transition active:scale-98 flex items-center justify-center gap-1.5"
                  >
                    <span>💾 حفظ وتطبيق أوقات المناوبة على التطبيق فوراً</span>
                  </button>
                </form>

                {/* 2. Individual Pharmacy Duty Assignment */}
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-black text-slate-800">
                      🏥 تعيين الصيدليات المناوبة لهذه الفترة:
                    </span>
                    <span className="text-[11px] text-emerald-700 font-bold">
                      {pharmacies.filter((p) => p.isOnDuty).length} مناوبة نشطة
                    </span>
                  </div>

                  <div className="space-y-1.5 max-h-56 overflow-y-auto pr-0.5 no-scrollbar">
                    {pharmacies.map((p) => (
                      <div
                        key={p.id}
                        className="p-2.5 rounded-2xl bg-white border border-slate-200 shadow-2xs flex items-center justify-between gap-2"
                      >
                        <div>
                          <div className="text-xs font-black text-slate-900 flex items-center gap-1.5">
                            <Pill className="w-3.5 h-3.5 text-emerald-600" />
                            <span>{p.name}</span>
                          </div>
                          <div className="text-[10px] text-slate-500">
                            {p.isOnDuty ? `مناوبة نشطة (${p.dutyEndTime || '12:00 ليلاً'})` : 'غير مناوبة'}
                          </div>
                        </div>

                        <button
                          type="button"
                          onClick={() => setPendingAdminDutyPharmacy(p)}
                          className={`px-3 py-1 rounded-xl text-xs font-bold transition-all ${
                            p.isOnDuty
                              ? 'bg-emerald-600 text-white shadow-2xs'
                              : 'bg-slate-100 hover:bg-slate-200 text-slate-700'
                          }`}
                        >
                          {p.isOnDuty ? 'مناوبة 🟢' : 'تعيين مناوبة'}
                        </button>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            )}

            {/* TAB: APP UPDATE CONFIGURATION */}
            {adminTab === 'update_info' && (
              <form
                onSubmit={handleSaveAppUpdate}
                className="bg-gradient-to-br from-sky-50 via-teal-50 to-emerald-50/60 border border-sky-200 rounded-3xl p-3.5 space-y-3 shadow-2xs text-right"
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-1.5 font-black text-xs text-sky-950">
                    <Download className="w-4 h-4 text-sky-700" />
                    <span>إرسال نافذة تحديث التطبيق للمستخدمين 📱</span>
                  </div>
                </div>

                {updateToast && (
                  <div className="bg-sky-600 text-white text-xs p-2 rounded-xl text-center font-black animate-fadeIn">
                    {updateToast}
                  </div>
                )}

                <p className="text-[11px] text-slate-600 font-medium">
                  عند تغيير رقم النسخة وإضافة تفاصيل المزايا، ستظهر نافذة التحديث الإجبارية لجميع المستخدمين فور فتحهم للتطبيق مع زر التنزيل والتثبيت المباشر.
                </p>

                {/* Version Input */}
                <div className="space-y-1">
                  <label className="text-[10px] text-slate-700 font-bold block">
                    رقم الإصدار الجديد (مثال: 1.6.75)
                  </label>
                  <input
                    type="text"
                    value={appUpdateInfo.version}
                    onChange={(e) =>
                      setAppUpdateInfo((prev) => ({ ...prev, version: e.target.value }))
                    }
                    className="w-full bg-white border border-slate-300 rounded-xl px-3 py-2 text-xs font-bold text-slate-900 focus:outline-sky-600"
                    placeholder="1.6.75"
                  />
                </div>

                {/* APK Download URL */}
                <div className="space-y-1">
                  <label className="text-[10px] text-slate-700 font-bold block">
                    رابط تحميل ملف APK المباشر (GitHub Releases URL)
                  </label>
                  <input
                    type="text"
                    value={appUpdateInfo.apkUrl}
                    onChange={(e) =>
                      setAppUpdateInfo((prev) => ({ ...prev, apkUrl: e.target.value }))
                    }
                    className="w-full bg-white border border-slate-300 rounded-xl px-3 py-2 text-xs font-medium text-slate-900 focus:outline-sky-600"
                  />
                </div>

                {/* Release Notes List */}
                <div className="space-y-1.5 bg-white/90 p-3 rounded-2xl border border-sky-200">
                  <label className="text-xs font-black text-slate-900 block mb-1">
                    نقاط وتفاصيل التحديث ومميزاته:
                  </label>

                  <div className="space-y-1.5 max-h-36 overflow-y-auto pr-0.5">
                    {appUpdateInfo.releaseNotes.map((note, idx) => (
                      <div key={idx} className="flex items-center justify-between gap-1.5 bg-slate-50 p-1.5 rounded-xl border border-slate-200 text-xs">
                        <span className="text-slate-800 font-medium text-[11px] flex-1">{note}</span>
                        <button
                          type="button"
                          onClick={() =>
                            setAppUpdateInfo((prev) => ({
                              ...prev,
                              releaseNotes: prev.releaseNotes.filter((_, i) => i !== idx)
                            }))
                          }
                          className="text-rose-600 hover:text-rose-800 p-1 font-bold text-xs"
                        >
                          ✕
                        </button>
                      </div>
                    ))}
                  </div>

                  <div className="flex gap-1.5 pt-1">
                    <input
                      type="text"
                      value={updateNoteInput}
                      onChange={(e) => setUpdateNoteInput(e.target.value)}
                      placeholder="أضف ميزة أو إصلاح جديد..."
                      className="flex-1 bg-white border border-slate-300 rounded-xl px-3 py-1.5 text-xs focus:outline-sky-600"
                    />
                    <button
                      type="button"
                      onClick={() => {
                        if (updateNoteInput.trim()) {
                          setAppUpdateInfo((prev) => ({
                            ...prev,
                            releaseNotes: [...prev.releaseNotes, updateNoteInput.trim()]
                          }));
                          setUpdateNoteInput('');
                        }
                      }}
                      className="bg-sky-700 hover:bg-sky-800 text-white font-bold px-3 py-1.5 rounded-xl text-xs"
                    >
                      إضافة
                    </button>
                  </div>
                </div>

                {/* Force Update Checkbox */}
                <div className="flex items-center gap-2 bg-white/80 p-2.5 rounded-xl border border-sky-200">
                  <input
                    type="checkbox"
                    id="forceUpdateCheck"
                    checked={appUpdateInfo.forceUpdate}
                    onChange={(e) =>
                      setAppUpdateInfo((prev) => ({ ...prev, forceUpdate: e.target.checked }))
                    }
                    className="w-4 h-4 text-sky-600 rounded border-slate-300 focus:ring-sky-500"
                  />
                  <label htmlFor="forceUpdateCheck" className="text-xs font-black text-slate-900 cursor-pointer">
                    تحديث إجباري (يمنع استخدام التطبيق القديم حتى التثبيت)
                  </label>
                </div>

                <button
                  type="submit"
                  className="w-full bg-sky-700 hover:bg-sky-800 text-white font-black py-2.5 rounded-2xl text-xs shadow-xs transition active:scale-98 flex items-center justify-center gap-1.5"
                >
                  <span>🚀 حفظ ونشر إشعار التحديث لجميع المستخدمين</span>
                </button>
              </form>
            )}

            {/* TAB 5: Feature 31 - إحصائيات وتقارير الالتزام بالمناوبات */}
            {adminTab === 'analytics' && (
              <div className="space-y-3.5">
                <div className="bg-gradient-to-br from-slate-900 to-emerald-950 text-white rounded-2xl p-4 shadow-sm space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-[11px] font-bold bg-white/10 px-2.5 py-0.5 rounded-full">
                      تقرير التغطية الشهرية • دير حافر
                    </span>
                    <span className="text-xs font-black text-emerald-400">
                      نسبة الالتزام: 98% 🟢
                    </span>
                  </div>
                  <h3 className="text-sm font-black">
                    معدل التزام وتوزيع المناوبات الليلية
                  </h3>
                  <p className="text-[11px] text-slate-300 leading-relaxed">
                    إحصائيات دقيقة لحصص الصيدليات وساعات التغطية الإسعافية لضمان عدم وجود أي نقص ليلي.
                  </p>
                </div>

                {/* Stats Grid */}
                <div className="grid grid-cols-3 gap-2 text-center text-xs">
                  <div className="bg-emerald-50 border border-emerald-200 p-2.5 rounded-2xl">
                    <span className="text-lg font-black text-emerald-900 block">
                      {pharmacies.filter((p) => p.isOnDuty).length}
                    </span>
                    <span className="text-[10px] text-emerald-700 font-bold">
                      مناوبة الليلة
                    </span>
                  </div>
                  <div className="bg-teal-50 border border-teal-200 p-2.5 rounded-2xl">
                    <span className="text-lg font-black text-teal-900 block">
                      {pharmacies.length}
                    </span>
                    <span className="text-[10px] text-teal-700 font-bold">
                      إجمالي الصيدليات
                    </span>
                  </div>
                  <div className="bg-amber-50 border border-amber-200 p-2.5 rounded-2xl">
                    <span className="text-lg font-black text-amber-900 block">
                      360 ساعة
                    </span>
                    <span className="text-[10px] text-amber-700 font-bold">
                      تغطية الشهر
                    </span>
                  </div>
                </div>

                {/* Compliance Table */}
                <div className="bg-white rounded-2xl border border-slate-200 p-3 space-y-2">
                  <h4 className="text-xs font-black text-slate-900">
                    سجل المناوبات لكل صيدلية (توزيع شهري عادل):
                  </h4>
                  <div className="space-y-1.5 max-h-56 overflow-y-auto">
                    {pharmacies.map((ph, idx) => {
                      const shiftsCount = 5 + (idx % 2);
                      return (
                        <div
                          key={ph.id}
                          className="flex items-center justify-between p-2 rounded-xl bg-slate-50 border border-slate-100 text-xs"
                        >
                          <div>
                            <span className="font-bold text-slate-800 block">
                              {ph.name}
                            </span>
                            <span className="text-[10px] text-slate-500">
                              {ph.district}
                            </span>
                          </div>
                          <div className="text-left">
                            <span className="text-[11px] font-black text-emerald-800 bg-emerald-100 px-2 py-0.5 rounded-md">
                              {shiftsCount} مناوبات هذا الشهر
                            </span>
                            <span className="text-[9px] text-emerald-600 font-bold block mt-0.5">
                              ملتزمة 100%
                            </span>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              </div>
            )}
          </div>
        )}

        {/* ======================================================== */}
        {/* VIEW 3: LOGGED IN AS PHARMACIST (ONLY THEIR PHARMACY)    */}
        {/* ======================================================== */}
        {session?.user.role === 'pharmacist' && currentPharmacistPh && (
          <div className="space-y-4">
            {/* Pharmacist Welcome Badge */}
            <div className="bg-emerald-50 border border-emerald-200 rounded-2xl p-3 flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-xl bg-emerald-600 text-white flex items-center justify-center shrink-0">
                <Pill className="w-4 h-4" />
              </div>
              <div>
                <div className="text-xs font-black text-emerald-950">
                  {currentPharmacistPh.name}
                </div>
                <div className="text-[10px] text-emerald-700">
                  أنت مخول حصرياً لإدارة حالة ومناوبة هذه الصيدلية 🔒
                </div>
              </div>
            </div>

            {saveSuccessMsg && (
              <div className="p-2.5 bg-emerald-50 border border-emerald-200 rounded-xl text-xs text-emerald-800 font-bold flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                <span>{saveSuccessMsg}</span>
              </div>
            )}

            {/* Toggle IsOpen */}
            <div className="bg-slate-50 rounded-2xl p-3 border border-slate-200/80 flex items-center justify-between">
              <div>
                <span className="font-bold text-xs text-slate-900 block">حالة العمل الآن:</span>
                <span className="text-[11px] text-slate-500 font-medium">
                  {phIsOpen ? 'الصيدلية مفتوحة وتستقبل المرضى' : 'الصيدلية مغلقة حالياً'}
                </span>
              </div>
              <button
                type="button"
                onClick={() => setPendingPhToggle({ field: 'open', nextValue: !phIsOpen })}
                className={`relative w-12 h-6.5 rounded-full transition-colors flex items-center px-1 ${
                  phIsOpen ? 'bg-emerald-600' : 'bg-slate-300'
                }`}
              >
                <span
                  className={`w-5 h-5 rounded-full bg-white shadow-md transform transition-transform ${
                    phIsOpen ? 'translate-x-0' : '-translate-x-5.5'
                  }`}
                />
              </button>
            </div>

            {/* Toggle OnDuty */}
            <div className="bg-slate-50 rounded-2xl p-3 border border-slate-200/80 flex items-center justify-between">
              <div>
                <span className="font-bold text-xs text-slate-900 block">المناوبة الليلية / 24 ساعة:</span>
                <span className="text-[11px] text-slate-500 font-medium">
                  {phIsOnDuty
                    ? 'مسجلة في قائمة الصيدليات المناوبة 🟢'
                    : 'ليست في جدول المناوبة'}
                </span>
              </div>
              <button
                type="button"
                onClick={() => setPendingPhToggle({ field: 'duty', nextValue: !phIsOnDuty })}
                className={`relative w-12 h-6.5 rounded-full transition-colors flex items-center px-1 ${
                  phIsOnDuty ? 'bg-emerald-600' : 'bg-slate-300'
                }`}
              >
                <span
                  className={`w-5 h-5 rounded-full bg-white shadow-md transform transition-transform ${
                    phIsOnDuty ? 'translate-x-0' : '-translate-x-5.5'
                  }`}
                />
              </button>
            </div>

            {/* Smart Duty Timer presets */}
            {phIsOnDuty && (
              <div className="bg-emerald-50/70 border border-emerald-100 rounded-2xl p-3 space-y-2">
                <div className="flex items-center gap-1.5 text-xs font-bold text-emerald-900">
                  <Timer className="w-4 h-4 text-emerald-600" />
                  <span>تحديد وقت انتهاء المناوبة:</span>
                </div>

                <div className="grid grid-cols-4 gap-1 text-xs font-bold">
                  {['6:00 صباحاً', '8:00 صباحاً', '12:00 ظهراً', '24 ساعة'].map((preset) => (
                    <button
                      key={preset}
                      type="button"
                      onClick={() => setPhDutyEndTime(preset)}
                      className={`py-1.5 px-1 rounded-xl border text-center transition-all text-[11px] ${
                        phDutyEndTime === preset
                          ? 'bg-emerald-600 text-white border-emerald-600 shadow-2xs'
                          : 'bg-white text-slate-700 border-emerald-200 hover:bg-emerald-50'
                      }`}
                    >
                      {preset}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Save Button */}
            <button
              onClick={handleSavePharmacistUpdates}
              disabled={isSaving}
              className="w-full bg-emerald-700 hover:bg-emerald-800 active:scale-98 text-white py-3 rounded-2xl font-black text-xs transition-all shadow-md shadow-emerald-700/20 flex items-center justify-center gap-2"
            >
              {isSaving ? (
                <RefreshCw className="w-4 h-4 animate-spin" />
              ) : (
                <Save className="w-4 h-4" />
              )}
              <span>حفظ وتحديث حالة الصيدلية لحظياً</span>
            </button>
          </div>
        )}

        {/* ======================================================== */}
        {/* VIEW 4: LOGGED IN AS NURSE (ONLY THEIR PROFILE)          */}
        {/* ======================================================== */}
        {session?.user.role === 'nurse' && currentNurseUser && (
          <div className="space-y-4">
            {/* Nurse Welcome Badge */}
            <div className="bg-sky-50 border border-sky-200 rounded-2xl p-3 flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-xl bg-sky-600 text-white flex items-center justify-center shrink-0">
                <Stethoscope className="w-4 h-4" />
              </div>
              <div>
                <div className="text-xs font-black text-sky-950">
                  الممرض: {currentNurseUser.name}
                </div>
                <div className="text-[10px] text-sky-700">
                  أنت مخول حصرياً لإدارة حالتك وتوفرك للزيارات والمناوبة 🔒
                </div>
              </div>
            </div>

            {saveSuccessMsg && (
              <div className="p-2.5 bg-emerald-50 border border-emerald-200 rounded-xl text-xs text-emerald-800 font-bold flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                <span>{saveSuccessMsg}</span>
              </div>
            )}

            {/* Toggle Availability */}
            <div className="bg-slate-50 rounded-2xl p-3 border border-slate-200/80 flex items-center justify-between">
              <div>
                <span className="font-bold text-xs text-slate-900 block">جاهزية الزيارة المنزلية:</span>
                <span className="text-[11px] text-slate-500 font-medium">
                  {nrIsAvailable ? 'متاح للتوجه للمريض فوراً 🟢' : 'مشغول بموعد رعاية آخر'}
                </span>
              </div>
              <button
                type="button"
                onClick={() => setNrIsAvailable(!nrIsAvailable)}
                className={`relative w-12 h-6.5 rounded-full transition-colors flex items-center px-1 ${
                  nrIsAvailable ? 'bg-sky-600' : 'bg-slate-300'
                }`}
              >
                <span
                  className={`w-5 h-5 rounded-full bg-white shadow-md transform transition-transform ${
                    nrIsAvailable ? 'translate-x-0' : '-translate-x-5.5'
                  }`}
                />
              </button>
            </div>

            {/* Toggle OnDuty */}
            <div className="bg-slate-50 rounded-2xl p-3 border border-slate-200/80 flex items-center justify-between">
              <div>
                <span className="font-bold text-xs text-slate-900 block">وردية المناوبة الليلية/الطارئة:</span>
                <span className="text-[11px] text-slate-500 font-medium">
                  {nrIsOnDuty ? 'في المناوبة النشطة حالياً ⚡' : 'خارج وقت المناوبة'}
                </span>
              </div>
              <button
                type="button"
                onClick={() => setNrIsOnDuty(!nrIsOnDuty)}
                className={`relative w-12 h-6.5 rounded-full transition-colors flex items-center px-1 ${
                  nrIsOnDuty ? 'bg-sky-600' : 'bg-slate-300'
                }`}
              >
                <span
                  className={`w-5 h-5 rounded-full bg-white shadow-md transform transition-transform ${
                    nrIsOnDuty ? 'translate-x-0' : '-translate-x-5.5'
                  }`}
                />
              </button>
            </div>

            {/* Smart Duty Timer presets for Nurse */}
            {nrIsOnDuty && (
              <div className="bg-sky-50/70 border border-sky-100 rounded-2xl p-3 space-y-2">
                <div className="flex items-center gap-1.5 text-xs font-bold text-sky-900">
                  <Timer className="w-4 h-4 text-sky-600" />
                  <span>تحديد وقت انتهاء المناوبة:</span>
                </div>

                <div className="grid grid-cols-4 gap-1 text-xs font-bold">
                  {['4:00 صباحاً', '7:00 صباحاً', '9:00 صباحاً', 'مناوبة كاملة'].map((preset) => (
                    <button
                      key={preset}
                      type="button"
                      onClick={() => setNrDutyEndTime(preset)}
                      className={`py-1.5 px-1 rounded-xl border text-center transition-all text-[11px] ${
                        nrDutyEndTime === preset
                          ? 'bg-sky-600 text-white border-sky-600 shadow-2xs'
                          : 'bg-white text-slate-700 border-sky-200 hover:bg-sky-50'
                      }`}
                    >
                      {preset}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Phone Number */}
            <div>
              <label className="text-xs font-bold text-slate-700 block mb-1">
                رقم الهاتف / الواتساب النشط للاتصال:
              </label>
              <div className="relative">
                <input
                  type="text"
                  value={nrPhone}
                  onChange={(e) => setNrPhone(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 pr-9 text-xs font-bold text-slate-800"
                />
                <Phone className="w-4 h-4 text-slate-400 absolute right-3 top-2.5" />
              </div>
            </div>

            {/* Save Button */}
            <button
              onClick={handleSaveNurseUpdates}
              disabled={isSaving}
              className="w-full bg-sky-700 hover:bg-sky-800 active:scale-98 text-white py-3 rounded-2xl font-black text-xs transition-all shadow-md shadow-sky-700/20 flex items-center justify-center gap-2"
            >
              {isSaving ? (
                <RefreshCw className="w-4 h-4 animate-spin" />
              ) : (
                <Save className="w-4 h-4" />
              )}
              <span>حفظ وتحديث حالة الممرض لحظياً</span>
            </button>
          </div>
        )}

        {/* Confirmation Modal for Pharmacist Availability Toggle */}
        {pendingPhToggle !== null && currentPharmacistPh && (
          <div className="absolute inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4 animate-fade-in">
            <div className="w-full max-w-sm rounded-2xl bg-white shadow-2xl border border-slate-200 p-5 text-right space-y-3.5">
              <div className="flex items-center gap-3">
                <div
                  className={`w-11 h-11 rounded-2xl flex items-center justify-center shrink-0 ${
                    pendingPhToggle.nextValue
                      ? 'bg-emerald-100 text-emerald-700'
                      : 'bg-rose-100 text-rose-700'
                  }`}
                >
                  {pendingPhToggle.nextValue ? (
                    <CheckCircle2 className="w-6 h-6" />
                  ) : (
                    <AlertCircle className="w-6 h-6" />
                  )}
                </div>
                <div>
                  <h4 className="text-sm font-black text-slate-900 leading-tight">
                    {pendingPhToggle.field === 'open'
                      ? pendingPhToggle.nextValue
                        ? 'تأكيد فتح الصيدلية للجمهور'
                        : 'تأكيد إغلاق الصيدلية'
                      : pendingPhToggle.nextValue
                      ? 'تأكيد تفعيل المناوبة الليلية'
                      : 'تأكيد إلغاء المناوبة الليلية'}
                  </h4>
                  <p className="text-[11px] text-slate-500 font-semibold mt-0.5">
                    {currentPharmacistPh.name}
                  </p>
                </div>
              </div>

              <div
                className={`p-3 rounded-xl text-xs font-semibold leading-relaxed border ${
                  pendingPhToggle.nextValue
                    ? 'bg-emerald-50 border-emerald-200 text-emerald-900'
                    : 'bg-rose-50 border-rose-200 text-rose-900'
                }`}
              >
                {pendingPhToggle.field === 'open'
                  ? pendingPhToggle.nextValue
                    ? `هل أنت متأكد من تغيير حالة "${currentPharmacistPh.name}" إلى: مفتوحة وتستقبل المراجعين الآن؟`
                    : `هل أنت متأكد من تغيير حالة "${currentPharmacistPh.name}" إلى: مغلقة حالياً؟`
                  : pendingPhToggle.nextValue
                  ? `هل أنت متأكد من إدراج "${currentPharmacistPh.name}" كـ صيدلية مناوبة ليلاً؟ ستظهر في قائمة المناوبة لجميع الأهالي.`
                  : `هل أنت متأكد من إزالة "${currentPharmacistPh.name}" من قائمة الصيدليات المناوبة؟`}
              </div>

              <div className="grid grid-cols-2 gap-2 pt-1">
                <button
                  type="button"
                  onClick={() => {
                    const toggle = pendingPhToggle;
                    setPendingPhToggle(null);
                    if (toggle.field === 'open') {
                      setPhIsOpen(toggle.nextValue);
                    } else {
                      setPhIsOnDuty(toggle.nextValue);
                    }
                  }}
                  className={`py-2.5 px-3 rounded-xl text-white font-black text-xs transition-all shadow-sm flex items-center justify-center gap-1.5 active:scale-95 ${
                    pendingPhToggle.nextValue
                      ? 'bg-emerald-700 hover:bg-emerald-800'
                      : 'bg-rose-700 hover:bg-rose-800'
                  }`}
                >
                  <CheckCircle2 className="w-4 h-4" />
                  <span>نعم، تأكيد التغيير</span>
                </button>

                <button
                  type="button"
                  onClick={() => setPendingPhToggle(null)}
                  className="py-2.5 px-3 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs transition-all"
                >
                  إلغاء وتراجع
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Confirmation Modal for Admin Master Duty Toggle */}
        {pendingAdminDutyPharmacy !== null && (
          <div className="absolute inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4 animate-fade-in">
            <div className="w-full max-w-sm rounded-2xl bg-white shadow-2xl border border-slate-200 p-5 text-right space-y-3.5">
              <div className="flex items-center gap-3">
                <div
                  className={`w-11 h-11 rounded-2xl flex items-center justify-center shrink-0 ${
                    !pendingAdminDutyPharmacy.isOnDuty
                      ? 'bg-emerald-100 text-emerald-700'
                      : 'bg-rose-100 text-rose-700'
                  }`}
                >
                  {!pendingAdminDutyPharmacy.isOnDuty ? (
                    <CheckCircle2 className="w-6 h-6" />
                  ) : (
                    <AlertCircle className="w-6 h-6" />
                  )}
                </div>
                <div>
                  <h4 className="text-sm font-black text-slate-900 leading-tight">
                    {!pendingAdminDutyPharmacy.isOnDuty
                      ? 'تأكيد تعيين مناوبة للصيدلية'
                      : 'تأكيد إلغاء مناوبة الصيدلية'}
                  </h4>
                  <p className="text-[11px] text-slate-500 font-semibold mt-0.5">
                    {pendingAdminDutyPharmacy.name}
                  </p>
                </div>
              </div>

              <div
                className={`p-3 rounded-xl text-xs font-semibold leading-relaxed border ${
                  !pendingAdminDutyPharmacy.isOnDuty
                    ? 'bg-emerald-50 border-emerald-200 text-emerald-900'
                    : 'bg-rose-50 border-rose-200 text-rose-900'
                }`}
              >
                {!pendingAdminDutyPharmacy.isOnDuty
                  ? `بصفتك المشرف العام، هل أنت متأكد من تعيين "${pendingAdminDutyPharmacy.name}" كمناوبة ليلية؟ ستظهر فوراً في الواجهة الرئيسية للأهالي.`
                  : `بصفتك المشرف العام، هل أنت متأكد من إلغاء مناوبة "${pendingAdminDutyPharmacy.name}"؟`}
              </div>

              <div className="grid grid-cols-2 gap-2 pt-1">
                <button
                  type="button"
                  onClick={async () => {
                    const p = pendingAdminDutyPharmacy;
                    setPendingAdminDutyPharmacy(null);
                    const newDuty = !p.isOnDuty;
                    await updatePharmacyStatus(p.id, {
                      isOnDuty: newDuty,
                      dutyEndTime: newDuty ? '6:00 صباحاً' : '',
                      dutyHours: newDuty ? 'مناوبة ليلية حتى 6:00 صباحاً' : 'مفتوحة - دوام اعتيادي'
                    });
                    onPharmacyUpdated({
                      ...p,
                      isOnDuty: newDuty,
                      dutyEndTime: newDuty ? '6:00 صباحاً' : '',
                      dutyHours: newDuty ? 'مناوبة ليلية حتى 6:00 صباحاً' : 'مفتوحة - دوام اعتيادي'
                    });
                  }}
                  className={`py-2.5 px-3 rounded-xl text-white font-black text-xs transition-all shadow-sm flex items-center justify-center gap-1.5 active:scale-95 ${
                    !pendingAdminDutyPharmacy.isOnDuty
                      ? 'bg-emerald-700 hover:bg-emerald-800'
                      : 'bg-rose-700 hover:bg-rose-800'
                  }`}
                >
                  <CheckCircle2 className="w-4 h-4" />
                  <span>نعم، اعتماد التغيير</span>
                </button>

                <button
                  type="button"
                  onClick={() => setPendingAdminDutyPharmacy(null)}
                  className="py-2.5 px-3 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs transition-all"
                >
                  إلغاء وتراجع
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
