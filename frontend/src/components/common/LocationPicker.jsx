// src/components/common/LocationPicker.jsx
import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { MapPin, Home, Briefcase, Plus, Check } from 'lucide-react';
import Modal from './Modal';
import useLocationStore from '@store/locationStore';
import useUiStore from '@store/uiStore';
import useAuthStore from '@store/authStore';

const LABEL_ICONS = { Home: Home, Work: Briefcase };

export default function LocationPicker() {
  const navigate = useNavigate();
  const { locationPickerOpen, setLocationPickerOpen } = useUiStore();
  const { addresses, selectedAddress, setSelectedAddress, fetchAddresses } = useLocationStore();
  const { isLoggedIn } = useAuthStore();

  useEffect(() => {
    if (locationPickerOpen && isLoggedIn) {
      fetchAddresses();
    }
  }, [locationPickerOpen, isLoggedIn, fetchAddresses]);

  const handleSelect = (addr) => {
    setSelectedAddress(addr);
    setLocationPickerOpen(false);
  };

  const handleAddAddress = () => {
    setLocationPickerOpen(false);
    navigate('/account/addresses');
  };

  return (
    <Modal
      isOpen={locationPickerOpen}
      onClose={() => setLocationPickerOpen(false)}
      title="Select Delivery Address"
      size="md"
    >
      <div className="p-6 space-y-3">
        {addresses.length > 0 ? (
          addresses.map((addr) => {
            const Icon = LABEL_ICONS[addr.label] || MapPin;
            const isSelected = selectedAddress?.id === addr.id;
            return (
              <button
                key={addr.id}
                onClick={() => handleSelect(addr)}
                className={`w-full flex items-start gap-4 p-4 rounded-2xl border-2 text-left transition-all ${
                  isSelected ? 'border-brand-500 bg-brand-50' : 'border-dark-100 hover:border-brand-300 bg-white'
                }`}
              >
                <div className={`p-2.5 rounded-xl ${isSelected ? 'bg-brand-500' : 'bg-dark-50'}`}>
                  <Icon size={18} className={isSelected ? 'text-dark-900' : 'text-dark-500'} />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-0.5">
                    <span className="font-semibold text-dark-900 text-sm">{addr.label}</span>
                    {addr.isDefault && (
                      <span className="text-xs bg-brand-100 text-brand-700 px-2 py-0.5 rounded-full font-medium">
                        Default
                      </span>
                    )}
                  </div>
                  <p className="text-dark-500 text-xs leading-relaxed truncate">
                    {addr.line1 || addr.street}, {addr.city} - {addr.pincode}
                  </p>
                </div>
                {isSelected && <Check size={18} className="text-brand-600 flex-shrink-0 mt-0.5" />}
              </button>
            );
          })
        ) : (
          <p className="text-sm text-dark-400 text-center py-2">No saved addresses found.</p>
        )}

        <button
          onClick={handleAddAddress}
          className="w-full flex items-center justify-center gap-2 p-4 rounded-2xl border-2 border-dashed border-dark-200 hover:border-brand-400 text-dark-700 font-semibold text-sm transition-all"
        >
          <Plus size={18} />
          <span>Manage / Add New Address</span>
        </button>
      </div>
    </Modal>
  );
}
