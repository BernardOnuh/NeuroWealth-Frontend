/**
 * User store - Backward compatibility wrapper with test-mode in-memory storage
 *
 * In production, delegates to PostgreSQL repository.
 * In tests (NODE_ENV==='test'), uses an in-memory store and exposes _test helpers.
 */

import { randomUUID } from 'crypto';
import type {
  OnboardingStep as RepoOnboardingStep,
  Strategy as RepoStrategy,
  User as RepoUser,
} from './userRepository';
import * as repo from './userRepository';

export type OnboardingStep = RepoOnboardingStep;
export type Strategy = RepoStrategy;
export type User = RepoUser;

const IS_TEST = process.env.NODE_ENV === 'test';

// ─── Test-mode in-memory store ───────────────────────────────────────────────
let TEST_USERS: User[] = [];

async function test_findUserByPhone(phone: string): Promise<User | null> {
  return TEST_USERS.find(u => u.phone === phone) ?? null;
}

async function test_createUser(phone: string): Promise<User> {
  const now = new Date();
  const user: User = {
    id: randomUUID(),
    phone,
    step: 'awaiting_strategy',
    strategy: null,
    walletAddress: null,
    encryptedPrivateKey: null,
    totalDeposited: 0,
    depositedAt: null,
    createdAt: now,
    updatedAt: now,
  };
  TEST_USERS.push(user);
  return user;
}

async function test_setUserStrategy(phone: string, strategy: Strategy): Promise<void> {
  const u = TEST_USERS.find(u => u.phone === phone);
  if (!u) throw new Error(`User not found: ${phone}`);
  u.strategy = strategy;
  u.step = 'awaiting_confirmation';
  u.updatedAt = new Date();
}

async function test_setUserWallet(phone: string, walletAddress: string, encryptedPrivateKey: string): Promise<void> {
  const u = TEST_USERS.find(u => u.phone === phone);
  if (!u) throw new Error(`User not found: ${phone}`);
  u.walletAddress = walletAddress;
  u.encryptedPrivateKey = encryptedPrivateKey;
  u.step = 'awaiting_deposit';
  u.updatedAt = new Date();
}

async function test_setUserDeposit(phone: string, totalDeposited: number, depositedAt: Date = new Date()): Promise<void> {
  const u = TEST_USERS.find(u => u.phone === phone);
  if (!u) throw new Error(`User not found: ${phone}`);
  u.totalDeposited = totalDeposited;
  u.depositedAt = depositedAt;
  u.step = totalDeposited > 0 ? 'active' : 'awaiting_deposit';
  u.updatedAt = new Date();
}

async function test_incrementUserDeposit(userId: string, amount: number): Promise<void> {
  const u = TEST_USERS.find(u => u.id === userId);
  if (!u) throw new Error(`User not found: ${userId}`);
  u.totalDeposited += amount;
  if (!u.depositedAt) u.depositedAt = new Date();
  if (u.totalDeposited > 0) u.step = 'active';
  u.updatedAt = new Date();
}

async function test_setUserStep(phone: string, step: OnboardingStep): Promise<void> {
  const u = TEST_USERS.find(u => u.phone === phone);
  if (!u) throw new Error(`User not found: ${phone}`);
  u.step = step;
  u.updatedAt = new Date();
}

// ─── Public API (conditional) ────────────────────────────────────────────────
export const findUserByPhone = IS_TEST ? test_findUserByPhone : repo.findUserByPhone;
export const createUser = IS_TEST ? test_createUser : repo.createUser;
export const setUserStrategy = IS_TEST ? test_setUserStrategy : repo.setUserStrategy;
export const setUserWallet = IS_TEST ? test_setUserWallet : repo.setUserWallet;
export const setUserDeposit = IS_TEST ? test_setUserDeposit : repo.setUserDeposit;
export const setUserStep = IS_TEST ? test_setUserStep : repo.setUserStep;
export const incrementUserDeposit = IS_TEST ? test_incrementUserDeposit : repo.incrementUserDeposit;

// ─── Test helpers ────────────────────────────────────────────────────────────
export const _test = {
  clear: () => {
    if (IS_TEST) {
      TEST_USERS = [];
    } else {
      console.warn('_test.clear() is only available in test environment');
    }
  },
  all: (): User[] => {
    if (IS_TEST) {
      return [...TEST_USERS];
    }
    console.warn('_test.all() is only available in test environment');
    return [];
  },
  seed: (userOrUsers?: User | User[]) => {
    if (!IS_TEST) {
      console.warn('_test.seed() is only available in test environment');
      return;
    }
    if (!userOrUsers) return;
    if (Array.isArray(userOrUsers)) {
      TEST_USERS.push(...userOrUsers);
    } else {
      TEST_USERS.push(userOrUsers);
    }
  },
};
