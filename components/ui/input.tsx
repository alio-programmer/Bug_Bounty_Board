import type {
  InputHTMLAttributes,
  TextareaHTMLAttributes,
} from "react";
import { cn } from "@/lib/format";

export const fieldClasses =
  "w-full rounded-lg border border-line bg-canvas px-3 text-[13px] text-ink placeholder:text-faint transition-colors hover:border-line-strong focus:border-line-strong focus:outline-none focus:ring-2 focus:ring-accent/25 disabled:opacity-50";

export function TextInput({
  className,
  ...props
}: InputHTMLAttributes<HTMLInputElement>) {
  return (
    <input className={cn(fieldClasses, "h-9", className)} {...props} />
  );
}

export function Textarea({
  className,
  ...props
}: TextareaHTMLAttributes<HTMLTextAreaElement>) {
  return (
    <textarea
      className={cn(fieldClasses, "min-h-28 resize-y py-2.5 leading-relaxed", className)}
      {...props}
    />
  );
}

export function FieldLabel({
  htmlFor,
  children,
  hint,
}: {
  htmlFor?: string;
  children: React.ReactNode;
  hint?: React.ReactNode;
}) {
  return (
    <div className="mb-1.5 flex items-baseline justify-between gap-3">
      <label
        htmlFor={htmlFor}
        className="font-mono text-[10px] uppercase tracking-[0.14em] text-faint"
      >
        {children}
      </label>
      {hint ? <span className="text-[11px] text-faint">{hint}</span> : null}
    </div>
  );
}
