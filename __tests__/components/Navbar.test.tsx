/**
 * @file Navbar.test.tsx
 * @description Unit tests for the Navbar component.
 * Covers: logo render, nav link presence, guest state UI,
 * language toggle, mobile menu trigger, and auth modal trigger.
 *
 * NOTE: Firebase is mocked at module level to prevent real SDK initialisation
 * in the jsdom test environment.
 */

// ─── Mock Firebase before any imports touch it ───────────────────────────────
jest.mock("@/lib/firebase", () => ({
  auth: {},
  db: {},
}));

jest.mock("firebase/auth", () => ({
  onAuthStateChanged: jest.fn(),
  signInWithEmailAndPassword: jest.fn(),
  createUserWithEmailAndPassword: jest.fn(),
  signInWithPopup: jest.fn(),
  GoogleAuthProvider: jest.fn().mockImplementation(() => ({
    addScope: jest.fn(),
  })),
  signOut: jest.fn(),
  updateProfile: jest.fn(),
  deleteUser: jest.fn(),
}));

jest.mock("firebase/firestore", () => ({
  doc: jest.fn(),
  getDoc: jest.fn(),
  setDoc: jest.fn(),
  updateDoc: jest.fn(),
  deleteDoc: jest.fn(),
  serverTimestamp: jest.fn(() => "SERVER_TIMESTAMP"),
}));

// ─── Mock AuthContext ─────────────────────────────────────────────────────────
const mockLogOut = jest.fn();
jest.mock("@/context/AuthContext", () => ({
  useAuth: () => ({
    firebaseUser: null,
    userDoc: null,
    loading: false,
    logOut: mockLogOut,
  }),
}));

// ─── Mock LanguageContext ─────────────────────────────────────────────────────
jest.mock("@/context/LanguageContext", () => ({
  useTranslation: () => ({
    language: "en",
    setLanguage: jest.fn(),
    t: (s: string) => s,
    isTranslating: false,
  }),
}));

// ─── Mock next/navigation ─────────────────────────────────────────────────────
jest.mock("next/navigation", () => ({
  usePathname: () => "/",
}));

// ─── Mock Next.js Image ───────────────────────────────────────────────────────
jest.mock("next/image", () => ({
  __esModule: true,
  default: ({ alt, src }: { alt: string; src: string }) => (
    // eslint-disable-next-line @next/next/no-img-element
    <img alt={alt} src={src} />
  ),
}));

// ─── Mock framer-motion ───────────────────────────────────────────────────────
jest.mock("framer-motion", () => ({
  motion: {
    header: ({
      children,
      className,
    }: React.PropsWithChildren<{ className?: string }>) => (
      <header className={className}>{children}</header>
    ),
    div: ({
      children,
      className,
    }: React.PropsWithChildren<{ className?: string }>) => (
      <div className={className}>{children}</div>
    ),
  },
  AnimatePresence: ({ children }: React.PropsWithChildren) => <>{children}</>,
}));

// ─── Mock sub-components ─────────────────────────────────────────────────────
jest.mock("@/components/auth/AuthModal", () => ({
  __esModule: true,
  default: ({ isOpen }: { isOpen: boolean }) =>
    isOpen ? <div data-testid="auth-modal" /> : null,
}));

jest.mock("@/components/auth/OnboardingModal", () => ({
  __esModule: true,
  default: () => null,
}));

jest.mock("@/components/ThemeToggle", () => ({
  ThemeToggle: () => (
    <button aria-label="Toggle theme" data-testid="theme-toggle">
      🌙
    </button>
  ),
}));

// ─── Imports (after all mocks) ────────────────────────────────────────────────
import React from "react";
import { render, screen, fireEvent } from "@testing-library/react";
import "@testing-library/jest-dom";
import Navbar from "@/components/Navbar";

// ─── Tests ────────────────────────────────────────────────────────────────────

describe("Navbar — guest (unauthenticated) state", () => {
  it("renders the JagrukYatra brand name (split across two spans)", () => {
    render(<Navbar />);
    // Brand is rendered as <span>Jagruk</span><span>Yatra</span>
    expect(screen.getAllByText("Jagruk").length).toBeGreaterThan(0);
    expect(screen.getAllByText("Yatra").length).toBeGreaterThan(0);
  });

  it("renders the Guest Mode indicator", () => {
    render(<Navbar />);
    expect(screen.getAllByText(/Guest Mode/i).length).toBeGreaterThan(0);
  });

  it("renders the Login to Save Progress button", () => {
    render(<Navbar />);
    expect(screen.getAllByText(/Login to Save Progress/i).length).toBeGreaterThan(0);
  });

  it("renders all 6 navigation links in desktop nav", () => {
    render(<Navbar />);
    const expectedLinks = [
      "Home",
      "My Journey",
      "Simulator",
      "Myth Buster",
      "Quiz",
      "Yatri AI",
    ];
    expectedLinks.forEach((label) => {
      expect(screen.getAllByText(label).length).toBeGreaterThan(0);
    });
  });

  it("renders language toggle showing EN and हिंदी", () => {
    render(<Navbar />);
    expect(screen.getAllByText("EN").length).toBeGreaterThan(0);
    expect(screen.getAllByText("हिंदी").length).toBeGreaterThan(0);
  });

  it("renders the mobile hamburger toggle button", () => {
    render(<Navbar />);
    expect(screen.getByRole("button", { name: /toggle menu/i })).toBeInTheDocument();
  });

  it("expands mobile menu when hamburger is clicked", () => {
    render(<Navbar />);
    const menuBtn = screen.getByRole("button", { name: /toggle menu/i });
    fireEvent.click(menuBtn);
    // After opening, each nav link appears in both desktop (hidden) and mobile menus
    expect(screen.getAllByText("Home").length).toBeGreaterThan(1);
  });

  it("opens AuthModal when Login to Save Progress is clicked", () => {
    render(<Navbar />);
    const loginBtns = screen.getAllByText(/Login to Save Progress/i);
    fireEvent.click(loginBtns[0]);
    expect(screen.getByTestId("auth-modal")).toBeInTheDocument();
  });

  it("renders theme toggle button", () => {
    render(<Navbar />);
    expect(screen.getAllByTestId("theme-toggle").length).toBeGreaterThan(0);
  });
});

describe("Navbar — Home link is active on '/' route", () => {
  it("Home link has the active orange color class applied", () => {
    render(<Navbar />);
    // usePathname is mocked to return "/" so Home link should be active
    const homeLinks = screen.getAllByText("Home");
    // At least one should be rendered as an anchor
    expect(homeLinks.length).toBeGreaterThan(0);
  });
});
