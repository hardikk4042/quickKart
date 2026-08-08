// src/components/common/Modal.jsx
import { useEffect } from 'react';
import { X } from 'lucide-react';

export default function Modal({ isOpen, onClose, title, children, size = 'md', className = '' }) {
  useEffect(() => {
    if (isOpen) document.body.style.overflow = 'hidden';
    else document.body.style.overflow = '';
    return () => { document.body.style.overflow = ''; };
  }, [isOpen]);

  if (!isOpen) return null;

  const sizes = {
    sm: 'max-w-sm',
    md: 'max-w-md',
    lg: 'max-w-2xl',
    xl: 'max-w-4xl',
    full: 'max-w-full mx-3',
  };

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black/50 backdrop-blur-sm"
        onClick={onClose}
      />
      {/* Sheet */}
      <div className={`relative w-full ${sizes[size]} bg-white rounded-t-3xl sm:rounded-3xl shadow-2xl 
                       animate-slide-up sm:animate-scale-in max-h-[90vh] overflow-auto ${className}`}>
        {/* Header */}
        {title && (
          <div className="flex items-center justify-between px-6 py-4 border-b border-dark-50">
            <h2 className="text-lg font-bold text-dark-900">{title}</h2>
            <button onClick={onClose} className="btn-ghost p-2 -mr-2">
              <X size={20} />
            </button>
          </div>
        )}
        {!title && (
          <button onClick={onClose} className="absolute top-4 right-4 z-10 btn-ghost p-2">
            <X size={20} />
          </button>
        )}
        {children}
      </div>
    </div>
  );
}
