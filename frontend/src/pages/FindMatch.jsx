import { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import toast from 'react-hot-toast';
import io from 'socket.io-client';
import {
  MapContainer,
  TileLayer,
  Marker,
  Popup,
  useMap,
  useMapEvents,
} from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';

const SOCKET_URL = 'https://routemate-q0su.onrender.com';
const TIMER_DURATION = 60;

// ── Fix leaflet icons ────────────────────────────────────
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png',
  iconUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png',
  shadowUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
});

const greenIcon = new L.Icon({
  iconUrl: 'https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-green.png',
  shadowUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
  iconSize: [25, 41],
  iconAnchor: [12, 41],
});

const redIcon = new L.Icon({
  iconUrl: 'https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-red.png',
  shadowUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
  iconSize: [25, 41],
  iconAnchor: [12, 41],
});

const blueIcon = new L.Icon({
  iconUrl: 'https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-blue.png',
  shadowUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
  iconSize: [25, 41],
  iconAnchor: [12, 41],
});

// ── Fly to location ──────────────────────────────────────
const FlyToLocation = ({ position }) => {
  const map = useMap();
  useEffect(() => {
    if (position) {
      map.flyTo(position, 15, { animate: true, duration: 1.5 });
    }
  }, [position]);
  return null;
};

// ── Map click handler ────────────────────────────────────
const MapClickHandler = ({ selectingSource, onSourceSet, onDestSet }) => {
  useMapEvents({
    click: async (e) => {
      const { lat, lng } = e.latlng;
      const name = await reverseGeocode(lat, lng);
      if (selectingSource) {
        onSourceSet({ lat, lng, name });
        toast.success('📍 Source set!');
      } else {
        onDestSet({ lat, lng, name });
        toast.success('🏁 Destination set!');
      }
    },
  });
  return null;
};

// ── Reverse geocode ──────────────────────────────────────
const reverseGeocode = async (lat, lng) => {
  try {
    const res = await fetch(
      `https://nominatim.openstreetmap.org/reverse?lat=${lat}&lon=${lng}&format=json`,
      { headers: { 'Accept-Language': 'en' } }
    );
    const data = await res.json();
    return data.display_name || `${lat.toFixed(4)}, ${lng.toFixed(4)}`;
  } catch {
    return `${lat.toFixed(4)}, ${lng.toFixed(4)}`;
  }
};

// ── Autocomplete Input ───────────────────────────────────
const AutocompleteInput = ({ label, placeholder, value, onChange, onSelect, color }) => {
  const [inputValue, setInputValue] = useState(value || '');
  const [suggestions, setSuggestions] = useState([]);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const timeoutRef = useRef(null);
  const isSelectingRef = useRef(false);

  const getSuggestions = async (query) => {
    if (!query || query.length < 3) { setSuggestions([]); return; }
    try {
      const res = await fetch(
        `https://nominatim.openstreetmap.org/search?q=${encodeURIComponent(query)}&format=json&limit=5`,
        { headers: { 'Accept-Language': 'en' } }
      );
      const data = await res.json();
      setSuggestions(data.map((item) => ({
        name: item.display_name,
        lat: parseFloat(item.lat),
        lng: parseFloat(item.lon),
      })));
    } catch {
      setSuggestions([]);
    }
  };

  const handleInput = (e) => {
    const val = e.target.value;
    setInputValue(val);
    onChange(val);
    setShowSuggestions(true);
    if (timeoutRef.current) clearTimeout(timeoutRef.current);
    timeoutRef.current = setTimeout(() => getSuggestions(val), 400);
  };

  const handleSelect = (item) => {
    isSelectingRef.current = true;
    setInputValue(item.name);
    setSuggestions([]);
    setShowSuggestions(false);
    onSelect(item);
    setTimeout(() => { isSelectingRef.current = false; }, 300);
  };

  const handleBlur = () => {
    setTimeout(() => {
      if (!isSelectingRef.current) setShowSuggestions(false);
    }, 300);
  };

  useEffect(() => {
    if (value && value !== inputValue) setInputValue(value);
  }, [value]);

  return (
    <div className="relative">
      <label className="block text-sm font-bold text-[#1F2937] mb-1">{label}</label>
      <input
        type="text"
        value={inputValue}
        onChange={handleInput}
        onFocus={() => setShowSuggestions(true)}
        onBlur={handleBlur}
        placeholder={placeholder}
        className={`w-full px-4 py-3 rounded-xl border-2 focus:outline-none font-medium text-[#1F2937] transition-colors ${
          color === 'green'
            ? 'border-gray-200 focus:border-[#58CC02]'
            : 'border-gray-200 focus:border-[#FF4B4B]'
        }`}
      />
      {showSuggestions && suggestions.length > 0 && (
        <div className="absolute z-[9999] w-full bg-white border-2 border-gray-200 rounded-xl mt-1 shadow-xl overflow-hidden">
          {suggestions.map((item, index) => (
            <div
              key={index}
              onMouseDown={(e) => { e.preventDefault(); handleSelect(item); }}
              className="w-full text-left px-4 py-3 hover:bg-[#F0FFF0] cursor-pointer transition-colors border-b border-gray-100 last:border-0"
            >
              <div className="flex items-start gap-2">
                <span className="mt-0.5 flex-shrink-0">
                  {color === 'green' ? '📍' : '🏁'}
                </span>
                <span className="text-sm font-medium text-[#1F2937] leading-snug">
                  {item.name}
                </span>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

// ────────────────────────────────────────────────────────
// MAIN COMPONENT
// ────────────────────────────────────────────────────────
const FindMatch = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const socketRef = useRef(null);

  const [step, setStep] = useState('form');
  const [timer, setTimer] = useState(TIMER_DURATION);
  const [radius, setRadius] = useState(1);
  const [matchData, setMatchData] = useState(null);
  const [selectingSource, setSelectingSource] = useState(true);
  const [userLocation, setUserLocation] = useState(null);
  const [flyTo, setFlyTo] = useState(null);

  const [source, setSource] = useState(null);
  const [destination, setDestination] = useState(null);
  const [sourceInput, setSourceInput] = useState('');
  const [destInput, setDestInput] = useState('');

  // ── Get user location ────────────────────────────────────
  useEffect(() => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (pos) => {
          const loc = { lat: pos.coords.latitude, lng: pos.coords.longitude };
          setUserLocation(loc);
          setFlyTo([loc.lat, loc.lng]);
        },
        () => console.log('Location access denied')
      );
    }
  }, []);

  // ── Socket setup ─────────────────────────────────────────
  useEffect(() => {
    socketRef.current = io(SOCKET_URL);
    socketRef.current.on('matchFound', (data) => {
      setMatchData(data);
      setStep('matched');
      toast.success('RouteMate found! 🎉');
    });
    return () => { if (socketRef.current) socketRef.current.disconnect(); };
  }, []);

  // ── Timer ────────────────────────────────────────────────
  useEffect(() => {
    if (step !== 'searching') return;
    if (timer === 0) { setStep('notfound'); return; }
    const interval = setInterval(() => setTimer((p) => p - 1), 1000);
    return () => clearInterval(interval);
  }, [step, timer]);

  const handleSourceSet = (loc) => {
    setSource(loc);
    setSourceInput(loc.name);
    setFlyTo([loc.lat, loc.lng]);
  };

  const handleDestSet = (loc) => {
    setDestination(loc);
    setDestInput(loc.name);
    setFlyTo([loc.lat, loc.lng]);
  };

  const useMyLocation = async () => {
    if (!userLocation) {
      toast.error('Location access denied. Please enable location.');
      return;
    }
    const name = await reverseGeocode(userLocation.lat, userLocation.lng);
    handleSourceSet({ ...userLocation, name });
    toast.success('📍 Using your current location!');
  };

  const handleFindMatch = async (e) => {
    e.preventDefault();
    if (!source) { toast.error('Please set your source location'); return; }
    if (!destination) { toast.error('Please set your destination location'); return; }
    setStep('searching');
    setTimer(TIMER_DURATION);
    socketRef.current.emit('findMatch', {
      userId: user.id,
      userName: user.name,
      sourceLat: source.lat,
      sourceLng: source.lng,
      sourceName: source.name,
      destinationLat: destination.lat,
      destinationLng: destination.lng,
      destinationName: destination.name,
      radius,
    });
  };

  const handleConnect = () => {
    navigate('/waiting', {
      state: {
        matchData: {
          ...matchData,
          sourceLat: source.lat,
          sourceLng: source.lng,
          sourceName: source.name,
          destinationLat: destination.lat,
          destinationLng: destination.lng,
          destinationName: destination.name,
        }
      }
    });
  };

  const handleRetry = () => {
    setStep('form');
    setTimer(TIMER_DURATION);
    setRadius(1);
  };

  const handleExpandRadius = () => {
    const expanded = 3;
    setRadius(expanded);
    setStep('searching');
    setTimer(TIMER_DURATION);
    toast('Expanding search radius to 3km...', { icon: '🔍' });
    socketRef.current.emit('findMatch', {
      userId: user.id,
      userName: user.name,
      sourceLat: source.lat,
      sourceLng: source.lng,
      sourceName: source.name,
      destinationLat: destination.lat,
      destinationLng: destination.lng,
      destinationName: destination.name,
      radius: expanded,
    });
  };

  // ── FORM STEP ────────────────────────────────────────────
  if (step === 'form') {
    return (
      <div className="min-h-screen bg-[#F7F7F7] flex flex-col">

        {/* Navbar */}
        <nav className="bg-white border-b-2 border-gray-100 px-6 py-4 flex items-center justify-between flex-shrink-0">
          <div className="flex items-center gap-2">
            <span className="text-3xl">🚗</span>
            <span className="text-xl font-extrabold text-[#1F2937]">RouteMate</span>
          </div>
          <button onClick={() => navigate('/home')} className="text-[#1CB0F6] font-bold hover:underline">
            ← Back
          </button>
        </nav>

        {/* Map */}
        <div className="flex-shrink-0 relative">
          <MapContainer
            center={[25.3176, 82.9739]}
            zoom={14}
            style={{ height: '320px', width: '100%' }}
          >
            <TileLayer
              url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
              attribution='© OpenStreetMap'
            />
            <FlyToLocation position={flyTo} />
            <MapClickHandler
              selectingSource={selectingSource}
              onSourceSet={handleSourceSet}
              onDestSet={handleDestSet}
            />
            {userLocation && (
              <Marker position={[userLocation.lat, userLocation.lng]} icon={blueIcon}>
                <Popup>📌 You are here</Popup>
              </Marker>
            )}
            {source && (
              <Marker position={[source.lat, source.lng]} icon={greenIcon}>
                <Popup>📍 {source.name?.split(',')[0]}</Popup>
              </Marker>
            )}
            {destination && (
              <Marker position={[destination.lat, destination.lng]} icon={redIcon}>
                <Popup>🏁 {destination.name?.split(',')[0]}</Popup>
              </Marker>
            )}
          </MapContainer>

          {/* Map toggle */}
          <div className="absolute bottom-3 left-1/2 -translate-x-1/2 z-[999] flex gap-2">
            <button
              onClick={() => setSelectingSource(true)}
              className={`px-4 py-2 rounded-xl font-extrabold text-sm border-b-4 transition-all shadow-lg ${
                selectingSource
                  ? 'bg-[#58CC02] text-white border-[#46A302]'
                  : 'bg-white text-gray-400 border-gray-200'
              }`}
            >
              📍 Set Source
            </button>
            <button
              onClick={() => setSelectingSource(false)}
              className={`px-4 py-2 rounded-xl font-extrabold text-sm border-b-4 transition-all shadow-lg ${
                !selectingSource
                  ? 'bg-[#FF4B4B] text-white border-red-700'
                  : 'bg-white text-gray-400 border-gray-200'
              }`}
            >
              🏁 Set Dest
            </button>
          </div>
        </div>

        {/* Form */}
        <div className="flex-1 overflow-y-auto">
          <div className="max-w-md mx-auto px-4 py-4">
            <form onSubmit={handleFindMatch} className="space-y-4">

              {/* Source */}
              <AutocompleteInput
                label="📍 Source"
                placeholder="Type or click map to set source"
                value={sourceInput}
                color="green"
                onChange={setSourceInput}
                onSelect={handleSourceSet}
              />

              {/* Use my location */}
              <button
                type="button"
                onClick={useMyLocation}
                className="w-full bg-[#F7F7F7] text-[#1CB0F6] font-bold py-3 rounded-xl border-2 border-[#1CB0F6] hover:bg-blue-50 transition-all text-sm"
              >
                📌 Use My Current Location as Source
              </button>

              {/* Destination */}
              <AutocompleteInput
                label="🏁 Destination"
                placeholder="Type or click map to set destination"
                value={destInput}
                color="red"
                onChange={setDestInput}
                onSelect={handleDestSet}
              />

              {/* Selected summary */}
              {(source || destination) && (
                <div className="bg-white rounded-xl border-2 border-gray-100 p-4 space-y-2">
                  <div className="flex items-center gap-2">
                    <span>📍</span>
                    <span className="text-sm font-bold text-[#58CC02] truncate">
                      {source ? source.name?.split(',')[0] : 'Not set'}
                    </span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span>🏁</span>
                    <span className="text-sm font-bold text-[#FF4B4B] truncate">
                      {destination ? destination.name?.split(',')[0] : 'Not set'}
                    </span>
                  </div>
                </div>
              )}

              {/* Radius Selector */}
              <div className="bg-[#F7F7F7] rounded-xl p-4">
                <div className="flex items-center gap-2 mb-3">
                  <span className="text-xl">📡</span>
                  <div className="text-sm font-bold text-[#1F2937]">
                    Search Radius
                  </div>
                </div>
                <div className="grid grid-cols-4 gap-2">
                  {[0.5, 1, 2, 3].map((r) => (
                    <button
                      key={r}
                      type="button"
                      onClick={() => setRadius(r)}
                      className={`py-2 rounded-xl font-extrabold text-sm border-b-4 transition-all ${
                        radius === r
                          ? 'bg-[#58CC02] text-white border-[#46A302]'
                          : 'bg-white text-gray-400 border-gray-200 hover:border-[#58CC02] hover:text-[#58CC02]'
                      }`}
                    >
                      {r} km
                    </button>
                  ))}
                </div>
                <div className="text-xs text-gray-400 font-medium mt-2 text-center">
                  Find matches within {radius}km of your route
                </div>
              </div>

              {/* Find Button */}
              <button
                type="submit"
                className="w-full bg-[#58CC02] text-white font-extrabold py-4 rounded-xl border-b-4 border-[#46A302] hover:bg-[#46A302] active:border-b-0 transition-all text-lg"
              >
                🔍 FIND A ROUTEMATE
              </button>

            </form>
          </div>
        </div>
      </div>
    );
  }

  // ── SEARCHING ────────────────────────────────────────────
  if (step === 'searching') {
    const percentage = (timer / TIMER_DURATION) * 100;
    const circumference = 2 * Math.PI * 54;
    const strokeDashoffset = circumference - (percentage / 100) * circumference;

    return (
      <div className="min-h-screen bg-[#F7F7F7] flex items-center justify-center px-4">
        <div className="max-w-md w-full text-center">
          <div className="relative inline-flex items-center justify-center mb-8">
            <svg width="140" height="140" className="-rotate-90">
              <circle cx="70" cy="70" r="54" fill="none" stroke="#E5E7EB" strokeWidth="10" />
              <circle
                cx="70" cy="70" r="54"
                fill="none"
                stroke={timer > 15 ? '#58CC02' : '#FF4B4B'}
                strokeWidth="10"
                strokeDasharray={circumference}
                strokeDashoffset={strokeDashoffset}
                strokeLinecap="round"
                style={{ transition: 'stroke-dashoffset 1s linear' }}
              />
            </svg>
            <div className="absolute text-center">
              <div className={`text-4xl font-extrabold ${timer > 15 ? 'text-[#58CC02]' : 'text-[#FF4B4B]'}`}>
                {timer}
              </div>
              <div className="text-xs font-bold text-gray-400">SEC</div>
            </div>
          </div>

          <div className="text-6xl mb-4 animate-bounce">🔍</div>
          <h1 className="text-3xl font-extrabold text-[#1F2937] mb-2">
            Finding your RouteMate...
          </h1>
          <p className="text-gray-500 font-medium mb-8">
            Searching within {radius}km of your route
          </p>

          <div className="bg-white rounded-2xl shadow-lg p-5 border-2 border-gray-100 text-left mb-6">
            <div className="flex items-start gap-3 mb-4">
              <span className="text-2xl">📍</span>
              <div>
                <div className="text-xs font-bold text-gray-400">FROM</div>
                <div className="font-bold text-[#1F2937] text-sm">
                  {source?.name?.split(',')[0]}
                </div>
              </div>
            </div>
            <div className="flex items-start gap-3">
              <span className="text-2xl">🏁</span>
              <div>
                <div className="text-xs font-bold text-gray-400">TO</div>
                <div className="font-bold text-[#1F2937] text-sm">
                  {destination?.name?.split(',')[0]}
                </div>
              </div>
            </div>
          </div>

          <button onClick={handleRetry} className="text-gray-400 font-bold hover:text-gray-600 transition-colors">
            Cancel Search
          </button>
        </div>
      </div>
    );
  }

  // ── MATCHED ──────────────────────────────────────────────
  if (step === 'matched') {
    return (
      <div className="min-h-screen bg-[#F7F7F7] flex items-center justify-center px-4">
        <div className="max-w-md w-full text-center">
          <div className="text-7xl mb-4 animate-bounce">🎉</div>
          <h1 className="text-3xl font-extrabold text-[#1F2937] mb-2">RouteMate Found!</h1>
          <p className="text-gray-500 font-medium mb-6">Someone is going your way!</p>

          <div className="bg-white rounded-2xl shadow-lg p-6 border-2 border-[#58CC02] mb-6">
            <div className="text-5xl mb-3">👤</div>
            <div className="text-xl font-extrabold text-[#1F2937] mb-1">
              {matchData?.matchedUserName}
            </div>
            <div className="text-sm text-gray-400 font-medium mb-4">
              is going a similar route!
            </div>
            <div className="bg-[#F7F7F7] rounded-xl p-4 text-left space-y-3">
              <div className="flex items-start gap-2">
                <span>📍</span>
                <div>
                  <div className="text-xs font-bold text-gray-400">THEIR SOURCE</div>
                  <div className="text-sm font-bold text-[#1F2937]">
                    {matchData?.matchedSourceName?.split(',')[0]}
                  </div>
                </div>
              </div>
              <div className="flex items-start gap-2">
                <span>🏁</span>
                <div>
                  <div className="text-xs font-bold text-gray-400">THEIR DESTINATION</div>
                  <div className="text-sm font-bold text-[#1F2937]">
                    {matchData?.matchedDestinationName?.split(',')[0]}
                  </div>
                </div>
              </div>
            </div>
          </div>

          <button
            onClick={handleConnect}
            className="w-full bg-[#58CC02] text-white font-extrabold py-4 rounded-xl border-b-4 border-[#46A302] hover:bg-[#46A302] active:border-b-0 transition-all text-lg mb-3"
          >
            🤝 CONNECT
          </button>
          <button
            onClick={handleRetry}
            className="w-full bg-white text-gray-400 font-bold py-3 rounded-xl border-2 border-gray-200 hover:bg-gray-50 transition-all"
          >
            Skip this match
          </button>
        </div>
      </div>
    );
  }

  // ── NOT FOUND ────────────────────────────────────────────
  if (step === 'notfound') {
    return (
      <div className="min-h-screen bg-[#F7F7F7] flex items-center justify-center px-4">
        <div className="max-w-md w-full text-center">
          <div className="text-7xl mb-4">😔</div>
          <h1 className="text-3xl font-extrabold text-[#1F2937] mb-2">No match found</h1>
          <p className="text-gray-500 font-medium mb-8">
            No one was found going your way this time
          </p>
          <button
            onClick={handleRetry}
            className="w-full bg-[#58CC02] text-white font-extrabold py-4 rounded-xl border-b-4 border-[#46A302] hover:bg-[#46A302] active:border-b-0 transition-all text-lg mb-4"
          >
            🔄 TRY AGAIN
          </button>
          <button
            onClick={handleExpandRadius}
            className="w-full bg-[#1CB0F6] text-white font-extrabold py-4 rounded-xl border-b-4 border-blue-600 hover:bg-blue-500 active:border-b-0 transition-all text-lg mb-4"
          >
            📡 EXPAND SEARCH TO 3KM
          </button>
          <button
            onClick={() => navigate('/home')}
            className="text-gray-400 font-bold hover:text-gray-600 transition-colors"
          >
            Back to Home
          </button>
        </div>
      </div>
    );
  }
};

export default FindMatch;