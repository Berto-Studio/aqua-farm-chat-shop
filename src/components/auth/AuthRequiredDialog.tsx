import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { useAuthPromptStore } from "@/store/authPromptStore";
import { LogIn, UserPlus } from "lucide-react";
import { useLocation, useNavigate } from "react-router-dom";

export default function AuthRequiredDialog() {
  const navigate = useNavigate();
  const location = useLocation();
  const isOpen = useAuthPromptStore((state) => state.isOpen);
  const title = useAuthPromptStore((state) => state.title);
  const description = useAuthPromptStore((state) => state.description);
  const closePrompt = useAuthPromptStore((state) => state.closePrompt);
  const returnTo =
    `${location.pathname}${location.search}${location.hash}` || "/";

  const handleNavigate = (path: "/login" | "/register") => {
    closePrompt();
    navigate(path, { state: { returnTo } });
  };

  return (
    <Dialog
      open={isOpen}
      onOpenChange={(open) => {
        if (!open) {
          closePrompt();
        }
      }}
    >
      <DialogContent className="max-w-md">
        <DialogHeader className="space-y-2">
          <DialogTitle>{title}</DialogTitle>
          <DialogDescription>{description}</DialogDescription>
        </DialogHeader>

        <DialogFooter className="flex-col gap-2 sm:flex-row sm:justify-start sm:space-x-0">
          <Button
            className="w-full sm:w-auto"
            onClick={() => handleNavigate("/login")}
          >
            <LogIn className="mr-2 h-4 w-4" />
            Login
          </Button>
          <Button
            variant="outline"
            className="w-full sm:w-auto"
            onClick={() => handleNavigate("/register")}
          >
            <UserPlus className="mr-2 h-4 w-4" />
            Register
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
