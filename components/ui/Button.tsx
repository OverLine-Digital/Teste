import { ButtonHTMLAttributes, forwardRef } from "react";
import clsx from "clsx";

type Variant = "primary" | "secondary" | "ghost";

type Props = ButtonHTMLAttributes<HTMLButtonElement> & {
  variant?: Variant;
  loading?: boolean;
};

const VARIANT_CLASSES: Record<Variant, string> = {
  primary: "bg-indigo text-stone hover:bg-indigo-dark disabled:bg-indigo/50",
  secondary: "bg-transparent border border-ink text-ink hover:bg-ink hover:text-stone",
  ghost: "bg-transparent text-ink hover:bg-stone-dim",
};

export const Button = forwardRef<HTMLButtonElement, Props>(
  ({ variant = "primary", loading, className, children, disabled, ...props }, ref) => {
    return (
      <button
        ref={ref}
        disabled={disabled || loading}
        className={clsx(
          "font-sans font-medium text-sm rounded-md px-4 py-2.5 transition-colors",
          "disabled:cursor-not-allowed disabled:opacity-60",
          VARIANT_CLASSES[variant],
          className
        )}
        {...props}
      >
        {loading ? "Un instant…" : children}
      </button>
    );
  }
);

Button.displayName = "Button";
