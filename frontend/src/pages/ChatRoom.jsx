import { useEffect, useRef, useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { MapContainer, TileLayer, Marker, Polyline, Popup } from 'react-leaflet';
import io from 'socket.io-client';
import toast from 'react-hot-toast';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';

const SOCKET_URL = 'https://routemate-q0su.onrender.com';

// Fix leaflet marker icons
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png',
  iconUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png',
  shadowUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
});

// Green marker for source
const greenIcon = new L.Icon({
  iconUrl: 'https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-green.png',
  shadowUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
  iconSize: [25, 41],
  iconAnchor: [12, 41],
});

// Red marker for destination
const redIcon = new L.Icon({
  iconUrl: 'https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-red.png',
  shadowUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
  iconSize: [25, 41],
  iconAnchor: [12, 41],
});

const ChatRoom = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const socketRef = useRef(null);
  const messagesEndRef = useRef(null);
  const { matchData } = location.state || {};

  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState('');
  const [showMap, setShowMap] = useState(false);

  // Calculate map center between source and destination
  const mapCenter = matchData ? [
    (matchData.sourceLat + matchData.destinationLat) / 2,
    (matchData.sourceLng + matchData.destinationLng) / 2,
  ] : [25.3176, 82.9739];

  // Route line coordinates
  const routeLine = matchData ? [
    [matchData.sourceLat, matchData.sourceLng],
    [matchData.destinationLat, matchData.destinationLng],
  ] : [];

  useEffect(() => {
    if (!matchData) {
      navigate('/home');
      return;
    }

    socketRef.current = io(SOCKET_URL);

    socketRef.current.emit('joinRoom', {
      matchId: matchData.matchId,
      userId: user.id,
      userName: user.name,
    });

    socketRef.current.on('receiveMessage', (message) => {
      setMessages((prev) => [...prev, message]);
    });

    socketRef.current.on('userJoined', (data) => {
      setMessages((prev) => [...prev, {
        type: 'system',
        text: `${data.userName} joined the chat`,
      }]);
    });

    socketRef.current.on('userLeft', (data) => {
      setMessages((prev) => [...prev, {
        type: 'system',
        text: `${data.userName} left the chat`,
      }]);
    });

    return () => {
      if (socketRef.current) socketRef.current.disconnect();
    };
  }, []);

  // Auto scroll to bottom
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const handleSendMessage = (e) => {
    e.preventDefault();
    if (!newMessage.trim()) return;

    const message = {
      matchId: matchData.matchId,
      senderId: user.id,
      senderName: user.name,
      text: newMessage.trim(),
      timestamp: new Date().toISOString(),
    };

    socketRef.current.emit('sendMessage', message);
    setMessages((prev) => [...prev, { ...message, own: true }]);
    setNewMessage('');
  };

  const handleLeave = () => {
    socketRef.current.emit('leaveRoom', {
      matchId: matchData.matchId,
      userId: user.id,
      userName: user.name,
    });
    navigate('/home');
  };

  return (
    <div className="min-h-screen bg-[#F7F7F7] flex flex-col">

      {/* Navbar */}
      <nav className="bg-white border-b-2 border-gray-100 px-4 py-4 flex items-center justify-between flex-shrink-0">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-[#58CC02] rounded-xl flex items-center justify-center text-white font-extrabold">
            {matchData?.matchedUserName?.charAt(0).toUpperCase()}
          </div>
          <div>
            <div className="font-extrabold text-[#1F2937]">
              {matchData?.matchedUserName}
            </div>
            <div className="text-xs text-[#58CC02] font-bold">
              ● Online
            </div>
          </div>
        </div>
        <div className="flex items-center gap-2">
          {/* Map Toggle Button */}
          <button
            onClick={() => setShowMap(!showMap)}
            className={`font-bold px-4 py-2 rounded-xl border-b-4 transition-all text-sm ${
              showMap
                ? 'bg-[#FFC800] text-white border-yellow-600 hover:bg-yellow-500'
                : 'bg-[#1CB0F6] text-white border-blue-600 hover:bg-blue-500'
            }`}
          >
            {showMap ? '💬 Chat' : '🗺️ Map'}
          </button>
          <button
            onClick={handleLeave}
            className="bg-[#FF4B4B] text-white font-bold px-4 py-2 rounded-xl border-b-4 border-red-700 hover:bg-red-600 active:border-b-0 transition-all text-sm"
          >
            Leave
          </button>
        </div>
      </nav>

      {/* Route Info Bar */}
      <div className="bg-[#F0FFF0] border-b-2 border-[#58CC02] px-4 py-2 flex items-center gap-4 flex-shrink-0">
        <div className="flex items-center gap-1 text-sm font-bold text-[#1F2937]">
          <span>📍</span>
          <span className="truncate max-w-28">
            {matchData?.sourceName?.split(',')[0]}
          </span>
        </div>
        <span className="text-[#58CC02] font-extrabold">→</span>
        <div className="flex items-center gap-1 text-sm font-bold text-[#1F2937]">
          <span>🏁</span>
          <span className="truncate max-w-28">
            {matchData?.destinationName?.split(',')[0]}
          </span>
        </div>
      </div>

      {/* Map View */}
      {showMap && (
        <div className="flex-shrink-0">
          <MapContainer
            center={mapCenter}
            zoom={13}
            style={{ height: '300px', width: '100%' }}
          >
            <TileLayer
              url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
              attribution='© OpenStreetMap contributors'
            />

            {/* Source Marker */}
            {matchData?.sourceLat && (
              <Marker
                position={[matchData.sourceLat, matchData.sourceLng]}
                icon={greenIcon}
              >
                <Popup>
                  <strong>📍 Source</strong><br />
                  {matchData.sourceName?.split(',')[0]}
                </Popup>
              </Marker>
            )}

            {/* Destination Marker */}
            {matchData?.destinationLat && (
              <Marker
                position={[matchData.destinationLat, matchData.destinationLng]}
                icon={redIcon}
              >
                <Popup>
                  <strong>🏁 Destination</strong><br />
                  {matchData.destinationName?.split(',')[0]}
                </Popup>
              </Marker>
            )}

            {/* Route Line */}
            {routeLine.length === 2 && (
              <Polyline
                positions={routeLine}
                color="#58CC02"
                weight={4}
                dashArray="10, 10"
              />
            )}
          </MapContainer>

          {/* Map Legend */}
          <div className="bg-white px-4 py-3 flex items-center gap-6 border-b-2 border-gray-100">
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 rounded-full bg-[#58CC02]"></div>
              <span className="text-xs font-bold text-gray-500">Source</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 rounded-full bg-[#FF4B4B]"></div>
              <span className="text-xs font-bold text-gray-500">Destination</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-6 h-1 bg-[#58CC02]" style={{borderTop: '2px dashed #58CC02'}}></div>
              <span className="text-xs font-bold text-gray-500">Route</span>
            </div>
          </div>
        </div>
      )}

      {/* Messages */}
      {!showMap && (
        <div className="flex-1 overflow-y-auto px-4 py-4 space-y-3">

          <div className="text-center">
            <span className="bg-[#E5E7EB] text-gray-500 text-xs font-bold px-4 py-2 rounded-full">
              🎉 You are connected with {matchData?.matchedUserName}!
            </span>
          </div>

          {messages.map((msg, index) => {

            if (msg.type === 'system') {
              return (
                <div key={index} className="text-center">
                  <span className="bg-[#E5E7EB] text-gray-500 text-xs font-bold px-4 py-2 rounded-full">
                    {msg.text}
                  </span>
                </div>
              );
            }

            if (msg.own || msg.senderId === user.id) {
              return (
                <div key={index} className="flex justify-end">
                  <div className="max-w-xs">
                    <div className="bg-[#58CC02] text-white font-medium px-4 py-3 rounded-2xl rounded-tr-sm">
                      {msg.text}
                    </div>
                    <div className="text-xs text-gray-400 font-medium mt-1 text-right">
                      {new Date(msg.timestamp).toLocaleTimeString([], {
                        hour: '2-digit', minute: '2-digit'
                      })}
                    </div>
                  </div>
                </div>
              );
            }

            return (
              <div key={index} className="flex justify-start gap-2">
                <div className="w-8 h-8 bg-[#FFC800] rounded-xl flex items-center justify-center text-white text-sm font-extrabold flex-shrink-0">
                  {msg.senderName?.charAt(0).toUpperCase()}
                </div>
                <div className="max-w-xs">
                  <div className="bg-white text-[#1F2937] font-medium px-4 py-3 rounded-2xl rounded-tl-sm border-2 border-gray-100 shadow-sm">
                    {msg.text}
                  </div>
                  <div className="text-xs text-gray-400 font-medium mt-1">
                    {new Date(msg.timestamp).toLocaleTimeString([], {
                      hour: '2-digit', minute: '2-digit'
                    })}
                  </div>
                </div>
              </div>
            );
          })}

          <div ref={messagesEndRef} />
        </div>
      )}

      {/* Message Input */}
      <div className="bg-white border-t-2 border-gray-100 px-4 py-4 flex-shrink-0">
        <form onSubmit={handleSendMessage} className="flex gap-3">
          <input
            type="text"
            value={newMessage}
            onChange={(e) => setNewMessage(e.target.value)}
            placeholder="Type a message..."
            className="flex-1 px-4 py-3 rounded-xl border-2 border-gray-200 focus:border-[#58CC02] focus:outline-none font-medium text-[#1F2937] transition-colors"
          />
          <button
            type="submit"
            disabled={!newMessage.trim()}
            className="bg-[#58CC02] text-white font-extrabold px-5 py-3 rounded-xl border-b-4 border-[#46A302] hover:bg-[#46A302] active:border-b-0 transition-all disabled:opacity-50"
          >
            Send
          </button>
        </form>
      </div>

    </div>
  );
};

export default ChatRoom;