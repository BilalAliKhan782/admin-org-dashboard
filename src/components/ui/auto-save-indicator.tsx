import { Check, Save } from "lucide-react";
import { cn } from "@/lib/utils";

interface AutoSaveIndicatorProps {
  status: "idle" | "saving" | "saved";
  className?: string;
}

export function AutoSaveIndicator({ status, className }: AutoSaveIndicatorProps) {
  if (status === "idle") return null;

  return (
    <div className={cn("flex items-center gap-2 text-sm text-muted-foreground", className)}>
      {status === "saving" ? (
        <>
          <Save className="h-3.5 w-3.5 animate-pulse" />
          <span>Saving...</span>
        </>
      ) : (
        <>
          <Check className="h-3.5 w-3.5 text-emerald-500" />
          <span className="text-emerald-600 dark:text-emerald-400">Saved</span>
        </>
      )}
    </div>
  );
}
