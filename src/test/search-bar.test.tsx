import { fireEvent, render, screen } from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";
import { SearchBar } from "../components/SearchBar";

afterEach(() => {
  vi.useRealTimers();
});

describe("SearchBar", () => {
  it("calls onSearch when input changes", () => {
    vi.useFakeTimers();
    const onSearch = vi.fn();

    render(<SearchBar onSearch={onSearch} />);
    fireEvent.change(screen.getByRole("searchbox"), { target: { value: "electrical" } });

    vi.advanceTimersByTime(250);
    expect(onSearch).toHaveBeenCalledWith("electrical");
  });
});
