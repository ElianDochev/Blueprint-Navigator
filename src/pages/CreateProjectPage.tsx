import { FormEvent, useState } from "react";

interface CreateProjectPageProps {
  onCreate: (name: string) => Promise<void>;
  onBack: () => void;
}

export function CreateProjectPage({ onCreate, onBack }: CreateProjectPageProps) {
  const [projectName, setProjectName] = useState("");

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const trimmed = projectName.trim();
    if (!trimmed) {
      return;
    }

    await onCreate(trimmed);
  }

  return (
    <main className="mx-auto flex min-h-screen w-full max-w-3xl flex-col gap-4 p-4 md:p-8">
      <header className="rounded-3xl border border-white/20 bg-white/85 p-5 shadow-lg backdrop-blur">
        <button
          type="button"
          onClick={onBack}
          className="rounded-xl border border-brand-600/30 bg-brand-600/10 px-3 py-1 text-xs font-semibold text-brand-800"
        >
          Back To Dashboard
        </button>
        <h1 className="mt-3 text-2xl font-semibold text-brand-950">Create Project</h1>
        <p className="text-sm text-brand-900/70">Each project has its own image and plan space.</p>
      </header>

      <section className="rounded-3xl border border-white/30 bg-white/85 p-5 shadow-lg backdrop-blur">
        <form className="space-y-3" onSubmit={handleSubmit}>
          <label className="block text-sm text-brand-900" htmlFor="project-name">
            Project name
          </label>
          <input
            id="project-name"
            type="text"
            value={projectName}
            onChange={(event) => setProjectName(event.target.value)}
            placeholder="Tower A Renovation"
            className="w-full rounded-xl border border-brand-600/30 px-3 py-2"
          />
          <button
            type="submit"
            disabled={!projectName.trim()}
            className="rounded-xl bg-brand-700 px-4 py-2 text-sm font-semibold text-white hover:bg-brand-800 disabled:cursor-not-allowed disabled:opacity-50"
          >
            Create And Continue
          </button>
        </form>
      </section>
    </main>
  );
}
