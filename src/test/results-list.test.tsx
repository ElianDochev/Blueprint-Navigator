import { fireEvent, render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import { ResultsList } from "../components/ResultsList";

describe("ResultsList", () => {
  it("renders results and handles click", () => {
    const result = {
      projectId: "project-1",
      projectName: "Tower A",
      fileId: "file-1",
      fileName: "B1-Electrical.pdf",
      pageNumber: 4,
      score: 8.5,
      snippet: "electrical panel schedule"
    };

    const onSelect = vi.fn();
    render(<ResultsList results={[result]} onSelect={onSelect} />);

    fireEvent.click(screen.getByRole("button", { name: /B1-Electrical.pdf/i }));
    expect(onSelect).toHaveBeenCalledWith(result);
  });
});
