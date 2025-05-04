import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';
import { BrowserRouter } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import { TelegramProvider } from './context/TelegramContext';
import './styles/index.scss';

// Инициализация Telegram Mini App
window.Telegram.WebApp.expand();
window.Telegram.WebApp.enableClosingConfirmation();

const root = ReactDOM.createRoot(document.getElementById('root') as HTMLElement);
root.render(
  <React.StrictMode>
    <BrowserRouter>
      <TelegramProvider>
        <AuthProvider>
          <App />
        </AuthProvider>
      </TelegramProvider>
    </BrowserRouter>
  </React.StrictMode>
); 