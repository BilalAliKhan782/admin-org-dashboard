import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

const relativeFormatter = new Intl.RelativeTimeFormat("en", { numeric: "auto" });

export function formatRelativeDate(value: string | Date) {
  const date = value instanceof Date ? value : new Date(value);
  const diffInSeconds = Math.round((date.getTime() - Date.now()) / 1000);
  const divisions: Array<[Intl.RelativeTimeFormatUnit, number]> = [
    ["year", 60 * 60 * 24 * 365],
    ["month", 60 * 60 * 24 * 30],
    ["week", 60 * 60 * 24 * 7],
    ["day", 60 * 60 * 24],
    ["hour", 60 * 60],
    ["minute", 60],
  ];

  for (const [unit, seconds] of divisions) {
    const valueForUnit = Math.trunc(diffInSeconds / seconds);
    if (Math.abs(valueForUnit) >= 1) {
      return relativeFormatter.format(valueForUnit, unit);
    }
  }

  return "just now";
}
