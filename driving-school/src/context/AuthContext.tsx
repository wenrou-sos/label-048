'use client';

import { createContext, useContext, useState, useEffect, ReactNode } from 'react';

interface User {
  id: number;
  email: string;
  name: string;
  phone: string | null;
  role: string;
  avatar: string | null;
}

interface AuthContextType {
  user: User | null;
  studentId: number | null;
  coachId: number | null;
  login: (user: User, studentId?: number, coachId?: number) => void;
  logout: () => void;
  isLoading: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [studentId, setStudentId] = useState<number | null>(null);
  const [coachId, setCoachId] = useState<number | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const storedUser = localStorage.getItem('user');
    const storedStudentId = localStorage.getItem('studentId');
    const storedCoachId = localStorage.getItem('coachId');

    if (storedUser) {
      try {
        setUser(JSON.parse(storedUser));
        if (storedStudentId) setStudentId(parseInt(storedStudentId, 10));
        if (storedCoachId) setCoachId(parseInt(storedCoachId, 10));
      } catch (e) {
        console.error('Failed to parse stored user data:', e);
      }
    }
    setIsLoading(false);
  }, []);

  const login = (userData: User, newStudentId?: number, newCoachId?: number) => {
    setUser(userData);
    localStorage.setItem('user', JSON.stringify(userData));

    if (newStudentId !== undefined) {
      setStudentId(newStudentId);
      localStorage.setItem('studentId', newStudentId.toString());
    }
    if (newCoachId !== undefined) {
      setCoachId(newCoachId);
      localStorage.setItem('coachId', newCoachId.toString());
    }
  };

  const logout = () => {
    setUser(null);
    setStudentId(null);
    setCoachId(null);
    localStorage.removeItem('user');
    localStorage.removeItem('studentId');
    localStorage.removeItem('coachId');
  };

  return (
    <AuthContext.Provider value={{ user, studentId, coachId, login, logout, isLoading }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
