import React, { useState } from "react";
import { Session } from "../App";

/**
 * Sidebar component for session management.
 * - Lists past sessions
 * - Allows selection and creation of sessions
 */
interface SidebarProps {
  sessions: Session[];
  currentSessionId: string | null;
  onCreateSession: (name?: string) => void;
  onSelectSession: (id: string) => void;
}

const Sidebar: React.FC<SidebarProps> = ({
  sessions,
  currentSessionId,
  onCreateSession,
  onSelectSession,
}) => {
  const [newSessionName, setNewSessionName] = useState("");

  const handleCreateSession = () => {
    const trimmed = newSessionName.trim();
    if (trimmed.length > 0) {
      onCreateSession(trimmed);
      setNewSessionName("");
    } else {
      onCreateSession();
    }
  };

  return (
    <aside
      className="sidebar"
      role="complementary"
      aria-label="Session management sidebar"
      tabIndex={-1}
    >
      <div className="sidebar-header">Sessions</div>
      <ul
        className="session-list"
        aria-label="Session list"
        role="listbox"
      >
        {sessions.length === 0 ? (
          <li style={{ color: "#aaa", fontStyle: "italic" }}>No sessions yet</li>
        ) : (
          sessions.map((session) => (
            <li
              key={session.id}
              className={session.id === currentSessionId ? "active" : ""}
              style={{
                background: session.id === currentSessionId ? "#343541" : "transparent",
                borderRadius: "4px",
                padding: "0.5rem",
                cursor: "pointer",
                marginBottom: "0.25rem",
                fontWeight: session.id === currentSessionId ? "bold" : "normal",
              }}
              tabIndex={0}
              role="option"
              aria-selected={session.id === currentSessionId}
              aria-current={session.id === currentSessionId ? "page" : undefined}
              onClick={() => onSelectSession(session.id)}
              onKeyDown={(e) => {
                if (e.key === "Enter" || e.key === " ") onSelectSession(session.id);
                // Arrow key navigation
                if (e.key === "ArrowDown" || e.key === "ArrowUp") {
                  e.preventDefault();
                  const items = Array.from(
                    (e.currentTarget.parentElement?.querySelectorAll('[role="option"]') || []) as NodeListOf<HTMLElement>
                  );
                  const idx = items.findIndex((el) => el === e.currentTarget);
                  let nextIdx = idx;
                  if (e.key === "ArrowDown") nextIdx = (idx + 1) % items.length;
                  if (e.key === "ArrowUp") nextIdx = (idx - 1 + items.length) % items.length;
                  items[nextIdx]?.focus();
                }
              }}
            >
              {session.name}
            </li>
          ))
        )}
      </ul>
      <div style={{ display: "flex", gap: "0.5rem" }}>
        <input
          type="text"
          placeholder="New session name"
          value={newSessionName}
          onChange={(e) => setNewSessionName(e.target.value)}
          style={{
            flex: 1,
            borderRadius: 4,
            border: "1px solid #444654",
            padding: "0.25rem 0.5rem",
            background: "#2a2b32",
            color: "#fff",
          }}
          aria-label="New session name"
          onKeyDown={(e) => {
            if (e.key === "Enter") handleCreateSession();
          }}
        />
        <button
          className="new-session-btn"
          onClick={handleCreateSession}
          aria-label="Create new session"
        >
          New Session
        </button>
      </div>
    </aside>
  );
};

export default Sidebar;