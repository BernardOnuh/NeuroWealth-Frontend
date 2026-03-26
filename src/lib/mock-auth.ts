"use client";

import { logger } from "./logger";

export interface User {
  id: string;
  email: string;
  name: string;
}

export interface AuthSession {
  user: User;
  token: string;
}

const STORAGE_KEY = "nw_auth_session";

export const mockAuth = {
  signIn: async (email: string, password: string): Promise<AuthSession> => {
    logger.info("Mock sign in attempt", { email });
    // Simulate delay
    await new Promise((resolve) => setTimeout(resolve, 800));

    // Mock validation
    if (password === "password123") {
      const session: AuthSession = {
        user: { id: "u1", email, name: email.split("@")[0] },
        token: "mock-jwt-token-" + Math.random().toString(36).substring(7),
      };
      localStorage.setItem(STORAGE_KEY, JSON.stringify(session));
      return session;
    }
    throw new Error("Invalid email or password");
  },

  signUp: async (email: string, name: string, password: string): Promise<AuthSession> => {
    logger.info("Mock sign up attempt", { email, name });
    await new Promise((resolve) => setTimeout(resolve, 1000));

    const session: AuthSession = {
      user: { id: "u" + Math.random().toString(36).substring(7), email, name },
      token: "mock-jwt-token-" + Math.random().toString(36).substring(7),
    };
    localStorage.setItem(STORAGE_KEY, JSON.stringify(session));
    return session;
  },

  signOut: () => {
    logger.info("Mock sign out");
    localStorage.removeItem(STORAGE_KEY);
  },

  getSession: (): AuthSession | null => {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored) {
      try {
        return JSON.parse(stored);
      } catch (e) {
        return null;
      }
    }
    return null;
  },
};
