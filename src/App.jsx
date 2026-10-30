import React, { useState, useEffect } from 'react';
import Navbar from './components/Navbar';
import Home from './pages/Home';
import History from './pages/History';
import { getReviews } from './services/api';
import { ThemeProvider } from './context/ThemeContext';

function MainApp() {
  const [activePage, setActivePage] = useState('editor'); // 'editor' | 'history'
  const [activeReview, setActiveReview] = useState(null);
  const [historyCount, setHistoryCount] = useState(0);

  const refreshHistoryCount = async () => {
    try {
      const list = await getReviews();
      if (Array.isArray(list)) {
        setHistoryCount(list.length);
      }
    } catch (err) {
      // Ignore initial count error
    }
  };

  useEffect(() => {
    refreshHistoryCount();
  }, []);

  const handleSelectReviewFromHistory = (review) => {
    setActiveReview(review);
    setActivePage('editor');
  };

  return (
    <div
      id="app-root"
      className="min-h-screen flex flex-col transition-colors duration-200"
      style={{
        backgroundColor: 'var(--bg-color)',
        color: 'var(--text-main)',
      }}
    >
      <Navbar
        activePage={activePage}
        setActivePage={setActivePage}
        historyCount={historyCount}
      />

      <main className="flex-1 p-3 sm:p-5 md:p-6 max-w-[1600px] mx-auto w-full">
        {activePage === 'editor' && (
          <Home
            activeReview={activeReview}
            setActiveReview={setActiveReview}
            onReviewSaved={refreshHistoryCount}
          />
        )}

        {activePage === 'history' && (
          <History
            onSelectReview={handleSelectReviewFromHistory}
            onReviewsUpdated={setHistoryCount}
          />
        )}
      </main>
    </div>
  );
}

export default function App() {
  return (
    <ThemeProvider>
      <MainApp />
    </ThemeProvider>
  );
}

