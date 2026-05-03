import { downloadCertificate } from "@/lib/certificateUtils";

describe("certificateUtils", () => {
  beforeEach(() => {
    // Mock URL.createObjectURL and revokeObjectURL
    global.URL.createObjectURL = jest.fn(() => "blob:http://localhost/test-blob");
    global.URL.revokeObjectURL = jest.fn();
    
    // Mock createElement for canvas and anchor
    const originalCreateElement = document.createElement.bind(document);
    jest.spyOn(document, "createElement").mockImplementation((tagName: string) => {
      if (tagName === "canvas") {
        return {
          width: 0,
          height: 0,
          getContext: jest.fn(() => ({
            fillStyle: "",
            fillRect: jest.fn(),
            createLinearGradient: jest.fn(() => ({
              addColorStop: jest.fn()
            })),
            strokeStyle: "",
            lineWidth: 0,
            strokeRect: jest.fn(),
            save: jest.fn(),
            globalAlpha: 1,
            beginPath: jest.fn(),
            arc: jest.fn(),
            stroke: jest.fn(),
            moveTo: jest.fn(),
            lineTo: jest.fn(),
            restore: jest.fn(),
            font: "",
            textAlign: "",
            fillText: jest.fn(),
          })),
          toBlob: jest.fn((cb) => cb(new Blob(["test"], { type: "image/png" }))),
        } as unknown as HTMLCanvasElement;
      }
      if (tagName === "a") {
        return {
          href: "",
          download: "",
          click: jest.fn(),
        } as unknown as HTMLAnchorElement;
      }
      return originalCreateElement(tagName);
    });
  });

  afterEach(() => {
    jest.restoreAllMocks();
  });

  it("should generate and trigger download of certificate", async () => {
    await downloadCertificate({
      name: "Test User",
      score: 100,
      stagesCompleted: 8,
      profileName: "Maharashtra",
      firstTimeVoter: true
    });
    
    expect(document.createElement).toHaveBeenCalledWith("canvas");
    expect(document.createElement).toHaveBeenCalledWith("a");
    expect(URL.createObjectURL).toHaveBeenCalled();
  });
});
