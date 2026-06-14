import { create } from 'zustand';

export interface Survey {
  id: string;
  title: string;
  description?: string;
  status: 'draft' | 'published';
  responses_count: number;
  created_at: string;
}

interface SurveyState {
  surveys: Survey[];
  setSurveys: (surveys: Survey[]) => void;
  addSurvey: (survey: Survey) => void;
  removeSurvey: (id: string) => void;
  updateSurvey: (id: string, updated: Partial<Survey>) => void;
}

export const useSurveyStore = create<SurveyState>((set) => ({
  surveys: [],
  setSurveys: (surveys) => set({ surveys }),
  addSurvey: (survey) => set((state) => ({ surveys: [survey, ...state.surveys] })),
  removeSurvey: (id) => set((state) => ({ surveys: state.surveys.filter((s) => s.id !== id) })),
  updateSurvey: (id, updated) =>
    set((state) => ({
      surveys: state.surveys.map((s) => (s.id === id ? { ...s, ...updated } : s)),
    })),
}));
