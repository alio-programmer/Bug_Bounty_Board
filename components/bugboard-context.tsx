"use client";

import {
  createContext,
  useContext,
  useMemo,
  useState,
  type ReactNode,
} from "react";

interface BugBoardContextValue {
  projectPath: string;
  newBugOpen: boolean;
  setNewBugOpen: (open: boolean) => void;
  selectedBugId: string | null;
  openBug: (id: string) => void;
  closeBug: () => void;
  connectOpen: boolean;
  setConnectOpen: (open: boolean) => void;
}

const BugBoardContext = createContext<BugBoardContextValue | null>(null);

export function BugBoardProvider({
  children,
  projectPath,
}: {
  children: ReactNode;
  projectPath: string;
}) {
  const [newBugOpen, setNewBugOpen] = useState(false);
  const [selectedBugId, setSelectedBugId] = useState<string | null>(null);
  const [connectOpen, setConnectOpen] = useState(false);

  const value = useMemo<BugBoardContextValue>(
    () => ({
      projectPath,
      newBugOpen,
      setNewBugOpen,
      selectedBugId,
      openBug: (id: string) => setSelectedBugId(id),
      closeBug: () => setSelectedBugId(null),
      connectOpen,
      setConnectOpen,
    }),
    [connectOpen, newBugOpen, projectPath, selectedBugId],
  );

  return (
    <BugBoardContext.Provider value={value}>
      {children}
    </BugBoardContext.Provider>
  );
}

export function useBugBoard(): BugBoardContextValue {
  const context = useContext(BugBoardContext);
  if (!context) {
    throw new Error("useBugBoard must be used within BugBoardProvider");
  }
  return context;
}
