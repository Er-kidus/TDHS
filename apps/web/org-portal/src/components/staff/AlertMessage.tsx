// components/staff/AlertMessage.tsx
// Reusable alert/message components

interface AlertMessageProps {
  type: "error" | "success" | "warning" | "info";
  message: string;
  onDismiss?: () => void;
  autoClose?: boolean;
  duration?: number;
}

export function AlertMessage({
  type,
  message,
  onDismiss,
  autoClose = true,
  duration = 5000,
}: AlertMessageProps) {
  // Auto-close effect
  if (autoClose && onDismiss && duration > 0) {
    // Effect handled by parent component for better control
  }

  const styles = {
    error: "border-red-200 bg-red-50 text-red-700",
    success: "border-green-200 bg-green-50 text-green-700",
    warning: "border-yellow-200 bg-yellow-50 text-yellow-700",
    info: "border-blue-200 bg-blue-50 text-blue-700",
  };

  const icons = {
    error: "✕",
    success: "✓",
    warning: "!",
    info: "ⓘ",
  };

  return (
    <div className={`rounded-lg border p-3 text-sm flex items-start justify-between gap-2 ${styles[type]}`}>
      <div className="flex items-start gap-2">
        <span className="font-bold mt-0.5">{icons[type]}</span>
        <p>{message}</p>
      </div>
      {onDismiss && (
        <button
          onClick={onDismiss}
          className="flex-shrink-0 opacity-70 hover:opacity-100 transition-opacity"
          aria-label="Dismiss message"
        >
          ✕
        </button>
      )}
    </div>
  );
}

interface ErrorAlertProps {
  error: string | null;
  onDismiss?: () => void;
}

export function ErrorAlert({ error, onDismiss }: ErrorAlertProps) {
  if (!error) return null;
  return <AlertMessage type="error" message={error} onDismiss={onDismiss} />;
}

interface SuccessAlertProps {
  message: string | null;
  onDismiss?: () => void;
}

export function SuccessAlert({ message, onDismiss }: SuccessAlertProps) {
  if (!message) return null;
  return <AlertMessage type="success" message={message} onDismiss={onDismiss} />;
}

interface LoadingSpinnerProps {
  size?: "sm" | "md" | "lg";
}

export function LoadingSpinner({ size = "md" }: LoadingSpinnerProps) {
  const sizeClass = {
    sm: "w-4 h-4",
    md: "w-6 h-6",
    lg: "w-8 h-8",
  };

  return (
    <div className={`${sizeClass[size]} animate-spin text-primary`}>
      <svg
        className="w-full h-full"
        xmlns="http://www.w3.org/2000/svg"
        fill="none"
        viewBox="0 0 24 24"
      >
        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
        <path
          className="opacity-75"
          fill="currentColor"
          d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
        />
      </svg>
    </div>
  );
}
