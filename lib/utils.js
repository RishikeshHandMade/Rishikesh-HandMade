import { clsx } from "clsx";
import { twMerge } from "tailwind-merge"

export function formatDate(dateString) {
  const date = new Date(dateString)
  return new Intl.DateTimeFormat("en-US", {
    year: "numeric",
    month: "long",
    day: "numeric",
  }).format(date)
}

export function cn(...inputs) {
  return twMerge(clsx(inputs));
}
