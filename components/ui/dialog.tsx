"use client";

import type { ComponentPropsWithoutRef } from "react";
import * as DialogPrimitive from "@radix-ui/react-dialog";
import { X } from "lucide-react";
import { cn } from "@/lib/format";

export const Dialog = DialogPrimitive.Root;
export const DialogTrigger = DialogPrimitive.Trigger;
export const DialogClose = DialogPrimitive.Close;

interface DialogContentProps
  extends ComponentPropsWithoutRef<typeof DialogPrimitive.Content> {
  side?: "center" | "right";
  hideClose?: boolean;
}

export function DialogContent({
  side = "center",
  hideClose = false,
  className,
  children,
  ...props
}: DialogContentProps) {
  return (
    <DialogPrimitive.Portal>
      <DialogPrimitive.Overlay className="dialog-overlay fixed inset-0 z-50" />
      <DialogPrimitive.Content
        className={cn(
          "fixed z-50 border-line bg-canvas text-ink focus:outline-none",
          side === "center" &&
            "dialog-content left-1/2 top-1/2 max-h-[90dvh] w-[calc(100%-2rem)] max-w-xl -translate-x-1/2 -translate-y-1/2 overflow-y-auto rounded-xl border p-6",
          side === "right" &&
            "drawer-content inset-y-0 right-0 flex h-dvh w-full max-w-[560px] flex-col border-l",
          className,
        )}
        {...props}
      >
        {children}
        {hideClose ? null : (
          <DialogPrimitive.Close className="absolute right-4 top-4 z-10 flex h-7 w-7 items-center justify-center rounded-md text-faint transition-colors hover:bg-raised hover:text-ink">
            <X size={15} strokeWidth={1.8} />
            <span className="sr-only">Close</span>
          </DialogPrimitive.Close>
        )}
      </DialogPrimitive.Content>
    </DialogPrimitive.Portal>
  );
}

export const DialogTitle = DialogPrimitive.Title;
export const DialogDescription = DialogPrimitive.Description;
