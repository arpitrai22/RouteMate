import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import { AuthProvider, useAuth } from './context/AuthContext';
import Login from './pages/Login';
import Register from './pages/Register';
import Home from './pages/Home';
import FindMatch from './pages/FindMatch';
import WaitingScreen from './pages/WaitingScreen';
import ChatRoom from './pages/ChatRoom';
import Profile from './pages/Profile';

// Protected route
const ProtectedRoute = ({ children }) => {
  const { user, loading } = useAuth();
  if (loading) return (
    <div className="min-h-screen flex items-center justify-center">
      <div className="text-6xl animate-bounce">🚗</div>
    </div>
  );
  return user ? children : <Navigate to="/login" />;
};

// Public route
const PublicRoute = ({ children }) => {
  const { user, loading } = useAuth();
  if (loading) return (
    <div className="min-h-screen flex items-center justify-center">
      <div className="text-6xl animate-bounce">🚗</div>
    </div>
  );
  return !user ? children : <Navigate to="/home" />;
};

const AppRoutes = () => {
  return (
    <Routes>
      <Route path="/" element={<Navigate to="/login" />} />

      <Route path="/login" element={
        <PublicRoute><Login /></PublicRoute>
      } />
      <Route path="/register" element={
        <PublicRoute><Register /></PublicRoute>
      } />

      <Route path="/home" element={
        <ProtectedRoute><Home /></ProtectedRoute>
      } />
      <Route path="/find-match" element={
        <ProtectedRoute><FindMatch /></ProtectedRoute>
      } />
      <Route path="/waiting" element={
        <ProtectedRoute><WaitingScreen /></ProtectedRoute>
      } />
      <Route path="/chat" element={
        <ProtectedRoute><ChatRoom /></ProtectedRoute>
      } />
      <Route path="/profile" element={
        <ProtectedRoute><Profile /></ProtectedRoute>
      } />
    </Routes>
  );
};

function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <Toaster
          position="top-center"
          toastOptions={{
            style: {
              fontWeight: 'bold',
              borderRadius: '12px',
            },
          }}
        />
        <AppRoutes />
      </AuthProvider>
    </BrowserRouter>
  );
}

export default App;