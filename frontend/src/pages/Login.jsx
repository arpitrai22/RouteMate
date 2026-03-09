import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import Logo from '../components/Logo';
import toast from 'react-hot-toast';

const Login = () => {
  const [formData, setFormData] = useState({ email: '', password: '' });
  const [loading, setLoading] = useState(false);
  const { login } = useAuth();
  const navigate = useNavigate();

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      await login(formData);
      toast.success('Welcome back! 🚗');
      navigate('/home');
    } catch (error) {
      toast.error(error.response?.data?.message || 'Something went wrong');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#F7F7F7] flex flex-col">

      {/* Top green banner */}
      <div className="bg-[#58CC02] px-6 pt-12 pb-16 flex flex-col items-center">
        <Logo size="xl" />
        <p className="text-white font-bold mt-4 text-center text-lg opacity-90">
          Find someone going your way! 🗺️
        </p>
      </div>

      {/* Card */}
      <div className="flex-1 -mt-6 bg-[#F7F7F7] rounded-t-3xl px-6 pt-8">
        <div className="max-w-md mx-auto">

          <h2 className="text-2xl font-extrabold text-[#1F2937] mb-6 text-center">
            Welcome Back! 👋
          </h2>

          <div className="bg-white rounded-2xl shadow-lg p-6 border-2 border-gray-100">
            <form onSubmit={handleSubmit} className="space-y-4">

              <div>
                <label className="block text-sm font-extrabold text-[#1F2937] mb-1">
                  EMAIL
                </label>
                <input
                  type="email"
                  name="email"
                  value={formData.email}
                  onChange={handleChange}
                  placeholder="john@example.com"
                  required
                  className="w-full px-4 py-3 rounded-xl border-2 border-gray-200 focus:border-[#58CC02] focus:outline-none font-medium text-[#1F2937] transition-colors"
                />
              </div>

              <div>
                <label className="block text-sm font-extrabold text-[#1F2937] mb-1">
                  PASSWORD
                </label>
                <input
                  type="password"
                  name="password"
                  value={formData.password}
                  onChange={handleChange}
                  placeholder="Your password"
                  required
                  className="w-full px-4 py-3 rounded-xl border-2 border-gray-200 focus:border-[#58CC02] focus:outline-none font-medium text-[#1F2937] transition-colors"
                />
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full bg-[#58CC02] text-white font-extrabold py-4 rounded-xl border-b-4 border-[#46A302] hover:bg-[#46A302] active:border-b-0 active:translate-y-1 transition-all text-lg disabled:opacity-70 mt-2"
              >
                {loading ? '...' : 'LOG IN'}
              </button>

            </form>
          </div>

          {/* Divider */}
          <div className="flex items-center gap-3 my-5">
            <div className="flex-1 h-0.5 bg-gray-200"></div>
            <span className="text-gray-400 font-bold text-sm">OR</span>
            <div className="flex-1 h-0.5 bg-gray-200"></div>
          </div>

          {/* Register link */}
          <Link to="/register">
            <button className="w-full bg-white text-[#1CB0F6] font-extrabold py-4 rounded-xl border-2 border-[#1CB0F6] border-b-4 hover:bg-blue-50 active:border-b-2 transition-all text-lg">
              CREATE AN ACCOUNT
            </button>
          </Link>

        </div>
      </div>
    </div>
  );
};

export default Login;