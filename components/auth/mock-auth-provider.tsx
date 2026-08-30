'use client';

import { createContext, useContext, useEffect, useState, type ReactNode } from 'react';

type UserRole = 'student' | 'teacher' | 'admin';

interface MockUser {
  id: string;
  email: string;
  name: string;
  role: UserRole;
}

interface MockAuthContextValue {
  user: MockUser | null;
  session: { user: MockUser } | null;
  loading: boolean;
  role: UserRole | null;
  signIn: (email: string, password: string) => Promise<{ error: string | null }>;
  signUp: (email: string, password: string, name: string) => Promise<{ error: string | null }>;
  signOut: () => Promise<void>;
}

const MockAuthContext = createContext<MockAuthContextValue>({
  user: null,
  session: null,
  loading: true,
  role: null,
  signIn: async () => ({ error: 'Not implemented' }),
  signUp: async () => ({ error: 'Not implemented' }),
  signOut: async () => {},
});

const STORAGE_KEY = 'ieltspro_mock_users';
const CURRENT_USER_KEY = 'ieltspro_current_user';


const ADMIN_EMAIL = 'admin@test.com';
const ADMIN_PASSWORD = 'admin123';

function seedDefaultAdmin() {
  if (typeof window === 'undefined') return;
  const users = getStoredUsers();
  let needsUpdate = false;
  if (!users[ADMIN_EMAIL]) {
    users[ADMIN_EMAIL] = {
      password: ADMIN_PASSWORD,
      user: {
        id: 'admin-default-001',
        email: ADMIN_EMAIL,
        name: 'Admin',
        role: 'admin',
      },
    };
    needsUpdate = true;
  } else if (users[ADMIN_EMAIL].user.role !== 'admin') {
    users[ADMIN_EMAIL].user.role = 'admin';
    needsUpdate = true;
  }
  if (needsUpdate) {
    saveStoredUsers(users);
    // Also update current user session if it's the admin
    const current = getCurrentUser();
    if (current && current.email === ADMIN_EMAIL) {
      current.role = 'admin';
      setCurrentUser(current);
    }
  }
}

function getStoredUsers(): Record<string, { password: string; user: MockUser }> {
  if (typeof window === 'undefined') return {};
  try {
    const data = localStorage.getItem(STORAGE_KEY);
    return data ? JSON.parse(data) : {};
  } catch {
    return {};
  }
}

function saveStoredUsers(users: Record<string, { password: string; user: MockUser }>) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(users));
}

function getCurrentUser(): MockUser | null {
  if (typeof window === 'undefined') return null;
  try {
    const data = localStorage.getItem(CURRENT_USER_KEY);
    return data ? JSON.parse(data) : null;
  } catch {
    return null;
  }
}

function setCurrentUser(user: MockUser | null) {
  if (user) {
    localStorage.setItem(CURRENT_USER_KEY, JSON.stringify(user));
  } else {
    localStorage.removeItem(CURRENT_USER_KEY);
  }
}

export function MockAuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<MockUser | null>(null);
  const [loading, setLoading] = useState(true);
  const [role, setRole] = useState<UserRole | null>(null);

  useEffect(() => {
    seedDefaultAdmin();
    // Load current user from localStorage
    const stored = getCurrentUser();
    if (stored) {
      setUser(stored);
      setRole(stored.role);
    }
    setLoading(false);
  }, []);

  const signIn = async (email: string, password: string) => {
    const users = getStoredUsers();
    const record = users[email.toLowerCase()];

    if (!record) {
      return { error: 'User not found. Please sign up first.' };
    }

    if (record.password !== password) {
      return { error: 'Invalid password.' };
    }

    // Force admin role for admin@test.com
    const effectiveUser = record.user.email === ADMIN_EMAIL
      ? { ...record.user, role: 'admin' as UserRole }
      : record.user;
    setUser(effectiveUser);
    setRole(effectiveUser.role);
    setCurrentUser(effectiveUser);
    return { error: null };
  };

  const signUp = async (email: string, password: string, name: string) => {
    const users = getStoredUsers();

    if (users[email.toLowerCase()]) {
      return { error: 'User already exists with this email.' };
    }

    const newUser: MockUser = {
      id: crypto.randomUUID(),
      email: email.toLowerCase(),
      name,
      role: email.toLowerCase() === ADMIN_EMAIL ? 'admin' : 'student',
    }

    users[email.toLowerCase()] = { password, user: newUser };
    saveStoredUsers(users);

    setUser(newUser);
    setRole(newUser.role);
    setCurrentUser(newUser);
    return { error: null };
  };

  const signOut = async () => {
    setUser(null);
    setRole(null);
    setCurrentUser(null);
  };

  return (
    <MockAuthContext.Provider
      value={{
        user,
        session: user ? { user } : null,
        loading,
        role,
        signIn,
        signUp,
        signOut,
      }}
    >
      {children}
    </MockAuthContext.Provider>
  );
}

export function useMockAuth() {
  return useContext(MockAuthContext);
}
