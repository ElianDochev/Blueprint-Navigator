interface StatusBannerProps {
  tone: "info" | "success" | "error";
  message: string;
}

export function StatusBanner({ tone, message }: StatusBannerProps) {
  const toneClass =
    tone === "success"
      ? "border-brand-300 bg-brand-50 text-brand-800"
      : tone === "error"
        ? "border-violet-300 bg-violet-50 text-violet-800"
        : "border-brand-300 bg-brand-100/70 text-brand-900";

  return <div className={`rounded-xl border p-3 text-sm ${toneClass}`}>{message}</div>;
}
