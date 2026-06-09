import * as React from "react";
import { Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

interface FABProps {
  onClick: () => void;
  label?: string;
  icon?: React.ReactNode;
  className?: string;
}

export function FAB({ onClick, label = "Create", icon, className }: FABProps) {
  return (
    <Button
      type="button"
      onClick={onClick}
      className={cn(
        "fixed bottom-6 right-6 z-40 h-14 rounded-full shadow-lg transition-all hover:scale-110 hover:shadow-xl md:hidden",
        label ? "px-6" : "w-14",
        className,
      )}
      size="default"
    >
      {icon ?? <Plus className="h-5 w-5" />}
      {label ? <span>{label}</span> : null}
    </Button>
  );
}
