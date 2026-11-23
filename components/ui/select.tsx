"use client";

import * as SelectPrimitive from "@radix-ui/react-select";
import { Check, ChevronDown } from "lucide-react";
import { cn } from "@/lib/format";

export interface SelectOption {
  value: string;
  label: string;
  color?: string;
}

export function Select({
  value,
  onValueChange,
  options,
  placeholder = "Select…",
  className,
  id,
  ariaLabel,
}: {
  value: string;
  onValueChange: (value: string) => void;
  options: SelectOption[];
  placeholder?: string;
  className?: string;
  id?: string;
  ariaLabel?: string;
}) {
  return (
    <SelectPrimitive.Root value={value} onValueChange={onValueChange}>
      <SelectPrimitive.Trigger
        id={id}
        aria-label={ariaLabel}
        className={cn(
          "flex h-9 w-full items-center justify-between gap-2 rounded-lg border border-line bg-canvas px-3 text-left text-[13px] text-ink transition-colors hover:border-line-strong focus:border-line-strong focus:outline-none focus:ring-2 focus:ring-accent/25 data-[placeholder]:text-faint",
          className,
        )}
      >
        <SelectPrimitive.Value placeholder={placeholder} />
        <SelectPrimitive.Icon>
          <ChevronDown size={14} className="text-faint" strokeWidth={1.8} />
        </SelectPrimitive.Icon>
      </SelectPrimitive.Trigger>
      <SelectPrimitive.Portal>
        <SelectPrimitive.Content
          position="popper"
          sideOffset={6}
          className="z-[70] max-h-72 min-w-[var(--radix-select-trigger-width)] overflow-hidden rounded-lg border border-line bg-surface p-1 text-ink"
        >
          <SelectPrimitive.Viewport>
            {options.map((option) => (
              <SelectPrimitive.Item
                key={option.value}
                value={option.value}
                className="flex cursor-default select-none items-center gap-2 rounded-md px-2.5 py-1.5 text-[13px] text-muted outline-none data-[highlighted]:bg-raised data-[state=checked]:text-ink"
              >
                {option.color ? (
                  <span
                    className="h-1.5 w-1.5 rounded-full"
                    style={{ background: option.color }}
                  />
                ) : null}
                <SelectPrimitive.ItemText>
                  {option.label}
                </SelectPrimitive.ItemText>
                <SelectPrimitive.ItemIndicator className="ml-auto text-ink">
                  <Check size={13} strokeWidth={2} />
                </SelectPrimitive.ItemIndicator>
              </SelectPrimitive.Item>
            ))}
          </SelectPrimitive.Viewport>
        </SelectPrimitive.Content>
      </SelectPrimitive.Portal>
    </SelectPrimitive.Root>
  );
}
