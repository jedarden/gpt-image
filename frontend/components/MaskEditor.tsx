import React, { useRef, useEffect, useState } from "react";

/**
 * MaskEditor component: Two-canvas overlay for drawing/erasing a mask on an image.
 * - User can draw (add mask), erase (remove mask), and reset.
 * - Exports mask as base64 PNG (same dimensions as image).
 * - Shows user feedback for mask submission.
 */
interface MaskEditorProps {
  image: string; // Base64 image to display under mask
  onMaskChange: (maskBase64: string | null) => void; // Called when mask changes
}

const CANVAS_SIZE = 512; // Default canvas size for mask (will scale to image)

const MaskEditor: React.FC<MaskEditorProps> = ({ image, onMaskChange }) => {
  const imageCanvasRef = useRef<HTMLCanvasElement>(null);
  const maskCanvasRef = useRef<HTMLCanvasElement>(null);
  const [drawing, setDrawing] = useState(false);
  const [mode, setMode] = useState<"draw" | "erase">("draw");
  const [maskChanged, setMaskChanged] = useState(false);
  const [feedback, setFeedback] = useState<null | { type: "success" | "error"; message: string }>(null);

  // Draw image as background (image canvas, never modified after draw)
  useEffect(() => {
    const canvas = imageCanvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;
    const img = new window.Image();
    img.onload = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      ctx.globalAlpha = 1.0;
      ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
    };
    img.src = image;
  }, [image]);

  // Clear mask canvas when image changes
  useEffect(() => {
    const maskCanvas = maskCanvasRef.current;
    if (!maskCanvas) return;
    const maskCtx = maskCanvas.getContext("2d");
    if (!maskCtx) return;
    maskCtx.clearRect(0, 0, maskCanvas.width, maskCanvas.height);
    setMaskChanged(false);
    setFeedback(null);
  }, [image]);

  // Draw/erase mask (on mask canvas only)
  const handlePointerDown = (e: React.PointerEvent<HTMLCanvasElement>) => {
    setDrawing(true);
    drawOrErase(e);
  };
  const handlePointerMove = (e: React.PointerEvent<HTMLCanvasElement>) => {
    if (!drawing) return;
    drawOrErase(e);
  };
  const handlePointerUp = () => {
    setDrawing(false);
    setMaskChanged(true);
    exportMask();
  };

  function drawOrErase(e: React.PointerEvent<HTMLCanvasElement>) {
    const canvas = maskCanvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;
    const rect = canvas.getBoundingClientRect();
    const x = ((e.clientX - rect.left) / rect.width) * canvas.width;
    const y = ((e.clientY - rect.top) / rect.height) * canvas.height;
    ctx.globalAlpha = 1.0;
    ctx.lineCap = "round";
    ctx.lineJoin = "round";
    ctx.lineWidth = 24;
    if (mode === "draw") {
      ctx.globalCompositeOperation = "source-over";
      ctx.strokeStyle = "#00f";
    } else {
      ctx.globalCompositeOperation = "destination-out";
      ctx.strokeStyle = "rgba(0,0,0,1)";
    }
    ctx.beginPath();
    ctx.moveTo(x, y);
    ctx.lineTo(x + 0.1, y + 0.1); // Dot for click
    ctx.stroke();
  }

  // Export mask as base64 PNG (alpha channel only)
  function exportMask() {
    const maskCanvas = maskCanvasRef.current;
    if (!maskCanvas) {
      onMaskChange(null);
      setFeedback({ type: "error", message: "Mask export failed: mask canvas not found." });
      return;
    }
    // Create a mask-only canvas (alpha channel)
    const exportCanvas = document.createElement("canvas");
    exportCanvas.width = maskCanvas.width;
    exportCanvas.height = maskCanvas.height;
    const exportCtx = exportCanvas.getContext("2d");
    if (!exportCtx) {
      onMaskChange(null);
      setFeedback({ type: "error", message: "Mask export failed: context error." });
      return;
    }
    // Copy only the blue mask pixels (drawn by user)
    exportCtx.drawImage(maskCanvas, 0, 0);
    // Optionally, threshold to binary mask
    const imgData = exportCtx.getImageData(0, 0, exportCanvas.width, exportCanvas.height);
    for (let i = 0; i < imgData.data.length; i += 4) {
      // If blue channel is high, set alpha to 255, else 0
      imgData.data[i + 3] = imgData.data[i + 2] > 128 ? 255 : 0;
      imgData.data[i + 0] = 0;
      imgData.data[i + 1] = 0;
      imgData.data[i + 2] = 0;
    }
    exportCtx.putImageData(imgData, 0, 0);
    const maskBase64 = exportCanvas.toDataURL("image/png");
    try {
      onMaskChange(maskBase64);
      setFeedback({ type: "success", message: "Mask submitted successfully." });
    } catch (err) {
      setFeedback({ type: "error", message: "Mask submission failed." });
    }
  }

  // Reset mask
  function handleReset() {
    const maskCanvas = maskCanvasRef.current;
    if (!maskCanvas) return;
    const ctx = maskCanvas.getContext("2d");
    if (!ctx) return;
    ctx.clearRect(0, 0, maskCanvas.width, maskCanvas.height);
    setMaskChanged(false);
    setFeedback(null);
    onMaskChange(null);
  }

  // Compose two-canvas overlay
  return (
    <div
      style={{ textAlign: "center", position: "relative", display: "inline-block" }}
      role="region"
      aria-label="Mask editor"
      tabIndex={-1}
    >
      <div
        style={{
          position: "relative",
          width: CANVAS_SIZE,
          height: CANVAS_SIZE,
          display: "inline-block",
        }}
      >
        <canvas
          ref={imageCanvasRef}
          width={CANVAS_SIZE}
          height={CANVAS_SIZE}
          style={{
            position: "absolute",
            left: 0,
            top: 0,
            zIndex: 1,
            border: "2px solid #00f",
            borderRadius: 8,
            background: "#fff",
            maxWidth: "70vw",
            maxHeight: "70vh",
            pointerEvents: "none", // image canvas is not interactive
            userSelect: "none",
          }}
          tabIndex={-1}
          aria-label="Base image"
          role="img"
        />
        <canvas
          ref={maskCanvasRef}
          width={CANVAS_SIZE}
          height={CANVAS_SIZE}
          style={{
            position: "absolute",
            left: 0,
            top: 0,
            zIndex: 2,
            border: "2px solid #00f",
            borderRadius: 8,
            cursor: mode === "draw" ? "crosshair" : "not-allowed",
            background: "transparent",
            maxWidth: "70vw",
            maxHeight: "70vh",
          }}
          aria-label="Mask drawing canvas. Use mouse or touch to draw or erase mask."
          role="application"
          tabIndex={0}
          onPointerDown={handlePointerDown}
          onPointerMove={handlePointerMove}
          onPointerUp={handlePointerUp}
          onPointerLeave={handlePointerUp}
          onKeyDown={(e) => {
            // Keyboard accessibility: switch mode with D/E, reset with R
            if (e.key === "d" || e.key === "D") setMode("draw");
            if (e.key === "e" || e.key === "E") setMode("erase");
            if (e.key === "r" || e.key === "R") handleReset();
          }}
        />
      </div>
      <div style={{ marginTop: 8 }}>
        <button
          onClick={() => setMode("draw")}
          aria-label="Switch to draw mode"
          style={{
            background: mode === "draw" ? "#00f" : "#ececf1",
            color: mode === "draw" ? "#fff" : "#222",
            border: "none",
            borderRadius: 4,
            padding: "0.25rem 0.75rem",
            marginRight: 8,
            cursor: "pointer",
          }}
        >
          Draw
        </button>
        <button
          onClick={() => setMode("erase")}
          aria-label="Switch to erase mode"
          style={{
            background: mode === "erase" ? "#00f" : "#ececf1",
            color: mode === "erase" ? "#fff" : "#222",
            border: "none",
            borderRadius: 4,
            padding: "0.25rem 0.75rem",
            marginRight: 8,
            cursor: "pointer",
          }}
        >
          Erase
        </button>
        <button
          onClick={handleReset}
          aria-label="Reset mask"
          style={{
            background: "#ececf1",
            color: "#222",
            border: "none",
            borderRadius: 4,
            padding: "0.25rem 0.75rem",
            cursor: "pointer",
          }}
        >
          Reset
        </button>
      </div>
      {maskChanged && (
        <div style={{ marginTop: 8, color: "#00f" }} aria-live="polite">
          Mask edited. Will be submitted with prompt.
        </div>
      )}
      {feedback && (
        <div
          style={{
            marginTop: 8,
            color: feedback.type === "success" ? "#008800" : "#d00",
            fontWeight: "bold",
          }}
          aria-live="polite"
          role={feedback.type === "error" ? "alert" : undefined}
        >
          {feedback.message}
        </div>
      )}
    </div>
  );
};

export default MaskEditor;