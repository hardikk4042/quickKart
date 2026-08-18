// src/pages/Register.jsx
import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Eye, EyeOff, Zap, Mail, Lock, User, Phone } from 'lucide-react';
import { useAuth } from '@hooks/useAuth';

export default function Register() {
  const { register, isLoggedIn } = useAuth();
  const navigate = useNavigate();
  if (isLoggedIn) { navigate('/'); return null; }

  const [form, setForm]         = useState({ name: '', email: '', phone: '', password: '', confirmPassword: '' });
  const [showPass, setShowPass] = useState(false);
  const [loading, setLoading]   = useState(false);
  const [errors, setErrors]     = useState({});

  const validate = () => {
    const e = {};
    if (!form.name.trim())    e.name = 'Name is required';
    if (!form.email.trim())   e.email = 'Email is required';
    else if (!/\S+@\S+\.\S+/.test(form.email)) e.email = 'Invalid email address';
    
    if (form.phone.trim() && !/^\+?[\d\s\-()]{7,15}$/.test(form.phone.trim())) {
      e.phone = 'Enter a valid phone number';
    }

    if (!form.password) {
      e.password = 'Password is required';
    } else if (form.password.length < 8) {
      e.password = 'Password must be at least 8 characters long';
    } else if (!/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/.test(form.password)) {
      e.password = 'Must contain at least 1 uppercase, 1 lowercase, and 1 number';
    }

    if (form.password !== form.confirmPassword) {
      e.confirmPassword = 'Passwords do not match';
    }
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validate()) return;
    setLoading(true);
    const result = await register(form);
    setLoading(false);
    if (result.success) navigate('/');
  };

  const Field = ({ id, label, icon: Icon, type = 'text', field, placeholder, error, extra }) => (
    <div>
      <label htmlFor={id} className="text-xs font-semibold text-dark-700 mb-1.5 block">{label}</label>
      <div className="relative">
        <Icon className="absolute left-3.5 top-1/2 -translate-y-1/2 text-dark-300" size={16} />
        <input id={id} type={type} value={form[field]} placeholder={placeholder}
          onChange={e => setForm({ ...form, [field]: e.target.value })}
          className={`input pl-10 ${extra ? 'pr-10' : ''} ${error ? 'border-error focus:border-error focus:ring-error/20' : ''}`}
          autoComplete={field}
        />
        {extra}
      </div>
      {error && <p className="text-xs text-error mt-1">{error}</p>}
    </div>
  );

  return (
    <div className="min-h-screen flex items-center justify-center bg-dark-50 px-4 py-8">
      <div className="w-full max-w-md">
        <div className="bg-white rounded-3xl shadow-card-hover p-8">
          <div className="flex flex-col items-center mb-8">
            <div className="w-14 h-14 bg-brand-500 rounded-2xl flex items-center justify-center shadow-brand mb-3">
              <Zap size={28} className="text-dark-900" fill="currentColor" />
            </div>
            <h1 className="text-2xl font-extrabold text-dark-900">Create Account</h1>
            <p className="text-dark-400 text-sm mt-1">Join QuickKart — Everything delivered fast</p>
          </div>

          <form onSubmit={handleSubmit} noValidate>
            <div className="space-y-4 mb-6">
              <Field id="reg-name"    label="Full Name"     icon={User}  field="name"    placeholder="Hardik" error={errors.name} />
              <Field id="reg-email"   label="Email"         icon={Mail}  field="email"   type="email" placeholder="you@example.com" error={errors.email} />
              <Field id="reg-phone"   label="Phone Number (Optional)" icon={Phone} field="phone" type="tel" placeholder="9876543210" error={errors.phone} />
              <div>
                <label htmlFor="reg-pass" className="text-xs font-semibold text-dark-700 mb-1.5 block">Password</label>
                <div className="relative">
                  <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 text-dark-300" size={16} />
                  <input id="reg-pass" type={showPass ? 'text' : 'password'} value={form.password}
                    onChange={e => setForm({ ...form, password: e.target.value })}
                    className={`input pl-10 pr-10 ${errors.password ? 'border-error' : ''}`}
                    placeholder="e.g. Password123!" autoComplete="new-password" />
                  <button type="button" onClick={() => setShowPass(!showPass)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-dark-300 hover:text-dark-600">
                    {showPass ? <EyeOff size={16} /> : <Eye size={16} />}
                  </button>
                </div>
                {errors.password ? (
                  <p className="text-xs text-error mt-1">{errors.password}</p>
                ) : (
                  <p className="text-[11px] text-dark-400 mt-1">
                    Min 8 chars, 1 uppercase (A-Z), 1 lowercase (a-z), 1 number (0-9).
                  </p>
                )}
              </div>
              <div>
                <label htmlFor="reg-confirm" className="text-xs font-semibold text-dark-700 mb-1.5 block">Confirm Password</label>
                <div className="relative">
                  <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 text-dark-300" size={16} />
                  <input id="reg-confirm" type="password" value={form.confirmPassword}
                    onChange={e => setForm({ ...form, confirmPassword: e.target.value })}
                    className={`input pl-10 ${errors.confirmPassword ? 'border-error' : ''}`}
                    placeholder="Repeat password" autoComplete="new-password" />
                </div>
                {errors.confirmPassword && <p className="text-xs text-error mt-1">{errors.confirmPassword}</p>}
              </div>
            </div>

            <p className="text-xs text-dark-400 mb-5 leading-relaxed">
              By creating an account, you agree to our{' '}
              <a href="#" className="text-brand-600 font-medium">Terms of Service</a> and{' '}
              <a href="#" className="text-brand-600 font-medium">Privacy Policy</a>.
            </p>

            <button type="submit" disabled={loading} id="register-submit"
              className="btn-primary w-full py-3.5 text-base mb-5 disabled:opacity-70 flex items-center justify-center gap-2">
              {loading ? (
                <><span className="w-4 h-4 border-2 border-dark-900 border-t-transparent rounded-full animate-spin" /> Creating account...</>
              ) : 'Create Account'}
            </button>

            <p className="text-center text-sm text-dark-500">
              Already have an account?{' '}
              <Link to="/login" className="text-brand-600 font-semibold hover:text-brand-700">Login</Link>
            </p>
          </form>
        </div>
      </div>
    </div>
  );
}

// Finalized authentication logic
