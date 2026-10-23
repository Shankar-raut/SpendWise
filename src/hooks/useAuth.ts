import { useEffect, useState } from 'react';
import { spendwiseApi } from '../api/spendwise';
import type { User } from '../types';

export function useAuth() {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const token = localStorage.getItem('spendwise_token');
    if (!token) {
      setIsLoading(false);
      return;
    }
    spendwiseApi.auth
      .me()
      .then(setUser)
      .catch(() => localStorage.removeItem('spendwise_token'))
      .finally(() => setIsLoading(false));
  }, []);

  const login = async (email: string, password: string) => {
    const session = await spendwiseApi.auth.login({ email, password });
    localStorage.setItem('spendwise_token', session.token);
    setUser(session.user);
    return session.user;
  };

  const logout = () => {
    localStorage.removeItem('spendwise_token');
    setUser(null);
  };

  return { user, isLoading, login, logout };
}