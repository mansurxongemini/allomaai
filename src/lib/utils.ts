import type { UIMessage } from 'ai';
import { type ClassValue, clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';

/**
 * Tailwind klasslarini birlashtiruvchi universal funksiya.
 * Ham Landing Page, ham v0.dev dashboard komponentlari uchun ishlaydi.
 */
export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export const getCurrentYear = (): number => {
  return new Date().getFullYear();
};

/**
 * AI chat mantiqi uchun foydalanuvchining oxirgi xabarini olish.
 */
export function getMostRecentUserMessage(messages: Array<UIMessage>) {
  const userMessages = messages.filter((message) => message.role === 'user');
  return userMessages.at(-1);
}

/**
 * Global xatolarni matn ko'rinishiga o'tkazish.
 */
export function errorHandler(error: unknown) {
  if (error == null) {
    return 'noma’lum xatolik';
  }

  if (typeof error === 'string') {
    return error;
  }

  if (error instanceof Error) {
    return error.message;
  }

  return JSON.stringify(error);
}

/**
 * UI modal yoki sidebar ochilganda ekran siljishini hisoblash uchun.
 */
export function getScrollBarWidth() {
  if (typeof window === 'undefined') return 0;
  return window.innerWidth - document.documentElement.clientWidth;
}