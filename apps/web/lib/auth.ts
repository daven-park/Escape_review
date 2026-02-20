import type { User } from '@escape/types';

export interface AuthTokens {
  accessToken: string;
  refreshToken: string;
}

export interface AuthSession {
  user: User;
  tokens: AuthTokens;
}

const STORAGE_KEY = 'escape-review.auth';

function isBrowser(): boolean {
  return typeof window !== 'undefined';
}

export function getSession(): AuthSession | null {
  if (!isBrowser()) {
    return null;
  }

  const raw = window.localStorage.getItem(STORAGE_KEY);

  if (!raw) {
    return null;
  }

  try {
    return JSON.parse(raw) as AuthSession;
  } catch {
    window.localStorage.removeItem(STORAGE_KEY);
    return null;
  }
}

export function setSession(session: AuthSession): void {
  if (!isBrowser()) {
    return;
  }

  window.localStorage.setItem(STORAGE_KEY, JSON.stringify(session));
}

export function clearSession(): void {
  if (!isBrowser()) {
    return;
  }

  window.localStorage.removeItem(STORAGE_KEY);
}

export function getCurrentUser(): User | null {
  return getSession()?.user ?? null;
}

export function getAccessToken(): string | null {
  return getSession()?.tokens.accessToken ?? null;
}

export function getRefreshToken(): string | null {
  return getSession()?.tokens.refreshToken ?? null;
}

export function isAuthenticated(): boolean {
  return Boolean(getAccessToken());
}
