import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import React, { useState, useRef } from "react";
import MaskEditor from "./MaskEditor";
const ChatArea = ({ session, onUpdateHistory, onOpenModal, modalImageIndex, onCloseModal, }) => {
    const [prompt, setPrompt] = useState("");
    const [imageFile, setImageFile] = useState(null);
    const [submitting, setSubmitting] = useState(false);
    const [modalMask, setModalMask] = useState(null); // Mask for modal
    const [maskEdited, setMaskEdited] = useState(false);
    const [uploadError, setUploadError] = useState(null);
    const fileInputRef = useRef(null);
    if (!session) {
        return (_jsx("main", { className: "chat-area", children: _jsx("div", { className: "chat-history", style: { color: "#aaa", fontStyle: "italic" }, children: "No session selected." }) }));
    }
    const handlePromptChange = (e) => setPrompt(e.target.value);
    const handleImageChange = (e) => {
        setUploadError(null);
        if (e.target.files && e.target.files[0]) {
            const file = e.target.files[0];
            // Validate type
            if (!file.type.startsWith("image/")) {
                setUploadError("Only image files are allowed.");
                if (fileInputRef.current)
                    fileInputRef.current.value = "";
                return;
            }
            // Validate size (<5MB)
            if (file.size > 5 * 1024 * 1024) {
                setUploadError("Image file must be less than 5MB.");
                if (fileInputRef.current)
                    fileInputRef.current.value = "";
                return;
            }
            // Optionally validate dimensions
            const img = new window.Image();
            img.onload = () => {
                if (img.width < 32 || img.height < 32) {
                    setUploadError("Image is too small (min 32x32px).");
                    if (fileInputRef.current)
                        fileInputRef.current.value = "";
                    return;
                }
                setImageFile(file);
            };
            img.onerror = () => {
                setUploadError("Invalid or corrupted image file.");
                if (fileInputRef.current)
                    fileInputRef.current.value = "";
            };
            img.src = URL.createObjectURL(file);
        }
    };
    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!prompt.trim() && !imageFile && !maskEdited)
            return;
        setSubmitting(true);
        // Prepare message
        const userMsg = {
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
                const assistantMsg = {
                    id: `${Date.now()}-assistant`,
                    role: "assistant",
                    content: "Image generated.",
                    image: data.image,
                    timestamp: Date.now(),
                };
                onUpdateHistory([...newHistory, assistantMsg]);
            }
            else {
                const errorMsg = {
                    id: `${Date.now()}-error`,
                    role: "assistant",
                    content: data.error || "Failed to generate image.",
                    timestamp: Date.now(),
                };
                onUpdateHistory([...newHistory, errorMsg]);
            }
        }
        catch (err) {
            const errorMsg = {
                id: `${Date.now()}-error`,
                role: "assistant",
                content: "Network or server error.",
                timestamp: Date.now(),
            };
            onUpdateHistory([...newHistory, errorMsg]);
        }
        finally {
            setPrompt("");
            setImageFile(null);
            setModalMask(null);
            setMaskEdited(false);
            if (fileInputRef.current)
                fileInputRef.current.value = "";
            setSubmitting(false);
        }
    };
    // Utility: file to base64
    function fileToBase64(file) {
        return new Promise((resolve, reject) => {
            const reader = new FileReader();
            reader.onload = () => resolve(reader.result);
            reader.onerror = reject;
            reader.readAsDataURL(file);
        });
    }
    // Find all assistant messages with images for modal navigation
    const imageMessages = session.history.filter((m) => m.image);
    return (_jsxs("main", { className: "chat-area", children: [_jsx("div", { className: "chat-history", children: session.history.length === 0 ? (_jsx("div", { style: { color: "#aaa", fontStyle: "italic" }, children: "No messages yet." })) : (session.history.map((msg, idx) => (_jsx("div", { style: {
                        marginBottom: "1rem",
                        textAlign: msg.role === "user" ? "right" : "left",
                    }, children: _jsxs("div", { style: {
                            display: "inline-block",
                            background: msg.role === "user" ? "#ececf1" : "#f7f7f8",
                            borderRadius: 8,
                            padding: "0.5rem 1rem",
                            maxWidth: "70%",
                            wordBreak: "break-word",
                        }, children: [msg.content, msg.image && (_jsx("div", { style: { marginTop: 8 }, children: _jsx("img", { src: msg.image, alt: "Generated", style: {
                                        maxWidth: 180,
                                        maxHeight: 180,
                                        borderRadius: 6,
                                        cursor: "pointer",
                                        border: "1px solid #ccc",
                                    }, tabIndex: 0, onClick: () => {
                                        const imageIdx = imageMessages.findIndex((m) => m.id === msg.id);
                                        if (imageIdx !== -1)
                                            onOpenModal(imageIdx);
                                    }, onKeyDown: (e) => {
                                        if (e.key === "Enter" || e.key === " ") {
                                            const imageIdx = imageMessages.findIndex((m) => m.id === msg.id);
                                            if (imageIdx !== -1)
                                                onOpenModal(imageIdx);
                                        }
                                    } }) }))] }) }, msg.id)))) }), _jsxs("form", { className: "prompt-input-section", onSubmit: handleSubmit, style: { display: "flex", gap: "0.5rem" }, children: [_jsx("input", { type: "text", placeholder: "Type your prompt...", value: prompt, onChange: handlePromptChange, style: { flex: 1, borderRadius: 4, border: "1px solid #ececf1", padding: "0.5rem" }, "aria-label": "Prompt input", disabled: submitting }), _jsx("input", { type: "file", accept: "image/*", ref: fileInputRef, onChange: handleImageChange, "aria-label": "Upload image", disabled: submitting }), _jsx("button", { type: "submit", className: "new-session-btn", disabled: submitting || (!prompt.trim() && !imageFile), style: { minWidth: 100 }, children: submitting ? "Submitting..." : "Send" }), uploadError && (_jsx("div", { style: { color: "#c00", marginLeft: 8, alignSelf: "center" }, children: uploadError }))] }), modalImageIndex !== null && imageMessages[modalImageIndex] && (_jsx(ImageModal, { image: imageMessages[modalImageIndex].image, onClose: () => {
                    setModalMask(null);
                    setMaskEdited(false);
                    onCloseModal();
                }, onPrev: () => {
                    setModalMask(null);
                    setMaskEdited(false);
                    if (modalImageIndex > 0)
                        onOpenModal(modalImageIndex - 1);
                }, onNext: () => {
                    setModalMask(null);
                    setMaskEdited(false);
                    if (modalImageIndex < imageMessages.length - 1)
                        onOpenModal(modalImageIndex + 1);
                }, canPrev: modalImageIndex > 0, canNext: modalImageIndex < imageMessages.length - 1, mask: modalMask, onMaskChange: (mask) => {
                    setModalMask(mask);
                    setMaskEdited(!!mask);
                } }))] }));
};
const ImageModal = ({ image, onClose, onPrev, onNext, canPrev, canNext, mask, onMaskChange, }) => {
    // Keyboard navigation
    React.useEffect(() => {
        const handler = (e) => {
            if (e.key === "ArrowLeft" && canPrev)
                onPrev();
            if (e.key === "ArrowRight" && canNext)
                onNext();
            if (e.key === "Escape")
                onClose();
        };
        window.addEventListener("keydown", handler);
        return () => window.removeEventListener("keydown", handler);
    }, [canPrev, canNext, onPrev, onNext, onClose]);
    return (_jsx("div", { style: {
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
        }, tabIndex: -1, "aria-modal": "true", role: "dialog", onClick: onClose, children: _jsxs("div", { style: {
                background: "#fff",
                borderRadius: 8,
                padding: 24,
                position: "relative",
                maxWidth: "90vw",
                maxHeight: "90vh",
                boxShadow: "0 2px 16px rgba(0,0,0,0.3)",
            }, onClick: (e) => e.stopPropagation(), children: [_jsx("img", { src: image, alt: "High resolution", style: { maxWidth: "70vw", maxHeight: "70vh", borderRadius: 8 } }), _jsx("div", { style: { marginTop: 16, textAlign: "center" }, children: _jsx(MaskEditor, { image: image, onMaskChange: onMaskChange ? onMaskChange : () => { } }) }), _jsx("button", { onClick: onClose, style: {
                        position: "absolute",
                        top: 8,
                        right: 8,
                        background: "#444654",
                        color: "#fff",
                        border: "none",
                        borderRadius: 4,
                        padding: "0.25rem 0.75rem",
                        cursor: "pointer",
                    }, "aria-label": "Close modal", children: "\u00D7" }), _jsx("button", { onClick: onPrev, disabled: !canPrev, style: {
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
                    }, "aria-label": "Previous image", children: "<" }), _jsx("button", { onClick: onNext, disabled: !canNext, style: {
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
                    }, "aria-label": "Next image", children: ">" })] }) }));
};
export default ChatArea;
