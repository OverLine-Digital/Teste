import { InputHTMLAttributes, forwardRef } from "react";
import clsx from "clsx";

type Props = InputHTMLAttributes<HTMLInputElement> & {
  label: string;
  error?: string;
};

export const Input = forwardRef<HTMLInputElement, Props>(
  ({ label, error, id, className, ...props }, ref) => {
    const inputId = id ?? props.name;

    return (
      <div className="flex flex-col gap-1.5">
        <label htmlFor={inputId} className="font-sans text-sm font-medium text-ink">
          {label}
        </label>
        <input
          ref={ref}
          id={inputId}
          className={clsx(
            "font-sans text-sm rounded-md border bg-white px-3.5 py-2.5",
            "focus:outline-none focus:ring-2 focus:ring-indigo/40",
            error ? "border-clay" : "border-line",
            className
          )}
          {...props}
        />
        {error && <p className="font-sans text-xs text-clay">{error}</p>}
      </div>
    );
  }
);

Input.displayName = "Input";
