"use client";

import { useEffect, useId, useRef } from "react";
import { Button } from "./Button";

/**
 * Accessible confirmation dialog for irreversible or privilege-changing
 * actions (suspend, role change, reject, delete, ...). Built on native
 * <dialog> so focus trapping, Escape-to-cancel, and the top-layer stacking
 * context (immune to ancestor backdrop-filter/transform quirks) come for
 * free from the browser instead of being hand-rolled.
 */
export function ConfirmDialog({
  open,
  title,
  description,
  confirmLabel,
  cancelLabel,
  pendingLabel,
  destructive = false,
  pending = false,
  onConfirm,
  onCancel,
}: {
  open: boolean;
  title: string;
  description: string;
  confirmLabel: string;
  cancelLabel: string;
  pendingLabel?: string;
  destructive?: boolean;
  pending?: boolean;
  onConfirm: () => void;
  onCancel: () => void;
}) {
  const ref = useRef<HTMLDialogElement>(null);
  const titleId = useId();
  const descriptionId = useId();

  useEffect(() => {
    const dialog = ref.current;
    if (!dialog) return;
    if (open && !dialog.open) {
      dialog.showModal();
    } else if (!open && dialog.open) {
      dialog.close();
    }
  }, [open]);

  useEffect(() => {
    const dialog = ref.current;
    if (!dialog) return;

    // Fires on Escape (native) and on dialog.close() (both the imperative
    // call above and this handler's own path) — routing both through
    // onCancel keeps the controlled `open` prop and the DOM in sync.
    function handleClose() {
      onCancel();
    }
    dialog.addEventListener("close", handleClose);
    return () => dialog.removeEventListener("close", handleClose);
  }, [onCancel]);

  return (
    <dialog
      ref={ref}
      aria-labelledby={titleId}
      aria-describedby={descriptionId}
      className="m-auto w-[calc(100vw-2rem)] max-w-sm rounded-2xl border border-border bg-card p-6 text-foreground shadow-lg backdrop:bg-foreground/40 backdrop:backdrop-blur-sm"
      onCancel={(event) => {
        if (pending) event.preventDefault();
      }}
      onClick={(event) => {
        // A click that lands on the <dialog> element itself (not a
        // descendant) is a click on the ::backdrop — dialog has no padding
        // box out there, so this reliably distinguishes backdrop clicks.
        if (event.target === ref.current && !pending) onCancel();
      }}
    >
      <h2 id={titleId} className="font-serif text-lg text-foreground">
        {title}
      </h2>
      <p id={descriptionId} className="mt-2 text-sm text-muted">
        {description}
      </p>
      <div className="mt-6 flex justify-end gap-3">
        <Button type="button" variant="secondary" onClick={onCancel} disabled={pending}>
          {cancelLabel}
        </Button>
        <Button
          type="button"
          variant={destructive ? "destructive" : "primary"}
          onClick={onConfirm}
          disabled={pending}
        >
          {pending ? (pendingLabel ?? confirmLabel) : confirmLabel}
        </Button>
      </div>
    </dialog>
  );
}
