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
      const message = err.message || err.error?.message || 'Login failed';
      toast.error(message);
      return { success: false, error: message };
    }
  };

  const register = async (data) => {
    try {
      await authAPI.register(data);
      // Automatically log in after registration to acquire JWT token & session
      const loginRes = await authAPI.login({ email: data.email, password: data.password });
      setUser(loginRes.user, loginRes.token);
      localStorage.setItem('qk_token', loginRes.token);
      toast.success(`Welcome to QuickKart, ${loginRes.user.name}!`);
      return { success: true, user: loginRes.user };
    } catch (err) {
      const message = err.message || err.error?.message || 'Registration failed';
      toast.error(message);
      return { success: false, error: message };
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
