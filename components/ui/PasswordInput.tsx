"use client";

import { useState } from "react";
import { Eye, EyeOff } from "lucide-react";
import { Input, type InputProps } from "./Input";
import { cn, FOCUS_RING } from "@/lib/utils";

export function PasswordInput({
  showLabel,
  hideLabel,
  className,
  ref,
  ...props
}: InputProps & { showLabel: string; hideLabel: string }) {
  const [visible, setVisible] = useState(false);

  return (
    <div className="relative">
      <Input ref={ref} type={visible ? "text" : "password"} className={cn("pr-11", className)} {...props} />
      <button
        type="button"
        onClick={() => setVisible((v) => !v)}
        aria-label={visible ? hideLabel : showLabel}
        className={cn(
          "absolute inset-y-0 right-1 flex w-9 items-center justify-center rounded-md text-muted transition-colors hover:text-foreground",
          FOCUS_RING,
        )}
      >
        {visible ? (
          <EyeOff className="h-4 w-4" aria-hidden="true" />
        ) : (
          <Eye className="h-4 w-4" aria-hidden="true" />
        )}
      </button>
    </div>
  );
}
