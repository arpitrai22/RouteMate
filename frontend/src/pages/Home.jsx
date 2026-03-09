import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import Navbar from '../components/Navbar';

const Home = () => {
  const { user } = useAuth();
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-[#F7F7F7]">

      <Navbar />

      {/* Hero Section */}
      <div className="bg-[#58CC02] px-6 pt-8 pb-16 text-center">
        <div className="text-6xl mb-3">👋</div>
        <h1 className="text-3xl font-extrabold text-white mb-2">
          Hey, {user?.name}!
        </h1>
        <p className="text-white opacity-90 font-bold text-lg">
          Ready to find your ride match?
        </p>

        {/* Stats */}
        <div className="flex gap-4 mt-6 max-w-xs mx-auto">
          <div className="flex-1 bg-white rounded-2xl p-3 text-center border-b-4 border-[#46A302]">
            <div className="text-2xl font-extrabold text-[#FFC800]">
              {user?.streak} 🔥
            </div>
            <div className="text-xs font-bold text-gray-400 mt-1">
              DAY STREAK
            </div>
          </div>
          <div className="flex-1 bg-white rounded-2xl p-3 text-center border-b-4 border-[#46A302]">
            <div className="text-2xl font-extrabold text-[#58CC02]">
              {user?.totalRides}
            </div>
            <div className="text-xs font-bold text-gray-400 mt-1">
              TOTAL RIDES
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-md mx-auto px-4 -mt-6">

        {/* Find Match Card */}
        <div className="bg-white rounded-2xl shadow-lg border-2 border-gray-100 overflow-hidden mb-4">
          <div className="p-6">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-12 h-12 bg-[#F0FFF0] rounded-2xl flex items-center justify-center text-2xl">
                🔍
              </div>
              <div>
                <h2 className="font-extrabold text-[#1F2937] text-lg">
                  Find a RouteMate
                </h2>
                <p className="text-gray-400 font-medium text-sm">
                  Match with someone on your route
                </p>
              </div>
            </div>
            <button
              onClick={() => navigate('/find-match')}
              className="w-full bg-[#58CC02] text-white font-extrabold py-4 rounded-xl border-b-4 border-[#46A302] hover:bg-[#46A302] active:border-b-0 active:translate-y-1 transition-all text-lg"
            >
              🚗 START MATCHING
            </button>
          </div>
        </div>

        {/* How it works */}
        <div className="bg-white rounded-2xl shadow-lg border-2 border-gray-100 p-6 mb-4">
          <h2 className="font-extrabold text-[#1F2937] text-lg mb-4">
            How it works 💡
          </h2>
          <div className="space-y-4">

            <div className="flex items-center gap-4">
              <div className="w-12 h-12 bg-[#58CC02] rounded-2xl flex items-center justify-center text-white font-extrabold text-lg flex-shrink-0 border-b-4 border-[#46A302]">
                1
              </div>
              <div>
                <div className="font-extrabold text-[#1F2937]">Enter your route</div>
                <div className="text-sm text-gray-400 font-medium">
                  Type or pick on map
                </div>
              </div>
            </div>

            <div className="flex items-center gap-4">
              <div className="w-12 h-12 bg-[#1CB0F6] rounded-2xl flex items-center justify-center text-white font-extrabold text-lg flex-shrink-0 border-b-4 border-blue-600">
                2
              </div>
              <div>
                <div className="font-extrabold text-[#1F2937]">Wait for a match</div>
                <div className="text-sm text-gray-400 font-medium">
                  Up to 60 seconds search
                </div>
              </div>
            </div>

            <div className="flex items-center gap-4">
              <div className="w-12 h-12 bg-[#FFC800] rounded-2xl flex items-center justify-center text-white font-extrabold text-lg flex-shrink-0 border-b-4 border-yellow-600">
                3
              </div>
              <div>
                <div className="font-extrabold text-[#1F2937]">Connect & chat</div>
                <div className="text-sm text-gray-400 font-medium">
                  Coordinate your ride together
                </div>
              </div>
            </div>

          </div>
        </div>

        {/* Tips Card */}
        <div className="bg-[#FFF9E6] rounded-2xl border-2 border-[#FFC800] p-5 mb-6">
          <div className="flex items-start gap-3">
            <span className="text-2xl">💡</span>
            <div>
              <div className="font-extrabold text-[#1F2937] mb-1">
                Pro Tip
              </div>
              <div className="text-sm text-gray-600 font-medium">
                The closer your source and destination are to another user, the higher your chance of matching! Try expanding the search radius if no match is found.
              </div>
            </div>
          </div>
        </div>

      </div>
    </div>
  );
};

export default Home;