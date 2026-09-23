import clsx from "clsx";

export function OnboardingStepper({ current, total }: { current: number; total: number }) {
  return (
    <div className="flex gap-1.5 mb-6">
      {Array.from({ length: total }).map((_, i) => (
        <div
          key={i}
          className={clsx(
            "h-1.5 flex-1 rounded-full transition-colors",
            i < current ? "bg-indigo" : "bg-line"
          )}
        />
      ))}
    </div>
  );
}
