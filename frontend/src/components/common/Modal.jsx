import React, { useEffect } from 'react';
import { X } from 'lucide-react';

const Modal = ({ isOpen, onClose, title, children, maxWidth = 'max-w-2xl' }) => {
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === 'Escape' && isOpen) {
        onClose();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[70] flex items-center justify-center p-2.5 sm:p-6 overflow-y-auto">
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-navy-950/85 backdrop-blur-sm transition-opacity"
        onClick={onClose}
        aria-hidden="true"
      />

      {/* Modal Dialog */}
      <div
        className={`relative w-full ${maxWidth} glass-panel border border-slate-700/80 bg-navy-900/98 shadow-2xl p-4 sm:p-7 z-10 my-auto sm:my-8 rounded-2xl sm:rounded-3xl max-h-[calc(100dvh-2rem)] flex flex-col`}
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between pb-3 sm:pb-4 mb-3 sm:mb-5 border-b border-slate-800 shrink-0">
          <h3 className="text-base sm:text-lg font-bold text-slate-100 flex items-center gap-2 truncate pr-2">
            {title}
          </h3>
          <button
            onClick={onClose}
            className="text-slate-400 hover:text-slate-200 transition-colors p-2 rounded-xl hover:bg-slate-800 shrink-0 min-h-[40px] min-w-[40px] flex items-center justify-center active:scale-95"
            aria-label="Close modal"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="max-h-[calc(100dvh-9rem)] sm:max-h-[75vh] overflow-y-auto pr-1 scrollbar-thin scrollbar-thumb-slate-700">
          {children}
        </div>
      </div>
    </div>
  );
};

export default Modal;

