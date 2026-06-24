/**
 * Pluggable auth-token store.
 *
 * The auth strategy isn't finalized yet. Today we keep a bearer token in memory
 * with a localStorage fallback (survives reloads). The rest of the app only
 * talks to `tokenStore` — so switching to HttpOnly cookies, refresh tokens, or
 * a different storage later means changing ONLY this file.
 */
const STORAGE_KEY = "cargoland.token";

let inMemoryToken: string | null = null;

function isBrowser() {
  return typeof window !== "undefined";
}

export const tokenStore = {
  get(): string | null {
    if (inMemoryToken) return inMemoryToken;
    if (isBrowser()) {
      inMemoryToken = window.localStorage.getItem(STORAGE_KEY);
    }
    return inMemoryToken;
  },

  set(token: string): void {
    inMemoryToken = token;
    if (isBrowser()) {
      window.localStorage.setItem(STORAGE_KEY, token);
    }
  },

  clear(): void {
    inMemoryToken = null;
    if (isBrowser()) {
      window.localStorage.removeItem(STORAGE_KEY);
    }
  },

  isAuthenticated(): boolean {
    return Boolean(this.get());
  },
};
