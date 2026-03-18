import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';
import bcrypt from 'crypto-js';
import { v4 as uuidv4 } from 'uuid';

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function formatDate(date: Date | string): string {
  return new Intl.DateTimeFormat('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  }).format(new Date(date));
}

export function formatCurrency(amount: number, currency: string = 'USD'): string {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency,
  }).format(amount);
}

export function truncate(str: string, length: number): string {
  if (str.length <= length) return str;
  return str.slice(0, length) + '...';
}

export function generateId(): string {
  return uuidv4();
}

export function sleep(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

export function sanitizeHtml(html: string): string {
  return html
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;');
}

export function parseJsonSafe<T = any>(json: string, fallback: T): T {
  try {
    return JSON.parse(json);
  } catch {
    return fallback;
  }
}

export function encrypt(text: string, key?: string): string {
  const secret = key || process.env.JWT_SECRET || 'default-secret';
  return bcrypt.AES.encrypt(text, secret).toString();
}

export function decrypt(encrypted: string, key?: string): string {
  const secret = key || process.env.JWT_SECRET || 'default-secret';
  const bytes = bcrypt.AES.decrypt(encrypted, secret);
  return bytes.toString(bcrypt.enc.Utf8);
}

export function getInitials(name: string): string {
  return name
    .split(' ')
    .map((n) => n[0])
    .join('')
    .toUpperCase()
    .slice(0, 2);
}

export function slugify(text: string): string {
  return text
    .toLowerCase()
    .replace(/[^\w\s-]/g, '')
    .replace(/[\s_-]+/g, '-')
    .replace(/^-+|-+$/g, '');
}

export function debounce<T extends (...args: any[]) => any>(
  func: T,
  wait: number
): (...args: Parameters<T>) => void {
  let timeout: NodeJS.Timeout | null = null;

  return (...args: Parameters<T>) => {
    if (timeout) clearTimeout(timeout);
    timeout = setTimeout(() => func(...args), wait);
  };
}

export function throttle<T extends (...args: any[]) => any>(
  func: T,
  limit: number
): (...args: Parameters<T>) => void {
  let inThrottle: boolean;

  return (...args: Parameters<T>) => {
    if (!inThrottle) {
      func(...args);
      inThrottle = true;
      setTimeout(() => (inThrottle = false), limit);
    }
  };
}

export function isValidEmail(email: string): boolean {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
}

export function getPlanFeatures(plan: string): {
  generationsPerDay: number;
  monthlyTokens: number;
  models: string[];
  priority: boolean;
  support: string;
} {
  const features = {
    FREE: {
      generationsPerDay: 5,
      monthlyTokens: 10000,
      models: ['openrouter/claude-3-haiku', 'openrouter/mistral-7b-instruct'],
      priority: false,
      support: 'Community',
    },
    PRO: {
      generationsPerDay: 50,
      monthlyTokens: 100000,
      models: ['gemini-pro', 'gemini-pro-vision', 'openrouter/*'],
      priority: false,
      support: 'Email',
    },
    PREMIUM: {
      generationsPerDay: Infinity,
      monthlyTokens: Infinity,
      models: ['gemini-pro', 'gemini-pro-vision', 'openrouter/*'],
      priority: true,
      support: 'Priority',
    },
  };

  return features[plan as keyof typeof features] || features.FREE;
}

export function getPlanPrice(plan: string): number {
  const prices = {
    FREE: 0,
    PRO: 29,
    PREMIUM: 99,
  };

  return prices[plan as keyof typeof prices] || 0;
}
