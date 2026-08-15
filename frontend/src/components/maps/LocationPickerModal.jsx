// src/components/maps/LocationPickerModal.jsx
/**
 * Full-screen two-step location-picker modal.
 *
 * Step 1 — Map Picker (LeafletMapPicker):
 *   Interactive OpenStreetMap. User pans the map; fixed 📍 pin at center.
 *   Nominatim reverse geocoding updates the address on map idle.
 *   User clicks "Confirm This Location →".
 *
 * Step 2 — Address Details Form:
 *   Pre-filled from Nominatim geocode result.
 *   User adds house/flat, landmark, label (Home/Work/Other).
 *   User clicks "Confirm & Save" → onSave(payload) called.
 *
 * Props:
 *   isOpen        {boolean}
 *   onClose       {() => void}
 *   onSave        {(payload) => Promise<void>}
 *   initialValues {object}  optional — populated when editing an existing address
 */

import { useState, useCallback } from 'react';
import { ArrowLeft, Home, Briefcase, MapPin, Check, Loader2, Tag } from 'lucide-react';
import GoogleMapPicker from './GoogleMapPicker';
// ─────────────────────────────────────────────────────────────────────────────
// Step 2 — Address Details Form
// ─────────────────────────────────────────────────────────────────────────────
function AddressDetailsForm({ geocodedData, lat, lng, initialValues, onBack, onSave }) {
  const [form, setForm] = useState({
    label:     initialValues?.label     || 'Home',
    house:     '',                        // house/flat — always starts empty for new picks
    line1:     geocodedData?.line1      || initialValues?.line1   || '',
    landmark:  '',                        // landmark — always starts empty for new picks
    city:      geocodedData?.city       || initialValues?.city    || '',
    state:     geocodedData?.state      || initialValues?.state   || '',
    pincode:   geocodedData?.pincode    || initialValues?.pincode || '',
    country:   geocodedData?.country    || initialValues?.country || 'India',
    isDefault: initialValues?.isDefault || false,
  });
  const [errors, setErrors] = useState({});
  const [saving, setSaving] = useState(false);

  const set = (field, value) => setForm((f) => ({ ...f, [field]: value }));

  const validate = () => {
    const e = {};
    if (!form.label.trim())   e.label   = 'Label is required';
    if (!form.line1.trim())   e.line1   = 'Street / area is required';
    if (!form.city.trim())    e.city    = 'City is required';
    if (!form.state.trim())   e.state   = 'State is required';
    if (!form.pincode.trim()) e.pincode = 'Pincode is required';
    else if (!/^[\d\s\-]{3,10}$/.test(form.pincode.trim())) e.pincode = 'Enter a valid pincode';
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validate()) return;
    setSaving(true);
    try {
      // Combine house + street into line1 / line2 fields that the backend expects
      const fullLine1 = [form.house, form.line1].filter(Boolean).join(', ') || form.line1;
      await onSave({
        label:     form.label.trim(),
        line1:     fullLine1.trim(),
        line2:     form.landmark ? form.landmark.trim() : null,
        city:      form.city.trim(),
        state:     form.state.trim(),
        pincode:   form.pincode.trim(),
        country:   form.country || 'India',
        latitude:  lat,
        longitude: lng,
        isDefault: form.isDefault,
      });
    } finally {
      setSaving(false);
    }
  };

  const locationSummary = [form.city, form.state, form.pincode].filter(Boolean).join(', ');

  return (
    <div className="flex flex-col h-full">
      {/* Header */}
      <div className="flex items-center gap-3 px-4 py-3 border-b border-dark-100 bg-white flex-shrink-0">
        <button onClick={onBack} className="p-2 hover:bg-dark-50 rounded-xl text-dark-600 transition-colors">
          <ArrowLeft size={20} />
        </button>
        <div>
          <h2 className="text-base font-bold text-dark-900">Confirm Delivery Details</h2>
          <p className="text-xs text-dark-400">Review and complete your address</p>
        </div>
      </div>

      {/* Detected location strip */}
      {locationSummary && (
        <div className="flex items-center gap-2.5 px-4 py-3 bg-brand-50 border-b border-brand-100 flex-shrink-0">
          <div className="w-7 h-7 bg-brand-500 rounded-lg flex items-center justify-center flex-shrink-0">
            <MapPin size={14} className="text-dark-900" fill="currentColor" />
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-xs text-brand-900 font-bold leading-snug truncate">{locationSummary}</p>
            {lat && lng && (
              <p className="text-[10px] text-brand-600 font-mono">
                {lat.toFixed(5)}, {lng.toFixed(5)}
              </p>
            )}
          </div>
        </div>
      )}

      {/* Form — scrollable */}
      <form onSubmit={handleSubmit} noValidate className="flex-1 overflow-y-auto">
        <div className="px-4 py-5 space-y-4">

          {/* Label pills */}
          <div>
            <label className="text-xs font-bold text-dark-700 mb-2 flex items-center gap-1.5">
              <Tag size={13} className="text-dark-400" />
              Address Type
            </label>
            <div className="flex gap-2">
              {[
                { label: 'Home',  Icon: Home },
                { label: 'Work',  Icon: Briefcase },
                { label: 'Other', Icon: MapPin },
              ].map(({ label, Icon }) => (
                <button
                  key={label}
                  type="button"
                  onClick={() => set('label', label)}
                  className={`flex-1 flex items-center justify-center gap-1.5 py-2.5 rounded-xl text-xs font-bold border transition-all
                              ${form.label === label
                                ? 'bg-dark-900 text-white border-dark-900 shadow-sm'
                                : 'bg-dark-50 text-dark-600 border-dark-200 hover:border-dark-400'}`}
                >
                  <Icon size={13} />
                  {label}
                </button>
              ))}
            </div>
            {errors.label && <p className="text-xs text-error mt-1">{errors.label}</p>}
          </div>

          {/* House / Flat No. */}
          <div>
            <label className="text-xs font-bold text-dark-700 mb-1.5 block">House / Flat / Floor No.</label>
            <input
              type="text"
              value={form.house}
              onChange={(e) => set('house', e.target.value)}
              className="input"
              placeholder="e.g. Flat 204, Tower B, 3rd Floor"
            />
          </div>

          {/* Street / Area */}
          <div>
            <label className="text-xs font-bold text-dark-700 mb-1.5 block">
              Street / Area / Colony <span className="text-error">*</span>
            </label>
            <input
              type="text"
              value={form.line1}
              onChange={(e) => set('line1', e.target.value)}
              className={`input ${errors.line1 ? 'border-error focus:border-error' : ''}`}
              placeholder="Street name, area, locality"
            />
            {errors.line1 && <p className="text-xs text-error mt-1">{errors.line1}</p>}
          </div>

          {/* Landmark */}
          <div>
            <label className="text-xs font-bold text-dark-700 mb-1.5 block">
              Landmark <span className="text-dark-400 font-normal">(Optional)</span>
            </label>
            <input
              type="text"
              value={form.landmark}
              onChange={(e) => set('landmark', e.target.value)}
              className="input"
              placeholder="e.g. Near City Mall, Opposite Park"
            />
          </div>

          {/* City + State */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-xs font-bold text-dark-700 mb-1.5 block">
                City <span className="text-error">*</span>
              </label>
              <input
                type="text"
                value={form.city}
                onChange={(e) => set('city', e.target.value)}
                className={`input ${errors.city ? 'border-error' : ''}`}
                placeholder="City"
              />
              {errors.city && <p className="text-xs text-error mt-1">{errors.city}</p>}
            </div>
            <div>
              <label className="text-xs font-bold text-dark-700 mb-1.5 block">
                State <span className="text-error">*</span>
              </label>
              <input
                type="text"
                value={form.state}
                onChange={(e) => set('state', e.target.value)}
                className={`input ${errors.state ? 'border-error' : ''}`}
                placeholder="State"
              />
              {errors.state && <p className="text-xs text-error mt-1">{errors.state}</p>}
            </div>
          </div>

          {/* Pincode + Country */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-xs font-bold text-dark-700 mb-1.5 block">
                Pincode <span className="text-error">*</span>
              </label>
              <input
                type="text"
                value={form.pincode}
                onChange={(e) => set('pincode', e.target.value)}
                className={`input ${errors.pincode ? 'border-error' : ''}`}
                placeholder="140401"
              />
              {errors.pincode && <p className="text-xs text-error mt-1">{errors.pincode}</p>}
            </div>
            <div>
              <label className="text-xs font-bold text-dark-700 mb-1.5 block">Country</label>
              <input
                type="text"
                value={form.country}
                onChange={(e) => set('country', e.target.value)}
                className="input"
                placeholder="India"
              />
            </div>
          </div>

          {/* Default checkbox */}
          <label className="flex items-center gap-2.5 cursor-pointer select-none pt-1">
            <div
              onClick={() => set('isDefault', !form.isDefault)}
              className={`w-5 h-5 rounded-md border-2 flex items-center justify-center flex-shrink-0 cursor-pointer transition-all
                          ${form.isDefault ? 'bg-brand-500 border-brand-500' : 'border-dark-200 bg-white'}`}
            >
              {form.isDefault && <Check size={12} className="text-dark-900" strokeWidth={3} />}
            </div>
            <span className="text-xs font-semibold text-dark-700">Set as default delivery address</span>
          </label>

        </div>
      </form>

      {/* Footer actions */}
      <div className="px-4 py-4 border-t border-dark-100 bg-white flex gap-3 flex-shrink-0 shadow-[0_-4px_20px_rgba(0,0,0,0.06)]">
        <button type="button" onClick={onBack} className="flex-1 btn-secondary py-3 text-sm">
          ← Change Location
        </button>
        <button
          onClick={handleSubmit}
          disabled={saving}
          className="flex-1 btn-primary py-3 text-sm font-bold flex items-center justify-center gap-2"
        >
          {saving
            ? <><Loader2 size={16} className="animate-spin" /> Saving…</>
            : <><Check size={16} /> Confirm & Save</>
          }
        </button>
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// Root: LocationPickerModal — manages step state
// ─────────────────────────────────────────────────────────────────────────────
export default function LocationPickerModal({ isOpen, onClose, onSave, initialValues, autoLocate }) {
  const [step, setStep]                           = useState('map');
  const [confirmedLat, setConfirmedLat]           = useState(null);
  const [confirmedLng, setConfirmedLng]           = useState(null);
  const [confirmedAddress, setConfirmedAddress]   = useState(null);

  const handleMapConfirm = useCallback((lat, lng, addressData) => {
    setConfirmedLat(lat);
    setConfirmedLng(lng);
    setConfirmedAddress(addressData);
    setStep('form');
  }, []);

  const handleClose = () => {
    setStep('map');
    setConfirmedLat(null);
    setConfirmedLng(null);
    setConfirmedAddress(null);
    onClose();
  };

  const handleSave = async (payload) => {
    await onSave(payload);
    handleClose();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[60] flex flex-col">
      {/* Backdrop */}
      <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={handleClose} />

      {/* Modal sheet */}
      <div
        className="relative w-full h-full sm:h-[90vh] sm:max-w-lg sm:m-auto
                   bg-white sm:rounded-3xl shadow-2xl flex flex-col overflow-hidden
                   animate-slide-up sm:animate-scale-in"
        style={{ minHeight: 0 }}
      >
        {step === 'map' ? (
          <GoogleMapPicker
            initialLat={confirmedLat ?? initialValues?.latitude  ?? null}
            initialLng={confirmedLng ?? initialValues?.longitude ?? null}
            initialAddress={initialValues}
            onConfirm={handleMapConfirm}
            onClose={handleClose}
            autoLocate={autoLocate}
          />
        ) : (
          <AddressDetailsForm
            geocodedData={confirmedAddress}
            lat={confirmedLat}
            lng={confirmedLng}
            initialValues={initialValues}
            onBack={() => setStep('map')}
            onSave={handleSave}
          />
        )}
      </div>
    </div>
  );
}
