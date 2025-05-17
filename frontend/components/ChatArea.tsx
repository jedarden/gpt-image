import React, { useState, useRef } from "react";
import { Session, ChatMessage } from "../App";
import MaskEditor from "./MaskEditor";

/**
 * ChatArea component for current session, chat history, and prompt input.
 * - Displays chat history (text and images)
 * - Integrates prompt input and photo upload
 * - Handles image modal for high-res view and mask editing
 */
interface ChatAreaProps {
  session: Session | null;
  onUpdateHistory: (newHistory: ChatMessage[]) => void;
  onOpenModal: (index: number) => void;
  modalImageIndex: number | null;
  onCloseModal: () => void;
}

const ChatArea: React.FC<ChatAreaProps> = ({
  session,
  onUpdateHistory,
  onOpenModal,
  modalImageIndex,
  onCloseModal,
}) => {
  const [prompt, setPrompt] = useState("");
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [modalMask, setModalMask] = useState<string | null>(null); // Mask for modal
  const [maskEdited, setMaskEdited] = useState(false);
  const [uploadError, setUploadError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  if (!session) {
    return (
      <main className="chat-area">
        <div className="chat-history" style={{ color: "#aaa", fontStyle: "italic" }}>
          No session selected.
        </div>
      </main>
    );
  }

  const handlePromptChange = (e: React.ChangeEvent<HTMLInputElement>) => setPrompt(e.target.value);

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setUploadError(null);
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      // Validate type
      if (!file.type.startsWith("image/")) {
        setUploadError("Only image files are allowed.");
        if (fileInputRef.current) fileInputRef.current.value = "";
        return;
      }
      // Validate size (<5MB)
      if (file.size > 5 * 1024 * 1024) {
        setUploadError("Image file must be less than 5MB.");
        if (fileInputRef.current) fileInputRef.current.value = "";
        return;
      }
      // Optionally validate dimensions
      const img = new window.Image();
      img.onload = () => {
        if (img.width < 32 || img.height < 32) {
          setUploadError("Image is too small (min 32x32px).");
          if (fileInputRef.current) fileInputRef.current.value = "";
          return;
        }
        setImageFile(file);
      };
      img.onerror = () => {
        setUploadError("Invalid or corrupted image file.");
        if (fileInputRef.current) fileInputRef.current.value = "";
      };
      img.src = URL.createObjectURL(file);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!prompt.trim() && !imageFile && !maskEdited) return;
    setSubmitting(true);

    // Prepare message
    const userMsg: ChatMessage = {
      id: `${Date.now()}-user`,
      role: "user",
      content: prompt.trim(),
      image: imageFile ? await fileToBase64(imageFile) : undefined,
      timestamp: Date.now(),
    };

    // Add user message to history
    const newHistory = [...session.history, userMsg];
    onUpdateHistory(newHistory);

    // Call backend pipeline
    try {
      const res = await fetch("/api/pipeline", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          prompt: userMsg.content,
          image: userMsg.image,
          mask: maskEdited ? modalMask : undefined,
        }),
      });
      const data = await res.json();
      if (res.ok && data.image) {
        const assistantMsg: ChatMessage = {
          id: `${Date.now()}-assistant`,
          role: "assistant",
          content: "Image generated.",
          image: data.image,
          timestamp: Date.now(),
        };
        onUpdateHistory([...newHistory, assistantMsg]);
      } else {
        const errorMsg: ChatMessage = {
          id: `${Date.now()}-error`,
          role: "assistant",
          content: data.error || "Failed to generate image.",
          timestamp: Date.now(),
        };
        onUpdateHistory([...newHistory, errorMsg]);
      }
    } catch (err) {
      const errorMsg: ChatMessage = {
        id: `${Date.now()}-error`,
        role: "assistant",
        content: "Network or server error.",
        timestamp: Date.now(),
      };
      onUpdateHistory([...newHistory, errorMsg]);
    } finally {
      setPrompt("");
      setImageFile(null);
      setModalMask(null);
      setMaskEdited(false);
      if (fileInputRef.current) fileInputRef.current.value = "";
      setSubmitting(false);
    }
  };

  // Utility: file to base64
  function fileToBase64(file: File): Promise<string> {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => resolve(reader.result as string);
      reader.onerror = reject;
      reader.readAsDataURL(file);
    });
  }

  // Find all assistant messages with images for modal navigation
  const imageMessages = session.history.filter((m) => m.image);

  return (
    <main
      className="chat-area"
      aria-label="Chat area"
      role="main"
      tabIndex={-1}
    >
      <section
        className="chat-history"
        aria-label="Chat history"
        aria-live="polite"
        role="log"
        tabIndex={-1}
        style={{ outline: "none" }}
      >
        {session.history.length === 0 ? (
          <div style={{ color: "#aaa", fontStyle: "italic" }}>No messages yet.</div>
        ) : (
          session.history.map((msg, idx) => (
            <div
              key={msg.id}
              style={{
                marginBottom: "1rem",
                textAlign: msg.role === "user" ? "right" : "left",
              }}
            >
              <div
                style={{
                  display: "inline-block",
                  background: msg.role === "user" ? "#ececf1" : "#f7f7f8",
                  borderRadius: 8,
                  padding: "0.5rem 1rem",
                  maxWidth: "70%",
                  wordBreak: "break-word",
                }}
              >
                {msg.content}
                {msg.image && (
                  <div style={{ marginTop: 8 }}>
                    <img
                      src={msg.image}
                      alt="Generated"
                      style={{
                        maxWidth: 180,
                        maxHeight: 180,
                        borderRadius: 6,
                        cursor: "pointer",
                        border: "1px solid #ccc",
                      }}
                      tabIndex={0}
                      aria-label="Open generated image in modal"
                      onClick={() => {
                        const imageIdx = imageMessages.findIndex((m) => m.id === msg.id);
                        if (imageIdx !== -1) onOpenModal(imageIdx);
                      }}
                      onKeyDown={(e) => {
                        if (e.key === "Enter" || e.key === " ") {
                          const imageIdx = imageMessages.findIndex((m) => m.id === msg.id);
                          if (imageIdx !== -1) onOpenModal(imageIdx);
                        }
                      }}
                    />
                  </div>
                )}
              </div>
            </div>
          ))
        )}
      </section>
      <form className="prompt-input-section" onSubmit={handleSubmit} style={{ display: "flex", gap: "0.5rem" }}>
        <input
          type="text"
          placeholder="Type your prompt..."
          value={prompt}
          onChange={handlePromptChange}
          style={{ flex: 1, borderRadius: 4, border: "1px solid #ececf1", padding: "0.5rem" }}
          aria-label="Prompt input"
          disabled={submitting}
        />
        <input
          type="file"
          accept="image/*"
          ref={fileInputRef}
          onChange={handleImageChange}
          aria-label="Upload image"
          disabled={submitting}
        />
        <button
          type="submit"
          className="new-session-btn"
          disabled={submitting || (!prompt.trim() && !imageFile)}
          style={{ minWidth: 100 }}
        >
          {submitting ? "Submitting..." : "Send"}
        </button>
        {uploadError && (
          <div style={{ color: "#c00", marginLeft: 8, alignSelf: "center" }} role="alert" aria-live="assertive">
            {uploadError}
          </div>
        )}
      </form>
      {/* Image modal */}
      {modalImageIndex !== null && imageMessages[modalImageIndex] && (
        <ImageModal
          image={imageMessages[modalImageIndex].image!}
          onClose={() => {
            setModalMask(null);
            setMaskEdited(false);
            onCloseModal();
          }}
          onPrev={() => {
            setModalMask(null);
            setMaskEdited(false);
            if (modalImageIndex > 0) onOpenModal(modalImageIndex - 1);
          }}
          onNext={() => {
            setModalMask(null);
            setMaskEdited(false);
            if (modalImageIndex < imageMessages.length - 1) onOpenModal(modalImageIndex + 1);
          }}
          canPrev={modalImageIndex > 0}
          canNext={modalImageIndex < imageMessages.length - 1}
          mask={modalMask}
          onMaskChange={(mask) => {
            setModalMask(mask);
            setMaskEdited(!!mask);
          }}
          // Accessibility: focus trap and initial focus
          autoFocus
        />
      )}
    </main>
  );
};

// ImageModal component (inline for simplicity)
interface ImageModalProps {
  image: string;
  onClose: () => void;
  onPrev: () => void;
  onNext: () => void;
  canPrev: boolean;
  canNext: boolean;
  mask?: string | null;
  onMaskChange?: (mask: string | null) => void;
}
const ImageModal: React.FC<ImageModalProps & { autoFocus?: boolean }> = ({
  image,
  onClose,
  onPrev,
  onNext,
  canPrev,
  canNext,
  mask,
  onMaskChange,
  autoFocus,
}) => {
  // Focus trap and initial focus
  const closeBtnRef = React.useRef<HTMLButtonElement>(null);
  const modalRef = React.useRef<HTMLDivElement>(null);

  React.useEffect(() => {
    if (autoFocus && closeBtnRef.current) {
      closeBtnRef.current.focus();
    }
  }, [autoFocus]);

  // Keyboard navigation and focus trap
  React.useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if (e.key === "ArrowLeft" && canPrev) onPrev();
      if (e.key === "ArrowRight" && canNext) onNext();
      if (e.key === "Escape") onClose();

      // Focus trap: Tab/Shift+Tab cycles within modal
      if (e.key === "Tab" && modalRef.current) {
        const focusable = modalRef.current.querySelectorAll<HTMLElement>(
          'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
        );
        if (focusable.length === 0) return;
        const first = focusable[0];
        const last = focusable[focusable.length - 1];
        if (!e.shiftKey && document.activeElement === last) {
          e.preventDefault();
          first.focus();
        } else if (e.shiftKey && document.activeElement === first) {
          e.preventDefault();
          last.focus();
        }
      }
    };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, [canPrev, canNext, onPrev, onNext, onClose]);

  return (
    <div
      style={{
        position: "fixed",
        top: 0,
        left: 0,
        width: "100vw",
        height: "100vh",
        background: "rgba(0,0,0,0.7)",
        zIndex: 1000,
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
      }}
      tabIndex={-1}
      aria-modal="true"
      role="dialog"
      aria-label="Image modal"
      onClick={onClose}
    >
      <div
        ref={modalRef}
        style={{
          background: "#fff",
          borderRadius: 8,
          padding: 24,
          position: "relative",
          maxWidth: "90vw",
          maxHeight: "90vh",
          boxShadow: "0 2px 16px rgba(0,0,0,0.3)",
        }}
        onClick={(e) => e.stopPropagation()}
      >
        <img
          src={image}
          alt="High resolution"
          style={{ maxWidth: "70vw", maxHeight: "70vh", borderRadius: 8 }}
        />
        {/* Mask editor */}
        <div style={{ marginTop: 16, textAlign: "center" }}>
          <div style={{ marginBottom: 12, fontWeight: 500, color: "#444" }}>
            mask editing coming soon
          </div>
          <MaskEditor image={image} onMaskChange={onMaskChange ? onMaskChange : () => {}} />
        </div>
        <button
          ref={closeBtnRef}
          onClick={onClose}
          style={{
            position: "absolute",
            top: 8,
            right: 8,
            background: "#444654",
            color: "#fff",
            border: "none",
            borderRadius: 4,
            padding: "0.25rem 0.75rem",
            cursor: "pointer",
          }}
          aria-label="Close modal"
        >
          ×
        </button>
        <button
          onClick={onPrev}
          disabled={!canPrev}
          style={{
            position: "absolute",
            top: "50%",
            left: 8,
            transform: "translateY(-50%)",
            background: "#ececf1",
            border: "none",
            borderRadius: 4,
            padding: "0.25rem 0.75rem",
            cursor: canPrev ? "pointer" : "not-allowed",
            opacity: canPrev ? 1 : 0.5,
          }}
          aria-label="Previous image"
        >
          {"<"}
        </button>
        <button
          onClick={onNext}
          disabled={!canNext}
          style={{
            position: "absolute",
            top: "50%",
            right: 8,
            transform: "translateY(-50%)",
            background: "#ececf1",
            border: "none",
            borderRadius: 4,
            padding: "0.25rem 0.75rem",
            cursor: canNext ? "pointer" : "not-allowed",
            opacity: canNext ? 1 : 0.5,
          }}
          aria-label="Next image"
        >
          {">"}
        </button>
      </div>
    </div>
  );
};


export default ChatArea;