import { create } from 'zustand'
import type { Session } from '@/types'

interface SessionStore {
  sessions: Session[]
  addSession: (session: Session) => void
  updateSession: (id: string, updates: Partial<Session>) => void
}

export const useSessionStore = create<SessionStore>((set) => ({
  sessions: [],
  addSession: (session) =>
    set((state) => ({ sessions: [session, ...state.sessions] })),
  updateSession: (id, updates) =>
    set((state) => ({
      sessions: state.sessions.map((s) =>
        s.id === id ? { ...s, ...updates } : s
      ),
    })),
}))
