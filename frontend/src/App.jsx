import React from 'react'
import { Route, Routes, Navigate, Outlet, useParams } from 'react-router-dom'
import Login from './components/user/Login';
import Signup from './components/user/SignUp';
import LoginSuccess from './components/user/LoginSucess';
import ForgotPassword from './components/user/ForgotPassword';
import ResetPassword from './components/user/ResetPassword';
import VerifyOTP from './components/user/VerifyOtp';
import Navbar from './components/Navbar/Navbar';
import Home from './pages/Home';
import Footer from './components/Footer';

import GoogleCallback from './components/user/GoogleCallback';
import Admin from './Admin';
import Community from './pages/Community';
import GameDetail from './pages/GameDetail';
import LiveEvents from './pages/LiveEvents';
import LiveEventDetail from './pages/LiveEventDetail';
import EventEnrollForm from './pages/EventEnrollForm';
import TopPlayers from './pages/TopPlayers';
import DriverProfile from './pages/DriverProfile';
import UserProfile from './pages/UserProfile';
import Checkout from './pages/Checkout';
import Library from './pages/Librarary';
import ThankYou from './pages/ThankYou';
import AdminAddEvent from './pages/AdminAddEvent';
import AdminDashboard from './pages/AdminDashboard';
import AdminEditGame from './pages/AdminEditGame';

function LegacyGameEventRedirect() {
  const { id } = useParams();
  return <Navigate to={`/live-events/${id}`} replace />;
}

function LegacyGameDriverRedirect() {
  const { id } = useParams();
  return <Navigate to={`/drivers/${encodeURIComponent(id)}`} replace />;
}

const App = () => {
  const PrivateRoutes = () => {
    const isAuthenticated = !!localStorage.getItem('token');
    return isAuthenticated ? <Outlet /> : <Navigate to="/login" replace />;
  };

  const PublicRoutes = () => {
    const isAuthenticated = !!localStorage.getItem('token');
    return !isAuthenticated ? <Outlet /> : <Navigate to="/" replace />;
  };
  return (
    <Routes>
      {/* Standalone Route for Library separated from the UI layout */}
      <Route path='/library' element={<Library />} />
      
      {/* Main App Layout */}
      <Route path="*" element={
        <>
          <Navbar />
          <Routes>
            <Route path="/community" element={<Community />} />
            <Route path="/live-events" element={<LiveEvents />} />
            <Route path="/live-events/:eventId" element={<LiveEventDetail />} />
            <Route path="/event-enroll/:eventId" element={<EventEnrollForm />} />
            <Route path="/top-players" element={<TopPlayers />} />
            <Route path="/drivers/:rank" element={<DriverProfile />} />
            <Route path="/game/event/:id" element={<LegacyGameEventRedirect />} />
            <Route path="/game/driver/:id" element={<LegacyGameDriverRedirect />} />
            <Route path="/game/:category/:id" element={<GameDetail />} />
            <Route path="/checkout" element={<Checkout />} />
            <Route path="/thank-you" element={<ThankYou />} />

            <Route element={<PublicRoutes />}>
              <Route path="/login" element={<Login />} />
              <Route path="/signup" element={<Signup />} />
              <Route path="/verify-otp" element={<VerifyOTP />} />
              <Route path="/forgot-password" element={<ForgotPassword />} />
              <Route path="/reset-password" element={<ResetPassword />} />
              <Route path="/google-callback" element={<GoogleCallback />} />
            </Route>

            <Route path="/" element={<Home />} />
            <Route element={<PrivateRoutes />}>
              <Route path="/profile" element={<UserProfile />} />
              <Route path="/admin" element={<Admin />} />
              <Route path="/admin/dashboard" element={<AdminDashboard />} />
              <Route path="/admin/add-event" element={<AdminAddEvent />} />
              <Route path="/admin/edit-game/:id" element={<AdminEditGame />} />
              <Route path="/login-success" element={<LoginSuccess />} />
            </Route>

            <Route path="*" element={<Navigate to={!!localStorage.getItem('token') ? "/" : "/login"} replace />} />
          </Routes>
          <Footer />
        </>
      } />
    </Routes>
  )
}

export default App;
