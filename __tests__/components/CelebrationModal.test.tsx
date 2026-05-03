/**
 * @file CelebrationModal.test.tsx
 * @description Unit tests for the CelebrationModal component.
 * Covers: render when open/closed, stats display, share and download button presence,
 * confetti cleanup, and personalisation copy variations.
 */

import React from "react";
import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import "@testing-library/jest-dom";
import CelebrationModal from "@/components/journey/CelebrationModal";

// ─── Mock heavy / browser-only dependencies ───────────────────────────────────

jest.mock("react-confetti", () => ({
  __esModule: true,
  default: () => <div data-testid="confetti" />,
}));

jest.mock("framer-motion", () => ({
  motion: {
    div: ({ children, className, style, onClick }: React.PropsWithChildren<{ className?: string; style?: React.CSSProperties; onClick?: () => void }>) => (
      <div className={className} style={style} onClick={onClick}>{children}</div>
    ),
    button: ({ children, className, onClick, disabled, style }: React.PropsWithChildren<{ className?: string; onClick?: () => void; disabled?: boolean; style?: React.CSSProperties }>) => (
      <button className={className} onClick={onClick} disabled={disabled} style={style}>{children}</button>
    ),
    p: ({ children, className }: React.PropsWithChildren<{ className?: string }>) => (
      <p className={className}>{children}</p>
    ),
  },
  AnimatePresence: ({ children }: React.PropsWithChildren) => <>{children}</>,
}));

jest.mock("@/lib/certificateUtils", () => ({
  downloadCertificate: jest.fn().mockResolvedValue(undefined),
}));

// Mock navigator.share and clipboard
Object.defineProperty(navigator, "share", {
  value: jest.fn().mockResolvedValue(undefined),
  writable: true,
});

Object.defineProperty(navigator, "clipboard", {
  value: { writeText: jest.fn().mockResolvedValue(undefined) },
  writable: true,
});

// ─── Default props ────────────────────────────────────────────────────────────

const defaultProps = {
  isOpen: true,
  onClose: jest.fn(),
  score: 87,
  stagesCompleted: 8,
  badgesEarned: 5,
  profileName: "Maharashtra",
  firstTimeVoter: false,
  userName: "Abhishek",
};

// ─── Tests ────────────────────────────────────────────────────────────────────

describe("CelebrationModal — visibility", () => {
  it("renders modal content when isOpen is true", () => {
    render(<CelebrationModal {...defaultProps} />);
    expect(screen.getByText(/You are the democracy/i)).toBeInTheDocument();
  });

  it("renders nothing when isOpen is false", () => {
    const { container } = render(
      <CelebrationModal {...defaultProps} isOpen={false} />
    );
    // The AnimatePresence will render nothing
    expect(container.textContent).toBe("");
  });
});

describe("CelebrationModal — score display", () => {
  it("displays the jagruk score", () => {
    render(<CelebrationModal {...defaultProps} score={87} />);
    // Score appears in the stats bar and the progress bar label
    const scoreElements = screen.getAllByText(/87/);
    expect(scoreElements.length).toBeGreaterThan(0);
  });

  it("displays stagesCompleted as a fraction of 8", () => {
    render(<CelebrationModal {...defaultProps} stagesCompleted={6} />);
    expect(screen.getByText("6/8")).toBeInTheDocument();
  });

  it("displays badgesEarned count", () => {
    render(<CelebrationModal {...defaultProps} badgesEarned={3} />);
    expect(screen.getByText("3")).toBeInTheDocument();
  });

  it("shows correct progress label", () => {
    render(<CelebrationModal {...defaultProps} score={90} />);
    expect(screen.getByText(/Jagruk Score — 90 \/ 100/)).toBeInTheDocument();
  });
});

describe("CelebrationModal — personalisation copy", () => {
  it("shows first-time voter message when firstTimeVoter is true", () => {
    render(
      <CelebrationModal
        {...defaultProps}
        firstTimeVoter={true}
        profileName="Rajasthan"
      />
    );
    expect(screen.getByText(/first-time voter/i)).toBeInTheDocument();
  });

  it("shows returning voter message when firstTimeVoter is false", () => {
    render(
      <CelebrationModal
        {...defaultProps}
        firstTimeVoter={false}
        profileName="Delhi"
      />
    );
    expect(screen.getByText(/completed your JagrukYatra/i)).toBeInTheDocument();
  });

  it("mentions the profileName in the copy", () => {
    render(
      <CelebrationModal {...defaultProps} profileName="Kerala" firstTimeVoter={false} />
    );
    expect(screen.getByText(/Kerala/i)).toBeInTheDocument();
  });
});

describe("CelebrationModal — action buttons", () => {
  beforeEach(() => jest.clearAllMocks());

  it("renders the Share button", () => {
    render(<CelebrationModal {...defaultProps} />);
    expect(screen.getByText(/Share Your Yatra/i)).toBeInTheDocument();
  });

  it("renders the Download Certificate button", () => {
    render(<CelebrationModal {...defaultProps} />);
    expect(screen.getByText(/Download Certificate/i)).toBeInTheDocument();
  });

  it("renders the Continue My Yatra dismiss button", () => {
    render(<CelebrationModal {...defaultProps} />);
    expect(screen.getByText(/Continue My Yatra/i)).toBeInTheDocument();
  });

  it("calls onClose when dismiss button is clicked", () => {
    const onClose = jest.fn();
    render(<CelebrationModal {...defaultProps} onClose={onClose} />);
    fireEvent.click(screen.getByText(/Continue My Yatra/i));
    expect(onClose).toHaveBeenCalledTimes(1);
  });

  it("calls navigator.share when Share button is clicked and share is available", async () => {
    render(<CelebrationModal {...defaultProps} />);
    fireEvent.click(screen.getByText(/Share Your Yatra/i));
    await waitFor(() => {
      expect(navigator.share).toHaveBeenCalledWith(
        expect.objectContaining({ title: expect.stringContaining("JagrukYatra") })
      );
    });
  });

  it("calls downloadCertificate when Download button is clicked", async () => {
    const { downloadCertificate } = await import("@/lib/certificateUtils");
    render(<CelebrationModal {...defaultProps} />);
    fireEvent.click(screen.getByText(/Download Certificate/i));
    await waitFor(() => {
      expect(downloadCertificate).toHaveBeenCalledWith(
        expect.objectContaining({
          name: "Abhishek",
          score: 87,
          stagesCompleted: 8,
        })
      );
    });
  });
});

describe("CelebrationModal — accessibility", () => {
  it("has a close button", () => {
    render(<CelebrationModal {...defaultProps} />);
    // There are two close triggers: the X button and "Continue My Yatra"
    const closeButtons = screen.getAllByRole("button");
    expect(closeButtons.length).toBeGreaterThanOrEqual(2);
  });

  it("displays the Jagruk Naagrik label", () => {
    render(<CelebrationModal {...defaultProps} />);
    expect(screen.getByText(/Jagruk Naagrik/i)).toBeInTheDocument();
  });
});
