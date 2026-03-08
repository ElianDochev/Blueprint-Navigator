import { FormEvent, useState } from "react";

interface SearchBarProps {
  disabled?: boolean;
  onSearch: (query: string) => void | Promise<void>;
  placeholder?: string;
  actionLabel?: string;
}

export function SearchBar({ disabled, onSearch, placeholder = "Search plans", actionLabel = "Search" }: SearchBarProps) {
  const [query, setQuery] = useState("");

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!query.trim()) {
      return;
    }

    void onSearch(query.trim());
  }

  return (
    <section className="rounded-2xl bg-white p-4 shadow-sm">
      <form onSubmit={handleSubmit} className="flex flex-col gap-2">
        <label className="text-sm text-slate-700" htmlFor="global-search">
          Search drawings
        </label>
        <div className="flex gap-2">
          <input
            id="global-search"
            type="search"
            value={query}
            onChange={(event) => setQuery(event.target.value)}
            placeholder={placeholder}
            className="w-full rounded-lg border border-slate-300 px-3 py-2"
            disabled={disabled}
          />
          <button
            type="submit"
            disabled={disabled || !query.trim()}
            className="rounded-lg bg-accent px-4 py-2 text-sm font-semibold text-white disabled:cursor-not-allowed disabled:opacity-50"
          >
            {actionLabel}
          </button>
        </div>
      </form>
    </section>
  );
}
