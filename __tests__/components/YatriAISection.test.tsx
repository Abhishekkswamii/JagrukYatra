import React from "react";
import { render, screen } from "@testing-library/react";
import "@testing-library/jest-dom";
import YatriAISection from "@/components/YatriAISection";

// Mock framer-motion to avoid animation issues in tests
jest.mock("framer-motion", () => ({
  motion: {
    div: ({ children, className }: React.PropsWithChildren<{ className?: string }>) => <div className={className}>{children}</div>,
    button: ({ children, className, onClick }: React.PropsWithChildren<{ className?: string, onClick?: () => void }>) => (
      <button className={className} onClick={onClick}>
        {children}
      </button>
    ),
  },
  AnimatePresence: ({ children }: React.PropsWithChildren) => <>{children}</>,
}));

// Mock matchMedia
Object.defineProperty(window, "matchMedia", {
  writable: true,
  value: jest.fn().mockImplementation((query) => ({
    matches: false,
    media: query,
    onchange: null,
    addListener: jest.fn(),
    removeListener: jest.fn(),
    addEventListener: jest.fn(),
    removeEventListener: jest.fn(),
    dispatchEvent: jest.fn(),
  })),
});

// Mock the SpeechSynthesis API
Object.defineProperty(window, "speechSynthesis", {
  value: {
    speak: jest.fn(),
    cancel: jest.fn(),
    getVoices: jest.fn(() => []),
  },
  writable: true,
});

window.HTMLElement.prototype.scrollIntoView = jest.fn();

describe("YatriAISection", () => {
  it("renders the AI welcome screen with quick questions", () => {
    render(<YatriAISection />);
    
    // Check for welcome text
    expect(screen.getAllByText(/Yatri AI/i).length).toBeGreaterThan(0);
    
    // Check for quick questions presence
    expect(screen.getAllByText(/How do I register to vote?/i).length).toBeGreaterThan(0);
  });
});
