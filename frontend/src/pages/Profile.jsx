import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import Navbar from "../components/Navbar";
import axios from "axios";
import toast from "react-hot-toast";
import authService from "../services/authService";

const API_BASE = import.meta.env.VITE_API_URL || "http://localhost:5000/api";

const Profile = () => {
  const { user, login } = useAuth();
  const navigate = useNavigate();

  const [activeTab, setActiveTab] = useState("profile");
  const [loading, setLoading] = useState(false);

  const [profileData, setProfileData] = useState({
    name: user?.name || "",
    phone: user?.phone || "",
  });

  const [passwordData, setPasswordData] = useState({
    currentPassword: "",
    newPassword: "",
    confirmPassword: "",
  });

  const handleProfileUpdate = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const response = await axios.put(
        `${API_BASE}/users/profile`,
        profileData,
        { headers: { Authorization: `Bearer ${authService.getToken()}` } },
      );
      localStorage.setItem("user", JSON.stringify(response.data.user));
      toast.success("Profile updated! 🎉");
    } catch (error) {
      toast.error(error.response?.data?.message || "Something went wrong");
    } finally {
      setLoading(false);
    }
  };

  const handlePasswordChange = async (e) => {
    e.preventDefault();
    if (passwordData.newPassword !== passwordData.confirmPassword) {
      toast.error("Passwords do not match");
      return;
    }
    setLoading(true);
    try {
      await axios.put(
        `${API_BASE}/users/change-password`,
        {
          currentPassword: passwordData.currentPassword,
          newPassword: passwordData.newPassword,
        },
        { headers: { Authorization: `Bearer ${authService.getToken()}` } },
      );
      toast.success("Password changed! 🔒");
      setPasswordData({
        currentPassword: "",
        newPassword: "",
        confirmPassword: "",
      });
    } catch (error) {
      toast.error(error.response?.data?.message || "Something went wrong");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#F7F7F7]">
      <Navbar showBack={true} backTo="/home" title="Profile" />

      {/* Hero */}
      <div className="bg-[#58CC02] px-6 pt-8 pb-16 flex flex-col items-center">
        <div className="w-20 h-20 bg-white rounded-2xl flex items-center justify-center text-[#58CC02] text-4xl font-extrabold border-b-4 border-[#46A302] shadow-lg mb-3">
          {user?.name?.charAt(0).toUpperCase()}
        </div>
        <h1 className="text-2xl font-extrabold text-white">{user?.name}</h1>
        <p className="text-white opacity-80 font-medium text-sm mt-1">
          {user?.email}
        </p>

        {/* Stats */}
        <div className="flex gap-4 mt-5">
          <div className="bg-white bg-opacity-20 rounded-2xl px-5 py-3 text-center">
            <div className="text-2xl font-extrabold text-white">
              {user?.totalRides}
            </div>
            <div className="text-xs font-bold text-white opacity-80 mt-1">
              RIDES
            </div>
          </div>
          <div className="bg-white bg-opacity-20 rounded-2xl px-5 py-3 text-center">
            <div className="text-2xl font-extrabold text-white">
              {user?.streak} 🔥
            </div>
            <div className="text-xs font-bold text-white opacity-80 mt-1">
              STREAK
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-md mx-auto px-4 -mt-6">
        {/* Tabs */}
        <div className="flex gap-3 mb-5">
          <button
            onClick={() => setActiveTab("profile")}
            className={`flex-1 py-3 rounded-xl font-extrabold border-b-4 transition-all ${
              activeTab === "profile"
                ? "bg-[#58CC02] text-white border-[#46A302]"
                : "bg-white text-gray-400 border-gray-200"
            }`}
          >
            👤 Profile
          </button>
          <button
            onClick={() => setActiveTab("password")}
            className={`flex-1 py-3 rounded-xl font-extrabold border-b-4 transition-all ${
              activeTab === "password"
                ? "bg-[#1CB0F6] text-white border-blue-600"
                : "bg-white text-gray-400 border-gray-200"
            }`}
          >
            🔒 Password
          </button>
        </div>

        {/* Profile Tab */}
        {activeTab === "profile" && (
          <div className="bg-white rounded-2xl shadow-lg p-6 border-2 border-gray-100">
            <form onSubmit={handleProfileUpdate} className="space-y-4">
              <div>
                <label className="block text-sm font-extrabold text-[#1F2937] mb-1">
                  FULL NAME
                </label>
                <input
                  type="text"
                  value={profileData.name}
                  onChange={(e) =>
                    setProfileData({ ...profileData, name: e.target.value })
                  }
                  className="w-full px-4 py-3 rounded-xl border-2 border-gray-200 focus:border-[#58CC02] focus:outline-none font-medium text-[#1F2937] transition-colors"
                />
              </div>

              <div>
                <label className="block text-sm font-extrabold text-[#1F2937] mb-1">
                  EMAIL
                </label>
                <input
                  type="email"
                  value={user?.email}
                  disabled
                  className="w-full px-4 py-3 rounded-xl border-2 border-gray-100 bg-gray-50 font-medium text-gray-400 cursor-not-allowed"
                />
                <p className="text-xs text-gray-400 mt-1 font-medium">
                  Email cannot be changed
                </p>
              </div>

              <div>
                <label className="block text-sm font-extrabold text-[#1F2937] mb-1">
                  PHONE NUMBER
                </label>
                <input
                  type="tel"
                  value={profileData.phone}
                  onChange={(e) =>
                    setProfileData({ ...profileData, phone: e.target.value })
                  }
                  className="w-full px-4 py-3 rounded-xl border-2 border-gray-200 focus:border-[#58CC02] focus:outline-none font-medium text-[#1F2937] transition-colors"
                />
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full bg-[#58CC02] text-white font-extrabold py-4 rounded-xl border-b-4 border-[#46A302] hover:bg-[#46A302] active:border-b-0 transition-all text-lg disabled:opacity-70"
              >
                {loading ? "Saving..." : "SAVE CHANGES"}
              </button>
            </form>
          </div>
        )}

        {/* Password Tab */}
        {activeTab === "password" && (
          <div className="bg-white rounded-2xl shadow-lg p-6 border-2 border-gray-100">
            <form onSubmit={handlePasswordChange} className="space-y-4">
              <div>
                <label className="block text-sm font-extrabold text-[#1F2937] mb-1">
                  CURRENT PASSWORD
                </label>
                <input
                  type="password"
                  value={passwordData.currentPassword}
                  onChange={(e) =>
                    setPasswordData({
                      ...passwordData,
                      currentPassword: e.target.value,
                    })
                  }
                  placeholder="Enter current password"
                  className="w-full px-4 py-3 rounded-xl border-2 border-gray-200 focus:border-[#1CB0F6] focus:outline-none font-medium text-[#1F2937] transition-colors"
                />
              </div>

              <div>
                <label className="block text-sm font-extrabold text-[#1F2937] mb-1">
                  NEW PASSWORD
                </label>
                <input
                  type="password"
                  value={passwordData.newPassword}
                  onChange={(e) =>
                    setPasswordData({
                      ...passwordData,
                      newPassword: e.target.value,
                    })
                  }
                  placeholder="Min. 6 characters"
                  className="w-full px-4 py-3 rounded-xl border-2 border-gray-200 focus:border-[#1CB0F6] focus:outline-none font-medium text-[#1F2937] transition-colors"
                />
              </div>

              <div>
                <label className="block text-sm font-extrabold text-[#1F2937] mb-1">
                  CONFIRM PASSWORD
                </label>
                <input
                  type="password"
                  value={passwordData.confirmPassword}
                  onChange={(e) =>
                    setPasswordData({
                      ...passwordData,
                      confirmPassword: e.target.value,
                    })
                  }
                  placeholder="Repeat new password"
                  className="w-full px-4 py-3 rounded-xl border-2 border-gray-200 focus:border-[#1CB0F6] focus:outline-none font-medium text-[#1F2937] transition-colors"
                />
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full bg-[#1CB0F6] text-white font-extrabold py-4 rounded-xl border-b-4 border-blue-600 hover:bg-blue-500 active:border-b-0 transition-all text-lg disabled:opacity-70"
              >
                {loading ? "Changing..." : "CHANGE PASSWORD"}
              </button>
            </form>
          </div>
        )}
      </div>
    </div>
  );
};

export default Profile;
