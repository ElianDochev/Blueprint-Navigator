import { fireEvent, render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import { ImportPanel } from "../components/ImportPanel";

describe("ImportPanel", () => {
  it("shows validation error when project name is missing", async () => {
    const onImport = vi.fn().mockResolvedValue(undefined);
    const { container } = render(<ImportPanel importing={false} progress={null} onImport={onImport} />);

    const input = container.querySelector('input[type="file"]') as HTMLInputElement;
    const file = new File(["data"], "plan.pdf", { type: "application/pdf" });

    fireEvent.change(input, { target: { files: [file] } });

    expect(await screen.findByText(/Project name is required/i)).toBeInTheDocument();
    expect(onImport).not.toHaveBeenCalled();
  });
});
