import React from 'react';
import { useApp } from '../../context/AppContext';
import { CheckCircle2, AlertTriangle, AlertCircle, Info, X } from 'lucide-react';

const ToastContainer = () => {
  const { toasts, removeToast } = useApp();

  if (!toasts || toasts.length === 0) return null;

  return (
    <div className="fixed bottom-5 right-5 z-50 flex flex-col gap-2.5 max-w-sm w-full pointer-events-none">
      {toasts.map((toast) => {
        const isSuccess = toast.type === 'success';
        const isError = toast.type === 'error';
        const isWarning = toast.type === 'warning';

        return (
          <div
            key={toast.id}
            className={`pointer-events-auto flex items-start gap-3 p-4 rounded-xl border backdrop-blur-md shadow-2xl transition-all duration-300 animate-slide-up ${
              isSuccess
                ? 'bg-navy-900/95 border-emerald-500/40 text-emerald-300 shadow-emerald-950/40'
                : isError
                ? 'bg-navy-900/95 border-rose-500/40 text-rose-300 shadow-rose-950/40'
                : isWarning
                ? 'bg-navy-900/95 border-amber-500/40 text-amber-300 shadow-amber-950/40'
                : 'bg-navy-900/95 border-sky-500/40 text-sky-300 shadow-sky-950/40'
            }`}
          >
            <div className="mt-0.5 shrink-0">
              {isSuccess && <CheckCircle2 className="w-5 h-5 text-emerald-400" />}
              {isError && <AlertCircle className="w-5 h-5 text-rose-400" />}
              {isWarning && <AlertTriangle className="w-5 h-5 text-amber-400" />}
              {!isSuccess && !isError && !isWarning && <Info className="w-5 h-5 text-sky-400" />}
            </div>

            <div className="flex-1 text-sm">
              {toast.title && <div className="font-semibold text-slate-100">{toast.title}</div>}
              <div className="text-slate-300 text-xs mt-0.5 leading-relaxed">{toast.message}</div>
            </div>

            <button
              onClick={() => removeToast(toast.id)}
              className="text-slate-400 hover:text-slate-200 transition-colors p-1"
              aria-label="Dismiss notification"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        );
      })}
    </div>
  );
};

export default ToastContainer;

