import React, { Component, ErrorInfo, ReactNode } from 'react';

interface Props {
  children: ReactNode;
}

interface State {
  hasError: boolean;
  error: Error | null;
}

export class ErrorBoundary extends Component<Props, State> {
  public state: State = {
    hasError: false,
    error: null
  };

  public static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  public componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error('Uncaught React Error:', error, errorInfo);
  }

  private handleReset = () => {
    try {
      if ('serviceWorker' in navigator) {
        navigator.serviceWorker.getRegistrations().then((registrations) => {
          for (const reg of registrations) {
            reg.unregister();
          }
          window.location.reload();
        });
      } else {
        window.location.reload();
      }
    } catch {
      window.location.reload();
    }
  };

  public render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col items-center justify-center p-6 text-center font-sans" dir="rtl">
          <div className="bg-slate-900 border border-emerald-500/30 rounded-3xl p-8 max-w-md w-full shadow-2xl space-y-5">
            <div className="w-16 h-16 rounded-2xl bg-emerald-600/20 border border-emerald-500/40 text-emerald-400 flex items-center justify-center mx-auto text-2xl font-bold">
              ⚕️
            </div>
            <div className="space-y-2">
              <h2 className="text-xl font-extrabold text-white">منصة صحتك</h2>
              <p className="text-xs text-slate-300 leading-relaxed font-medium">
                جاري تحديث المنظومة واستعادة البيانات الحية. انقر على الزر أدناه لإعادة تنشيط التطبيق فوراً.
              </p>
            </div>
            <button
              onClick={this.handleReset}
              className="w-full py-3.5 px-6 rounded-2xl bg-gradient-to-r from-emerald-600 via-teal-600 to-emerald-500 text-white font-black text-sm shadow-xl hover:from-emerald-500 hover:to-teal-500 transition cursor-pointer active:scale-98"
            >
              تنشيط التحديث وإعادة التحميل 🔄
            </button>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}
