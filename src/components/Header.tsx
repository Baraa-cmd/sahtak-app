import React from 'react';
import {
  MapPin,
  RefreshCw,
  Bell,
  BellRing,
  WifiOff,
  UserCheck,
  Lock,
  Unlock
} from 'lucide-react';
import { UserLocation, AuthSession } from '../types';

interface HeaderProps {
  userLocation: UserLocation;
  isLocating: boolean;
  onRefreshLocation: () => void;
  onOpenLocationModal: () => void;
  isOnline: boolean;
  notificationsEnabled: boolean;
  onRequestNotifications: () => void;
  onOpenProviderLogin: () => void;
  session: AuthSession | null;
}

export const Header: React.FC<HeaderProps> = ({
  userLocation,
  isLocating,
  onRefreshLocation,
  onOpenLocationModal,
  isOnline,
  notificationsEnabled,
  onRequestNotifications,
  onOpenProviderLogin,
  session
}) => {
  return (
    <header className="sticky top-0 z-40 backdrop-blur-md border-b bg-white/95 border-slate-200">
      <div className="max-w-md mx-auto px-4 py-2.5 flex items-center justify-between gap-2">
        {/* Brand */}
        <div className="flex items-center gap-2">
          <div className="w-9 h-9 rounded-xl overflow-hidden shadow-xs shrink-0 flex items-center justify-center border bg-gradient-to-br from-emerald-600 to-emerald-800 border-emerald-500/30 text-white">
            <svg className="w-6 h-6 text-white" viewBox="0 0 512 512" fill="none" xmlns="http://www.w3.org/2000/svg">
              <rect width="512" height="512" rx="128" fill="#047857" />
              <path d="M 216 96 C 216 85, 225 76, 236 76 L 276 76 C 287 76, 296 85, 296 96 L 296 216 L 416 216 C 427 216, 436 225, 436 236 L 436 276 C 436 287, 427 296, 416 296 L 296 296 L 296 416 C 296 427, 287 436, 276 436 L 236 436 C 225 436, 216 427, 216 416 L 216 296 L 96 296 C 85 296, 76 287, 76 276 L 76 236 C 76 225, 85 216, 96 216 L 216 216 Z" fill="#FFFFFF" />
              <path d="M 88 256 L 180 256 L 210 180 L 244 330 L 276 220 L 306 280 L 328 256 L 424 256" stroke="#047857" strokeWidth="20" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          </div>
          <div>
            <div className="flex items-center gap-1.5">
              <h1 className="font-extrabold text-base tracking-tight leading-none text-slate-900">
                صحتك
              </h1>
              <span className="text-[10px] font-bold px-1.5 py-0.2 rounded bg-emerald-100 text-emerald-800">
                دير حافر
              </span>
            </div>
            <p className="text-[11px] font-medium leading-tight mt-0.5 text-slate-500">
              دليل الصيدليات والممرضين والمشافي
            </p>
          </div>
        </div>

        {/* Action Controls */}
        <div className="flex items-center gap-1.5">
          {/* Staff/Admin Login Button or User Badge */}
          <button
            onClick={onOpenProviderLogin}
            title={session ? 'إدارة الحساب والمناوبة' : 'تسجيل دخول الكوادر والأدمن'}
            className={`px-2.5 py-1.5 rounded-xl font-extrabold text-xs transition-all flex items-center gap-1.5 shadow-2xs border cursor-pointer ${
              session
                ? session.user.role === 'admin'
                  ? 'bg-amber-100 text-amber-900 border-amber-300 hover:bg-amber-200'
                  : session.user.role === 'pharmacist'
                  ? 'bg-emerald-100 text-emerald-900 border-emerald-300 hover:bg-emerald-200'
                  : 'bg-sky-100 text-sky-900 border-sky-300 hover:bg-sky-200'
                : 'bg-emerald-700 hover:bg-emerald-800 text-white border-emerald-600'
            }`}
          >
            {session ? (
              <>
                <UserCheck className="w-3.5 h-3.5 shrink-0" />
                <span className="truncate max-w-[80px]">
                  {session.user.role === 'admin'
                    ? 'الأدمن'
                    : session.user.targetName || session.user.displayName}
                </span>
              </>
            ) : (
              <>
                <Lock className="w-3.5 h-3.5 shrink-0" />
                <span>دخول الكوادر</span>
              </>
            )}
          </button>

          {/* Notification Button */}
          <button
            onClick={onRequestNotifications}
            title={notificationsEnabled ? 'الإشعارات مفعلة' : 'تفعيل إشعارات المناوبة'}
            className={`p-2 rounded-xl transition-all flex items-center justify-center text-xs ${
              notificationsEnabled
                ? 'bg-amber-50 text-amber-700 border border-amber-200'
                : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
            }`}
          >
            {notificationsEnabled ? (
              <BellRing className="w-4 h-4 text-amber-600" />
            ) : (
              <Bell className="w-4 h-4" />
            )}
          </button>
        </div>
      </div>

      {/* Location Bar */}
      <div className="bg-slate-50 border-t border-slate-100 px-4 py-1.5 flex items-center justify-between text-xs text-slate-600 max-w-md mx-auto">
        <button
          onClick={onOpenLocationModal}
          className="flex items-center gap-1.5 truncate text-right group hover:text-emerald-700 transition-colors"
          title="تغيير أو تحديد موقعك"
        >
          <MapPin className="w-3.5 h-3.5 text-emerald-700 shrink-0 group-hover:scale-110 transition-transform" />
          <span className="text-slate-500 font-medium">المنطقة:</span>
          <span className="font-extrabold text-slate-900 truncate group-hover:text-emerald-800">
            {userLocation.districtName}
          </span>
          <span className="text-[10px] bg-emerald-100 text-emerald-800 font-bold px-1.5 py-0.5 rounded-full shrink-0">
            {userLocation.source === 'gps'
              ? 'تلقائي GPS 🛰️'
              : userLocation.source === 'ip'
              ? 'تلقائي 🌐'
              : userLocation.source === 'manual'
              ? 'تحديد يدوي 📍'
              : 'افتراضي'}
          </span>
        </button>

        <div className="flex items-center gap-1 shrink-0">
          <button
            onClick={onRefreshLocation}
            disabled={isLocating}
            title="تحديث الموقع تلقائياً"
            className="p-1 text-slate-400 hover:text-emerald-700 transition-colors"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${isLocating ? 'animate-spin text-emerald-700' : ''}`} />
          </button>

          {!isOnline && (
            <div className="flex items-center gap-1 px-2 py-0.5 rounded-full bg-amber-100 text-amber-800 text-[10px] font-bold">
              <WifiOff className="w-3 h-3" />
              <span>أوفلاين</span>
            </div>
          )}
        </div>
      </div>
    </header>
  );
};
