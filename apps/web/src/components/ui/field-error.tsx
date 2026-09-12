import React from "react";
import { AlertCircle } from "lucide-react";

interface FieldErrorProps {
  message?: string | null;
  className?: string;
}

export function FieldError({ message, className = "" }: FieldErrorProps) {
  if (!message) return null;

  return (
    <p
      role="alert"
      className={`text-[11px] font-medium text-rose-400 flex items-center gap-1.5 mt-1.5 animate-in fade-in slide-in-from-top-0.5 duration-200 ${className}`}
    >
      <AlertCircle className="h-3.5 w-3.5 shrink-0 text-rose-400" />
      <span>{message}</span>
    </p>
  );
}
