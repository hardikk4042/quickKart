// src/components/maps/GoogleMapPicker.jsx
import { useState, useCallback, useRef, useEffect } from 'react';
import { GoogleMap, useLoadScript } from '@react-google-maps/api';
import { Navigation, Search, X, ChevronRight, Loader2, AlertCircle } from 'lucide-react';
import { addressAPI } from '@services/address.api';

const INDIA_CENTER = { lat: 20.5937, lng: 78.9629 };
const INDIA_ZOOM = 5;

const libraries = [];

export default function GoogleMapPicker({ initialLat, initialLng, initialAddress, onConfirm, onClose, autoLocate }) {
  const { isLoaded, loadError } = useLoadScript({
    googleMapsApiKey: import.meta.env.VITE_GOOGLE_MAPS_API_KEY || '',
    libraries,
  });

  const mapRef = useRef(null);
  const debounceRef = useRef(null);
  const autoFiredRef = useRef(false);
  const placesPanRef = useRef(false);
  const isGeocodingRef = useRef(false);       // guard: only one geocode at a time
  const lastGeocodedPosRef = useRef(null);    // { lat, lng } of last reverse-geocoded position
  const userDraggedRef = useRef(false);       // true only after real user drag interaction
  // Track whether we opened with a pre-existing manual address (preserve text on drag)
  const hasInitialAddressRef = useRef(!!initialAddress);
  // Capture initial props in refs so callbacks always see latest values
  const initLatRef = useRef(initialLat);
  const initLngRef = useRef(initialLng);
  const initAddrRef = useRef(initialAddress);

  const [geocoding, setGeocoding] = useState(false);
  const [locating, setLocating] = useState(false);
  const [detectedAddress, setDetectedAddress] = useState(initialAddress || null);
  const [locationError, setLocationError] = useState(null);

  const buildAddressQuery = (addr) =>
    addr ? [addr.line1, addr.city, addr.state, addr.pincode, addr.country || 'India']
      .filter(Boolean).join(', ') : '';

  const [searchQuery, setSearchQuery] = useState(() => buildAddressQuery(initialAddress));

  // ── Reverse geocode ────────────────────────────────────────────────
  const reverseGeocode = useCallback((lat, lng) => {
    if (isGeocodingRef.current) return;
    isGeocodingRef.current = true;
    lastGeocodedPosRef.current = { lat, lng };  // record position BEFORE async work
    setGeocoding(true);
    setLocationError(null);

    const done = (line1, city, state, pincode, country) => {
      isGeocodingRef.current = false;
      // Batch both state updates together to minimise re-renders
      setDetectedAddress({ lat, lng, line1, city, state, pincode, country });
      setGeocoding(false);
    };

    // Use google.maps.Geocoder — always authorized when the map is loaded
    if (window.google?.maps?.Geocoder) {
      const geocoder = new window.google.maps.Geocoder();
      geocoder.geocode({ location: { lat, lng } }, (results, status) => {
        if (status === 'OK' && results?.[0]) {
          const comps = results[0].address_components || [];
          const get = (...types) =>
            comps.find((c) => types.some((t) => c.types.includes(t)))?.long_name || '';
          done(
            get('sublocality_level_1', 'sublocality', 'route', 'premise') ||
              results[0].formatted_address.split(',')[0] || `(${lat.toFixed(4)}, ${lng.toFixed(4)})`,
            get('locality', 'administrative_area_level_2'),
            get('administrative_area_level_1'),
            get('postal_code'),
            get('country') || 'India',
          );
        } else {
          // Fall back to Nominatim
          addressAPI.reverseGeocode(lat, lng)
            .then((res) => {
              const a = res?.address || {};
              done(a.line1 || `(${lat.toFixed(4)}, ${lng.toFixed(4)})`, a.city || '', a.state || '', a.pincode || '', a.country || 'India');
            })
            .catch(() => done(`Location (${lat.toFixed(4)}, ${lng.toFixed(4)})`, '', '', '', 'India'));
        }
      });
      return;
    }

    // No Google Maps SDK — fallback to Nominatim
    addressAPI.reverseGeocode(lat, lng)
      .then((res) => {
        const a = res?.address || {};
        done(a.line1 || `(${lat.toFixed(4)}, ${lng.toFixed(4)})`, a.city || '', a.state || '', a.pincode || '', a.country || 'India');
      })
      .catch(() => done(`Location (${lat.toFixed(4)}, ${lng.toFixed(4)})`, '', '', '', 'India'));
  }, []);

  // ── GPS helpers ───────────────────────────────────────────────────────────
  const fetchPosition = useCallback(() => new Promise((resolve, reject) => {
    if (!navigator.geolocation) {
      return reject(new Error('Geolocation is not supported by your browser.'));
    }
    let settled = false;
    const done = (fn, val) => {
      if (!settled) { settled = true; clearTimeout(hard); fn(val); }
    };
    const hard = setTimeout(
      () => done(reject, new Error('Location timed out. Move the map or search manually.')),
      6000
    );
    navigator.geolocation.getCurrentPosition(
      (p) => done(resolve, p),
      () => navigator.geolocation.getCurrentPosition(
        (p) => done(resolve, p),
        (e) => done(reject, e),
        { timeout: 3000, enableHighAccuracy: false, maximumAge: 60000 }
      ),
      { timeout: 3000, enableHighAccuracy: true, maximumAge: 30000 }
    );
  }), []);

  const doLocate = useCallback(async () => {
    setLocating(true);
    setLocationError(null);
    try {
      const pos = await fetchPosition();
      const { latitude, longitude } = pos.coords;
      // Mark as fired so the idle guard allows reverse geocoding after GPS pan
      autoFiredRef.current = true;
      if (mapRef.current) {
        mapRef.current.panTo({ lat: latitude, lng: longitude });
        mapRef.current.setZoom(17);
      }
    } catch (err) {
      const msgs = {
        1: 'Location permission denied. Search for your address below.',
        2: 'Could not determine your location. Please search manually.',
        3: 'Location timed out. Move the map or search manually.',
      };
      setLocationError(msgs[err.code] || err.message || 'Could not get location.');
    } finally {
      setLocating(false);
    }
  }, [fetchPosition]);

  // ── Auto-locate ───────────────────────────────────────────────────────────
  useEffect(() => {
    if (isLoaded && autoLocate && !autoFiredRef.current) {
      autoFiredRef.current = true;
      setTimeout(() => doLocate(), 300);
    }
  }, [isLoaded, autoLocate, doLocate]);

  // ── Handlers ──────────────────────────────────────────────────────────────
  const handleUseCurrentLocation = () => {
    doLocate();
  };

  const handleMapLoad = useCallback((map) => {
    mapRef.current = map;
    setTimeout(() => {
      const lat0 = initLatRef.current;
      const lng0 = initLngRef.current;
      const addr0 = hasInitialAddressRef.current
        ? { city: map.__initAddr?.city, state: map.__initAddr?.state, pincode: map.__initAddr?.pincode, country: map.__initAddr?.country }
        : null;

      if (lat0 && lng0) {
        // Already have coordinates — pan directly
        map.panTo({ lat: lat0, lng: lng0 });
        map.setZoom(16);
        return;
      }

      if (hasInitialAddressRef.current && window.google?.maps?.Geocoder) {
        const addrSnapshot = initAddrRef.current;
        const line1   = addrSnapshot?.line1   || '';
        const city    = addrSnapshot?.city    || '';
        const state   = addrSnapshot?.state   || '';
        const pincode = addrSnapshot?.pincode || '';
        const country = addrSnapshot?.country || 'India';

        // Try full address first for max precision, fall back to city+pincode
        const queries = [
          [line1, city, state, pincode, country].filter(Boolean).join(', '),
          [city, state, pincode, country].filter(Boolean).join(', '),
        ].filter((q) => q.trim().length > 2);

        const tryGeocode = (index = 0) => {
          if (index >= queries.length) return; // give up, user can drag

          const geocoder = new window.google.maps.Geocoder();
          geocoder.geocode({ address: queries[index], region: 'IN' }, (results, status) => {
            if (status === 'OK' && results && results[0]) {
              const result = results[0];
              const loc    = result.geometry.location;
              const type   = result.geometry.location_type;
              const bounds = result.geometry.bounds || result.geometry.viewport;

              placesPanRef.current = true;

              if (type === 'ROOFTOP' || type === 'RANGE_INTERPOLATED') {
                // Exact or interpolated street address — zoom to street level
                map.panTo({ lat: loc.lat(), lng: loc.lng() });
                map.setZoom(17);
              } else if (bounds) {
                // Approximate — fit the area bounds so user sees the neighborhood
                map.fitBounds(bounds);
              } else {
                map.panTo({ lat: loc.lat(), lng: loc.lng() });
                map.setZoom(15);
              }

              setDetectedAddress((prev) => prev
                ? { ...prev, lat: loc.lat(), lng: loc.lng() }
                : { lat: loc.lat(), lng: loc.lng() }
              );
              setGeocoding(false);
            } else {
              // This query failed — try the next simpler one
              tryGeocode(index + 1);
              if (index + 1 >= queries.length) setGeocoding(false);
            }
          });
        };

        if (queries.length > 0) {
          setGeocoding(true);
          tryGeocode(0);
        }
      }


    }, 0);
  }, []);

  const handleMapDragStart = useCallback(() => {
    userDraggedRef.current = true;
  }, []);

  const handleMapIdle = useCallback(() => {
    if (!mapRef.current) return;
    const center = mapRef.current.getCenter();
    if (!center) return;

    const lat = center.lat();
    const lng = center.lng();

    // Skip India default center on first load (no interaction yet)
    const isDefaultCenter =
      Math.abs(lat - INDIA_CENTER.lat) < 0.01 &&
      Math.abs(lng - INDIA_CENTER.lng) < 0.01;
    if (isDefaultCenter && !autoFiredRef.current && !initLatRef.current) return;

    // Prevent overwriting after a programmatic pan (GPS/search)
    if (placesPanRef.current) {
      placesPanRef.current = false;
      return;
    }

    // Skip if the position hasn't moved since the last geocode
    const last = lastGeocodedPosRef.current;
    if (last && Math.abs(lat - last.lat) < 0.0001 && Math.abs(lng - last.lng) < 0.0001) return;

    // Only geocode if the user actually dragged the map (not on programmatic pans/re-renders)
    if (!userDraggedRef.current) return;
    userDraggedRef.current = false;

    clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(() => {
      reverseGeocode(lat, lng);
    }, 700);
  }, [reverseGeocode]);


  const handleSearchSubmit = async (e) => {
    e.preventDefault();
    if (!searchQuery.trim() || !mapRef.current) return;

    setGeocoding(true);
    setLocationError(null);

    const panToResult = (lat, lng, addrOverride) => {
      setDetectedAddress({
        line1:   addrOverride?.line1   || searchQuery,
        city:    addrOverride?.city    || '',
        state:   addrOverride?.state   || '',
        pincode: addrOverride?.pincode || '',
        country: addrOverride?.country || 'India',
        lat, lng,
      });
      // After searching, allow future drags to reverse-geocode freely
      hasInitialAddressRef.current = false;
      placesPanRef.current = true;
      mapRef.current.panTo({ lat, lng });
      mapRef.current.setZoom(16);
    };

    // Use google.maps.Geocoder — always authorized if the map loaded
    if (window.google?.maps?.Geocoder) {
      const geocoder = new window.google.maps.Geocoder();
      geocoder.geocode({ address: searchQuery, region: 'IN' }, (results, status) => {
        setGeocoding(false);
        if (status === 'OK' && results && results[0]) {
          const loc = results[0].geometry.location;
          const comps = results[0].address_components || [];
          const get = (...types) => comps.find((c) => types.some((t) => c.types.includes(t)))?.long_name || '';
          panToResult(loc.lat(), loc.lng(), {
            line1:   searchQuery,
            city:    get('locality', 'administrative_area_level_2'),
            state:   get('administrative_area_level_1'),
            pincode: get('postal_code'),
            country: get('country') || 'India',
          });
        } else {
          // Fallback to backend Nominatim
          addressAPI.forwardGeocode(searchQuery)
            .then((result) => {
              if (result?.latitude && result?.longitude) {
                panToResult(result.latitude, result.longitude, result.address);
              } else {
                setLocationError('Address not found. Try: "City, State" e.g. "Yamuna Nagar, Haryana"');
              }
            })
            .catch(() => setLocationError('Search failed. Please check your connection.'))
            .finally(() => setGeocoding(false));
        }
      });
      return;
    }

    // No Google Maps SDK — fallback to Nominatim
    try {
      const result = await addressAPI.forwardGeocode(searchQuery);
      if (result?.latitude && result?.longitude) {
        panToResult(result.latitude, result.longitude, result.address);
      } else {
        setLocationError('Address not found. Try: "City, State" e.g. "Yamuna Nagar, Haryana"');
      }
    } catch {
      setLocationError('Search failed. Please check your connection.');
    } finally {
      setGeocoding(false);
    }
  };

  const handleConfirm = () => {
    if (!mapRef.current) return;
    const center = mapRef.current.getCenter();

    const lat = detectedAddress?.lat ?? center?.lat();
    const lng = detectedAddress?.lng ?? center?.lng();
    if (lat == null || lng == null) return;
    onConfirm(lat, lng, detectedAddress || {});
  };

  const addressSummary = detectedAddress
    ? [detectedAddress.line1, detectedAddress.city, detectedAddress.state, detectedAddress.pincode]
        .filter(Boolean).join(', ')
    : null;

  if (loadError) {
    return (
      <div className="flex flex-col h-full items-center justify-center p-6 text-center">
        <AlertCircle size={32} className="text-error mb-3" />
        <h2 className="text-lg font-bold text-dark-900 mb-2">Map Load Error</h2>
        <p className="text-sm text-dark-600 mb-4">Could not load Google Maps. Please check your API key and connection.</p>
        <button onClick={onClose} className="btn-secondary">Close</button>
      </div>
    );
  }

  if (!isLoaded) {
    return (
      <div className="flex flex-col h-full items-center justify-center p-6 text-center">
        <Loader2 size={32} className="text-brand-600 animate-spin mb-3" />
        <p className="text-sm font-semibold text-dark-900">Loading Map...</p>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-full">

      {/* ── Header ───────────────────────────────────────────────────────── */}
      <div className="flex items-center justify-between px-4 py-3 border-b border-dark-100 bg-white flex-shrink-0">
        <div>
          <h2 className="text-base font-bold text-dark-900">Select Delivery Location</h2>
          <p className="text-xs text-dark-400">Move the map to pin your exact delivery point</p>
        </div>
        <button onClick={onClose} className="p-2 hover:bg-dark-50 rounded-xl text-dark-500 transition-colors">
          <X size={20} />
        </button>
      </div>

      {/* ── Search bar ───────────────────────────────────────────────────── */}
      <div className="px-4 py-3 bg-white border-b border-dark-50 flex-shrink-0 relative z-[1000]">
        <form onSubmit={handleSearchSubmit} className="relative">
          <Search
            size={16}
            className="absolute left-3.5 top-1/2 -translate-y-1/2 text-dark-400 pointer-events-none"
          />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search for area, street, city and hit Enter…"
            className="w-full pl-10 pr-10 py-3 bg-white border border-dark-100 rounded-2xl text-sm
                       shadow-sm focus:outline-none focus:border-brand-500 focus:ring-2 focus:ring-brand-500/20
                       placeholder:text-dark-300 font-medium transition-all"
          />
          {searchQuery && (
            <button
              type="button"
              onClick={() => { setSearchQuery(''); }}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-dark-400 hover:text-dark-700 z-10"
            >
              <X size={14} />
            </button>
          )}
        </form>
      </div>

      {/* ── Map + fixed centered pin ─────────────────────────────────────── */}
      <div className="relative flex-1 min-h-0" style={{ minHeight: 300 }}>
        
        <GoogleMap
          mapContainerStyle={{ width: '100%', height: '100%', position: 'absolute', inset: 0 }}
          center={initialLat && initialLng ? { lat: initialLat, lng: initialLng } : INDIA_CENTER}
          zoom={initialLat && initialLng ? 16 : INDIA_ZOOM}
          onLoad={handleMapLoad}
          onIdle={handleMapIdle}
          onDragStart={handleMapDragStart}
          options={{
            disableDefaultUI: true,
            zoomControl: true,
          }}
        />

        {/* GPS acquiring overlay */}
        {locating && (
          <div className="absolute inset-0 z-[1000] flex items-center justify-center bg-black/10 backdrop-blur-[2px]">
            <div className="bg-white rounded-2xl px-5 py-4 shadow-card-hover
                            flex flex-col items-center text-center gap-2 border border-dark-100 max-w-xs mx-4">
              <Loader2 size={24} className="animate-spin text-brand-600" />
              <div>
                <p className="text-sm font-bold text-dark-900">Getting your location…</p>
                <p className="text-xs text-dark-400 mt-0.5">Allow location access if asked by your browser</p>
              </div>
              <button
                type="button"
                onClick={() => setLocating(false)}
                className="mt-1 text-xs font-semibold text-brand-700 hover:text-brand-900 underline cursor-pointer"
              >
                Skip & Pick on Map
              </button>
            </div>
          </div>
        )}

        {/* Fixed center pin — tip anchored at geographic center */}
        <div
          className="absolute pointer-events-none z-[900]"
          style={{ top: '50%', left: '50%', transform: 'translate(-50%, -100%)', paddingBottom: 2 }}
        >
          {/* Geocoding pulse ring */}
          {geocoding && (
            <div
              className="absolute rounded-full border-2 border-brand-400/60 animate-ping"
              style={{ width: 44, height: 44, top: 4, left: 4 }}
            />
          )}
          {/* Teardrop SVG pin */}
          <svg
            width="52"
            height="52"
            viewBox="0 0 52 52"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
          >
            <path
              d="M26 4C17.163 4 10 11.163 10 20c0 13 16 28 16 28s16-15 16-28C42 11.163 34.837 4 26 4z"
              fill="#F6C90E"
              stroke="white"
              strokeWidth="2.5"
            />
            <circle cx="26" cy="20" r="6" fill="white" opacity="0.85" />
            <circle cx="26" cy="20" r="3" fill="#1a1a1a" />
          </svg>
        </div>

        {/* GPS button (bottom-right of map) */}
        <button
          onClick={handleUseCurrentLocation}
          disabled={locating}
          title="Use my current location"
          className="absolute bottom-4 right-4 z-[900] w-12 h-12 bg-white rounded-2xl shadow-card-hover
                     flex items-center justify-center border border-dark-100
                     hover:bg-brand-50 transition-all active:scale-95 disabled:opacity-60"
        >
          {locating
            ? <Loader2 size={18} className="animate-spin text-brand-600" />
            : <Navigation size={18} className="text-brand-700" />
          }
        </button>
      </div>

      {/* ── Bottom panel — detected address + confirm ─────────────────────── */}
      <div className="bg-white border-t border-dark-100 flex-shrink-0 px-4 pt-3 pb-4">
        {locationError && (
          <div className="flex items-start gap-2 text-xs text-error mb-2 bg-error/5 px-3 py-2 rounded-xl border border-error/20">
            <AlertCircle size={13} className="mt-0.5 flex-shrink-0" />
            <span>{locationError}</span>
          </div>
        )}

        {geocoding ? (
          <div className="flex items-center gap-2 text-sm text-dark-400">
            <Loader2 size={14} className="animate-spin" />
            <span>Detecting address…</span>
          </div>
        ) : addressSummary ? (
          <div className="mb-3">
            <p className="text-[11px] text-dark-400 font-semibold uppercase tracking-wide mb-0.5">
              📍 Pinned location
            </p>
            <p className="text-sm font-semibold text-dark-900 line-clamp-2">{addressSummary}</p>
            {hasInitialAddressRef.current && (
              <p className="text-[11px] text-brand-700 font-semibold mt-1.5 bg-brand-50 px-2 py-1.5 rounded-lg">
                👆 Drag the map so the pin points to your exact location, then confirm.
              </p>
            )}
          </div>
        ) : (
          <p className="text-sm text-dark-400 mb-3">
            Move the map to select your delivery location, then confirm.
          </p>
        )}


        <button
          onClick={handleConfirm}
          disabled={geocoding || (!detectedAddress && !mapRef.current)}
          className="w-full btn-primary py-3.5 text-sm font-bold flex items-center justify-center gap-2
                     disabled:opacity-40 disabled:cursor-not-allowed"
        >
          Confirm This Location
          <ChevronRight size={18} />
        </button>
      </div>

    </div>
  );
}
