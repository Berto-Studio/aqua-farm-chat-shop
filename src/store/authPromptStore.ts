import { create } from "zustand";

export type AuthPromptOptions = {
  title?: string;
  description?: string;
};

const DEFAULT_AUTH_PROMPT = {
  title: "Login required",
  description: "Please login or register to continue.",
};

type AuthPromptState = {
  isOpen: boolean;
  title: string;
  description: string;
  openPrompt: (options?: AuthPromptOptions) => void;
  closePrompt: () => void;
};

export const useAuthPromptStore = create<AuthPromptState>((set) => ({
  isOpen: false,
  title: DEFAULT_AUTH_PROMPT.title,
  description: DEFAULT_AUTH_PROMPT.description,
  openPrompt: (options) =>
    set({
      isOpen: true,
      title: options?.title ?? DEFAULT_AUTH_PROMPT.title,
      description: options?.description ?? DEFAULT_AUTH_PROMPT.description,
    }),
  closePrompt: () =>
    set({
      isOpen: false,
      title: DEFAULT_AUTH_PROMPT.title,
      description: DEFAULT_AUTH_PROMPT.description,
    }),
}));
