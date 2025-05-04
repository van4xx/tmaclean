import React, { useState, useEffect } from 'react';
import { TelegramProvider } from './context/TelegramContext';
import { ApiProvider } from './context/ApiContext';
import Header from './components/Header';
import TabBar from './components/TabBar';
import Home from './pages/Home';
import MyCleanings from './pages/MyCleanings';
import ScheduleCleaning from './pages/ScheduleCleaning';
import Profile from './pages/Profile';
import Support from './pages/Support';
import LoadingScreen from './components/LoadingScreen';
import './styles/App.css';

const App = () => {
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('home');
  
  useEffect(() => {
    // Simulate loading time
    const timer = setTimeout(() => {
      setLoading(false);
    }, 1000);
    
    return () => clearTimeout(timer);
  }, []);
  
  // Render active page based on selected tab
  const renderActivePage = () => {
    switch (activeTab) {
      case 'home':
        return <Home onSchedule={() => setActiveTab('schedule')} />;
      case 'schedule':
        return <ScheduleCleaning onSuccess={() => setActiveTab('cleanings')} />;
      case 'cleanings':
        return <MyCleanings onSchedule={() => setActiveTab('schedule')} />;
      case 'profile':
        return <Profile />;
      case 'support':
        return <Support />;
      default:
        return <Home />;
    }
  };
  
  return (
    <TelegramProvider>
      <ApiProvider>
        <div className="app twa-container">
          {loading ? (
            <LoadingScreen />
          ) : (
            <>
              <Header activeTab={activeTab} />
              <main className="app-content">
                {renderActivePage()}
              </main>
              <TabBar activeTab={activeTab} onTabChange={setActiveTab} />
            </>
          )}
        </div>
      </ApiProvider>
    </TelegramProvider>
  );
};

export default App; 