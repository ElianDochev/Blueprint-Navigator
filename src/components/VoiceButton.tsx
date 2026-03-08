interface VoiceButtonProps {
  supported: boolean;
  listening: boolean;
  disabled?: boolean;
  onToggle: () => Promise<void>;
}

export function VoiceButton({ supported, listening, disabled, onToggle }: VoiceButtonProps) {
  if (!supported) {
    return (
      <section className="rounded-2xl bg-white p-4 shadow-sm">
        <p className="text-sm text-slate-600">Voice search is unavailable in this browser.</p>
      </section>
    );
  }

  return (
    <section className="rounded-2xl bg-white p-4 shadow-sm">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <p className="text-sm text-brand-900">Use voice commands for cross-project plan lookup.</p>
        <button
          type="button"
          onClick={() => {
            void onToggle();
          }}
          disabled={disabled}
          className={`rounded-lg px-4 py-2 text-sm font-medium text-white ${
            listening ? "bg-brand-900 hover:bg-brand-950" : "bg-accent hover:brightness-95"
          } disabled:cursor-not-allowed disabled:opacity-60`}
        >
          {listening ? "Stop Listening" : "Start Voice"}
        </button>
      </div>
    </section>
  );
}
