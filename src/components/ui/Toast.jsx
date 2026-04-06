import { useState, createContext, useContext, useCallback } from 'react';
import { CheckCircle2, XCircle, AlertCircle, X } from 'lucide-react';

const ToastContext = createContext();

const icons = {
  success: CheckCircle2,
  error: XCircle,
  info: AlertCircle,
};

const colors = {
  success: 'bg-white border-gray-200 text-gray-900',
  error: 'bg-white border-red-200 text-gray-900',
  info: 'bg-white border-gray-200 text-gray-900',
};

const iconColors = {
  success: 'text-green-500',
  error: 'text-red-500',
  info: 'text-gray-500',
};

export function ToastProvider({ children }) {
  const [toasts, setToasts] = useState([]);

  const addToast = useCallback((message, type = 'success') => {
    const id = Date.now();
    setToasts((prev) => [...prev, { id, message, type }]);
    setTimeout(() => {
      setToasts((prev) => prev.filter((t) => t.id !== id));
    }, 4000);
  }, []);

  const removeToast = useCallback((id) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  }, []);

  return (
    <ToastContext.Provider value={addToast}>
      {children}
      <div className="fixed bottom-4 right-4 z-[100] space-y-2">
        {toasts.map((toast) => {
          const Icon = icons[toast.type];
          return (
            <div
              key={toast.id}
              className={`flex items-center gap-2.5 px-4 py-3 rounded-lg border shadow-md animate-slide-in min-w-[280px] ${colors[toast.type]}`}
            >
              <Icon className={`w-4 h-4 flex-shrink-0 ${iconColors[toast.type]}`} />
              <p className="text-sm flex-1">{toast.message}</p>
              <button onClick={() => removeToast(toast.id)} className="flex-shrink-0 text-gray-400 hover:text-gray-600">
                <X className="w-3.5 h-3.5" />
              </button>
            </div>
          );
        })}
      </div>
    </ToastContext.Provider>
  );
}

export function useToast() {
  return useContext(ToastContext);
}
