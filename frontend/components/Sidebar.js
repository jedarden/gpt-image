import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { useState } from "react";
const Sidebar = ({ sessions, currentSessionId, onCreateSession, onSelectSession, }) => {
    const [newSessionName, setNewSessionName] = useState("");
    const handleCreateSession = () => {
        const trimmed = newSessionName.trim();
        if (trimmed.length > 0) {
            onCreateSession(trimmed);
            setNewSessionName("");
        }
        else {
            onCreateSession();
        }
    };
    return (_jsxs("aside", { className: "sidebar", children: [_jsx("div", { className: "sidebar-header", children: "Sessions" }), _jsx("ul", { className: "session-list", "aria-label": "Session list", children: sessions.length === 0 ? (_jsx("li", { style: { color: "#aaa", fontStyle: "italic" }, children: "No sessions yet" })) : (sessions.map((session) => (_jsx("li", { className: session.id === currentSessionId ? "active" : "", style: {
                        background: session.id === currentSessionId ? "#343541" : "transparent",
                        borderRadius: "4px",
                        padding: "0.5rem",
                        cursor: "pointer",
                        marginBottom: "0.25rem",
                        fontWeight: session.id === currentSessionId ? "bold" : "normal",
                    }, tabIndex: 0, "aria-current": session.id === currentSessionId, onClick: () => onSelectSession(session.id), onKeyDown: (e) => {
                        if (e.key === "Enter" || e.key === " ")
                            onSelectSession(session.id);
                    }, children: session.name }, session.id)))) }), _jsxs("div", { style: { display: "flex", gap: "0.5rem" }, children: [_jsx("input", { type: "text", placeholder: "New session name", value: newSessionName, onChange: (e) => setNewSessionName(e.target.value), style: {
                            flex: 1,
                            borderRadius: 4,
                            border: "1px solid #444654",
                            padding: "0.25rem 0.5rem",
                            background: "#2a2b32",
                            color: "#fff",
                        }, "aria-label": "New session name", onKeyDown: (e) => {
                            if (e.key === "Enter")
                                handleCreateSession();
                        } }), _jsx("button", { className: "new-session-btn", onClick: handleCreateSession, "aria-label": "Create new session", children: "New Session" })] })] }));
};
export default Sidebar;
