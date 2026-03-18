import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

const rateLimitStore = new Map<string, { count: number; timestamp: number }>();

const WINDOW_MS = 60 * 1000;
const MAX_REQUESTS = 100;

function getClientIP(request: NextRequest): string {
  const forwarded = request.headers.get('x-forwarded-for');
  const ip = forwarded ? forwarded.split(',')[0] : 'anonymous';
  return ip;
}

function cleanOldEntries() {
  const now = Date.now();
  for (const [key, value] of rateLimitStore.entries()) {
    if (now - value.timestamp > WINDOW_MS) {
      rateLimitStore.delete(key);
    }
  }
}

export async function rateLimit(request: NextRequest) {
  const ip = getClientIP(request);
  const now = Date.now();
  
  cleanOldEntries();

  const current = rateLimitStore.get(ip);
  
  if (current) {
    if (now - current.timestamp < WINDOW_MS) {
      if (current.count >= MAX_REQUESTS) {
        return NextResponse.json(
          { error: 'Too many requests, please try again later' },
          { status: 429 }
        );
      }
      current.count++;
    } else {
      rateLimitStore.set(ip, { count: 1, timestamp: now });
    }
  } else {
    rateLimitStore.set(ip, { count: 1, timestamp: now });
  }

  return null;
}

export function getRateLimitHeaders(request: NextRequest) {
  const ip = getClientIP(request);
  const current = rateLimitStore.get(ip);
  
  if (current) {
    return {
      'X-RateLimit-Limit': MAX_REQUESTS.toString(),
      'X-RateLimit-Remaining': Math.max(0, MAX_REQUESTS - current.count).toString(),
      'X-RateLimit-Reset': (current.timestamp + WINDOW_MS).toString(),
    };
  }
  
  return {};
}
