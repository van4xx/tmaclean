import React, { useEffect } from 'react';
import { Routes, Route, useNavigate } from 'react-router-dom';
import { AnimatePresence } from 'framer-motion';
import { useAuth } from './hooks/useAuth';
import { useTelegram } from './hooks/useTelegram';

// Импорт страниц
import HomePage from './pages/HomePage';
import TariffPage from './pages/TariffPage';
import SchedulePage from './pages/SchedulePage';
import ProfilePage from './pages/ProfilePage';
import MyCleaningsPage from './pages/MyCleaningsPage';
import AuthPage from './pages/AuthPage';
import PrivateRoute from './components/PrivateRoute';

// Импорт стилей
import './styles/App.scss';

function App() {
  const { user, loading } = useAuth();
  const { webApp } = useTelegram();
  const navigate = useNavigate();

  useEffect(() => {
    if (webApp) {
      webApp.ready();
      
      // Настраиваем кнопку назад
      webApp.BackButton.onClick(() => {
        navigate(-1);
      });
    }
  }, [webApp, navigate]);

  // Показываем загрузку пока проверяем аутентификацию
  if (loading) {
    return (
      <div className="loading-screen">
        <div className="spinner"></div>
        <p>Загрузка...</p>
      </div>
    );
  }

  return (
    <div className="app">
      <AnimatePresence mode="wait">
        <Routes>
          <Route path="/" element={<HomePage />} />
          <Route path="/auth" element={<AuthPage />} />
          <Route path="/tariffs" element={<TariffPage />} />
          
          {/* Защищенные маршруты */}
          <Route element={<PrivateRoute isAuthenticated={!!user} />}>
            <Route path="/schedule" element={<SchedulePage />} />
            <Route path="/profile" element={<ProfilePage />} />
            <Route path="/cleanings" element={<MyCleaningsPage />} />
          </Route>
        </Routes>
      </AnimatePresence>
    </div>
  );
}

export default App; 