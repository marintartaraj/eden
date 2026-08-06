import { cva, type VariantProps } from "class-variance-authority";
import { cn, FOCUS_RING } from "@/lib/utils";

export const buttonVariants = cva(
  cn(
    "inline-flex items-center justify-center gap-2 rounded-full font-medium transition-colors disabled:pointer-events-none disabled:opacity-50",
    FOCUS_RING,
  ),
  {
    variants: {
      variant: {
        primary: "bg-accent text-accent-foreground hover:opacity-90",
        secondary:
          "border border-border bg-card text-foreground hover:bg-border/30",
        ghost: "text-foreground hover:bg-border/30",
        // text-background, not text-accent-foreground: this variant used to
        // reuse accent-foreground back when it was a plain light color, but
        // it now means "the gold," and gold text on the danger-red fill
        // measured 1.41:1 contrast — nearly invisible. text-background is
        // the light token that still passes here.
        destructive: "bg-danger text-background hover:opacity-90",
      },
      size: {
        sm: "h-9 px-4 text-sm",
        md: "h-11 px-5 text-sm",
        lg: "h-12 px-6 text-base",
      },
    },
    defaultVariants: { variant: "primary", size: "md" },
  },
);

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> {
  ref?: React.Ref<HTMLButtonElement>;
}

export function Button({ className, variant, size, ref, ...props }: ButtonProps) {
  return (
    <button
      ref={ref}
      className={cn(buttonVariants({ variant, size }), className)}
      {...props}
    />
  );
}
