import { cn } from "@/lib/utils";

function getPasswordStrength(password: string) {
  let strength = 0;
  if (password.length >= 8) strength += 1;
  if (password.length >= 12) strength += 1;
  if (/[a-z]/.test(password) && /[A-Z]/.test(password)) strength += 1;
  if (/[0-9]/.test(password)) strength += 1;
  if (/[^a-zA-Z0-9]/.test(password)) strength += 1;
  return strength;
}

export function PasswordStrengthIndicator({ password }: { password: string }) {
  const strength = getPasswordStrength(password);
  const strengthLabels = ["Very weak", "Weak", "Fair", "Good", "Strong"];
  const strengthColors = ["bg-red-500", "bg-orange-500", "bg-yellow-500", "bg-blue-500", "bg-emerald-500"];

  if (!password) return null;

  return (
    <div className="space-y-2">
      <div className="flex gap-1">
        {Array.from({ length: 5 }).map((_, index) => (
          <div
            key={index}
            className={cn(
              "h-1 flex-1 rounded-full transition-all",
              index < strength ? strengthColors[Math.max(0, strength - 1)] : "bg-muted",
            )}
          />
        ))}
      </div>
      <p
        className={cn(
          "text-xs",
          strength < 2 && "text-red-500",
          strength === 2 && "text-yellow-600 dark:text-yellow-400",
          strength > 2 && "text-emerald-600 dark:text-emerald-400",
        )}
      >
        {strengthLabels[Math.max(0, strength - 1)]}
      </p>
    </div>
  );
}
