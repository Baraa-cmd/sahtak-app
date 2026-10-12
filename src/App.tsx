import React, { useState, useEffect } from 'react';
import { Capacitor } from '@capacitor/core';
import { LandingPage } from './components/LandingPage';
import { AdminDashboard } from './components/AdminDashboard';
import { UserApp } from './components/UserApp';

export default function App() {
  const [currentView, setCurrentView] = useState<'landing' | 'admin' | 'app'>(() => {
    // If running in Capacitor Android/iOS native app, default to full UserApp
    if (Capacitor.isNativePlatform()) {
      return 'app';
    }
    // If URL has ?view=app or ?view=admin
    const params = new URLSearchParams(window.location.search);
    if (params.get('view') === 'app') {
      return 'app';
    }
    if (params.get('view') === 'admin' && localStorage.getItem('sehatuk_admin_logged') === 'true') {
      return 'admin';
    }
    if (localStorage.getItem('sehatuk_admin_logged') === 'true') {
      return 'admin';
    }
    return 'landing';
  });

  const [showAdminLoginModal, setShowAdminLoginModal] = useState(false);
  const [adminUsername, setAdminUsername] = useState('');
  const [adminPassword, setAdminPassword] = useState('');
  const [adminError, setAdminError] = useState<string | null>(null);

  const handleAdminLogin = (e: React.FormEvent) => {
    e.preventDefault();
    if (adminUsername === 'admin' && (adminPassword === 'admin123' || adminPassword === 'B19961996b@')) {
      setCurrentView('admin');
      setShowAdminLoginModal(false);
      setAdminError(null);
      localStorage.setItem('sehatuk_admin_logged', 'true');
    } else {
      setAdminError('اسم المستخدم أو كلمة المرور غير صحيحة');
    }
  };

  if (currentView === 'admin') {
    return (
      <AdminDashboard
        onLogout={() => {
          setCurrentView('landing');
          localStorage.removeItem('sehatuk_admin_logged');
        }}
        onPreviewUserApp={() => setCurrentView('app')}
      />
    );
  }

  if (currentView === 'app') {
    return (
      <UserApp
        onBackToAdmin={
          localStorage.getItem('sehatuk_admin_logged') === 'true'
            ? () => setCurrentView('admin')
            : undefined
        }
        isAdmin={localStorage.getItem('sehatuk_admin_logged') === 'true'}
      />
    );
  }

  return (
    <>
      <LandingPage onOpenAdminLogin={() => setShowAdminLoginModal(true)} />

      {/* Admin Login Modal (Hidden 7-Clicks on Logo) */}
      {showAdminLoginModal && (
        <div className="fixed inset-0 z-50 bg-black/85 backdrop-blur-md flex items-center justify-center p-4" dir="rtl">
          <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 w-full max-w-md shadow-2xl space-y-5 text-slate-100 font-sans">
            <div className="flex items-center justify-between pb-2 border-b border-slate-800">
              <h3 className="text-base font-black text-white flex items-center gap-2">
                <span>🔐</span>
                <span>تسجيل دخول لوحة تحكم الأدمن (سري)</span>
              </h3>
              <button
                onClick={() => {
                  setShowAdminLoginModal(false);
                  setAdminError(null);
                }}
                className="text-slate-400 hover:text-white text-lg font-bold cursor-pointer"
              >
                ×
              </button>
            </div>

            <form onSubmit={handleAdminLogin} className="space-y-4">
              {adminError && (
                <div className="bg-rose-950/80 border border-rose-500 text-rose-200 text-xs px-4 py-2.5 rounded-xl font-bold">
                  {adminError}
                </div>
              )}
              <div>
                <label className="block text-xs font-bold text-slate-300 mb-1">اسم المستخدم</label>
                <input
                  type="text"
                  value={adminUsername}
                  onChange={(e) => setAdminUsername(e.target.value)}
                  className="w-full bg-slate-800 border border-slate-700 rounded-xl px-4 py-2.5 text-xs text-white focus:outline-none focus:border-emerald-500 font-mono"
                  placeholder="admin"
                  required
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-300 mb-1">كلمة المرور</label>
                <input
                  type="password"
                  value={adminPassword}
                  onChange={(e) => setAdminPassword(e.target.value)}
                  className="w-full bg-slate-800 border border-slate-700 rounded-xl px-4 py-2.5 text-xs text-white focus:outline-none focus:border-emerald-500 font-mono"
                  placeholder="••••••••"
                  required
                />
              </div>

              <button
                type="submit"
                className="w-full bg-emerald-600 hover:bg-emerald-500 text-white font-black py-3 rounded-xl text-xs shadow-lg shadow-emerald-900/50 transition cursor-pointer"
              >
                دخول لوحة التحكم
              </button>
            </form>
          </div>
        </div>
      )}
    </>
  );
}
