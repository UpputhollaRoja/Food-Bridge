import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function formatHydrationDate(dateInput: string | Date | null | undefined): string {
  if (!dateInput) return ""
  const d = new Date(dateInput)
  if (isNaN(d.getTime())) return ""
  const day = d.getDate()
  const month = d.getMonth() + 1
  const year = d.getFullYear()
  return `${day}/${month}/${year}`
}

export function formatHydrationTime(dateInput: string | Date | null | undefined): string {
  if (!dateInput) return ""
  const d = new Date(dateInput)
  if (isNaN(d.getTime())) return ""
  let hours = d.getHours()
  const minutes = String(d.getMinutes()).padStart(2, '0')
  const ampm = hours >= 12 ? 'PM' : 'AM'
  hours = hours % 12
  hours = hours ? hours : 12 // 0 should be 12
  return `${String(hours).padStart(2, '0')}:${minutes} ${ampm}`
}
