import React, { createContext, useContext, useState, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { CheckCircle2, AlertCircle, Info, X } from 'lucide-react';
import { cn } from '../../utils/cn';

export type ToastType = 'success' | 'error' | 'info';

export interface ToastItem {
  id: string;
  type: ToastType;
  title: string;
  message?: string;
}

interface ToastContextValue {
  showToast: (type: ToastType, title: string, message?: string) => void;
  removeToast: (id: string) => void;
}

const ToastContext = createContext<ToastContextValue | undefined>(undefined);

export const ToastProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [toasts, setToasts] = useState<ToastItem[]>([]);

  const removeToast = useCallback((id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  }, []);

  const showToast = useCallback((type: ToastType, title: string, message?: string) => {
    const id = Math.random().toString(36).substring(2, 9);
    setToasts((prev) => [...prev, { id, type, title, message }]);

    setTimeout(() => {
      removeToast(id);
    }, 4500);
  }, [removeToast]);

  return (
    <ToastContext.Provider value={{ showToast, removeToast }}>
      {children}
      <div className="fixed bottom-4 right-4 z-50 flex flex-col gap-2 max-w-sm w-full pointer-events-none p-3 sm:p-0">
        <AnimatePresence>
          {toasts.map((toast) => (
            <motion.div
              key={toast.id}
              initial={{ opacity: 0, y: 20, scale: 0.95 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, scale: 0.9, transition: { duration: 0.15 } }}
              className={cn(
                'pointer-events-auto flex items-start gap-3.5 p-4 rounded-card border shadow-xl transition-all duration-200',
                // success = black bg, white text
                toast.type === 'success' && 'bg-ink border-neutral-800 text-white',
                // error = red-tinted
                toast.type === 'error' && 'bg-red-50 border-red-200 text-danger',
                // info = clean paper card
                toast.type === 'info' && 'bg-paper border-border text-ink'
              )}
            >
              <div className="shrink-0 mt-0.5">
                {toast.type === 'success' && <CheckCircle2 className="w-5 h-5 text-emerald-400" />}
                {toast.type === 'error' && <AlertCircle className="w-5 h-5 text-danger" />}
                {toast.type === 'info' && <Info className="w-5 h-5 text-accent-end" />}
              </div>

              <div className="flex-1 min-w-0">
                <h4
                  className={cn(
                    'text-sm font-semibold leading-tight',
                    toast.type === 'success' ? 'text-white' : toast.type === 'error' ? 'text-danger' : 'text-ink'
                  )}
                >
                  {toast.title}
                </h4>
                {toast.message && (
                  <p
                    className={cn(
                      'text-xs mt-1 leading-snug',
                      toast.type === 'success' ? 'text-gray-300' : toast.type === 'error' ? 'text-red-600' : 'text-muted'
                    )}
                  >
                    {toast.message}
                  </p>
                )}
              </div>

              <button
                onClick={() => removeToast(toast.id)}
                className={cn(
                  'shrink-0 p-1 rounded-md transition-colors',
                  toast.type === 'success'
                    ? 'text-gray-400 hover:text-white hover:bg-white/10'
                    : toast.type === 'error'
                    ? 'text-red-400 hover:text-red-700 hover:bg-red-100'
                    : 'text-muted hover:text-ink hover:bg-surface'
                )}
                aria-label="Dismiss toast"
              >
                <X className="w-4 h-4" />
              </button>
            </motion.div>
          ))}
        </AnimatePresence>
      </div>
    </ToastContext.Provider>
  );
};

export const useToast = () => {
  const context = useContext(ToastContext);
  if (!context) {
    throw new Error('useToast must be used within a ToastProvider');
  }
  return context;
};
