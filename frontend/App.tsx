import React, { useState, useEffect, useRef } from "react";
import Sidebar from "./components/Sidebar";
import ChatArea from "./components/ChatArea";
import "./index.css";

/**
 * Debounce delay for localStorage writes (ms)
 */
const LOCAL_STORAGE_DEBOUNCE = 400;

// Types
export interface ChatMessage {
  id: string;
  role: "user" | "assistant";
  content: string;
  image?: string; // base64 or URL
  mask?: string; // base64 or URL
  timestamp: number;
}

export interface Session {
  id: string;
  name: string;
  history: ChatMessage[];
}

/**
 * Main application layout for GPT-Image-1 UI.
 * - Left: Sidebar (sessions)
 * - Right: Chat area (current session, chat history, images)
 */
const LOCAL_STORAGE_KEY = "gpt-image-sessions-v2";

const App: React.FC = () => {
  // State
  const [sessions, setSessions] = useState<Session[]>([]);
  const [currentSessionId, setCurrentSessionId] = useState<string | null>(null);
  const [modalImageIndex, setModalImageIndex] = useState<number | null>(null);

  // Load from localStorage on mount
  useEffect(() => {
    const data = localStorage.getItem(LOCAL_STORAGE_KEY);
    if (data) {
      try {
        const parsed: Session[] = JSON.parse(data);
        setSessions(parsed);
        if (parsed.length > 0) setCurrentSessionId(parsed[0].id);
      } catch {
        setSessions([]);
        setCurrentSessionId(null);
      }
    }
  }, []);

    // Debounced persist to localStorage on sessions change
    const debounceTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
    const lastSessionsRef = useRef<Session[]>(sessions);
  
    useEffect(() => {
      lastSessionsRef.current = sessions;
      if (debounceTimer.current) clearTimeout(debounceTimer.current);
      debounceTimer.current = setTimeout(() => {
        localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(lastSessionsRef.current));
        debounceTimer.current = null;
      }, LOCAL_STORAGE_DEBOUNCE);
      return () => {
        if (debounceTimer.current) {
          clearTimeout(debounceTimer.current);
          // Flush pending write on unmount
          localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(lastSessionsRef.current));
          debounceTimer.current = null;
        }
      };
      // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [sessions]);

  // Session management handlers
  const createSession = (name?: string) => {
    const newName =
      name ||
      `Session ${sessions.length + 1}${
        sessions.some((s) => s.name === `Session ${sessions.length + 1}`) ? ` (${Date.now()})` : ""
      }`;
    const newSession: Session = {
      id: `${Date.now()}-${Math.random().toString(36).substr(2, 6)}`,
      name: newName,
      history: [],
    };
    setSessions((prev) => [newSession, ...prev]);
    setCurrentSessionId(newSession.id);
  };

  const selectSession = (id: string) => {
    setCurrentSessionId(id);
  };

  const updateSessionHistory = (sessionId: string, newHistory: ChatMessage[]) => {
    setSessions((prev) =>
      prev.map((s) => (s.id === sessionId ? { ...s, history: newHistory } : s))
    );
  };

  // Modal handlers
  const openModal = (index: number) => setModalImageIndex(index);
  const closeModal = () => setModalImageIndex(null);

  // Current session
  const currentSession = sessions.find((s) => s.id === currentSessionId) || null;

  return (
    <div className="gpt-image-app">
      <Sidebar
        sessions={sessions}
        currentSessionId={currentSessionId}
        onCreateSession={createSession}
        onSelectSession={selectSession}
      />
      <ChatArea
        session={currentSession}
        onUpdateHistory={(newHistory) =>
          currentSession && updateSessionHistory(currentSession.id, newHistory)
        }
        onOpenModal={openModal}
        modalImageIndex={modalImageIndex}
        onCloseModal={closeModal}
      />
    </div>
  );
};

export default App;