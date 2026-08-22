// src/pages/Login.jsx
import { useState } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import { Eye, EyeOff, Zap, Mail, Lock } from 'lucide-react';
import { useAuth } from '@hooks/useAuth';
import demoUsers from '@data/users.json';

export default function Login() {
  const { login, isLoggedIn } = useAuth();
  const navigate = useNavigate();
  const [params] = useSearchParams();
  const redirect = params.get('redirect') || '/';

  if (isLoggedIn) { navigate(redirect); return null; }

  const [form, setForm]           = useState({ email: '', password: '' });
  const [showPass, setShowPass]   = useState(false);
  const [loading, setLoading]     = useState(false);
  const [errors, setErrors]       = useState({});

  const validate = () => {
    const e = {};
    if (!form.email.trim()) e.email = 'Email is required';
    else if (!/\S+@\S+\.\S+/.test(form.email)) e.email = 'Invalid email address';
    if (!form.password) e.password = 'Password is required';
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validate()) return;
    setLoading(true);
    const result = await login(form);
    setLoading(false);
    if (result.success) {
      const role = result.user?.role?.toUpperCase();
      if (role === 'ADMIN') navigate('/admin');
      else if (role === 'STORE_MANAGER') navigate('/store');
      else if (role === 'DELIVERY_PARTNER') navigate('/delivery');
      else navigate(redirect);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-dark-50 px-4 py-8">
      <div className="w-full max-w-md">
        {/* Card */}
        <div className="bg-white rounded-3xl shadow-card-hover p-8">
          {/* Logo */}
          <div className="flex flex-col items-center mb-8">
            <div className="w-14 h-14 bg-brand-500 rounded-2xl flex items-center justify-center shadow-brand mb-3">
              <Zap size={28} className="text-dark-900" fill="currentColor" />
            </div>
            <h1 className="text-2xl font-extrabold text-dark-900">Welcome back</h1>
            <p className="text-dark-400 text-sm mt-1">Login to your QuickKart account</p>
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit} noValidate>
            <div className="space-y-4 mb-6">
              <div>
                <label className="text-xs font-semibold text-dark-700 mb-1.5 block">Email Address</label>
                <div className="relative">
                  <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 text-dark-300" size={16} />
                  <input
                    type="email"
                    value={form.email}
                    onChange={e => setForm({ ...form, email: e.target.value })}
                    className={`input pl-10 ${errors.email ? 'border-error focus:border-error focus:ring-error/20' : ''}`}
                    placeholder="you@example.com"
                    id="login-email"
                    autoComplete="email"
                  />
                </div>
                {errors.email && <p className="text-xs text-error mt-1">{errors.email}</p>}
              </div>

              <div>
                <label className="text-xs font-semibold text-dark-700 mb-1.5 block">Password</label>
                <div className="relative">
                  <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 text-dark-300" size={16} />
                  <input
                    type={showPass ? 'text' : 'password'}
                    value={form.password}
                    onChange={e => setForm({ ...form, password: e.target.value })}
                    className={`input pl-10 pr-10 ${errors.password ? 'border-error focus:border-error focus:ring-error/20' : ''}`}
                    placeholder="Enter password"
                    id="login-password"
                    autoComplete="current-password"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPass(!showPass)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-dark-300 hover:text-dark-600"
                  >
                    {showPass ? <EyeOff size={16} /> : <Eye size={16} />}
                  </button>
                </div>
                {errors.password && <p className="text-xs text-error mt-1">{errors.password}</p>}
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              id="login-submit"
              className="btn-primary w-full py-3.5 text-base mb-5 disabled:opacity-70 flex items-center justify-center gap-2"
            >
              {loading ? (
                <><span className="w-4 h-4 border-2 border-dark-900 border-t-transparent rounded-full animate-spin" /> Logging in...</>
              ) : 'Login'}
            </button>

            {/* ── Quick Demo Login Buttons ── */}
            <div className="border-t border-dark-100 pt-4">
              <p className="text-xs text-dark-400 text-center mb-3">Quick Demo Login</p>
              <div className="grid grid-cols-2 gap-2">
                {demoUsers.map((u) => (
                  <button
                    key={u.id}
                    type="button"
                    onClick={() => setForm({ email: u.email, password: u.password })}
                    className="text-xs border border-dark-200 rounded-xl py-2 px-3 text-dark-600 hover:border-brand-400 hover:text-brand-600 transition-colors text-left"
                  >
                    <span className="font-semibold block">{u.name}</span>
                    <span className="text-dark-400 capitalize">{u.role.replace('_', ' ')}</span>
                  </button>
                ))}
              </div>
            </div>

            <p className="text-center text-sm text-dark-500">
              Don't have an account?{' '}
              <Link to="/register" className="text-brand-600 font-semibold hover:text-brand-700">Register</Link>
            </p>
          </form>
        </div>
      </div>
    </div>
  );
}

// Finalized authentication logic

// UI polish and final bug fixes applied
