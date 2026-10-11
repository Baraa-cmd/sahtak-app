import React from 'react';
import { Download, Sparkles, AlertTriangle } from 'lucide-react';
import { AppUpdateInfo } from '../types';

interface UpdateModalProps {
  updateInfo: AppUpdateInfo;
  currentVersion: string;
  isAdmin?: boolean;
}

export const UpdateModal: React.FC<UpdateModalProps> = ({ updateInfo, currentVersion, isAdmin }) => {
  const hasNewerVersion = updateInfo.version !== currentVersion;
  // If versions match, or if current user is admin (exempted from mandatory block to allow updating & managing), return null
  if (!hasNewerVersion || isAdmin) {
    return null;
  }

  const handleDownload = () => {
    window.location.href = updateInfo.apkUrl;
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-md p-4 animate-fade-in">
      <div className="w-full max-w-sm rounded-3xl bg-slate-900 border border-slate-800 p-5 shadow-2xl space-y-4 text-white text-right">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-slate-800 pb-3">
          <div className="flex items-center gap-2">
            <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-emerald-600 to-teal-500 text-white flex items-center justify-center shadow-md">
              <Download className="w-5 h-5 animate-bounce" />
            </div>
            <div>
              <h3 className="text-base font-black text-white tracking-tight">
                يتوفر تحديث جديد {updateInfo.version}
              </h3>
              <p className="text-[11px] text-emerald-400 font-bold">
                النسخة المثبتة: {currentVersion} • النسخة الجديدة: {updateInfo.version}
              </p>
            </div>
          </div>
        </div>

        {/* Release Notes */}
        <div className="space-y-2 bg-slate-800/80 p-3.5 rounded-2xl border border-slate-700/80">
          <div className="flex items-center gap-1.5 text-xs font-black text-amber-300">
            <Sparkles className="w-3.5 h-3.5" />
            <span>تفاصيل التحديث والمزايا الجديدة:</span>
          </div>

          <ul className="space-y-1.5 text-[11px] text-slate-200 font-medium pr-1">
            {updateInfo.releaseNotes.map((note, idx) => (
              <li key={idx} className="flex items-start gap-1.5">
                <span className="text-emerald-400 font-black">•</span>
                <span className="leading-snug">{note}</span>
              </li>
            ))}
          </ul>
        </div>

        {/* Mandatory Note */}
        <div className="flex items-center gap-2 bg-amber-500/10 border border-amber-500/30 p-2.5 rounded-2xl text-[11px] text-amber-200 font-semibold">
          <AlertTriangle className="w-4 h-4 text-amber-400 shrink-0" />
          <span>هذا التحديث إجباري ومطلوب لضمان استمرارية عمل التطبيق ومزامنة البيانات.</span>
        </div>

        {/* Action Button */}
        <div className="space-y-2 pt-1">
          <button
            onClick={handleDownload}
            className="w-full bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white font-black py-3 rounded-2xl text-xs shadow-lg shadow-emerald-900/30 transition active:scale-98 flex items-center justify-center gap-2"
          >
            <Download className="w-4 h-4" />
            <span>تحميل وتثبيت التحديث الآن ({updateInfo.version})</span>
          </button>
        </div>
      </div>
    </div>
  );
};
