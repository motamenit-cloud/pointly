import { InputHTMLAttributes } from "react";

interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  label: string;
  error?: string;
}

export function Input({ label, error, className = "", id, ...props }: InputProps) {
  const inputId = id || label.toLowerCase().replace(/\s+/g, "-");

  return (
    <div className="w-full">
      <label
        htmlFor={inputId}
        className="block text-sm font-medium text-navy mb-1.5"
      >
        {label}
      </label>
      <input
        id={inputId}
        className={`w-full px-4 py-3 rounded-xl border border-navy/15 bg-white text-navy text-sm placeholder:text-text-muted outline-none focus:border-coral focus:ring-2 focus:ring-coral/20 transition-all ${error ? "border-red-400 focus:border-red-400 focus:ring-red-400/20" : ""} ${className}`}
        {...props}
      />
      {error && <p className="mt-1 text-xs text-red-500">{error}</p>}
    </div>
  );
}
