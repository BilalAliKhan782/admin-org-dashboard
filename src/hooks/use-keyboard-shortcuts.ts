import { useEffect } from "react";
import { useNavigate } from "react-router-dom";

export function useKeyboardShortcuts() {
  const navigate = useNavigate();

  useEffect(() => {
    function handleKeyDown(event: KeyboardEvent) {
      const hasModifier = event.metaKey || event.ctrlKey;

      if (hasModifier && event.key.toLowerCase() === "h") {
        event.preventDefault();
        navigate("/");
      }

      if (hasModifier && event.key.toLowerCase() === "n") {
        event.preventDefault();
        navigate("/organizations/new");
      }
    }

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [navigate]);
}
