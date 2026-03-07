interface StatusBannerProps {
  tone: "info" | "success" | "error";
  message: string;
}

export function StatusBanner({ tone, message }: StatusBannerProps) {
  const toneClass =
    tone === "success"
      ? "border-emerald-200 bg-emerald-50 text-emerald-800"
      : tone === "error"
        ? "border-rose-200 bg-rose-50 text-rose-800"
        : "border-sky-200 bg-sky-50 text-sky-800";

  return <div className={`rounded-xl border p-3 text-sm ${toneClass}`}>{message}</div>;
}
