import React from 'react';
import { FaShieldHalved, FaWrench, FaBookOpen, FaSpinner } from 'react-icons/fa6';
import { useTheme } from '../context/ThemeContext';

export default function ReviewButton({
  onAnalyze,
  onFix,
  onExplain,
  loadingAction, // 'analyze' | 'fix' | 'explain' | null
  disabled,
}) {
  const { theme } = useTheme();
  const isDark = theme === 'dark';

  const isAnalyzing = loadingAction === 'analyze';
  const isFixing = loadingAction === 'fix';
  const isExplaining = loadingAction === 'explain';
  const isBusy = !!loadingAction;

  return (
    <div className="flex flex-wrap items-center gap-2">
      {/* 1. Explain Code Button */}
      <button
        id="explain-code-btn"
        type="button"
        onClick={onExplain}
        disabled={disabled || isBusy}
        className={`flex items-center gap-1.5 px-3 py-1.5 sm:py-2 rounded-lg text-xs font-semibold border transition-all cursor-pointer disabled:opacity-40 disabled:cursor-not-allowed shadow-sm whitespace-nowrap ${
          isDark
            ? 'bg-[#161b22] hover:bg-[#21262d] text-blue-300 border-[#30363d]'
            : 'bg-white hover:bg-blue-50 text-blue-700 border-blue-200'
        }`}
        title="Get beginner-friendly plain English explanation of this code"
      >
        {isExplaining ? (
          <FaSpinner className="animate-spin text-xs" />
        ) : (
          <FaBookOpen className="text-xs text-blue-400" />
        )}
        <span>{isExplaining ? 'Explaining...' : 'Explain'}</span>
      </button>

      {/* 2. Check Code Quality (Primary Hero Action) */}
      <button
        id="analyze-code-btn"
        type="button"
        onClick={onAnalyze}
        disabled={disabled || isBusy}
        className="flex items-center gap-2 px-3.5 sm:px-4 py-1.5 sm:py-2 rounded-lg text-xs font-bold text-white bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 active:from-purple-700 active:to-indigo-700 transition-all shadow-md hover:shadow-purple-500/20 cursor-pointer disabled:opacity-40 disabled:cursor-not-allowed border border-purple-400/30 whitespace-nowrap"
        title="Run deep AI analysis for security, bug vulnerabilities, and quality score"
      >
        {isAnalyzing ? (
          <FaSpinner className="animate-spin text-xs" />
        ) : (
          <FaShieldHalved className="text-xs text-purple-200" />
        )}
        <span>{isAnalyzing ? 'Checking Quality...' : 'Check Code Quality'}</span>
      </button>

      {/* 3. Auto-Fix Button */}
      <button
        id="fix-code-btn"
        type="button"
        onClick={onFix}
        disabled={disabled || isBusy}
        className={`flex items-center gap-1.5 px-3 py-1.5 sm:py-2 rounded-lg text-xs font-semibold border transition-all cursor-pointer disabled:opacity-40 disabled:cursor-not-allowed shadow-sm whitespace-nowrap ${
          isDark
            ? 'bg-[#161b22] hover:bg-[#21262d] text-emerald-300 border-[#30363d]'
            : 'bg-white hover:bg-emerald-50 text-emerald-700 border-emerald-200'
        }`}
        title="Automatically patch bugs, security vulnerabilities, and anti-patterns"
      >
        {isFixing ? (
          <FaSpinner className="animate-spin text-xs text-emerald-400" />
        ) : (
          <FaWrench className="text-xs text-emerald-400" />
        )}
        <span>{isFixing ? 'Fixing...' : 'Auto-Fix'}</span>
      </button>
    </div>
  );
}

