import { useEffect, useRef, useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import io from "socket.io-client";
import toast from "react-hot-toast";

const SOCKET_URL =
  import.meta.env.VITE_API_URL?.replace("/api", "") || "http://localhost:5000";

const WaitingScreen = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const socketRef = useRef(null);
  const { matchData } = location.state || {};
  const [waitingTime, setWaitingTime] = useState(0);

  useEffect(() => {
    if (!matchData) {
      navigate("/home");
      return;
    }

    const socket = io(SOCKET_URL);
    socketRef.current = socket;

    socket.on("connect", () => {
      console.log("WaitingScreen connected:", socket.id);
      socket.emit("acceptMatch", {
        matchId: matchData.matchId,
        userId: user.id,
      });
    });

    socket.on("bothAccepted", (data) => {
      console.log("Both accepted!", data);
      toast.success("Connected! Opening chat... 💬");
      navigate("/chat", { state: { matchData } });
    });

    socket.on("matchRejected", () => {
      toast.error("The other user declined the match");
      navigate("/home");
    });

    const interval = setInterval(() => {
      setWaitingTime((prev) => prev + 1);
    }, 1000);

    return () => {
      clearInterval(interval);
      socket.disconnect();
    };
  }, []);

  const handleCancel = () => {
    if (socketRef.current) {
      socketRef.current.emit("cancelMatch", {
        matchId: matchData?.matchId,
        userId: user.id,
      });
      socketRef.current.disconnect();
    }
    navigate("/home");
  };

  return (
    <div className="min-h-screen bg-[#F7F7F7] flex items-center justify-center px-4">
      <div className="max-w-md w-full text-center">
        <div className="text-7xl mb-6 animate-pulse">⏳</div>

        <h1 className="text-3xl font-extrabold text-[#1F2937] mb-2">
          Waiting for {matchData?.matchedUserName}...
        </h1>
        <p className="text-gray-500 font-medium mb-8">
          They need to accept the connection too
        </p>

        <div className="bg-white rounded-2xl shadow-lg p-6 border-2 border-gray-100 mb-6">
          <div className="flex items-center justify-center gap-4 mb-6">
            <div className="text-center">
              <div className="w-16 h-16 bg-[#58CC02] rounded-2xl flex items-center justify-center text-white text-2xl font-extrabold mx-auto mb-2">
                {user?.name?.charAt(0).toUpperCase()}
              </div>
              <div className="text-sm font-bold text-[#1F2937]">
                {user?.name}
              </div>
              <div className="text-xs text-[#58CC02] font-bold mt-1">
                ✅ Ready
              </div>
            </div>

            <div className="text-3xl animate-pulse">🤝</div>

            <div className="text-center">
              <div className="w-16 h-16 bg-[#FFC800] rounded-2xl flex items-center justify-center text-white text-2xl font-extrabold mx-auto mb-2">
                {matchData?.matchedUserName?.charAt(0).toUpperCase()}
              </div>
              <div className="text-sm font-bold text-[#1F2937]">
                {matchData?.matchedUserName}
              </div>
              <div className="text-xs text-[#FFC800] font-bold mt-1">
                ⏳ Waiting
              </div>
            </div>
          </div>

          <div className="bg-[#F7F7F7] rounded-xl p-3">
            <div className="text-sm font-bold text-gray-400">
              Waiting for {waitingTime}s...
            </div>
          </div>
        </div>

        <button
          onClick={handleCancel}
          className="w-full bg-[#FF4B4B] text-white font-extrabold py-4 rounded-xl border-b-4 border-red-700 hover:bg-red-600 active:border-b-0 transition-all text-lg"
        >
          Cancel
        </button>
      </div>
    </div>
  );
};

export default WaitingScreen;
