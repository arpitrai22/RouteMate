import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import Logo from './Logo';
import toast from 'react-hot-toast';

const Navbar = ({ showBack = false, backTo = '/home', title = '' }) => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    toast.success('Logged out successfully!');
    navigate('/login');
  };

  return (
    <nav className="bg-white border-b-4 border-gray-100 px-6 py-3 flex items-center justify-between flex-shrink-0 sticky top-0 z-50">

      {/* Left side */}
      <div className="flex items-center gap-3">
        {showBack ? (
          <button
            onClick={() => navigate(backTo)}
            className="w-9 h-9 bg-[#F7F7F7] rounded-xl flex items-center justify-center border-b-4 border-gray-200 hover:bg-gray-100 active:border-b-0 transition-all font-extrabold text-gray-500"
          >
            ←
          </button>
        ) : null}
        <Logo size="sm" />
        {title && (
          <span className="text-gray-300 font-bold">|</span>
        )}
        {title && (
          <span className="font-extrabold text-[#1F2937] text-sm">{title}</span>
        )}
      </div>

      {/* Right side */}
      {user && (
        <div className="flex items-center gap-2">
          <button
            onClick={() => navigate('/profile')}
            className="w-9 h-9 bg-[#58CC02] rounded-xl flex items-center justify-center text-white font-extrabold border-b-4 border-[#46A302] hover:bg-[#46A302] active:border-b-0 transition-all text-sm"
          >
            {user?.name?.charAt(0).toUpperCase()}
          </button>
          <button
            onClick={handleLogout}
            className="bg-[#FF4B4B] text-white font-extrabold px-4 py-2 rounded-xl border-b-4 border-red-700 hover:bg-red-600 active:border-b-0 transition-all text-sm"
          >
            Logout
          </button>
        </div>
      )}
    </nav>
  );
};

export default Navbar;