import React from 'react';
import {
  FaCode,
  FaClockRotateLeft,
  FaSun,
  FaMoon,
  FaShieldHalved,
  FaCircle,
} from 'react-icons/fa6';
import { useTheme } from '../context/ThemeContext';

export default function Navbar({ activePage, setActivePage, historyCount = 0 }) {
  const { theme, toggleTheme } = useTheme();
  const isDark = theme === 'dark';

  return (
    <header
      id="main-navbar"
      className="sticky top-0 z-50 flex items-center justify-between px-4 sm:px-6 py-2.5 border-b select-none transition-colors duration-200"
      style={{
        backgroundColor: 'var(--secondary-bg)',
        borderColor: 'var(--border-color)',
      }}
    >
      {/* LEFT: Simple Clean Logo & ReviewMyCode IDE with Unique Shimmer Effect */}
      <div className="flex items-center gap-3">
        {/* Simple Minimalist Logo */}
        <button
          type="button"
          onClick={() => setActivePage('editor')}
          className="flex items-center justify-center w-8 h-8 rounded-lg bg-gradient-to-tr from-purple-600 to-indigo-500 text-white shadow-md hover:opacity-90 transition-opacity cursor-pointer flex-shrink-0"
          title="ReviewMyCode IDE Home"
        >
          <FaCode className="text-sm" />
        </button>

        {/* Unique Effect on ReviewMyCode IDE */}
        <div
          onClick={() => setActivePage('editor')}
          className="flex items-center gap-2 cursor-pointer group"
        >
          <div className="flex items-center gap-1.5">
            <span
              className={`text-base sm:text-lg font-extrabold tracking-tight font-mono transition-all duration-300 ${
                isDark ? 'brand-shimmer-text' : 'brand-shimmer-text-light'
              }`}
            >
              ReviewMyCode
            </span>

            {/* Glowing IDE Badge with Live Status Dot */}
            <div
              className={`flex items-center gap-1 px-2 py-0.5 rounded-full text-[11px] font-bold font-mono border transition-all ${
                isDark
                  ? 'bg-purple-950/70 border-purple-500/50 text-purple-300 brand-glow-box'
                  : 'bg-purple-100 border-purple-300 text-purple-700 shadow-sm'
              }`}
            >
              <span className="relative flex h-1.5 w-1.5">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-1.5 w-1.5 bg-emerald-500"></span>
              </span>
              <span>IDE</span>
            </div>
          </div>
        </div>
      </div>

      {/* RIGHT: Navigation Items (ReviewMyCode IDE, History) & Dark/Light Theme Switcher */}
      <div className="flex items-center gap-2 sm:gap-3">
        {/* Nav 1: ReviewMyCode IDE workspace */}
        <button
          id="nav-editor-btn"
          type="button"
          onClick={() => setActivePage('editor')}
          className={`flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
            activePage === 'editor'
              ? 'bg-purple-600 text-white shadow-sm'
              : 'text-gray-400 hover:text-gray-200 hover:bg-[#21262d]/50'
          }`}
          style={
            activePage !== 'editor'
              ? {
                  color: 'var(--text-gray)',
                }
              : {}
          }
        >
          <FaCode className="text-xs" />
          <span className="hidden sm:inline">IDE</span>
          <span className="sm:hidden">IDE</span>
        </button>

        {/* Nav 2: History with badge */}
        <button
          id="nav-history-btn"
          type="button"
          onClick={() => setActivePage('history')}
          className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
            activePage === 'history'
              ? 'bg-purple-600 text-white shadow-sm'
              : 'text-gray-400 hover:text-gray-200 hover:bg-[#21262d]/50'
          }`}
          style={
            activePage !== 'history'
              ? {
                  color: 'var(--text-gray)',
                }
              : {}
          }
        >
          <FaClockRotateLeft className="text-xs" />
          <span>History</span>
          {historyCount > 0 && (
            <span
              className={`text-[10px] px-1.5 py-0.2 rounded-full font-mono font-bold ${
                activePage === 'history'
                  ? 'bg-white text-purple-700'
                  : 'bg-purple-600 text-white'
              }`}
            >
              {historyCount}
            </span>
          )}
        </button>

        {/* Vertical Divider */}
        <div
          className="h-5 w-[1px] mx-0.5"
          style={{ backgroundColor: 'var(--border-color)' }}
        />

        {/* Dark / Light Theme Toggle Option */}
        <button
          id="theme-toggle-btn"
          type="button"
          onClick={toggleTheme}
          className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-xs font-medium border transition-all cursor-pointer"
          style={{
            backgroundColor: 'var(--card-bg)',
            borderColor: 'var(--border-color)',
            color: 'var(--text-main)',
          }}
          title={isDark ? 'Switch to Light Theme' : 'Switch to Dark Theme'}
        >
          {isDark ? (
            <>
              <FaSun className="text-amber-400 text-xs transition-transform hover:rotate-45" />
              <span className="hidden md:inline text-[11px] font-mono text-gray-300">Light</span>
            </>
          ) : (
            <>
              <FaMoon className="text-purple-600 text-xs transition-transform hover:-rotate-12" />
              <span className="hidden md:inline text-[11px] font-mono text-gray-600">Dark</span>
            </>
          )}
        </button>
      </div>
    </header>
  );
}

