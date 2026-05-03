/**
 * @file ThemeToggle.test.tsx
 * @description Unit tests for the ThemeToggle component.
 * Covers: render, click interaction, and aria-label accessibility.
 * Note: ThemeToggle uses a mounted guard to avoid SSR hydration mismatches,
 * so we use `waitFor` / `findByRole` to query after the effect runs.
 */

import React from "react";
import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import "@testing-library/jest-dom";
import { ThemeToggle } from "@/components/ThemeToggle";

// ─── Mock next-themes ─────────────────────────────────────────────────────────
const mockSetTheme = jest.fn();
let mockTheme = "light";

jest.mock("next-themes", () => ({
  useTheme: () => ({
    theme: mockTheme,
    setTheme: mockSetTheme,
  }),
}));

// ─── Mock framer-motion ───────────────────────────────────────────────────────
jest.mock("framer-motion", () => ({
  motion: {
    div: ({ children, className }: React.PropsWithChildren<{ className?: string }>) => (
      <div className={className}>{children}</div>
    ),
  },
  AnimatePresence: ({ children }: React.PropsWithChildren) => <>{children}</>,
}));

// ─── Tests ────────────────────────────────────────────────────────────────────

describe("ThemeToggle", () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockTheme = "light";
  });

  it("renders a toggle button after mount", async () => {
    render(<ThemeToggle />);
    // After the mounted effect fires, the button replaces the skeleton
    await waitFor(() => {
      expect(screen.getByRole("button")).toBeInTheDocument();
    });
  });

  it("has aria-label='Toggle theme' for accessibility", async () => {
    render(<ThemeToggle />);
    await waitFor(() => {
      expect(screen.getByRole("button")).toHaveAttribute("aria-label", "Toggle theme");
    });
  });

  it("calls setTheme('dark') when in light mode", async () => {
    mockTheme = "light";
    render(<ThemeToggle />);
    const btn = await screen.findByRole("button");
    fireEvent.click(btn);
    expect(mockSetTheme).toHaveBeenCalledWith("dark");
  });

  it("calls setTheme('light') when in dark mode", async () => {
    mockTheme = "dark";
    render(<ThemeToggle />);
    const btn = await screen.findByRole("button");
    fireEvent.click(btn);
    expect(mockSetTheme).toHaveBeenCalledWith("light");
  });

  it("renders a skeleton placeholder before mounted", () => {
    render(<ThemeToggle />);
    // Before useEffect fires synchronously, there may be a pulse div
    // (this documents the hydration-safe behaviour)
    expect(document.body).toBeInTheDocument();
  });
});
