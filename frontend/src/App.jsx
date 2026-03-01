import React, { useState, useEffect } from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { useI18n } from './contexts/I18nContext';
import { getMe } from './api/client';
import UserBar from './components/UserBar';
import Invitation from './pages/Invitation';
import Rsvp from './pages/Rsvp';
import Login from './pages/Login';
import Admin from './pages/Admin';

function AppContent() {
  const { loading: i18nLoading } = useI18n();
  const [user, setUser] = useState(null);

  useEffect(() => {
    getMe()
      .then(setUser)
      .catch(() => setUser(null));
  }, []);

  if (i18nLoading) {
    return (
      <div style={{ textAlign: 'center', padding: '2rem' }}>
        Loading…
      </div>
    );
  }

  return (
    <>
      <UserBar user={user} />
      <div className={user ? 'user-bar-spacer' : ''} style={user ? { marginTop: '2.5rem' } : undefined}>
        <Routes>
          <Route path="/" element={user ? <Invitation user={user} /> : <Navigate to="/login" replace />} />
          <Route path="/rsvp" element={user ? <Rsvp user={user} onRefreshUser={() => getMe().then(setUser)} /> : <Navigate to="/login" replace />} />
          <Route path="/login" element={user ? <Navigate to="/" replace /> : <Login />} />
          <Route path="/admin" element={user?.admin ? <Admin /> : <Navigate to="/" replace />} />
          <Route path="*" element={<Navigate to="/login" replace />} />
        </Routes>
      </div>
    </>
  );
}

export default function App() {
  return <AppContent />;
}