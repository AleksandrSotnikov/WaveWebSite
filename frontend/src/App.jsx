import { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthContext } from './context/AuthContext';
import api from './services/api';

// Pages
import LoginPage from './pages/LoginPage';
import DashboardPage from './pages/DashboardPage';
import ClientsPage from './pages/ClientsPage';
import TrainersPage from './pages/TrainersPage';
import SubscriptionsPage from './pages/SubscriptionsPage';
import SchedulePage from './pages/SchedulePage';
import ReportsPage from './pages/ReportsPage';

// Components
import Navbar from './components/Navbar';

export default function App() {
  const [auth, setAuth] = useState({
    token: localStorage.getItem('token'),
    user: localStorage.getItem('user') ? JSON.parse(localStorage.getItem('user')) : null,
    isAuthenticated: !!localStorage.getItem('token'),
  });

  const login = (token, user) => {
    localStorage.setItem('token', token);
    localStorage.setItem('user', JSON.stringify(user));
    setAuth({ token, user, isAuthenticated: true });
    api.defaults.headers.common['Authorization'] = `Bearer ${token}`;
  };

  const logout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    setAuth({ token: null, user: null, isAuthenticated: false });
    delete api.defaults.headers.common['Authorization'];
  };

  // Set initial auth header
  useEffect(() => {
    if (auth.token) {
      api.defaults.headers.common['Authorization'] = `Bearer ${auth.token}`;
    }
  }, []);

  return (
    <AuthContext.Provider value={{ ...auth, login, logout }}>
      <Router>
        {auth.isAuthenticated && <Navbar />}
        <Routes>
          {!auth.isAuthenticated ? (
            <>
              <Route path="/" element={<LoginPage />} />
              <Route path="*" element={<Navigate to="/" />} />
            </>
          ) : (
            <>
              <Route path="/dashboard" element={<DashboardPage />} />
              <Route path="/clients" element={<ClientsPage />} />
              <Route path="/trainers" element={<TrainersPage />} />
              <Route path="/subscriptions" element={<SubscriptionsPage />} />
              <Route path="/schedule" element={<SchedulePage />} />
              <Route path="/reports" element={<ReportsPage />} />
              <Route path="*" element={<Navigate to="/dashboard" />} />
            </>
          )}
        </Routes>
      </Router>
    </AuthContext.Provider>
  );
}
