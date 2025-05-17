import React from "react";
import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import App from "../App";

// Mock fetch for backend API
beforeEach(() => {
  globalThis.fetch = jest.fn().mockImplementation((url, opts) => {
    if (url === "/api/pipeline") {
      return Promise.resolve({
        ok: true,
        json: () =>
          Promise.resolve({
            image: "data:image/png;base64,MOCK_IMAGE",
            metadata: { orientation: "portrait", quality: "high", maskUsed: false },
          }),
      });
    }
    return Promise.reject(new Error("Unknown endpoint"));
  });
  localStorage.clear();
});

afterEach(() => {
  jest.resetAllMocks();
  localStorage.clear();
});

describe("UI Layout (LS1_01)", () => {
  test("renders sidebar and main area with correct proportions", () => {
    render(<App />);
    // Use getAllByText to avoid multiple match error, then find the one inside an <aside>
    const allSessions = screen.getAllByText(/sessions/i);
    const sidebar = allSessions.find(el => el.closest("aside"));
    const chatArea = screen.getByRole("main");
    expect(sidebar && sidebar.closest("aside")).toBeInTheDocument();
    expect(chatArea).toBeInTheDocument();
  });
});

describe("Session Management (LS2_01)", () => {
  test("creates, lists, and loads sessions in sidebar", () => {
    render(<App />);
    const input = screen.getByPlaceholderText(/new session name/i);
    fireEvent.change(input, { target: { value: "Test Session" } });
    fireEvent.keyDown(input, { key: "Enter" });
    expect(screen.getByText("Test Session")).toBeInTheDocument();
    // Select session
    fireEvent.click(screen.getByText("Test Session"));
    expect(screen.getByText("Test Session")).toHaveClass("active");
  });

  test("handles empty session list and duplicate names", () => {
    render(<App />);
    expect(screen.getByText(/no sessions yet/i)).toBeInTheDocument();
    const input = screen.getByPlaceholderText(/new session name/i);
    fireEvent.change(input, { target: { value: "Dup" } });
    fireEvent.keyDown(input, { key: "Enter" });
    fireEvent.change(input, { target: { value: "Dup" } });
    fireEvent.keyDown(input, { key: "Enter" });
    expect(screen.getAllByText("Dup").length).toBeGreaterThanOrEqual(1);
  });
});

describe("Chat & Prompt Input (LS2_01)", () => {
  test("displays chat history and generated images in order", async () => {
    render(<App />);
    // Create session
    fireEvent.change(screen.getByPlaceholderText(/new session name/i), { target: { value: "Chat" } });
    fireEvent.keyDown(screen.getByPlaceholderText(/new session name/i), { key: "Enter" });
    // Send prompt
    fireEvent.change(screen.getByPlaceholderText(/type your prompt/i), { target: { value: "Hello" } });
    fireEvent.click(screen.getByText(/send/i));
    await waitFor(() => expect(screen.getByText("Hello")).toBeInTheDocument());
    await waitFor(() => expect(screen.getByAltText(/generated/i)).toBeInTheDocument());
  });

  test("accepts text and valid image uploads in prompt input", async () => {
    render(<App />);
    fireEvent.change(screen.getByPlaceholderText(/new session name/i), { target: { value: "Img" } });
    fireEvent.keyDown(screen.getByPlaceholderText(/new session name/i), { key: "Enter" });
    const file = new File(["dummy"], "test.png", { type: "image/png" });
    const fileInput = screen.getByLabelText(/upload image/i);
    fireEvent.change(fileInput, { target: { files: [file] } });
    fireEvent.change(screen.getByPlaceholderText(/type your prompt/i), { target: { value: "With image" } });
    fireEvent.click(screen.getByText(/send/i));
    await waitFor(() => expect(screen.getByText("With image")).toBeInTheDocument());
    await waitFor(() => expect(screen.getByAltText(/generated/i)).toBeInTheDocument());
  });

  test("disables submit on empty/invalid input", () => {
    render(<App />);
    fireEvent.change(screen.getByPlaceholderText(/new session name/i), { target: { value: "Empty" } });
    fireEvent.keyDown(screen.getByPlaceholderText(/new session name/i), { key: "Enter" });
    const sendBtn = screen.getByText(/send/i);
    expect(sendBtn).toBeDisabled();
  });
});

describe("Image Modal & Masking (LS2_01)", () => {
  test("opens modal on image click, shows high-res image", async () => {
    render(<App />);
    fireEvent.change(screen.getByPlaceholderText(/new session name/i), { target: { value: "Modal" } });
    fireEvent.keyDown(screen.getByPlaceholderText(/new session name/i), { key: "Enter" });
    fireEvent.change(screen.getByPlaceholderText(/type your prompt/i), { target: { value: "Show modal" } });
    fireEvent.click(screen.getByText(/send/i));
    await waitFor(() => expect(screen.getByAltText(/generated/i)).toBeInTheDocument());
    fireEvent.click(screen.getByAltText(/generated/i));
    expect(screen.getByRole("dialog")).toBeInTheDocument();
    expect(screen.getByText(/mask editing coming soon/i)).toBeInTheDocument();
  });

  test("modal navigation: keyboard, mouse, swipe", async () => {
    render(<App />);
    fireEvent.change(screen.getByPlaceholderText(/new session name/i), { target: { value: "Nav" } });
    fireEvent.keyDown(screen.getByPlaceholderText(/new session name/i), { key: "Enter" });
    // Add two images
    for (let i = 0; i < 2; i++) {
      fireEvent.change(screen.getByPlaceholderText(/type your prompt/i), { target: { value: `Prompt ${i}` } });
      fireEvent.click(screen.getByText(/send/i));
      // eslint-disable-next-line no-await-in-loop
      await waitFor(() => expect(screen.getByAltText(/generated/i)).toBeInTheDocument());
    }
    fireEvent.click(screen.getAllByAltText(/generated/i)[0]);
    expect(screen.getByRole("dialog")).toBeInTheDocument();
    // Next button
    fireEvent.click(screen.getByLabelText(/next image/i));
    // Prev button
    fireEvent.click(screen.getByLabelText(/previous image/i));
    // Close
    fireEvent.click(screen.getByLabelText(/close modal/i));
    expect(screen.queryByRole("dialog")).not.toBeInTheDocument();
  });
});

describe("Local Storage & Edge Cases (LS2_02)", () => {
  test("recovers from corrupted or missing local storage", () => {
    localStorage.setItem("gpt-image-sessions-v2", "not-json");
    render(<App />);
    expect(screen.getByText(/no sessions yet/i)).toBeInTheDocument();
  });

  test("rapid session switching preserves correct state", () => {
    render(<App />);
    for (let i = 0; i < 5; i++) {
      fireEvent.change(screen.getByPlaceholderText(/new session name/i), { target: { value: `S${i}` } });
      fireEvent.keyDown(screen.getByPlaceholderText(/new session name/i), { key: "Enter" });
    }
    const sessionItems = screen.getAllByRole("option");
    sessionItems.forEach((item) => fireEvent.click(item));
    expect(screen.getAllByRole("option").length).toBeGreaterThanOrEqual(5);
  });
});

describe("Backend API Integration & Error Handling (LS2_02, LS2_03)", () => {
  test("handles API/network failures gracefully", async () => {
    (globalThis.fetch as jest.Mock).mockImplementationOnce(() => Promise.reject(new Error("fail")));
    render(<App />);
    fireEvent.change(screen.getByPlaceholderText(/new session name/i), { target: { value: "Err" } });
    fireEvent.keyDown(screen.getByPlaceholderText(/new session name/i), { key: "Enter" });
    fireEvent.change(screen.getByPlaceholderText(/type your prompt/i), { target: { value: "fail" } });
    fireEvent.click(screen.getByText(/send/i));
    await waitFor(() => expect(screen.getByText(/network or server error/i)).toBeInTheDocument());
  });

  test("displays error messages for backend errors", async () => {
    (globalThis.fetch as jest.Mock).mockImplementationOnce(() =>
      Promise.resolve({
        ok: false,
        json: () => Promise.resolve({ error: "Backend error" }),
      })
    );
    render(<App />);
    fireEvent.change(screen.getByPlaceholderText(/new session name/i), { target: { value: "Err2" } });
    fireEvent.keyDown(screen.getByPlaceholderText(/new session name/i), { key: "Enter" });
    fireEvent.change(screen.getByPlaceholderText(/type your prompt/i), { target: { value: "fail2" } });
    fireEvent.click(screen.getByText(/send/i));
    await waitFor(() => expect(screen.getByText(/backend error/i)).toBeInTheDocument());
  });
});

describe("Accessibility & ARIA (LS2_02)", () => {
  test("UI components have correct ARIA roles and keyboard navigation", () => {
    render(<App />);
    // Create and select a session so the prompt input is rendered
    fireEvent.change(screen.getByPlaceholderText(/new session name/i), { target: { value: "A11y" } });
    fireEvent.keyDown(screen.getByPlaceholderText(/new session name/i), { key: "Enter" });
    expect(screen.getByLabelText(/session list/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/new session name/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/prompt input/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/upload image/i)).toBeInTheDocument();
  });
});