// src/pages/AddressesPage.jsx
import { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import {
  ArrowLeft, MapPin, Home, Briefcase, Plus, Star,
  Trash2, Edit3, Navigation, Check, Loader2, PenLine, X,
} from 'lucide-react';
import useLocationStore from '@store/locationStore';
import useAuthStore from '@store/authStore';
import Modal from '@components/common/Modal';
import LocationPickerModal from '@components/maps/LocationPickerModal';
import { addressAPI } from '@services/address.api';
import toast from 'react-hot-toast';

const LABEL_ICONS = { Home, Work: Briefcase };

export default function AddressesPage() {
  const navigate = useNavigate();
  const { isLoggedIn } = useAuthStore();
  const { addresses: storeAddresses, fetchAddresses, addAddress, updateAddress, deleteAddress, setDefault } = useLocationStore();
  const addresses = Array.isArray(storeAddresses) ? storeAddresses : [];

  // ── Modal state ───────────────────────────────────────────────────
  const [chooserOpen, setChooserOpen]               = useState(false); // "how to add?" sheet
  const [locationPickerOpen, setLocationPickerOpen] = useState(false); // map picker
  const [autoLocate, setAutoLocate]                 = useState(false); // auto-trigger GPS on map open
  const [formModalOpen, setFormModalOpen]           = useState(false); // manual text form
  const [editingId, setEditingId]                   = useState(null);
  const [editingInitialValues, setEditingInitialValues] = useState(null);
  const [loading, setLoading]                       = useState(false);

  // Text form state (used for both manual-add and quick-edit)
  const EMPTY_FORM = {
    label: 'Home', line1: '', line2: '',
    city: '', state: '', pincode: '', country: 'India',
    latitude: null, longitude: null, isDefault: false,
  };
  const [form, setForm]   = useState(EMPTY_FORM);
  const [errors, setErrors] = useState({});

  // ── Auth guard ────────────────────────────────────────────────────
  useEffect(() => {
    if (!isLoggedIn) {
      navigate('/login?redirect=/account/addresses');
      return;
    }
    fetchAddresses();
  }, [isLoggedIn, navigate, fetchAddresses]);

  // ─────────────────────────────────────────────────────────────────
  // "Add Address" → show chooser (map vs manual)
  // ─────────────────────────────────────────────────────────────────
  const openChooser = () => {
    setEditingId(null);
    setChooserOpen(true);
  };

  // Chooser → Map path (auto-fires GPS when map opens)
  const openAddWithMap = () => {
    setChooserOpen(false);
    setEditingId(null);
    setEditingInitialValues({ isDefault: addresses.length === 0 });
    setAutoLocate(true);   // ← GPS fires automatically when map is ready
    setLocationPickerOpen(true);
  };

  // Chooser → Manual path
  const openAddManually = () => {
    setChooserOpen(false);
    setEditingId(null);
    setForm({ ...EMPTY_FORM, isDefault: addresses.length === 0 });
    setErrors({});
    setFormModalOpen(true);
  };

  // ─────────────────────────────────────────────────────────────────
  // Edit existing address → text form (quick edit)
  // ─────────────────────────────────────────────────────────────────
  const openEditForm = (addr) => {
    setEditingId(addr.id);
    setForm({
      label:     addr.label     || 'Home',
      line1:     addr.line1     || '',
      line2:     addr.line2     || '',
      city:      addr.city      || '',
      state:     addr.state     || '',
      pincode:   addr.pincode   || '',
      country:   addr.country   || 'India',
      latitude:  addr.latitude  ?? null,
      longitude: addr.longitude ?? null,
      isDefault: addr.isDefault || false,
    });
    setErrors({});
    setFormModalOpen(true);
  };

  // Re-pick / View location on map
  const openEditWithMap = async (addr) => {
    setEditingId(addr.id);
    let lat = null;
    let lng = null;

    // Always try Google Geocoding first for maximum accuracy
    try {
      const query = [addr.line1, addr.city, addr.state, addr.pincode, addr.country || 'India']
        .filter(Boolean).join(', ');
      const apiKey = import.meta.env.VITE_GOOGLE_MAPS_API_KEY;
      const res = await fetch(`https://maps.googleapis.com/maps/api/geocode/json?address=${encodeURIComponent(query)}&key=${apiKey}`);
      const data = await res.json();

      if (data.results && data.results.length > 0) {
        lat = data.results[0].geometry.location.lat;
        lng = data.results[0].geometry.location.lng;
      }
    } catch (err) {
      console.warn('Google Geocode failed, using stored coords:', err);
    }

    // Fallback to stored coordinates if Google failed
    if (!lat || !lng) {
      lat = addr.latitude ?? null;
      lng = addr.longitude ?? null;
    }

    setEditingInitialValues({
      label:     addr.label     || 'Home',
      line1:     addr.line1     || '',
      line2:     addr.line2     || '',
      city:      addr.city      || '',
      state:     addr.state     || '',
      pincode:   addr.pincode   || '',
      country:   addr.country   || 'India',
      latitude:  lat,
      longitude: lng,
      isDefault: addr.isDefault || false,
    });
    setAutoLocate(false);
    setLocationPickerOpen(true);
  };

  // ─────────────────────────────────────────────────────────────────
  // Save from LocationPickerModal (map → form confirm)
  // ─────────────────────────────────────────────────────────────────
  const handleSaveFromMap = async (payload) => {
    if (editingId) {
      await updateAddress(editingId, payload);
      toast.success('Address updated successfully');
    } else {
      await addAddress(payload);
      toast.success('Address saved successfully');
    }
  };

  // ─────────────────────────────────────────────────────────────────
  // Manual form validation & submit (add OR edit)
  // ─────────────────────────────────────────────────────────────────
  const validate = () => {
    const errs = {};
    if (!form.label.trim())   errs.label   = 'Label is required';
    if (!form.line1.trim())   errs.line1   = 'Address line 1 is required';
    if (!form.city.trim())    errs.city    = 'City is required';
    if (!form.state.trim())   errs.state   = 'State is required';
    if (!form.pincode.trim()) errs.pincode = 'Pincode is required';
    else if (!/^[\d\s\-]{3,10}$/.test(form.pincode.trim())) errs.pincode = 'Enter a valid pincode';
    setErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const handleFormSubmit = async (e) => {
    e.preventDefault();
    if (!validate()) return;
    setLoading(true);
    try {
      let lat = form.latitude ? parseFloat(form.latitude) : null;
      let lng = form.longitude ? parseFloat(form.longitude) : null;

      if (lat === null || lng === null) {
        try {
          const query = `${form.line1.trim()}, ${form.city.trim()}, ${form.state.trim()}, ${form.pincode.trim()}, ${form.country || 'India'}`;
          const apiKey = import.meta.env.VITE_GOOGLE_MAPS_API_KEY;
          const res = await fetch(`https://maps.googleapis.com/maps/api/geocode/json?address=${encodeURIComponent(query)}&key=${apiKey}`);
          const data = await res.json();
          
          if (data.results && data.results.length > 0) {
            lat = data.results[0].geometry.location.lat;
            lng = data.results[0].geometry.location.lng;
          } else {
            console.warn('Google Geocode failed on save:', data);
            const geoResult = await addressAPI.forwardGeocode(query);
            if (geoResult?.latitude && geoResult?.longitude) {
              lat = geoResult.latitude;
              lng = geoResult.longitude;
            }
          }
        } catch (err) {
          console.error('Geocode save error:', err);
        }
      }

      const payload = {
        label:     form.label.trim(),
        line1:     form.line1.trim(),
        line2:     form.line2 ? form.line2.trim() : null,
        city:      form.city.trim(),
        state:     form.state.trim(),
        pincode:   form.pincode.trim(),
        country:   form.country || 'India',
        latitude:  lat,
        longitude: lng,
        isDefault: form.isDefault,
      };

      if (editingId) {
        await updateAddress(editingId, payload);
        toast.success('Address updated successfully');
      } else {
        await addAddress(payload);
        toast.success('Address saved successfully');
      }
      setFormModalOpen(false);
    } catch (err) {
      toast.error(err.message || 'Failed to save address');
    } finally {
      setLoading(false);
    }
  };

  // ─────────────────────────────────────────────────────────────────
  // Delete & Set Default
  // ─────────────────────────────────────────────────────────────────
  const handleDelete = async (id, label) => {
    if (!window.confirm(`Delete address '${label}'?`)) return;
    try {
      await deleteAddress(id);
      toast.success('Address deleted');
    } catch (err) {
      toast.error(err.message || 'Failed to delete address');
    }
  };

  const handleSetDefault = async (id) => {
    try {
      await setDefault(id);
      toast.success('Default address updated');
    } catch (err) {
      toast.error(err.message || 'Failed to set default address');
    }
  };

  // ─────────────────────────────────────────────────────────────────
  // Render
  // ─────────────────────────────────────────────────────────────────
  return (
    <div className="max-w-3xl mx-auto px-4 py-6 pb-24 md:pb-12">

      {/* Page header */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <Link
            to="/account"
            className="w-10 h-10 bg-white rounded-2xl flex items-center justify-center border border-dark-100 hover:bg-dark-50 text-dark-700 transition-colors"
          >
            <ArrowLeft size={20} />
          </Link>
          <div>
            <h1 className="text-2xl font-bold text-dark-900">Saved Addresses</h1>
            <p className="text-xs text-dark-400">Manage your delivery locations</p>
          </div>
        </div>
        <button onClick={openChooser} className="btn-primary text-xs px-4 py-2.5 flex items-center gap-1.5">
          <Plus size={16} /> Add Address
        </button>
      </div>

      {/* ── Empty state ────────────────────────────────────────────── */}
      {addresses.length === 0 ? (
        <div className="bg-white rounded-3xl p-10 text-center shadow-card border border-dark-100">
          <div className="w-16 h-16 bg-brand-50 rounded-2xl flex items-center justify-center mx-auto mb-4 text-brand-600">
            <MapPin size={32} />
          </div>
          <h3 className="text-lg font-bold text-dark-900 mb-1">No addresses saved yet</h3>
          <p className="text-xs text-dark-400 max-w-sm mx-auto mb-6">
            Add a delivery address using GPS or enter it manually.
          </p>
          <button onClick={openChooser} className="btn-primary text-sm px-5 py-2.5 inline-flex items-center gap-2">
            <Plus size={16} /> Add Your First Address
          </button>
        </div>
      ) : (
        <>
          {/* Quick-add card */}
          <button
            onClick={openChooser}
            className="w-full mb-4 flex items-center gap-3 p-4 bg-brand-50 hover:bg-brand-100 border-2 border-dashed border-brand-300
                       rounded-3xl transition-all group"
          >
            <div className="w-10 h-10 bg-brand-500 rounded-xl flex items-center justify-center group-hover:scale-105 transition-transform flex-shrink-0">
              <Plus size={18} className="text-dark-900" />
            </div>
            <div className="text-left">
              <p className="font-bold text-dark-900 text-sm">Add New Address</p>
              <p className="text-xs text-dark-500 font-normal">Pick on map or enter manually</p>
            </div>
          </button>

          {/* Address cards */}
          <div className="space-y-4">
            {addresses.map((addr) => {
              const Icon = LABEL_ICONS[addr.label] || MapPin;
              return (
                <div
                  key={addr.id}
                  className={`bg-white rounded-3xl p-5 shadow-card border-2 transition-all
                              ${addr.isDefault ? 'border-brand-500 bg-brand-50/20' : 'border-dark-100'}`}
                >
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex items-start gap-3.5">
                      <div className={`p-3 rounded-2xl flex-shrink-0
                                       ${addr.isDefault ? 'bg-brand-500 text-dark-900' : 'bg-dark-50 text-dark-500'}`}>
                        <Icon size={20} />
                      </div>
                      <div>
                        <div className="flex items-center gap-2 mb-1">
                          <span className="font-bold text-dark-900 text-base">{addr.label}</span>
                          {addr.isDefault && (
                            <span className="inline-flex items-center gap-1 text-xs bg-brand-100 text-brand-800 px-2.5 py-0.5 rounded-full font-bold">
                              <Star size={11} fill="currentColor" /> Default
                            </span>
                          )}
                        </div>
                        <p className="text-dark-700 text-sm font-medium leading-snug">
                          {addr.line1}
                          {addr.line2 ? `, ${addr.line2}` : ''}
                        </p>
                        <p className="text-dark-400 text-xs mt-0.5">
                          {addr.city}, {addr.state} —{' '}
                          <span className="font-semibold text-dark-600">{addr.pincode}</span>{' '}
                          ({addr.country || 'India'})
                        </p>
                        {addr.latitude && addr.longitude && (
                          <p className="text-[11px] text-brand-700 font-mono mt-1.5 flex items-center gap-1">
                            <Navigation size={11} />
                            {Number(addr.latitude).toFixed(5)}, {Number(addr.longitude).toFixed(5)}
                          </p>
                        )}
                      </div>
                    </div>

                    {/* Action icons */}
                    <div className="flex items-center gap-1 flex-shrink-0">
                      <button
                        onClick={() => openEditWithMap(addr)}
                        title="Re-pick location on map"
                        className="p-2 hover:bg-brand-50 rounded-xl text-brand-600 hover:text-brand-800 transition-colors"
                      >
                        <Navigation size={16} />
                      </button>
                      <button
                        onClick={() => openEditForm(addr)}
                        title="Edit address details"
                        className="p-2 hover:bg-dark-100 rounded-xl text-dark-500 hover:text-dark-900 transition-colors"
                      >
                        <Edit3 size={16} />
                      </button>
                      <button
                        onClick={() => handleDelete(addr.id, addr.label)}
                        title="Delete address"
                        className="p-2 hover:bg-red-50 rounded-xl text-dark-400 hover:text-error transition-colors"
                      >
                        <Trash2 size={16} />
                      </button>
                    </div>
                  </div>

                  {!addr.isDefault && (
                    <div className="mt-4 pt-3 border-t border-dark-100 flex justify-end">
                      <button
                        onClick={() => handleSetDefault(addr.id)}
                        className="text-xs font-semibold text-brand-700 hover:text-brand-900 flex items-center gap-1 hover:underline"
                      >
                        <Check size={13} /> Set as Default
                      </button>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </>
      )}

      {/* ══════════════════════════════════════════════════════════════
          METHOD CHOOSER — "How would you like to add your address?"
          Bottom sheet modal with two clear options
         ══════════════════════════════════════════════════════════════ */}
      <Modal isOpen={chooserOpen} onClose={() => setChooserOpen(false)} size="md">
        <div className="px-6 pt-6 pb-8">
          {/* Handle bar */}
          <div className="w-10 h-1 bg-dark-200 rounded-full mx-auto mb-6" />

          <h2 className="text-xl font-bold text-dark-900 text-center mb-1">Add New Address</h2>
          <p className="text-sm text-dark-400 text-center mb-8">How would you like to provide your delivery location?</p>

          <div className="space-y-3">
            {/* Option A — Map */}
            <button
              onClick={openAddWithMap}
              className="w-full flex items-center gap-4 p-5 rounded-2xl border-2 border-dark-100
                         hover:border-brand-400 hover:bg-brand-50/50 transition-all group text-left"
            >
              <div className="w-14 h-14 bg-brand-100 group-hover:bg-brand-500 rounded-2xl flex items-center justify-center
                              flex-shrink-0 transition-colors">
                <Navigation size={24} className="text-brand-700 group-hover:text-dark-900 transition-colors" />
              </div>
              <div>
                <p className="font-bold text-dark-900 text-base mb-0.5">📍 Use My Current Location</p>
                <p className="text-xs text-dark-400 leading-relaxed">
                  Open the map, pick your exact spot, and confirm. GPS + manual adjustment.
                </p>
              </div>
            </button>

            {/* Option B — Manual */}
            <button
              onClick={openAddManually}
              className="w-full flex items-center gap-4 p-5 rounded-2xl border-2 border-dark-100
                         hover:border-dark-400 hover:bg-dark-50 transition-all group text-left"
            >
              <div className="w-14 h-14 bg-dark-100 group-hover:bg-dark-900 rounded-2xl flex items-center justify-center
                              flex-shrink-0 transition-colors">
                <PenLine size={24} className="text-dark-600 group-hover:text-white transition-colors" />
              </div>
              <div>
                <p className="font-bold text-dark-900 text-base mb-0.5">✏️ Enter Address Manually</p>
                <p className="text-xs text-dark-400 leading-relaxed">
                  Type your house, street, city, state and pincode. No GPS required.
                </p>
              </div>
            </button>
          </div>

          <button
            onClick={() => setChooserOpen(false)}
            className="w-full mt-4 py-2.5 text-sm text-dark-400 hover:text-dark-600 font-medium transition-colors flex items-center justify-center gap-1.5"
          >
            <X size={15} /> Cancel
          </button>
        </div>
      </Modal>

      {/* ══════════════════════════════════════════════════════════════
          GOOGLE MAPS / LEAFLET MAP PICKER (step 1: map, step 2: form)
         ══════════════════════════════════════════════════════════════ */}
      <LocationPickerModal
        isOpen={locationPickerOpen}
        onClose={() => { setLocationPickerOpen(false); setAutoLocate(false); }}
        onSave={handleSaveFromMap}
        initialValues={editingInitialValues}
        autoLocate={autoLocate}
      />

      {/* ══════════════════════════════════════════════════════════════
          MANUAL FORM MODAL (add without GPS, or quick text-edit)
         ══════════════════════════════════════════════════════════════ */}
      <Modal
        isOpen={formModalOpen}
        onClose={() => setFormModalOpen(false)}
        title={editingId ? 'Edit Address' : 'Add Address Manually'}
        size="md"
      >
        <div className="p-6">
          {/* If editing, offer map re-pick */}
          {editingId && (
            <>
              <button
                type="button"
                onClick={() => {
                  setFormModalOpen(false);
                  openEditWithMap({
                    id:        editingId,
                    label:     form.label,
                    line1:     form.line1,
                    line2:     form.line2,
                    city:      form.city,
                    state:     form.state,
                    pincode:   form.pincode,
                    country:   form.country,
                    latitude:  form.latitude,
                    longitude: form.longitude,
                    isDefault: form.isDefault,
                  });
                }}
                className="w-full flex items-center justify-center gap-2.5 py-3 px-4 bg-brand-50 hover:bg-brand-100
                           border-2 border-brand-300 rounded-2xl text-brand-900 font-bold text-sm transition-all mb-4"
              >
                <Navigation size={17} className="text-brand-700" />
                Re-pick Location on Map
              </button>
              <div className="relative flex items-center mb-4">
                <div className="flex-grow border-t border-dark-200" />
                <span className="flex-shrink mx-4 text-xs font-semibold text-dark-400 uppercase">Or edit details below</span>
                <div className="flex-grow border-t border-dark-200" />
              </div>
            </>
          )}

          <form onSubmit={handleFormSubmit} className="space-y-4" noValidate>
            {/* Label pills */}
            <div>
              <label className="text-xs font-semibold text-dark-700 mb-1.5 block">Address Type</label>
              <div className="flex gap-2">
                {['Home', 'Work', 'Other'].map((lbl) => (
                  <button
                    key={lbl}
                    type="button"
                    onClick={() => setForm({ ...form, label: lbl })}
                    className={`flex-1 py-2 rounded-xl text-xs font-bold border transition-all
                                ${form.label === lbl
                                  ? 'bg-dark-900 text-white border-dark-900'
                                  : 'bg-dark-50 text-dark-600 border-dark-200 hover:border-dark-400'}`}
                  >
                    {lbl}
                  </button>
                ))}
              </div>
              {errors.label && <p className="text-xs text-error mt-1">{errors.label}</p>}
            </div>

            {/* Line 1 */}
            <div>
              <label className="text-xs font-semibold text-dark-700 mb-1 block">
                House / Flat No., Street, Area <span className="text-error">*</span>
              </label>
              <input
                type="text"
                value={form.line1}
                onChange={(e) => setForm({ ...form, line1: e.target.value })}
                className={`input ${errors.line1 ? 'border-error' : ''}`}
                placeholder="e.g. Flat 204, MG Road, Green Park"
              />
              {errors.line1 && <p className="text-xs text-error mt-1">{errors.line1}</p>}
            </div>

            {/* Line 2 / Landmark */}
            <div>
              <label className="text-xs font-semibold text-dark-700 mb-1 block">Landmark (Optional)</label>
              <input
                type="text"
                value={form.line2 || ''}
                onChange={(e) => setForm({ ...form, line2: e.target.value })}
                className="input"
                placeholder="e.g. Near City Mall, Opposite Metro"
              />
            </div>

            {/* City & State */}
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="text-xs font-semibold text-dark-700 mb-1 block">City <span className="text-error">*</span></label>
                <input
                  type="text"
                  value={form.city}
                  onChange={(e) => setForm({ ...form, city: e.target.value })}
                  className={`input ${errors.city ? 'border-error' : ''}`}
                  placeholder="City"
                />
                {errors.city && <p className="text-xs text-error mt-1">{errors.city}</p>}
              </div>
              <div>
                <label className="text-xs font-semibold text-dark-700 mb-1 block">State <span className="text-error">*</span></label>
                <input
                  type="text"
                  value={form.state}
                  onChange={(e) => setForm({ ...form, state: e.target.value })}
                  className={`input ${errors.state ? 'border-error' : ''}`}
                  placeholder="State"
                />
                {errors.state && <p className="text-xs text-error mt-1">{errors.state}</p>}
              </div>
            </div>

            {/* Pincode & Country */}
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="text-xs font-semibold text-dark-700 mb-1 block">Pincode <span className="text-error">*</span></label>
                <input
                  type="text"
                  value={form.pincode}
                  onChange={(e) => setForm({ ...form, pincode: e.target.value })}
                  className={`input ${errors.pincode ? 'border-error' : ''}`}
                  placeholder="140401"
                />
                {errors.pincode && <p className="text-xs text-error mt-1">{errors.pincode}</p>}
              </div>
              <div>
                <label className="text-xs font-semibold text-dark-700 mb-1 block">Country</label>
                <input
                  type="text"
                  value={form.country}
                  onChange={(e) => setForm({ ...form, country: e.target.value })}
                  className="input"
                  placeholder="India"
                />
              </div>
            </div>

            {/* Default toggle */}
            <label className="flex items-center gap-2 cursor-pointer pt-1">
              <div
                onClick={() => setForm({ ...form, isDefault: !form.isDefault })}
                className={`w-5 h-5 rounded-md border-2 flex items-center justify-center flex-shrink-0 cursor-pointer transition-all
                            ${form.isDefault ? 'bg-brand-500 border-brand-500' : 'border-dark-200 bg-white'}`}
              >
                {form.isDefault && <Check size={12} className="text-dark-900" strokeWidth={3} />}
              </div>
              <span className="text-xs font-semibold text-dark-700">Set as default delivery address</span>
            </label>

            {/* Actions */}
            <div className="flex gap-3 pt-2">
              <button type="button" onClick={() => setFormModalOpen(false)} className="flex-1 btn-secondary py-3 text-sm">
                Cancel
              </button>
              <button
                type="submit"
                disabled={loading}
                className="flex-1 btn-primary py-3 text-sm font-bold flex items-center justify-center gap-2"
              >
                {loading
                  ? <Loader2 size={18} className="animate-spin" />
                  : <Check size={18} />
                }
                {editingId ? 'Update Address' : 'Save Address'}
              </button>
            </div>
          </form>
        </div>
      </Modal>
    </div>
  );
}
