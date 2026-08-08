// src/pages/NotFound.jsx
import { Link } from 'react-router-dom';
import { Zap } from 'lucide-react';

export default function NotFound() {
  return (
    <div className="min-h-[60vh] flex flex-col items-center justify-center px-4 text-center">
      <div className="text-8xl mb-6">🔍</div>
      <h1 className="text-6xl font-extrabold text-dark-900 mb-2">404</h1>
      <h2 className="text-2xl font-bold text-dark-700 mb-3">Page Not Found</h2>
      <p className="text-dark-400 text-sm max-w-xs mb-8">
        Oops! The page you're looking for doesn't exist or has been moved.
      </p>
      <Link to="/" className="btn-primary px-8 py-3 text-base flex items-center gap-2">
        <Zap size={16} fill="currentColor" /> Back to QuickKart
      </Link>
    </div>
  );
}
