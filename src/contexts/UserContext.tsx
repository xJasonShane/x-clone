'use client';

import { createContext, useContext, useState, useEffect, ReactNode } from 'react';

export interface UserProfile {
  id: string;
  username: string;
  display_name: string;
  email: string;
  avatar: string | null;
  bio: string | null;
  cover_image: string | null;
  created_at: string;
  updated_at: string | null;
}

interface UserContextType {
  user: UserProfile | null;
  isLoading: boolean;
  refreshUser: () => Promise<void>;
  updateUser: (updates: Partial<UserProfile>) => Promise<boolean>;
}

const UserContext = createContext<UserContextType | undefined>(undefined);

const DEFAULT_USER: UserProfile = {
  id: 'current-user',
  username: 'you',
  display_name: 'Your Name',
  email: 'you@example.com',
  avatar: null,
  bio: 'Building the future, one tweet at a time.',
  cover_image: null,
  created_at: new Date().toISOString(),
  updated_at: null,
};

export function UserProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<UserProfile | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const refreshUser = async () => {
    try {
      const res = await fetch('/api/user');
      const data = await res.json();
      if (data.success && data.data) {
        setUser(data.data);
      } else {
        setUser(DEFAULT_USER);
      }
    } catch (error) {
      console.error('Error fetching user:', error);
      setUser(DEFAULT_USER);
    } finally {
      setIsLoading(false);
    }
  };

  const updateUser = async (updates: Partial<UserProfile>): Promise<boolean> => {
    try {
      const res = await fetch('/api/user', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(updates),
      });
      const data = await res.json();
      if (data.success && data.data) {
        setUser(data.data);
        return true;
      }
      return false;
    } catch (error) {
      console.error('Error updating user:', error);
      return false;
    }
  };

  useEffect(() => {
    refreshUser();
  }, []);

  return (
    <UserContext.Provider value={{ user, isLoading, refreshUser, updateUser }}>
      {children}
    </UserContext.Provider>
  );
}

export function useUser() {
  const context = useContext(UserContext);
  if (context === undefined) {
    throw new Error('useUser must be used within a UserProvider');
  }
  return context;
}
