// src/components/common/LocationPicker.jsx
import { useState } from 'react';
import { MapPin, Home, Briefcase, Plus, ChevronRight, Check } from 'lucide-react';
import Modal from './Modal';
import useLocationStore from '@store/locationStore';
import useUiStore from '@store/uiStore';

const LABEL_ICONS = { Home: Home, Work: Briefcase };

export default function LocationPicker() {
  const { locationPickerOpen, setLocationPickerOpen } = useUiStore();
  const { addresses, selectedAddress, setSelectedAddress } = useLocationStore();
  const [showAdd, setShowAdd] = useState(false);

  const handleSelect = (addr) => {
    setSelectedAddress(addr);
    setLocationPickerOpen(false);
  };

  return (
    <Modal
      isOpen={locationPickerOpen}
      onClose={() => setLocationPickerOpen(false)}
      title="Select Delivery Address"
      size="md"
    >
      <div className="p-6 space-y-3">
        {addresses.map((addr) => {
          const Icon = LABEL_ICONS[addr.label] || MapPin;
          const isSelected = selectedAddress?.id === addr.id;
          return (
            <button
              key={addr.id}
              onClick={() => handleSelect(addr)}
              className={`w-full flex items-start gap-4 p-4 rounded-2xl border-2 text-left transition-all
                          ${isSelected ? 'border-brand-500 bg-brand-50' : 'border-dark-100 hover:border-brand-300 bg-white'}`}
            >
              <div className={`p-2.5 rounded-xl ${isSelected ? 'bg-brand-500' : 'bg-dark-50'}`}>
                <Icon size={18} className={isSelected ? 'text-dark-900' : 'text-dark-500'} />
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-0.5">
                  <span className="font-semibold text-dark-900 text-sm">{addr.label}</span>
                  {addr.isDefault && (
                    <span className="text-xs bg-brand-100 text-brand-700 px-2 py-0.5 rounded-full font-medium">Default</span>
                  )}
                </div>
                <p className="text-dark-500 text-xs leading-relaxed truncate">
                  {addr.house}, {addr.street}, {addr.city} - {addr.pincode}
                </p>
              </div>
              {isSelected && <Check size={18} className="text-brand-600 flex-shrink-0 mt-0.5" />}
            </button>
          );
        })}

        <button
          onClick={() => setShowAdd(!showAdd)}
          className="w-full flex items-center gap-3 p-4 rounded-2xl border-2 border-dashed border-dark-200
                     hover:border-brand-400 text-dark-500 hover:text-dark-900 transition-all"
        >
          <Plus size={18} />
          <span className="font-medium text-sm">Add a new address</span>
        </button>

        {showAdd && (
          <div className="bg-dark-50 rounded-2xl p-4">
            <p className="text-sm text-dark-500 text-center">
              Address form — navigate to <strong>My Account → Addresses</strong> to add a new address.
            </p>
          </div>
        )}
      </div>
    </Modal>
  );
}
