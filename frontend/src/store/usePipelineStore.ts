import { create } from 'zustand';

type PipelineStatus = 'idle' | 'running' | 'complete' | 'error';

interface PipelineState {
  status: PipelineStatus;
  score: number | null;
  critique: string | null;
  logs: string[];
  setStatus: (status: PipelineStatus) => void;
  setResult: (score: number, critique: string) => void;
  addLog: (log: string) => void;
  reset: () => void;
}

export const usePipelineStore = create<PipelineState>((set) => ({
  status: 'idle',
  score: null,
  critique: null,
  logs: [],
  setStatus: (status) => set({ status }),
  setResult: (score, critique) => set({ score, critique, status: 'complete' }),
  addLog: (log) => set((state) => ({ logs: [...state.logs, log] })),
  reset: () => set({ status: 'idle', score: null, critique: null, logs: [] })
}));
