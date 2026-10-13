import React, { useState, useEffect } from 'react';
import {
  Download,
  Lock,
  CheckCircle2,
  MapPin,
  Clock,
  Wifi,
  ShieldCheck,
  Stethoscope,
  Pill,
  Hospital,
  ChevronDown,
  MessageCircle,
  Send,
  QrCode,
  X,
  Compass,
  Navigation,
  ArrowUpRight,
  ArrowLeft,
  Sparkles,
  Headphones,
  Smartphone,
  Share2,
  PlusSquare,
  ExternalLink
} from 'lucide-react';
import { DEFAULT_APP_UPDATE, offlineStorage } from '../lib/offlineStorage';
import { subscribeToPharmacies, subscribeToHospitals } from '../lib/firebase';
import { Pharmacy, Hospital as HospitalType } from '../types';

const TelegramIcon: React.FC<{ className?: string }> = ({ className = 'w-6 h-6' }) => (
  <svg className={className} viewBox="0 0 24 24" fill="currentColor">
    <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm4.64 6.8c-.15 1.58-.8 5.42-1.13 7.19-.14.75-.42 1-.68 1.03-.58.05-1.02-.38-1.58-.75-.88-.58-1.38-.94-2.23-1.5-.99-.65-.35-1.01.22-1.59.15-.15 2.71-2.48 2.76-2.69.01-.03.01-.14-.07-.19-.08-.05-.19-.02-.27 0-.12.03-1.99 1.27-5.63 3.73-.53.36-1.02.54-1.45.53-.48-.01-1.4-.27-2.09-.49-.84-.27-1.51-.42-1.45-.89.03-.25.38-.51 1.07-.78 4.2-1.83 7-3.04 8.41-3.64 4-.1.72 1.34.8 1.94.8z" />
  </svg>
);

const WhatsAppIcon: React.FC<{ className?: string }> = ({ className = 'w-6 h-6' }) => (
  <svg className={className} viewBox="0 0 24 24" fill="currentColor">
    <path d="M12.04 2C6.58 2 2.13 6.45 2.13 11.91C2.13 13.66 2.59 15.36 3.45 16.86L2.05 22L7.3 20.62C8.75 21.41 10.38 21.83 12.04 21.83C17.5 21.83 21.95 17.38 21.95 11.92C21.95 9.27 20.92 6.78 19.05 4.91C17.18 3.03 14.69 2 12.04 2ZM12.05 3.67C14.25 3.67 16.31 4.53 17.87 6.09C19.42 7.65 20.28 9.72 20.28 11.92C20.28 16.46 16.59 20.16 12.05 20.16C10.61 20.16 9.2 19.78 7.96 19.05L7.66 18.87L4.54 19.69L5.37 16.65L5.17 16.33C4.37 15.05 3.8 13.51 3.8 11.92C3.8 7.38 7.5 3.67 12.05 3.67ZM8.83 7.39C8.63 7.39 8.44 7.4 8.27 7.46C8.07 7.53 7.82 7.64 7.62 7.86C7.38 8.12 6.77 8.7 6.77 9.87C6.77 11.04 7.63 12.18 7.75 12.34C7.87 12.5 9.42 14.88 11.8 15.91C13.78 16.76 14.19 16.6 14.62 16.56C15.06 16.52 16.03 15.98 16.23 15.42C16.43 14.86 16.43 14.38 16.37 14.28C16.31 14.18 16.15 14.12 15.91 14C15.67 13.88 14.49 13.3 14.27 13.22C14.05 13.14 13.89 13.1 13.73 13.34C13.57 13.58 13.11 14.12 12.97 14.28C12.83 14.44 12.69 14.46 12.45 14.34C12.21 14.22 11.44 13.97 10.53 13.16C9.82 12.53 9.34 11.75 9.2 11.51C9.06 11.27 9.18 11.14 9.3 11.02C9.41 10.91 9.55 10.73 9.67 10.59C9.79 10.45 9.83 10.35 9.91 10.19C9.99 10.03 9.95 9.89 9.89 9.77C9.83 9.65 9.37 8.51 9.17 8.05C8.98 7.6 8.78 7.66 8.63 7.65C8.5 7.65 8.34 7.64 8.18 7.64L8.83 7.39Z" />
  </svg>
);

const AppleIcon: React.FC<{ className?: string }> = ({ className = 'w-5 h-5' }) => (
  <svg className={className} viewBox="0 0 24 24" fill="currentColor">
    <path d="M18.71 19.5c-.83 1.24-1.71 2.45-3.05 2.47-1.34.03-1.77-.79-3.29-.79-1.53 0-2 .77-3.27.82-1.31.05-2.3-1.32-3.14-2.53C4.25 17 2.94 12.45 4.7 9.39c.87-1.52 2.43-2.48 4.12-2.51 1.28-.02 2.5.87 3.29.87.78 0 2.26-1.07 3.81-.91.65.03 2.47.26 3.64 1.98-.09.06-2.17 1.28-2.15 3.81.03 3.02 2.65 4.03 2.68 4.04-.03.07-.42 1.44-1.38 2.83M15.97 6.37c.62-.75 1.04-1.8 0.92-2.85-.9.04-1.99.6-2.63 1.35-.57.65-1.06 1.72-.93 2.74 1 .08 2.02-.49 2.64-1.24z" />
  </svg>
);

const GithubIcon: React.FC<{ className?: string }> = ({ className = 'w-5 h-5' }) => (
  <svg className={className} viewBox="0 0 24 24" fill="currentColor">
    <path fillRule="evenodd" clipRule="evenodd" d="M12 2C6.477 2 2 6.484 2 12.017c0 4.425 2.865 8.18 6.839 9.504.5.092.682-.217.682-.483 0-.237-.008-.868-.013-1.703-2.782.605-3.369-1.343-3.369-1.343-.454-1.158-1.11-1.466-1.11-1.466-.908-.62.069-.608.069-.608 1.003.07 1.53 1.032 1.53 1.032.892 1.53 2.341 1.088 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.113-4.555-4.951 0-1.093.39-1.988 1.029-2.688-.103-.253-.446-1.272.098-2.65 0 0 .84-.27 2.75 1.026A9.564 9.564 0 0112 6.844c.85.004 1.705.115 2.504.337 1.909-1.296 2.747-1.027 2.747-1.027.546 1.379.202 2.398.1 2.651.64.7 1.028 1.595 1.028 2.688 0 3.848-2.339 4.695-4.566 4.943.359.309.678.92.678 1.855 0 1.338-.012 2.419-.012 2.747 0 .268.18.58.688.482A10.019 10.019 0 0022 12.017C22 6.484 17.522 2 12 2z" />
  </svg>
);

interface LandingPageProps {
  onOpenAdminLogin: () => void;
  onOpenUserApp: () => void;
}

export const LandingPage: React.FC<LandingPageProps> = ({ onOpenAdminLogin, onOpenUserApp }) => {
  const [downloading, setDownloading] = useState(false);
  const [downloadSuccess, setDownloadSuccess] = useState(false);
  const [openFaq, setOpenFaq] = useState<number | null>(null);
  const [showIosGuideModal, setShowIosGuideModal] = useState(false);

  // Live real-time entity counts from Firestore
  const [pharmacies, setPharmacies] = useState<Pharmacy[]>(() => {
    return offlineStorage.getPharmacies() || [];
  });
  const [hospitals, setHospitals] = useState<HospitalType[]>(() => {
    return offlineStorage.getHospitals() || [];
  });

  useEffect(() => {
    const unsub1 = subscribeToPharmacies((data) => {
      setPharmacies(data || []);
    });
    const unsub2 = subscribeToHospitals((data) => {
      setHospitals(data || []);
    });
    return () => {
      unsub1();
      unsub2();
    };
  }, []);

  // True entity counts directly from database
  const displayPharmacyCount = pharmacies.length;
  const displayHospitalCount = hospitals.length;

  // First-time visitor welcome modal
  const [showWelcomeModal, setShowWelcomeModal] = useState(false);

  useEffect(() => {
    if (!localStorage.getItem('sehatuk_welcomed')) {
      const timer = setTimeout(() => setShowWelcomeModal(true), 1200);
      return () => clearTimeout(timer);
    }
  }, []);

  const handleCloseWelcome = () => {
    setShowWelcomeModal(false);
    localStorage.setItem('sehatuk_welcomed', 'true');
  };

  // Secret 7 clicks trigger on Logo without visual hints
  const clickCountRef = React.useRef(0);
  const clickTimerRef = React.useRef<NodeJS.Timeout | null>(null);

  const handleLogoSecretClick = () => {
    clickCountRef.current += 1;
    if (clickTimerRef.current) {
      clearTimeout(clickTimerRef.current);
    }

    if (clickCountRef.current >= 7) {
      clickCountRef.current = 0;
      onOpenAdminLogin();
    } else {
      clickTimerRef.current = setTimeout(() => {
        clickCountRef.current = 0;
      }, 3500);
    }
  };

  // Direct APK download handler
  const handleDirectDownload = () => {
    setDownloading(true);
    const directApkUrl = '/Sahtak-Dierhafer-v1.1.apk';
    const fallbackUrl = 'https://github.com/Baraa-cmd/sahtak-app/releases/download/v1.1/Sahtak-Dierhafer.apk';
    
    try {
      const link = document.createElement('a');
      link.href = directApkUrl;
      link.setAttribute('download', 'Sahtak-Dierhafer-v1.1.apk');
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    } catch {
      window.location.href = fallbackUrl;
    }

    setTimeout(() => {
      setDownloading(false);
      setDownloadSuccess(true);
      setTimeout(() => setDownloadSuccess(false), 4000);
    }, 700);
  };

  const faqs = [
    {
      q: 'كيف أعرف الصيدليات المناوبة ليلاً في دير حافر؟',
      a: 'من خلال فتح تطبيق "صحتك"، تجد في الشاشة الرئيسية علامة تبويب "المناوبة الليلية" تعرض تلقائياً الصيدليات المناوبة الآن مع ساعات عملها وساعات المناوبة والتوجيه الدقيق عبر الخريطة.'
    },
    {
      q: 'هل يتطلب التطبيق الاتصال بالإنترنت بشكل دائم؟',
      a: 'لا، يتميز التطبيق بوجود ذاكرة محلية ذكية تحفظ آخر تحديث للبيانات لتصفح الصيدليات والمناوبات بدقة حتى في حال انقطاع الشبكة.'
    },
    {
      q: 'كيف يتم ربط واستخدام الخريطة والتوجيه؟',
      a: 'يتعرف التطبيق على موقعك الحالي تلقائياً حسابياً ويظهر لك المسافة الفعلية بالأمتار لكل صيدلية ومشفى مع زر لتشغيل ملاحة خرائط غوغل بضغطة زر.'
    }
  ];

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col selection:bg-emerald-500 selection:text-white relative overflow-x-hidden font-sans" dir="rtl">
      {/* Background Lighting */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[1100px] h-[550px] bg-gradient-to-b from-emerald-600/15 via-teal-900/5 to-transparent rounded-full blur-3xl pointer-events-none" />

      {/* Welcome Modal */}
      {showWelcomeModal && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4 transition-all duration-300" dir="rtl">
          <div className="bg-slate-900 border border-emerald-500/30 rounded-3xl p-6 w-full max-w-sm shadow-2xl text-center relative space-y-4 animate-in fade-in zoom-in-95 duration-200">
            <button
              onClick={handleCloseWelcome}
              className="absolute top-4 left-4 p-1.5 rounded-xl text-slate-400 hover:text-white hover:bg-slate-800 transition"
            >
              <X className="w-4 h-4" />
            </button>
            
            <div className="w-12 h-12 rounded-2xl bg-emerald-600/20 text-emerald-400 border border-emerald-500/30 flex items-center justify-center mx-auto shadow-inner">
              <ShieldCheck className="w-6 h-6" />
            </div>
            
            <div className="space-y-1.5">
              <h3 className="font-extrabold text-base text-white">أهلاً بك في منصة صحتك</h3>
              <p className="text-xs text-slate-300 leading-relaxed font-medium">
                دليلك الطبي الأول للمناوبات والصيدليات في دير حافر. يمكنك تحميل التطبيق الآن للوصول الفوري في حالات الطوارئ.
              </p>
            </div>

            <div className="flex flex-col gap-2 pt-1">
              <button
                onClick={() => {
                  handleCloseWelcome();
                  onOpenUserApp();
                }}
                className="w-full bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white font-black py-2.5 rounded-xl text-xs shadow-lg cursor-pointer transition active:scale-98 flex items-center justify-center gap-2"
              >
                <Smartphone className="w-4 h-4" />
                <span>فتح واستخدام التطبيق الآن 🚀</span>
              </button>
              <button
                onClick={handleCloseWelcome}
                className="w-full bg-slate-800 hover:bg-slate-700 text-slate-300 font-bold py-2 rounded-xl text-xs cursor-pointer transition"
              >
                تصفح صفحة التحميل
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Sticky Header */}
      <header className="sticky top-0 z-40 backdrop-blur-xl bg-slate-950/80 border-b border-slate-800/80 px-4 md:px-8 py-3.5 shadow-sm">
        <div className="max-w-6xl mx-auto flex items-center justify-between">
          {/* Logo & Platform Name - Hidden 7-Clicks Admin Trigger */}
          <div
            onClick={handleLogoSecretClick}
            className="flex items-center gap-3 select-none cursor-default"
          >
            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-emerald-600 to-teal-500 flex items-center justify-center shadow-md shadow-emerald-950/40 border border-emerald-400/20 shrink-0">
              <ShieldCheck className="w-5 h-5 text-white" />
            </div>
            <div className="flex flex-col text-right">
              <h1 className="font-extrabold text-base tracking-tight text-white leading-tight">
                صحتك
              </h1>
              <p className="text-[11px] text-emerald-400 font-semibold leading-tight">
                الدليل الطبي الحديث
              </p>
            </div>
          </div>

          {/* Action Buttons in Header */}
          <div className="flex items-center gap-2">
            <button
              onClick={onOpenUserApp}
              className="flex items-center gap-1.5 bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white font-extrabold px-3.5 py-2 rounded-xl text-xs shadow-md shadow-emerald-950/40 transition cursor-pointer active:scale-95"
            >
              <Smartphone className="w-4 h-4 shrink-0" />
              <span>فتح التطبيق مباشرة 📲</span>
            </button>
            <div className="hidden sm:flex items-center gap-2 bg-slate-900/80 border border-slate-800 text-slate-300 text-xs px-3 py-1.5 rounded-xl font-bold select-none">
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse shrink-0" />
              <span className="text-[11px]">الخدمة نشطة ومحدثة</span>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content Area */}
      <main className="max-w-5xl mx-auto w-full px-4 md:px-6 py-12 md:py-20 flex-1 flex flex-col items-center text-center space-y-16 md:space-y-24 z-10">
        
        {/* Hero Section */}
        <div className="flex flex-col items-center space-y-6 max-w-3xl mx-auto">
          {/* Top Badge */}
          <div className="inline-flex items-center gap-2 bg-emerald-950/70 border border-emerald-800/60 text-emerald-300 px-4 py-1.5 rounded-full text-xs font-bold shadow-sm">
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse shrink-0" />
            <span>الدليل الطبي الحديث في دير حافر</span>
          </div>

          {/* Main Headline */}
          <h2 className="text-3xl md:text-5xl lg:text-6xl font-black tracking-tight text-white leading-[1.3] text-center">
            رعايتك الصحية{' '}
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-emerald-400 via-teal-300 to-emerald-300">
              أقرب إليك
            </span>{' '}
            من أي وقت مضى
          </h2>

          {/* Subtitle Description */}
          <p className="text-sm md:text-base text-slate-300 font-medium leading-[1.8] max-w-2xl mx-auto">
            تطبيق "صحتك" يضع بين يديك دليلاً شاملاً ومحدثاً لحظياً للصيدليات المناوبة ليلاً، الكوادر التمريضية، والمشافي مع التوجيه المباشر بالخريطة.
          </p>

          {/* Hero Direct Access for iPhone & Web */}
          <div className="flex flex-col sm:flex-row items-center gap-3 pt-2 w-full sm:w-auto">
            <button
              onClick={onOpenUserApp}
              className="w-full sm:w-auto px-7 py-3.5 rounded-2xl bg-gradient-to-r from-emerald-600 via-teal-600 to-emerald-500 hover:from-emerald-500 hover:to-teal-400 text-white font-black text-sm shadow-xl shadow-emerald-950/60 transition flex items-center justify-center gap-2.5 cursor-pointer active:scale-95"
            >
              <Smartphone className="w-5 h-5 shrink-0" />
              <span>دخول واستخدام التطبيق مباشرة 🚀</span>
            </button>
            <button
              onClick={() => setShowIosGuideModal(true)}
              className="w-full sm:w-auto px-5 py-3 rounded-2xl bg-slate-900/90 hover:bg-slate-800 border border-slate-700/80 text-slate-200 hover:text-white font-bold text-xs transition flex items-center justify-center gap-2 cursor-pointer"
            >
              <AppleIcon className="w-4 h-4 text-slate-300" />
              <span>مستخدم آيفون؟ طريقة التثبيت 🍏</span>
            </button>
          </div>
        </div>

        {/* Live Stats Counters Bar */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 md:gap-4 w-full max-w-3xl">
          <div className="bg-slate-900/70 border border-slate-800/80 rounded-2xl p-4 flex flex-col items-center justify-center gap-1 shadow-sm">
            <div className="flex items-center gap-1.5 text-emerald-400 font-black text-xl">
              <Pill className="w-4 h-4 text-emerald-400 shrink-0" />
              <span>{displayPharmacyCount}</span>
            </div>
            <span className="text-[11px] text-slate-400 font-bold">صيدلية مسجلة</span>
          </div>

          <div className="bg-slate-900/70 border border-slate-800/80 rounded-2xl p-4 flex flex-col items-center justify-center gap-1 shadow-sm">
            <div className="flex items-center gap-1.5 text-teal-400 font-black text-xl">
              <Hospital className="w-4 h-4 text-teal-400 shrink-0" />
              <span>{displayHospitalCount}</span>
            </div>
            <span className="text-[11px] text-slate-400 font-bold">مشفى ومركز طبي</span>
          </div>

          <div className="bg-slate-900/70 border border-slate-800/80 rounded-2xl p-4 flex flex-col items-center justify-center gap-1 shadow-sm">
            <div className="flex items-center gap-1.5 text-indigo-400 font-black text-xl">
              <Clock className="w-4 h-4 text-indigo-400 shrink-0" />
              <span>24/7</span>
            </div>
            <span className="text-[11px] text-slate-400 font-bold">مناوبات ليلية حية</span>
          </div>

          <div className="bg-slate-900/70 border border-slate-800/80 rounded-2xl p-4 flex flex-col items-center justify-center gap-1 shadow-sm">
            <div className="flex items-center gap-1.5 text-amber-400 font-black text-xl">
              <CheckCircle2 className="w-4 h-4 text-amber-400 shrink-0" />
              <span>100%</span>
            </div>
            <span className="text-[11px] text-slate-400 font-bold">تغطية مجانية بالكامل</span>
          </div>
        </div>

        {/* Download & Access Action Section */}
        <div className="w-full max-w-2xl bg-slate-900/70 border border-slate-800/90 rounded-3xl p-6 md:p-8 shadow-xl space-y-6">
          <div className="text-center space-y-1">
            <h3 className="font-extrabold text-lg md:text-xl text-white">
              خيارات تشغيل وتثبيت التطبيق
            </h3>
            <p className="text-xs text-slate-400 font-medium">
              اختر الطريقة الأنسب لجهازك (آيفون، أندرويد، أو متصفح الويب)
            </p>
          </div>

          {/* iPhone & Web Users Section (PWA) */}
          <div className="bg-slate-950/70 border border-emerald-500/30 rounded-2xl p-4 sm:p-5 space-y-3 text-right">
            <div className="flex items-center justify-between gap-2">
              <div className="flex items-center gap-2">
                <AppleIcon className="w-5 h-5 text-emerald-400 shrink-0" />
                <h4 className="font-black text-sm text-white">مستخدمو الآيفون والكمبيوتر (Web App)</h4>
              </div>
              <span className="text-[10px] font-bold bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 px-2 py-0.5 rounded-full">
                يعمل فوراً 🍏
              </span>
            </div>
            <p className="text-xs text-slate-300 leading-relaxed font-medium">
              يعمل التطبيق على هواتف الآيفون مباشرة دون الحاجة لمتجر التطبيقات، ويمكنك حفظه كأيقونة تطبيق على الشاشة الرئيسية عبر متصفح Safari.
            </p>
            <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2.5 pt-1">
              <button
                onClick={onOpenUserApp}
                className="flex-1 py-3 px-5 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white font-black text-xs shadow-lg shadow-emerald-950/60 transition flex items-center justify-center gap-2 cursor-pointer active:scale-95"
              >
                <Smartphone className="w-4 h-4 shrink-0" />
                <span>فتح واستخدام التطبيق الآن 🚀</span>
              </button>
              <button
                onClick={() => setShowIosGuideModal(true)}
                className="py-3 px-4 rounded-xl bg-slate-900 hover:bg-slate-800 text-slate-200 hover:text-white border border-slate-700 font-bold text-xs transition flex items-center justify-center gap-2 cursor-pointer"
              >
                <AppleIcon className="w-3.5 h-3.5" />
                <span>طريقة التثبيت على الآيفون 📱</span>
              </button>
            </div>
          </div>

          {/* Android Users Section (APK & Telegram) */}
          <div className="bg-slate-950/50 border border-slate-800/80 rounded-2xl p-4 sm:p-5 space-y-3 text-right">
            <div className="flex items-center justify-between gap-2">
              <div className="flex items-center gap-2">
                <span className="text-base">🤖</span>
                <h4 className="font-black text-sm text-white">مستخدمو الأندرويد (تطبيق الهاتف APK)</h4>
              </div>
              <span className="text-[10px] font-bold bg-slate-800 text-slate-300 border border-slate-700 px-2 py-0.5 rounded-full">
                نسخة Android
              </span>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 pt-1">
              <button
                onClick={handleDirectDownload}
                disabled={downloading}
                className="py-3 px-4 rounded-xl bg-slate-800 hover:bg-slate-700 border border-slate-700 text-white font-extrabold text-xs transition flex items-center justify-center gap-2 cursor-pointer disabled:opacity-75 active:scale-98"
              >
                <Download className={`w-4 h-4 shrink-0 text-emerald-400 ${downloading ? 'animate-bounce' : ''}`} />
                <span>{downloading ? 'جاري التحضير...' : 'تحميل الـ APK مباشرة'}</span>
              </button>

              <a
                href="https://t.me/"
                target="_blank"
                rel="noreferrer"
                className="py-3 px-4 rounded-xl bg-sky-600/90 hover:bg-sky-500 border border-sky-400/30 text-white font-extrabold text-xs transition flex items-center justify-center gap-2 cursor-pointer active:scale-98"
              >
                <TelegramIcon className="w-4 h-4 text-white shrink-0" />
                <span>تحميل عبر التلغرام</span>
              </a>
            </div>

            {downloadSuccess && (
              <div className="flex items-center justify-center gap-2 bg-emerald-950/80 border border-emerald-600 text-emerald-200 py-2 px-3 rounded-xl text-xs font-bold transition-all">
                <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                <span>بدأ تنزيل التطبيق بنجاح على جهازك</span>
              </div>
            )}
          </div>

          {/* Trust Features Checklist */}
          <div className="flex items-center justify-center gap-5 text-[11px] text-slate-400 font-semibold pt-1">
            <span className="flex items-center gap-1.5">
              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
              <span>مجاني 100%</span>
            </span>
            <span className="flex items-center gap-1.5">
              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
              <span>يعمل أوفلاين</span>
            </span>
            <span className="flex items-center gap-1.5">
              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
              <span>لكافة الأجهزة</span>
            </span>
          </div>
        </div>

        {/* Feature Highlights Grid */}
        <div className="w-full max-w-4xl mx-auto flex flex-col items-center space-y-8">
          <div className="space-y-1.5 text-center">
            <h3 className="text-xl md:text-2xl font-black text-white">
              خدمات المنظومة الطبية
            </h3>
            <p className="text-xs text-slate-400 font-medium">
              تغطية شاملة وموثوقة لخدمة أهالي دير حافر
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 md:gap-5 w-full text-right">
            <div className="bg-slate-900/60 border border-slate-800/80 rounded-2xl p-6 space-y-3 shadow-xs">
              <div className="w-10 h-10 rounded-xl bg-emerald-600/20 text-emerald-400 border border-emerald-500/30 flex items-center justify-center shrink-0">
                <Clock className="w-5 h-5" />
              </div>
              <div className="space-y-1">
                <h4 className="font-extrabold text-sm md:text-base text-white">
                  المناوبات الليلية 24/7
                </h4>
                <p className="text-xs text-slate-400 leading-relaxed font-medium">
                  تحديد دقيق للصيدليات المناوبة خلال ساعات الليل وأيام العطل لضمان توفر الدواء دائماً.
                </p>
              </div>
            </div>

            <div className="bg-slate-900/60 border border-slate-800/80 rounded-2xl p-6 space-y-3 shadow-xs">
              <div className="w-10 h-10 rounded-xl bg-teal-600/20 text-teal-400 border border-teal-500/30 flex items-center justify-center shrink-0">
                <MapPin className="w-5 h-5" />
              </div>
              <div className="space-y-1">
                <h4 className="font-extrabold text-sm md:text-base text-white">
                  التوجيه بالخريطة
                </h4>
                <p className="text-xs text-slate-400 leading-relaxed font-medium">
                  حساب المسافة بدقة من موقعك الحالي وعرض المسار الأسرع للوصول إلى وجهتك.
                </p>
              </div>
            </div>

            <div className="bg-slate-900/60 border border-slate-800/80 rounded-2xl p-6 space-y-3 shadow-xs">
              <div className="w-10 h-10 rounded-xl bg-indigo-600/20 text-indigo-400 border border-indigo-500/30 flex items-center justify-center shrink-0">
                <Wifi className="w-5 h-5" />
              </div>
              <div className="space-y-1">
                <h4 className="font-extrabold text-sm md:text-base text-white">
                  العمل بدون إنترنت
                </h4>
                <p className="text-xs text-slate-400 leading-relaxed font-medium">
                  يعمل التطبيق بكفاءة تامة حتى في حال انقطاع الشبكة، ويحدّث البيانات تلقائياً.
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* FAQ Accordion Section */}
        <div className="w-full max-w-3xl mx-auto flex flex-col items-center space-y-6 text-right">
          <div className="space-y-1.5 text-center">
            <h3 className="text-xl md:text-2xl font-black text-white">
              الأسئلة الشائعة
            </h3>
            <p className="text-xs text-slate-400 font-medium">
              إجابات سريعة حول استخدام وتثبيت المنصة
            </p>
          </div>

          <div className="space-y-2.5 w-full">
            {faqs.map((faq, idx) => {
              const isOpen = openFaq === idx;
              return (
                <div
                  key={idx}
                  className="bg-slate-900/70 border border-slate-800/90 rounded-2xl overflow-hidden transition-colors"
                >
                  <button
                    onClick={() => setOpenFaq(isOpen ? null : idx)}
                    className="w-full px-5 py-4 flex items-center justify-between text-right font-extrabold text-xs md:text-sm text-white cursor-pointer hover:bg-slate-800/40 transition gap-4"
                  >
                    <span className="flex-1 leading-snug">{faq.q}</span>
                    <ChevronDown
                      className={`w-4 h-4 text-emerald-400 shrink-0 transition-transform duration-300 ${
                        isOpen ? 'rotate-180 text-emerald-300' : ''
                      }`}
                    />
                  </button>
                  {isOpen && (
                    <div className="overflow-hidden border-t border-slate-800/70 transition-all duration-200">
                      <p className="px-5 py-3.5 text-xs text-slate-300 leading-relaxed font-medium bg-slate-950/40">
                        {faq.a}
                      </p>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>

        {/* Telegram & WhatsApp Community Section */}
        <div className="w-full max-w-3xl mx-auto flex flex-col items-center space-y-6 text-center pt-2">
          <div className="space-y-2 text-center">
            <div className="inline-flex items-center gap-2 bg-emerald-950/60 border border-emerald-800/50 text-emerald-300 px-3.5 py-1 rounded-full text-xs font-bold">
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse shrink-0" />
              <span>تواصل مباشر وتحديثات فورية</span>
            </div>
            <h3 className="text-2xl md:text-3xl font-black text-white">
              قنوات التواصل والمجتمع
            </h3>
            <p className="text-xs md:text-sm text-slate-400 font-medium max-w-lg mx-auto">
              تابع جداول المناوبات اليومية وتحديثات الطوارئ أولاً بأول وانضم لمجتمع المنظومة الطبية
            </p>
          </div>

          <div className="flex flex-col gap-4 w-full">
            {/* Telegram Card */}
            <a
              href="https://t.me/"
              target="_blank"
              rel="noreferrer"
              className="group bg-gradient-to-r from-slate-900/90 via-slate-900/80 to-slate-950/90 border border-sky-500/30 hover:border-sky-400/80 rounded-2xl md:rounded-3xl p-5 md:p-6 shadow-xl hover:shadow-sky-950/40 transition-all duration-300 flex flex-col sm:flex-row sm:items-center justify-between gap-4 text-right relative overflow-hidden"
            >
              <div className="absolute top-0 right-0 w-48 h-full bg-sky-500/5 group-hover:bg-sky-500/10 transition-colors pointer-events-none rounded-3xl" />

              <div className="flex items-center gap-4 z-10">
                <div className="w-14 h-14 rounded-2xl bg-sky-500/15 border border-sky-500/30 text-[#0088cc] flex items-center justify-center shrink-0 shadow-inner group-hover:scale-105 transition-transform">
                  <TelegramIcon className="w-7 h-7 text-[#0088cc]" />
                </div>
                <div className="space-y-1">
                  <div className="flex items-center gap-2.5 flex-wrap">
                    <h4 className="font-extrabold text-base md:text-lg text-white group-hover:text-sky-300 transition-colors">
                      قناة التلغرام الرسمية
                    </h4>
                    <span className="text-[11px] font-bold px-2.5 py-0.5 rounded-full bg-sky-500/15 text-sky-300 border border-sky-500/30">
                      تنبيهات فورية
                    </span>
                  </div>
                  <p className="text-xs md:text-sm text-slate-400 font-medium leading-relaxed">
                    متابعة جداول المناوبات اليومية وتحديثات المنظومة الطبية بدير حافر لحظة بلحظة.
                  </p>
                </div>
              </div>

              <div className="shrink-0 flex items-center justify-end sm:justify-start z-10 pt-2 sm:pt-0 border-t sm:border-t-0 border-slate-800/60">
                <span className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-sky-500 hover:bg-sky-400 text-white font-extrabold text-xs shadow-md shadow-sky-950/50 transition group-hover:gap-3">
                  <span>الانضمام للقناة</span>
                  <ArrowLeft className="w-4 h-4 transition-transform" />
                </span>
              </div>
            </a>

            {/* WhatsApp Card */}
            <a
              href="https://whatsapp.com/"
              target="_blank"
              rel="noreferrer"
              className="group bg-gradient-to-r from-slate-900/90 via-slate-900/80 to-slate-950/90 border border-emerald-500/30 hover:border-emerald-400/80 rounded-2xl md:rounded-3xl p-5 md:p-6 shadow-xl hover:shadow-emerald-950/40 transition-all duration-300 flex flex-col sm:flex-row sm:items-center justify-between gap-4 text-right relative overflow-hidden"
            >
              <div className="absolute top-0 right-0 w-48 h-full bg-emerald-500/5 group-hover:bg-emerald-500/10 transition-colors pointer-events-none rounded-3xl" />

              <div className="flex items-center gap-4 z-10">
                <div className="w-14 h-14 rounded-2xl bg-emerald-500/15 border border-emerald-500/30 text-[#25D366] flex items-center justify-center shrink-0 shadow-inner group-hover:scale-105 transition-transform">
                  <WhatsAppIcon className="w-7 h-7 text-[#25D366]" />
                </div>
                <div className="space-y-1">
                  <div className="flex items-center gap-2.5 flex-wrap">
                    <h4 className="font-extrabold text-base md:text-lg text-white group-hover:text-emerald-300 transition-colors">
                      مجموعة الواتساب
                    </h4>
                    <span className="text-[11px] font-bold px-2.5 py-0.5 rounded-full bg-emerald-500/15 text-emerald-300 border border-emerald-500/30">
                      تواصل مباشر
                    </span>
                  </div>
                  <p className="text-xs md:text-sm text-slate-400 font-medium leading-relaxed">
                    لمتابعة آخر أخبار التطبيق وتحديثاته ومعرفة الصيدليات المناوبة والجدول اليومي.
                  </p>
                </div>
              </div>

              <div className="shrink-0 flex items-center justify-end sm:justify-start z-10 pt-2 sm:pt-0 border-t sm:border-t-0 border-slate-800/60">
                <span className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-extrabold text-xs shadow-md shadow-emerald-950/50 transition group-hover:gap-3">
                  <span>الانضمام للمجموعة</span>
                  <ArrowLeft className="w-4 h-4 transition-transform" />
                </span>
              </div>
            </a>

            {/* Contact App Administration Card */}
            <div className="bg-slate-900/80 border border-slate-800 hover:border-slate-700 rounded-2xl md:rounded-3xl p-5 md:p-6 shadow-lg flex flex-col sm:flex-row sm:items-center justify-between gap-4 text-right">
              <div className="flex items-center gap-4 z-10">
                <div className="w-14 h-14 rounded-2xl bg-amber-500/15 border border-amber-500/30 text-amber-400 flex items-center justify-center shrink-0 shadow-inner">
                  <Headphones className="w-7 h-7 text-amber-400" />
                </div>
                <div className="space-y-1">
                  <div className="flex items-center gap-2.5 flex-wrap">
                    <h4 className="font-extrabold text-base md:text-lg text-white">
                      التواصل المباشر مع إدارة التطبيق
                    </h4>
                    <span className="text-[11px] font-bold px-2.5 py-0.5 rounded-full bg-amber-500/15 text-amber-300 border border-amber-500/30">
                      دعم واقتراحات
                    </span>
                  </div>
                  <p className="text-xs md:text-sm text-slate-400 font-medium leading-relaxed">
                    لإضافة صيدلية أو كادر تمريضي، أو الإبلاغ عن تعديل رقم هاتف أو جدول مناوبة.
                  </p>
                </div>
              </div>

              <div className="shrink-0 flex items-center justify-end sm:justify-start z-10 pt-2 sm:pt-0 border-t sm:border-t-0 border-slate-800/60">
                <a
                  href="https://wa.me/?text=%D9%85%D8%B1%D8%AD%D8%A8%D8%A7%D9%8B%D8%8C%20%D8%A3%D9%88%D8%AF%20%D8%A7%D9%84%D8%AA%D9%88%D8%A7%D8%B5%D9%84%20%D9%85%D8%B9%20%D8%A5%D8%AF%D8%A7%D8%B1%D8%A9%20%D8%AA%D8%B7%D8%A8%D9%8A%D9%82%20%D8%B5%D8%AD%D8%AA%D9%83%20%D8%AF%D9%8A%D8%B1%20%D8%AD%D8%A7%D9%81%D8%B1"
                  target="_blank"
                  rel="noreferrer"
                  className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-5 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 hover:text-white border border-slate-700 hover:border-slate-600 font-extrabold text-xs shadow-sm transition cursor-pointer"
                >
                  <MessageCircle className="w-4 h-4 text-emerald-400" />
                  <span>مراسلة الإدارة</span>
                </a>
              </div>
            </div>
          </div>
        </div>

      </main>

      {/* Professional Footer */}
      <footer className="border-t border-slate-800/80 py-7 px-4 text-center text-xs text-slate-500 font-medium">
        <div className="max-w-6xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-3">
          <span>جميع الحقوق محفوظة © منصة صحتك • دير حافر</span>
          <span className="text-slate-600">خدمة مجانية مخصصة للمجتمع والرعاية الصحية</span>
        </div>
      </footer>

      {/* iOS Installation Guide Modal */}
      {showIosGuideModal && (
        <div className="fixed inset-0 z-50 bg-black/85 backdrop-blur-md flex items-center justify-center p-4" dir="rtl">
          <div className="bg-slate-900 border border-emerald-500/30 rounded-3xl p-6 w-full max-w-md shadow-2xl space-y-5 text-slate-100 font-sans animate-in fade-in zoom-in-95 duration-200">
            {/* Header */}
            <div className="flex items-center justify-between pb-3 border-b border-slate-800">
              <div className="flex items-center gap-2.5">
                <div className="w-10 h-10 rounded-2xl bg-slate-800 border border-slate-700 flex items-center justify-center text-emerald-400">
                  <AppleIcon className="w-6 h-6" />
                </div>
                <div>
                  <h3 className="text-sm font-black text-white">تثبيت التطبيق على هاتف الآيفون 🍏</h3>
                  <p className="text-[11px] text-slate-400">طريقة سهلة في 3 خطوات سريعة عبر Safari</p>
                </div>
              </div>
              <button
                onClick={() => setShowIosGuideModal(false)}
                className="p-1.5 rounded-xl text-slate-400 hover:text-white hover:bg-slate-800 transition cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Steps List */}
            <div className="space-y-2.5 text-xs">
              <div className="flex items-start gap-3 bg-slate-950/60 p-3 rounded-2xl border border-slate-800/80">
                <div className="w-6 h-6 rounded-full bg-emerald-600/20 border border-emerald-500/40 text-emerald-300 font-black text-xs flex items-center justify-center shrink-0">
                  1
                </div>
                <div className="space-y-0.5">
                  <p className="font-extrabold text-white">افتح هذا الرابط في متصفح Safari</p>
                  <p className="text-slate-400 text-[11px]">تأكد من فتح صفحة الموقع باستخدام متصفح Safari الأساسي على جهاز الآيفون.</p>
                </div>
              </div>

              <div className="flex items-start gap-3 bg-slate-950/60 p-3 rounded-2xl border border-slate-800/80">
                <div className="w-6 h-6 rounded-full bg-emerald-600/20 border border-emerald-500/40 text-emerald-300 font-black text-xs flex items-center justify-center shrink-0">
                  2
                </div>
                <div className="space-y-0.5">
                  <div className="flex items-center gap-1.5 font-extrabold text-white">
                    <span>اضغط على زر المشاركة</span>
                    <span className="px-1.5 py-0.5 bg-slate-800 rounded text-slate-200 text-[10px] font-mono">⎋ Share</span>
                  </div>
                  <p className="text-slate-400 text-[11px]">تجد زر المشاركة (المربع ذو السهم لأعلى) في الشريط السفلي للمتصفح.</p>
                </div>
              </div>

              <div className="flex items-start gap-3 bg-slate-950/60 p-3 rounded-2xl border border-slate-800/80">
                <div className="w-6 h-6 rounded-full bg-emerald-600/20 border border-emerald-500/40 text-emerald-300 font-black text-xs flex items-center justify-center shrink-0">
                  3
                </div>
                <div className="space-y-0.5">
                  <div className="flex items-center gap-1.5 font-extrabold text-white">
                    <span>اختر «إضافة إلى الشاشة الرئيسية»</span>
                    <span className="px-1.5 py-0.5 bg-slate-800 rounded text-emerald-300 text-[10px] font-mono">➕ Add to Home</span>
                  </div>
                  <p className="text-slate-400 text-[11px]">مرر للأسفل في القائمة، ثم اضغط «إضافة» في الزاوية العلوية لتأكيد التثبيت.</p>
                </div>
              </div>
            </div>

            {/* Advantages Box */}
            <div className="bg-emerald-950/40 border border-emerald-500/30 rounded-2xl p-3 text-[11px] text-emerald-200 space-y-1">
              <span className="font-black block text-emerald-300">✨ بعد التثبيت:</span>
              <p className="leading-relaxed">
                سيظهر تطبيق «صحتك» كأيقونة تطبيق كاملة على شاشة الآيفون، ويفتح بملء الشاشة كتطبيق رسمي مع حفظ البيانات للعمل أوفلاين.
              </p>
            </div>

            {/* Action Buttons */}
            <div className="flex items-center gap-2 pt-1">
              <button
                onClick={() => {
                  setShowIosGuideModal(false);
                  onOpenUserApp();
                }}
                className="flex-1 py-3 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white font-black text-xs transition cursor-pointer flex items-center justify-center gap-1.5 shadow-lg active:scale-98"
              >
                <Smartphone className="w-4 h-4" />
                <span>فتح وتجربة التطبيق الآن 🚀</span>
              </button>
              <button
                onClick={() => setShowIosGuideModal(false)}
                className="px-4 py-3 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 font-bold text-xs transition cursor-pointer"
              >
                إغلاق
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
