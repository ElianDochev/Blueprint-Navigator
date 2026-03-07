import { useEffect, useState } from "react";
import { useDebouncedValue } from "../hooks/useDebouncedValue";

interface SearchBarProps {
  disabled?: boolean;
  onSearch: (query: string) => void;
}

export function SearchBar({ disabled, onSearch }: SearchBarProps) {
  const [query, setQuery] = useState("");
  const debouncedQuery = useDebouncedValue(query, 220);

  useEffect(() => {
    onSearch(debouncedQuery);
  }, [debouncedQuery, onSearch]);

  return (
    <section className="rounded-2xl bg-white p-4 shadow-sm">
      <label className="flex flex-col gap-1 text-sm text-slate-700">
        Search drawings
        <input
          type="search"
          value={query}
          onChange={(event) => setQuery(event.target.value)}
          placeholder="Try: electrical panel, open plan building b, A-102"
          className="rounded-lg border border-slate-300 px-3 py-2"
          disabled={disabled}
        />
      </label>
    </section>
  );
}
