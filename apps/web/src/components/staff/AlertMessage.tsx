// AlertMessage Component
// Reusable alert/notification component for displaying messages

import React from "react";

interface AlertMessageProps {
  type: "success" | "error" | "warning" | "info";
  message: string;
  onClose?: () => void;
  closeable?: boolean;
}

export default function AlertMessage({
  type,
  message,
  onClose,
  closeable = true,
}: AlertMessageProps) {
  const styles = {
    success: {
      bg: "bg-green-50",
      border: "border-green-200",
      text: "text-green-800",
      icon: "✓",
    },
    error: {
      bg: "bg-red-50",
      border: "border-red-200",
      text: "text-red-800",
      icon: "✕",
    },
    warning: {
      bg: "bg-yellow-50",
      border: "border-yellow-200",
      text: "text-yellow-800",
      icon: "⚠",
    },
    info: {
      bg: "bg-blue-50",
      border: "border-blue-200",
      text: "text-blue-800",
      icon: "ℹ",
    },
  };

  const style = styles[type];

  return (
    <div
      className={`${style.bg} ${style.border} border rounded-md p-4 ${style.text} flex items-start gap-3`}
      role="alert"
    >
      <span className="font-bold text-lg mt-0.5">{style.icon}</span>
      <div className="flex-1 whitespace-pre-wrap text-sm">{message}</div>
      {closeable && onClose && (
        <button
          onClick={onClose}
          className="flex-shrink-0 text-xl font-bold hover:opacity-70"
          aria-label="Close alert"
        >
          ✕
        </button>
      )}
    </div>
  );
}
