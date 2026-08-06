import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

/**
 * The one keyboard-focus ring treatment for every interactive element in
 * the app — originally added to Button.tsx only; standardized here so
 * every hand-rolled button/link gets the same visible focus indicator
 * instead of each one growing its own (or none at all).
 */
export const FOCUS_RING =
  "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent focus-visible:ring-offset-2 focus-visible:ring-offset-background";

/** Same ring, applied via Tailwind's `peer` mechanism — for a visible
 * control (e.g. a styled `<span>`) that represents a visually-hidden
 * (`sr-only`) native input, where the ring must render on the sibling
 * users actually see, not on the input itself. */
export const PEER_FOCUS_RING =
  "peer-focus-visible:outline-none peer-focus-visible:ring-2 peer-focus-visible:ring-accent peer-focus-visible:ring-offset-2 peer-focus-visible:ring-offset-background";
