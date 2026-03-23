import { useCallback } from "react";
import {
  useAuthPromptStore,
  type AuthPromptOptions,
} from "@/store/authPromptStore";
import { useUserStore } from "@/store/store";

export const useRequireAuthAction = () => {
  const isLoggedIn = useUserStore((state) => state.isLoggedIn);
  const openPrompt = useAuthPromptStore((state) => state.openPrompt);

  return useCallback(
    (options?: AuthPromptOptions) => {
      if (isLoggedIn) {
        return true;
      }

      openPrompt(options);
      return false;
    },
    [isLoggedIn, openPrompt],
  );
};
