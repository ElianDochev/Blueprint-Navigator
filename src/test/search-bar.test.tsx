import { fireEvent, render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import { SearchBar } from "../components/SearchBar";

describe("SearchBar", () => {
  it("calls onSearch on submit", () => {
    const onSearch = vi.fn();

    render(<SearchBar onSearch={onSearch} />);
    fireEvent.change(screen.getByRole("searchbox"), { target: { value: "electrical" } });
    fireEvent.click(screen.getByRole("button", { name: /search/i }));
    expect(onSearch).toHaveBeenCalledWith("electrical");
  });
});
