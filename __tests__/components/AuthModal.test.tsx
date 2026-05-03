import { render, screen, fireEvent } from "@testing-library/react";
import "@testing-library/jest-dom";
import AuthModal from "@/components/auth/AuthModal";

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

// Mock Next router
jest.mock("next/navigation", () => ({
  useRouter: () => ({
    push: jest.fn(),
    replace: jest.fn(),
    prefetch: jest.fn(),
  }),
  usePathname: () => "/",
}));

// Mock AuthContext
jest.mock("@/context/AuthContext", () => ({
  useAuth: () => ({
    signIn: jest.fn(),
    signUp: jest.fn(),
    signInWithGoogle: jest.fn(),
    loading: false,
    error: null,
  }),
}));

describe("AuthModal Component", () => {
  it("renders login form by default when defaultTab is login", () => {
    render(<AuthModal isOpen={true} onClose={jest.fn()} defaultTab="login" />);
    // Check if the submit button says "Log In" (the second one)
    const logInButtons = screen.getAllByRole("button", { name: "Log In" });
    expect(logInButtons.length).toBeGreaterThan(0);
  });

  it("switches to signup tab when clicking Sign Up", () => {
    render(<AuthModal isOpen={true} onClose={jest.fn()} defaultTab="login" />);
    const signupTabs = screen.getAllByRole("button", { name: /Sign Up/i });
    fireEvent.click(signupTabs[0]);
    // The submit button should now be Create Account
    expect(screen.getByRole("button", { name: "Create Account" })).toBeInTheDocument();
  });

  it("does not render when isOpen is false", () => {
    const { container } = render(<AuthModal isOpen={false} onClose={jest.fn()} defaultTab="login" />);
    expect(container).toBeEmptyDOMElement();
  });
});
