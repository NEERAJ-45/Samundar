'use client';

import { AlertTriangle, X } from 'lucide-react';
import { Toaster as HotToaster, toast as hotToast } from 'react-hot-toast';
import { AlertCircle, CheckCircle2, Info, X, XCircle } from 'lucide-react';

type ToastVariant = 'default' | 'success' | 'error' | 'info' | 'destructive';

type ToastOptions = {
  title?: string;
  description?: string;
  variant?: ToastVariant;
  duration?: number;
};

const style = document.createElement('style');
style.textContent = `
  .toast-enter {
    animation: toastSlideIn 0.3s cubic-bezier(0.16, 1, 0.3, 1);
  }
  .toast-exit {
    animation: toastSlideOut 0.2s ease-in forwards;
  }
  @keyframes toastSlideIn {
    from { transform: translateX(24px) scale(0.95); opacity: 0; }
    to { transform: translateX(0) scale(1); opacity: 1; }
  }
  @keyframes toastSlideOut {
    from { transform: translateX(0) scale(1); opacity: 1; }
    to { transform: translateX(24px) scale(0.95); opacity: 0; }
  }
`;
if (typeof document !== 'undefined') document.head.appendChild(style);

const variantConfig: Record<ToastVariant, { icon: React.ReactNode; border: string; bg: string; text: string; iconColor: string }> = {
  default: {
    icon: <Info className="h-4 w-4" />,
    border: 'border-zinc-700/60',
    bg: 'bg-zinc-900/95',
    text: 'text-zinc-100',
    iconColor: 'text-zinc-400',
  },
  success: {
    icon: <CheckCircle2 className="h-4 w-4" />,
    border: 'border-emerald-700/50',
    bg: 'bg-emerald-950/90',
    text: 'text-emerald-100',
    iconColor: 'text-emerald-400',
  },
  error: {
    icon: <XCircle className="h-4 w-4" />,
    border: 'border-red-700/50',
    bg: 'bg-red-950/90',
    text: 'text-red-100',
    iconColor: 'text-red-400',
  },
  info: {
    icon: <Info className="h-4 w-4" />,
    border: 'border-blue-700/50',
    bg: 'bg-blue-950/90',
    text: 'text-blue-100',
    iconColor: 'text-blue-400',
  },
  destructive: {
    icon: <AlertCircle className="h-4 w-4" />,
    border: 'border-red-700/50',
    bg: 'bg-red-950/90',
    text: 'text-red-100',
    iconColor: 'text-red-400',
  },
};

let counter = 0;

function toast({ title, description, variant = 'default', duration = 4000 }: ToastOptions) {
  const id = `toast-${++counter}`;
  const cfg = variantConfig[variant];

  hotToast.custom(
    (t) => (
      <div
        className={`${t.visible ? 'toast-enter' : 'toast-exit'} flex items-start gap-3 rounded-xl border px-4 py-3 shadow-xl backdrop-blur-md ${
          cfg.bg
        } ${cfg.border}`}
        style={{ minWidth: 300, maxWidth: 380 }}
      >
<span className={`mt-0.5 shrink-0 ${cfg.iconColor}`}>
          {cfg.icon}
        </span>
        <div className="flex-1 min-w-0">
          {title && <div className={`text-sm font-semibold leading-snug ${cfg.text}`}>{title}</div>}
          {description && <div className="mt-0.5 text-xs leading-relaxed text-zinc-400">{description}</div>}
        </div>
        <button
          onClick={() => hotToast.dismiss(t.id)}
          className="-mr-1.5 -mt-1.5 flex h-6 w-6 shrink-0 items-center justify-center rounded-lg text-zinc-500 hover:text-zinc-300 hover:bg-zinc-800/80 transition-colors"
        >
<X className="h-3.5 w-3.5" />
        </button>
      </div>
    ),
    { id, duration }
  );

  return {
    id,
    dismiss: () => hotToast.dismiss(id),
  };
}

function Toaster() {
  return (
    <HotToaster
      position="top-right"
      gutter={10}
      containerStyle={{ top: 16, right: 16 }}
      toastOptions={{
        duration: 4000,
        style: {
          background: 'transparent',
          boxShadow: 'none',
          padding: 0,
        },
      }}
    />
  );
}

toast.success = (title: string, description?: string) => toast({ title, description, variant: 'success' });
toast.error = (title: string, description?: string) => toast({ title, description, variant: 'error' });

export { toast, Toaster };
export type { ToastVariant, ToastOptions };
