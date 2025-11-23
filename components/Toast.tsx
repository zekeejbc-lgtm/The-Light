import React, { useEffect } from 'react';

export type ToastType = 'success' | 'error' | 'info' | 'loading';

export interface ToastMessage {
  id: string;
  message: string;
  type: ToastType;
}

interface ToastProps {
  toast: ToastMessage;
  onClose: (id: string) => void;
}

const Toast: React.FC<ToastProps> = ({ toast, onClose }) => {
  useEffect(() => {
    if (toast.type !== 'loading') {
      const timer = setTimeout(() => {
        onClose(toast.id);
      }, 4000);
      return () => clearTimeout(timer);
    }
  }, [toast, onClose]);

  const getStyles = () => {
    // Brutalist styling: high contrast, borders
    switch (toast.type) {
      case 'success':
        return 'bg-[#00e676] text-black border-black';
      case 'error':
        return 'bg-[#ff1744] text-white border-black';
      case 'loading':
        return 'bg-brand-yellow text-black border-black';
      case 'info':
      default:
        return 'bg-brand-cyan text-white border-black';
    }
  };

  const getIcon = () => {
    switch (toast.type) {
      case 'success':
        return <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" /></svg>;
      case 'error':
        return <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M6 18L18 6M6 6l12 12" /></svg>;
      case 'loading':
        return <svg className="w-6 h-6 animate-spin" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" /></svg>;
      default:
        return <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>;
    }
  };

  return (
    <div className={`flex items-center w-full max-w-sm p-4 mb-4 rounded-lg border-2 shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] animate-fade-in-up transition-transform hover:translate-y-[-2px] ${getStyles()}`}>
      <div className="inline-flex items-center justify-center flex-shrink-0 w-8 h-8">
        {getIcon()}
      </div>
      <div className="ml-3 text-sm font-black uppercase tracking-wide flex-1 leading-tight">{toast.message}</div>
      <button type="button" className="ml-auto -mx-1.5 -my-1.5 rounded-lg focus:ring-2 focus:ring-black p-1.5 hover:bg-black/20 inline-flex h-8 w-8 transition-colors items-center justify-center" onClick={() => onClose(toast.id)}>
        <span className="sr-only">Close</span>
        <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}><path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" /></svg>
      </button>
    </div>
  );
};

export default Toast;