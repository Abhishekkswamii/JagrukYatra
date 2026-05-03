/**
 * @file LanguageContext.test.tsx
 * @description Comprehensive unit tests for the LanguageProvider and useTranslation hook.
 * Covers: initial language state, language toggling, localStorage persistence,
 * t() function, and document.documentElement.lang WCAG compliance sync.
 */

import React from "react";
import { render, screen, act, waitFor, fireEvent } from "@testing-library/react";
import "@testing-library/jest-dom";

import { LanguageProvider, useTranslation } from "@/context/LanguageContext";

// ─── Mock fetch for translation API ──────────────────────────────────────────
const mockFetch = jest.fn();
global.fetch = mockFetch;

// ─── Mock localStorage ────────────────────────────────────────────────────────
const localStorageMock = (() => {
  let store: Record<string, string> = {};
  return {
    getItem: (key: string) => store[key] ?? null,
    setItem: (key: string, value: string) => { store[key] = value; },
    removeItem: (key: string) => { delete store[key]; },
    clear: () => { store = {}; },
  };
})();

Object.defineProperty(window, "localStorage", { value: localStorageMock });

// ─── Test Consumer Component ──────────────────────────────────────────────────

/**
 * A minimal consumer that exposes all LanguageContext values for assertions.
 */
function TestConsumer({ testKey = "Home" }: { testKey?: string }) {
  const { language, setLanguage, t, isTranslating } = useTranslation();
  return (
    <div>
      <span data-testid="lang">{language}</span>
      <span data-testid="translated">{t(testKey)}</span>
      <span data-testid="translating">{isTranslating.toString()}</span>
      <button
        data-testid="toggle"
        onClick={() => setLanguage(language === "en" ? "hi" : "en")}
      >
        Toggle
      </button>
    </div>
  );
}

function renderWithProvider(ui: React.ReactNode = <TestConsumer />) {
  return render(<LanguageProvider>{ui}</LanguageProvider>);
}

// ─── Tests ────────────────────────────────────────────────────────────────────

beforeEach(() => {
  localStorageMock.clear();
  document.documentElement.lang = "";
  mockFetch.mockReset();
});

describe("LanguageProvider — initial state", () => {
  it("defaults to English when no localStorage value is set", async () => {
    renderWithProvider();
    await waitFor(() => {
      expect(screen.getByTestId("lang").textContent).toBe("en");
    });
  });

  it("sets document.documentElement.lang to 'en' on mount", async () => {
    renderWithProvider();
    await waitFor(() => {
      expect(document.documentElement.lang).toBe("en");
    });
  });

  it("restores language to 'hi' from localStorage on mount", async () => {
    localStorageMock.setItem("jagrukyatra_lang", "hi");
    renderWithProvider();
    await waitFor(() => {
      expect(screen.getByTestId("lang").textContent).toBe("hi");
    });
  });

  it("starts with isTranslating = false", async () => {
    renderWithProvider();
    await waitFor(() => {
      expect(screen.getByTestId("translating").textContent).toBe("false");
    });
  });
});

describe("LanguageProvider — setLanguage()", () => {
  it("switches language from en to hi on toggle click", async () => {
    renderWithProvider();
    act(() => {
      fireEvent.click(screen.getByTestId("toggle"));
    });
    expect(screen.getByTestId("lang").textContent).toBe("hi");
  });

  it("switches language from hi back to en on second toggle", async () => {
    renderWithProvider();
    act(() => {
      fireEvent.click(screen.getByTestId("toggle")); // en → hi
    });
    act(() => {
      fireEvent.click(screen.getByTestId("toggle")); // hi → en
    });
    expect(screen.getByTestId("lang").textContent).toBe("en");
  });

  it("persists the chosen language in localStorage", async () => {
    renderWithProvider();
    act(() => {
      fireEvent.click(screen.getByTestId("toggle")); // → hi
    });
    expect(localStorageMock.getItem("jagrukyatra_lang")).toBe("hi");
  });

  it("updates document.documentElement.lang to 'hi' when language changes", async () => {
    renderWithProvider();
    act(() => {
      fireEvent.click(screen.getByTestId("toggle")); // → hi
    });
    expect(document.documentElement.lang).toBe("hi");
  });

  it("updates document.documentElement.lang back to 'en' on toggle back", async () => {
    renderWithProvider();
    act(() => {
      fireEvent.click(screen.getByTestId("toggle")); // → hi
    });
    act(() => {
      fireEvent.click(screen.getByTestId("toggle")); // → en
    });
    expect(document.documentElement.lang).toBe("en");
  });
});

describe("t() translation function", () => {
  it("returns the original English text when language is 'en'", async () => {
    renderWithProvider(<TestConsumer testKey="Election" />);
    await waitFor(() => {
      expect(screen.getByTestId("translated").textContent).toBe("Election");
    });
  });

  it("falls back to original text when Hindi translation is not yet loaded", async () => {
    // fetch never resolves — simulates slow API
    mockFetch.mockReturnValue(new Promise(() => {}));
    renderWithProvider(<TestConsumer testKey="Home" />);
    act(() => {
      fireEvent.click(screen.getByTestId("toggle")); // → hi
    });
    // Falls back to original while translation is pending
    expect(screen.getByTestId("translated").textContent).toBe("Home");
  });

  it("returns cached Hindi translation immediately from localStorage", async () => {
    localStorageMock.setItem(
      "jagrukyatra_dynamic_translations_hi",
      JSON.stringify({ Vote: "मत दें" })
    );
    localStorageMock.setItem("jagrukyatra_lang", "hi");

    renderWithProvider(<TestConsumer testKey="Vote" />);

    await waitFor(() => {
      expect(screen.getByTestId("translated").textContent).toBe("मत दें");
    });
  });

  it("returns empty string unchanged", async () => {
    renderWithProvider(<TestConsumer testKey="" />);
    await waitFor(() => {
      expect(screen.getByTestId("translated").textContent).toBe("");
    });
  });
});

describe("useTranslation — error boundary", () => {
  it("throws a descriptive error when used outside LanguageProvider", () => {
    const consoleSpy = jest.spyOn(console, "error").mockImplementation(() => {});

    function BareConsumer() {
      useTranslation();
      return null;
    }

    expect(() => render(<BareConsumer />)).toThrow(
      "useTranslation must be used within a LanguageProvider"
    );

    consoleSpy.mockRestore();
  });
});
