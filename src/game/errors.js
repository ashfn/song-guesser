import { create } from "zustand";

export const useErrorStore = create((set) => ({
  error: null,
  setError: (error) => set({ error }),
  clearError: () => set({ error: null }),
}));