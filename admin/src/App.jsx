import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { useAuth } from './contexts/AuthContext';
import Login from './pages/Login';
import Signup from './pages/Signup';
import DashboardLayout from './layouts/DashboardLayout';
import Dashboard from './pages/Dashboard';
import GamesManagement from './pages/GamesManagement';
import EventsManagement from './pages/EventsManagement';
import DriversManagement from './pages/DriversManagement';

const ProtectedRoute = ({ children }) => {
  const { user, loading } = useAuth();
  if (loading) return <div>Loading...</div>;
  if (!user) return <Navigate to="/login" />;
  return children;
};

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/login" element={<Login />} />
        <Route path="/signup" element={<Signup />} />
        <Route path="/" element={<ProtectedRoute><DashboardLayout /></ProtectedRoute>}>
          <Route index element={<Dashboard />} />
          <Route path="games" element={<GamesManagement />} />
          <Route path="events" element={<EventsManagement />} />
          <Route path="drivers" element={<DriversManagement />} />
        </Route>
      </Routes>
    </Router>
  );
}

export default App;
