// src/hooks/useAuth.js
import { authAPI } from '@services/auth.api';
import useAuthStore from '@store/authStore';
import toast from 'react-hot-toast';

export const useAuth = () => {
  const { user, token, isLoggedIn, setUser, clearUser } = useAuthStore();

  const login = async (credentials) => {
    try {
      const { user, token } = await authAPI.login(credentials);
      setUser(user, token);
      localStorage.setItem('qk_token', token);
      toast.success(`Welcome back, ${user.name}!`);
      return { success: true, user };
    } catch (err) {
      toast.error(err.message || 'Login failed');
      return { success: false, error: err.message };
    }
  };

  const register = async (data) => {
    try {
      const { user, token } = await authAPI.register(data);
      setUser(user, token);
      localStorage.setItem('qk_token', token);
      toast.success(`Welcome to QuickKart, ${user.name}!`);
      return { success: true };
    } catch (err) {
      toast.error(err.message || 'Registration failed');
      return { success: false, error: err.message };
    }
  };

  const logout = async () => {
    try { await authAPI.logout(); } catch {}
    clearUser();
    localStorage.removeItem('qk_token');
    toast.success('Logged out successfully');
  };

  return { user, token, isLoggedIn, login, register, logout };
};
