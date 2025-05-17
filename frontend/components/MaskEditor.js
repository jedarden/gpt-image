import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { useRef, useEffect, useState } from "react";
const CANVAS_SIZE = 512; // Default canvas size for mask (will scale to image)
const MaskEditor = ({ image, onMaskChange }) => {
    const canvasRef = useRef(null);
    const [drawing, setDrawing] = useState(false);
    const [mode, setMode] = useState("draw");
    const [maskChanged, setMaskChanged] = useState(false);
    // Draw image as background
    useEffect(() => {
        const canvas = canvasRef.current;
        if (!canvas)
            return;
        const ctx = canvas.getContext("2d");
        if (!ctx)
            return;
        const img = new window.Image();
        img.onload = () => {
            ctx.clearRect(0, 0, canvas.width, canvas.height);
            ctx.globalAlpha = 1.0;
            ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
            // Draw mask overlay (if any)
            ctx.globalAlpha = 0.4;
            ctx.fillStyle = "#00f";
            ctx.fillRect(0, 0, canvas.width, canvas.height);
            ctx.globalAlpha = 1.0;
        };
        img.src = image;
    }, [image]);
    // Draw/erase mask
    const handlePointerDown = (e) => {
        setDrawing(true);
        drawOrErase(e);
    };
    const handlePointerMove = (e) => {
        if (!drawing)
            return;
        drawOrErase(e);
    };
    const handlePointerUp = () => {
        setDrawing(false);
        setMaskChanged(true);
        exportMask();
    };
    function drawOrErase(e) {
        const canvas = canvasRef.current;
        if (!canvas)
            return;
        const ctx = canvas.getContext("2d");
        if (!ctx)
            return;
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
        }
        else {
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
        const canvas = canvasRef.current;
        if (!canvas) {
            onMaskChange(null);
            return;
        }
        // Create a mask-only canvas (alpha channel)
        const maskCanvas = document.createElement("canvas");
        maskCanvas.width = canvas.width;
        maskCanvas.height = canvas.height;
        const maskCtx = maskCanvas.getContext("2d");
        if (!maskCtx) {
            onMaskChange(null);
            return;
        }
        // Copy only the blue mask pixels (drawn by user)
        maskCtx.drawImage(canvas, 0, 0);
        // Optionally, threshold to binary mask
        const imgData = maskCtx.getImageData(0, 0, maskCanvas.width, maskCanvas.height);
        for (let i = 0; i < imgData.data.length; i += 4) {
            // If blue channel is high, set alpha to 255, else 0
            imgData.data[i + 3] = imgData.data[i + 2] > 128 ? 255 : 0;
            imgData.data[i + 0] = 0;
            imgData.data[i + 1] = 0;
            imgData.data[i + 2] = 0;
        }
        maskCtx.putImageData(imgData, 0, 0);
        const maskBase64 = maskCanvas.toDataURL("image/png");
        onMaskChange(maskBase64);
    }
    // Reset mask
    function handleReset() {
        const canvas = canvasRef.current;
        if (!canvas)
            return;
        const ctx = canvas.getContext("2d");
        if (!ctx)
            return;
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        setMaskChanged(false);
        onMaskChange(null);
    }
    return (_jsxs("div", { style: { textAlign: "center" }, children: [_jsx("canvas", { ref: canvasRef, width: CANVAS_SIZE, height: CANVAS_SIZE, style: {
                    border: "2px solid #00f",
                    borderRadius: 8,
                    cursor: mode === "draw" ? "crosshair" : "not-allowed",
                    background: "#fff",
                    maxWidth: "70vw",
                    maxHeight: "70vh",
                }, onPointerDown: handlePointerDown, onPointerMove: handlePointerMove, onPointerUp: handlePointerUp, onPointerLeave: handlePointerUp }), _jsxs("div", { style: { marginTop: 8 }, children: [_jsx("button", { onClick: () => setMode("draw"), style: {
                            background: mode === "draw" ? "#00f" : "#ececf1",
                            color: mode === "draw" ? "#fff" : "#222",
                            border: "none",
                            borderRadius: 4,
                            padding: "0.25rem 0.75rem",
                            marginRight: 8,
                            cursor: "pointer",
                        }, children: "Draw" }), _jsx("button", { onClick: () => setMode("erase"), style: {
                            background: mode === "erase" ? "#00f" : "#ececf1",
                            color: mode === "erase" ? "#fff" : "#222",
                            border: "none",
                            borderRadius: 4,
                            padding: "0.25rem 0.75rem",
                            marginRight: 8,
                            cursor: "pointer",
                        }, children: "Erase" }), _jsx("button", { onClick: handleReset, style: {
                            background: "#ececf1",
                            color: "#222",
                            border: "none",
                            borderRadius: 4,
                            padding: "0.25rem 0.75rem",
                            cursor: "pointer",
                        }, children: "Reset" })] }), maskChanged && (_jsx("div", { style: { marginTop: 8, color: "#00f" }, children: "Mask edited. Will be submitted with prompt." }))] }));
};
export default MaskEditor;
