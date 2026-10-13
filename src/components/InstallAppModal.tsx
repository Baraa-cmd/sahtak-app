import React, { useState } from 'react';
import {
  X,
  Smartphone,
  Download,
  CheckCircle2,
  Share2,
  ExternalLink,
  ShieldCheck,
  Sparkles
} from 'lucide-react';

interface InstallAppModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const AppleIcon: React.FC<{ className?: string }> = ({ className = 'w-5 h-5' }) => (
  <svg className={className} viewBox="0 0 24 24" fill="currentColor">
    <path d="M18.71 19.5c-.83 1.24-1.71 2.45-3.05 2.47-1.34.03-1.77-.79-3.29-.79-1.53 0-2 .77-3.27.82-1.31.05-2.3-1.32-3.14-2.53C4.25 17 2.94 12.45 4.7 9.39c.87-1.52 2.43-2.48 4.12-2.51 1.28-.02 2.5.87 3.29.87.78 0 2.26-1.07 3.81-.91.65.03 2.47.26 3.64 1.98-.09.06-2.17 1.28-2.15 3.81.03 3.02 2.65 4.03 2.68 4.04-.03.07-.42 1.44-1.38 2.83M15.97 6.37c.62-.75 1.04-1.8 0.92-2.85-.9.04-1.99.6-2.63 1.35-.57.65-1.06 1.72-.93 2.74 1 .08 2.02-.49 2.64-1.24z" />
  </svg>
);

const TelegramIcon: React.FC<{ className?: string }> = ({ className = 'w-5 h-5' }) => (
  <svg className={className} viewBox="0 0 24 24" fill="currentColor">
    <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm4.64 6.8c-.15 1.58-.8 5.42-1.13 7.19-.14.75-.42 1-.68 1.03-.58.05-1.02-.38-1.58-.75-.88-.58-1.38-.94-2.23-1.5-.99-.65-.35-1.01.22-1.59.15-.15 2.71-2.48 2.76-2.69.01-.03.01-.14-.07-.19-.08-.05-.19-.02-.27 0-.12.03-1.99 1.27-5.63 3.73-.53.36-1.02.54-1.45.53-.48-.01-1.4-.27-2.09-.49-.84-.27-1.51-.42-1.45-.89.03-.25.38-.51 1.07-.78 4.2-1.83 7-3.04 8.41-3.64 4-.1.72 1.34.8 1.94.8z" />
  </svg>
);

export const InstallAppModal: React.FC<InstallAppModalProps> = ({ isOpen, onClose }) => {
  const [downloading, setDownloading] = useState(false);
  const [downloadSuccess, setDownloadSuccess] = useState(false);
  const [activeTab, setActiveTab] = useState<'android' | 'ios'>('android');

  if (!isOpen) return null;

  const handleDownloadApk = () => {
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

  return (
    <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-md flex items-center justify-center p-4 animate-in fade-in duration-200" dir="rtl">
      <div className="bg-slate-900 border border-emerald-500/30 rounded-3xl p-5 sm:p-6 w-full max-w-md shadow-2xl space-y-4 text-slate-100 font-sans">
        
        {/* Header */}
        <div className="flex items-center justify-between pb-3 border-b border-slate-800">
          <div className="flex items-center gap-2.5">
            <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-emerald-600 to-teal-500 flex items-center justify-center text-white shadow-md shadow-emerald-950/40">
              <Smartphone className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-sm sm:text-base font-black text-white">تثبيت تطبيق «صحتك» 📲</h3>
              <p className="text-[11px] text-slate-400">وصول فوري وسريع من الشاشة الرئيسية لهاتفك</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-xl text-slate-400 hover:text-white hover:bg-slate-800 transition cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Device Switcher Tabs */}
        <div className="grid grid-cols-2 gap-2 bg-slate-950/80 p-1 rounded-2xl border border-slate-800">
          <button
            onClick={() => setActiveTab('android')}
            className={`py-2 px-3 rounded-xl text-xs font-black transition flex items-center justify-center gap-1.5 cursor-pointer ${
              activeTab === 'android'
                ? 'bg-emerald-600 text-white shadow-md shadow-emerald-950/50'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            <span>🤖 أندرويد (APK)</span>
          </button>
          <button
            onClick={() => setActiveTab('ios')}
            className={`py-2 px-3 rounded-xl text-xs font-black transition flex items-center justify-center gap-1.5 cursor-pointer ${
              activeTab === 'ios'
                ? 'bg-emerald-600 text-white shadow-md shadow-emerald-950/50'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            <AppleIcon className="w-3.5 h-3.5" />
            <span>آيفون (iOS Safari)</span>
          </button>
        </div>

        {/* Tab 1: Android APK */}
        {activeTab === 'android' && (
          <div className="space-y-3.5">
            <div className="bg-slate-950/60 p-3.5 rounded-2xl border border-slate-800/80 space-y-1.5">
              <div className="flex items-center gap-2 text-emerald-400 text-xs font-extrabold">
                <CheckCircle2 className="w-4 h-4" />
                <span>تطبيق أندرويد رسمي ومحدث (v1.1)</span>
              </div>
              <p className="text-xs text-slate-300 leading-relaxed">
                يعمل التطبيق بشكل مستقل تماماً على هواتف الأندرويد، مع حفظ تلقائي للمناوبات والعمل في وضع عدم الاتصال (أوفلاين).
              </p>
            </div>

            <button
              onClick={handleDownloadApk}
              disabled={downloading}
              className="w-full py-3.5 px-4 rounded-2xl bg-gradient-to-r from-emerald-600 via-teal-600 to-emerald-500 hover:from-emerald-500 hover:to-teal-500 text-white font-black text-xs shadow-lg shadow-emerald-950/60 transition flex items-center justify-center gap-2 cursor-pointer active:scale-98 disabled:opacity-75"
            >
              <Download className={`w-4 h-4 ${downloading ? 'animate-bounce' : ''}`} />
              <span>{downloading ? 'جاري التحضير...' : 'تحميل ملَـف التطبيق مباشرة (APK)'}</span>
            </button>

            <a
              href="https://t.me/"
              target="_blank"
              rel="noreferrer"
              className="w-full py-3 px-4 rounded-2xl bg-sky-600/90 hover:bg-sky-500 border border-sky-400/30 text-white font-extrabold text-xs transition flex items-center justify-center gap-2 cursor-pointer"
            >
              <TelegramIcon className="w-4 h-4 text-white" />
              <span>تحميل أو استلام التطبيق عبر التلغرام</span>
            </a>

            {downloadSuccess && (
              <div className="flex items-center justify-center gap-2 bg-emerald-950 border border-emerald-500/60 text-emerald-200 py-2 px-3 rounded-xl text-xs font-bold animate-in fade-in">
                <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                <span>بدأ تنزيل ملف الـ APK بنجاح على جهازك</span>
              </div>
            )}
          </div>
        )}

        {/* Tab 2: iPhone iOS */}
        {activeTab === 'ios' && (
          <div className="space-y-3">
            <div className="bg-slate-950/60 p-3 rounded-2xl border border-slate-800/80 space-y-2 text-xs">
              <div className="flex items-start gap-2.5">
                <span className="w-5 h-5 rounded-full bg-emerald-600/30 border border-emerald-500/50 text-emerald-300 font-black text-[11px] flex items-center justify-center shrink-0">1</span>
                <p className="text-slate-300">
                  افتح هذا الرابط عبر متصفح <strong className="text-white">Safari</strong> على الآيفون.
                </p>
              </div>

              <div className="flex items-start gap-2.5">
                <span className="w-5 h-5 rounded-full bg-emerald-600/30 border border-emerald-500/50 text-emerald-300 font-black text-[11px] flex items-center justify-center shrink-0">2</span>
                <p className="text-slate-300">
                  اضغط زر المشاركة <span className="bg-slate-800 px-1.5 py-0.5 rounded text-white font-mono text-[10px]">⎋ Share</span> أسفل شاشة Safari.
                </p>
              </div>

              <div className="flex items-start gap-2.5">
                <span className="w-5 h-5 rounded-full bg-emerald-600/30 border border-emerald-500/50 text-emerald-300 font-black text-[11px] flex items-center justify-center shrink-0">3</span>
                <p className="text-slate-300">
                  اختر <strong className="text-emerald-300">«إضافة إلى الشاشة الرئيسية» ➕</strong> ثم اضغط إضافة.
                </p>
              </div>
            </div>

            <div className="bg-emerald-950/40 border border-emerald-500/30 rounded-2xl p-3 text-[11px] text-emerald-200 leading-relaxed font-medium">
              💡 سيفتح التطبيق من أيقونة شاشة الآيفون بملء الشاشة كتطبيق رسمي ويدعم العمل عند انقطاع الإنترنت.
            </div>
          </div>
        )}

        {/* Footer info */}
        <div className="pt-2 border-t border-slate-800/80 flex items-center justify-between text-[11px] text-slate-400">
          <span className="flex items-center gap-1 text-emerald-400">
            <Sparkles className="w-3.5 h-3.5" />
            <span>تحديثات متزامنة لحظياً</span>
          </span>
          <button
            onClick={onClose}
            className="text-slate-400 hover:text-white font-bold cursor-pointer"
          >
            إغلاق
          </button>
        </div>

      </div>
    </div>
  );
};
