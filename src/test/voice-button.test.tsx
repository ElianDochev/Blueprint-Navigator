import { render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import { VoiceButton } from "../components/VoiceButton";

describe("VoiceButton", () => {
  it("shows start and stop states", () => {
    const onToggle = vi.fn().mockResolvedValue(undefined);

    const { rerender } = render(
      <VoiceButton supported listening={false} onToggle={onToggle} />
    );

    expect(screen.getByRole("button", { name: /start voice/i })).toBeInTheDocument();

    rerender(<VoiceButton supported listening onToggle={onToggle} />);
    expect(screen.getByRole("button", { name: /stop listening/i })).toBeInTheDocument();
  });

  it("shows unsupported message", () => {
    const onToggle = vi.fn().mockResolvedValue(undefined);
    render(<VoiceButton supported={false} listening={false} onToggle={onToggle} />);

    expect(screen.getByText(/Voice search is unavailable/i)).toBeInTheDocument();
  });
});
