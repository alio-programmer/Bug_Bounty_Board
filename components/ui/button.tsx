import type { ButtonHTMLAttributes } from "react";
import { cn } from "@/lib/format";

type ButtonVariant = "primary" | "secondary" | "ghost" | "danger";
type ButtonSize = "sm" | "md" | "icon";

export function buttonStyles(
  variant: ButtonVariant = "secondary",
  size: ButtonSize = "md",
  className?: string,
): string {
  return cn(
    "inline-flex select-none items-center justify-center gap-1.5 whitespace-nowrap rounded-lg border text-[13px] font-medium transition-colors disabled:pointer-events-none disabled:opacity-45",
    variant === "primary" &&
      "border-transparent bg-ink text-canvas hover:bg-ink/90",
    variant === "secondary" &&
      "border-line bg-surface text-ink hover:border-line-strong hover:bg-raised",
    variant === "ghost" &&
      "border-transparent bg-transparent text-muted hover:bg-raised hover:text-ink",
    variant === "danger" &&
      "border-critical/30 bg-transparent text-critical hover:border-critical/50 hover:bg-critical/10",
    size === "sm" && "h-8 px-2.5",
    size === "md" && "h-9 px-3.5",
    size === "icon" && "h-9 w-9 p-0",
    className,
  );
}

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: ButtonVariant;
  size?: ButtonSize;
}

export function Button({
  variant = "secondary",
  size = "md",
  className,
  type = "button",
  ...props
}: ButtonProps) {
  return (
    <button
      type={type}
      className={buttonStyles(variant, size, className)}
      {...props}
    />
  );
}
