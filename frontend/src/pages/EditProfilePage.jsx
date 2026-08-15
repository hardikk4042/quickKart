// src/pages/EditProfilePage.jsx
import { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { ArrowLeft, User, Phone, Image, Save, Shield } from 'lucide-react';
import useAuthStore from '@store/authStore';
import { userAPI } from '@services/user.api';
import toast from 'react-hot-toast';

export default function EditProfilePage() {
  const navigate = useNavigate();
  const { user, updateUser, isLoggedIn } = useAuthStore();

  const [form, setForm] = useState({
    name: user?.name || '',
    phone: user?.phone || '',
    avatarUrl: user?.avatarUrl || '',
  });
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState({});

  useEffect(() => {
    if (!isLoggedIn) {
      navigate('/login?redirect=/account/edit');
    }
  }, [isLoggedIn, navigate]);

  const validate = () => {
    const errs = {};
    if (!form.name.trim()) errs.name = 'Name is required';
    else if (form.name.trim().length < 2) errs.name = 'Name must be at least 2 characters';

    if (form.phone && !/^\+?[\d\s\-()]{7,15}$/.test(form.phone)) {
      errs.phone = 'Please enter a valid phone number';
    }

    if (form.avatarUrl && !/^https?:\/\/.+/.test(form.avatarUrl)) {
      errs.avatarUrl = 'Please enter a valid Image URL (http:// or https://)';
    }

    setErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validate()) return;

    setLoading(true);
    try {
      const updated = await userAPI.updateMe({
        name: form.name.trim(),
        phone: form.phone ? form.phone.trim() : null,
        avatarUrl: form.avatarUrl ? form.avatarUrl.trim() : null,
      });

      updateUser(updated);
      toast.success('Profile updated successfully!');
      navigate('/account');
    } catch (err) {
      const msg = err.message || err.error?.message || 'Failed to update profile';
      toast.error(msg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-xl mx-auto px-4 py-6 pb-24 md:pb-12">
      {/* Header */}
      <div className="flex items-center gap-3 mb-6">
        <Link to="/account" className="w-10 h-10 bg-white rounded-2xl flex items-center justify-center border border-dark-100 hover:bg-dark-50 text-dark-700 transition-colors">
          <ArrowLeft size={20} />
        </Link>
        <div>
          <h1 className="text-2xl font-bold text-dark-900">Edit Profile</h1>
          <p className="text-xs text-dark-400">Update your personal information</p>
        </div>
      </div>

      <div className="bg-white rounded-3xl p-6 shadow-card">
        <form onSubmit={handleSubmit} className="space-y-5" noValidate>
          {/* Readonly Account Details */}
          <div className="bg-dark-50 rounded-2xl p-4 border border-dark-100 space-y-3">
            <div className="flex items-center justify-between text-xs text-dark-500">
              <span className="flex items-center gap-1.5 font-medium"><Shield size={14} className="text-brand-600" /> Account Role</span>
              <span className="font-bold text-dark-900 uppercase bg-brand-100 text-brand-800 px-2.5 py-0.5 rounded-full">{user?.role || 'CUSTOMER'}</span>
            </div>
            <div>
              <label className="text-xs text-dark-400 block mb-0.5">Email Address (Read-only)</label>
              <input
                type="email"
                value={user?.email || ''}
                disabled
                className="w-full bg-dark-100/60 text-dark-500 text-sm font-medium px-3.5 py-2 rounded-xl border border-dark-200 cursor-not-allowed"
              />
            </div>
          </div>

          {/* Name */}
          <div>
            <label className="text-xs font-semibold text-dark-700 mb-1.5 block">Full Name</label>
            <div className="relative">
              <User className="absolute left-3.5 top-1/2 -translate-y-1/2 text-dark-300" size={16} />
              <input
                type="text"
                value={form.name}
                onChange={(e) => setForm({ ...form, name: e.target.value })}
                className={`input pl-10 ${errors.name ? 'border-error focus:border-error focus:ring-error/20' : ''}`}
                placeholder="Enter your name"
              />
            </div>
            {errors.name && <p className="text-xs text-error mt-1">{errors.name}</p>}
          </div>

          {/* Phone */}
          <div>
            <label className="text-xs font-semibold text-dark-700 mb-1.5 block">Phone Number</label>
            <div className="relative">
              <Phone className="absolute left-3.5 top-1/2 -translate-y-1/2 text-dark-300" size={16} />
              <input
                type="tel"
                value={form.phone}
                onChange={(e) => setForm({ ...form, phone: e.target.value })}
                className={`input pl-10 ${errors.phone ? 'border-error focus:border-error focus:ring-error/20' : ''}`}
                placeholder="+91 98765 43210"
              />
            </div>
            {errors.phone && <p className="text-xs text-error mt-1">{errors.phone}</p>}
          </div>

          {/* Avatar URL */}
          <div>
            <label className="text-xs font-semibold text-dark-700 mb-1.5 block">Avatar Image URL (Optional)</label>
            <div className="relative">
              <Image className="absolute left-3.5 top-1/2 -translate-y-1/2 text-dark-300" size={16} />
              <input
                type="url"
                value={form.avatarUrl}
                onChange={(e) => setForm({ ...form, avatarUrl: e.target.value })}
                className={`input pl-10 ${errors.avatarUrl ? 'border-error focus:border-error focus:ring-error/20' : ''}`}
                placeholder="https://example.com/avatar.png"
              />
            </div>
            {errors.avatarUrl && <p className="text-xs text-error mt-1">{errors.avatarUrl}</p>}
          </div>

          {/* Actions */}
          <div className="pt-4 flex gap-3">
            <Link to="/account" className="flex-1 btn-secondary text-center py-3 text-sm">
              Cancel
            </Link>
            <button
              type="submit"
              disabled={loading}
              className="flex-1 btn-primary flex items-center justify-center gap-2 py-3 text-sm"
            >
              {loading ? (
                <div className="w-5 h-5 border-2 border-dark-900 border-t-transparent rounded-full animate-spin" />
              ) : (
                <>
                  <Save size={16} /> Save Changes
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
