import * as React from "react";
import { Button, type ButtonProps } from "@/components/ui/button";
import { cn } from "@/lib/utils";

interface RippleButtonProps extends ButtonProps {
  children: React.ReactNode;
}

export function RippleButton({ children, className, onClick, ...props }: RippleButtonProps) {
  const [ripples, setRipples] = React.useState<Array<{ id: number; x: number; y: number }>>([]);

  function addRipple(event: React.MouseEvent<HTMLButtonElement>) {
    const button = event.currentTarget;
    const rect = button.getBoundingClientRect();
    const id = Date.now();

    setRipples((current) => [
      ...current,
      {
        id,
        x: event.clientX - rect.left,
        y: event.clientY - rect.top,
      },
    ]);

    window.setTimeout(() => {
      setRipples((current) => current.filter((ripple) => ripple.id !== id));
    }, 600);

    onClick?.(event);
  }

  return (
    <Button className={cn("relative overflow-hidden", className)} onClick={addRipple} {...props}>
      {children}
      {ripples.map((ripple) => (
        <span
          key={ripple.id}
          className="pointer-events-none absolute rounded-full bg-white/30 animate-ping"
          style={{
            height: 10,
            left: ripple.x,
            top: ripple.y,
            transform: "translate(-50%, -50%)",
            width: 10,
          }}
        />
      ))}
    </Button>
  );
}
