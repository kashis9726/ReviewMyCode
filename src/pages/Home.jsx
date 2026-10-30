import React, { useState, useEffect } from 'react';
import CodeEditor from '../components/CodeEditor';
import LanguageSelector from '../components/LanguageSelector';
import ReviewButton from '../components/ReviewButton';
import AnalysisResult from '../components/AnalysisResult';
import { analyzeCode, fixCode, explainCode } from '../services/api';
import { useTheme } from '../context/ThemeContext';
import {
  FaCheck,
  FaCopy,
  FaDownload,
  FaWrench,
  FaBookOpen,
  FaTriangleExclamation,
  FaShieldHalved,
  FaCode,
  FaTableColumns,
  FaBug,
  FaBolt,
  FaArrowRight,
  FaTrash,
  FaRotateLeft,
  FaArrowsRotate,
  FaExpand,
  FaCompress,
  FaCircleCheck,
} from 'react-icons/fa6';

export default function Home({ onReviewSaved, activeReview, setActiveReview }) {
  const { theme } = useTheme();
  const isDark = theme === 'dark';

  const [code, setCode] = useState(activeReview?.code || '');
  const [language, setLanguage] = useState(activeReview?.language || 'javascript');

  // Sync editor when active review changes (e.g., loaded from history)
  useEffect(() => {
    if (activeReview?.code) {
      setCode(activeReview.code);
    }
    if (activeReview?.language) {
      setLanguage(activeReview.language);
    }
    if (activeReview) {
      setInspectorTab('audit');
    }
  }, [activeReview]);

  // Loading and active action states
  const [loadingAction, setLoadingAction] = useState(null); // 'analyze' | 'fix' | 'explain' | null
  const [errorMessage, setErrorMessage] = useState('');
  const [notification, setNotification] = useState('');

  // Fixed Code and Explanation states
  const [fixResult, setFixResult] = useState(null);
  const [explainResult, setExplainResult] = useState(null);
  const [originalCodeBeforeFix, setOriginalCodeBeforeFix] = useState(null);

  // Inspector sub-tab: 'audit' | 'fix' | 'explain'
  const [inspectorTab, setInspectorTab] = useState('audit');

  // View layout mode: 'split' | 'editor' | 'inspector'
  const [layoutMode, setLayoutMode] = useState('split');

  const showNotification = (msg) => {
    setNotification(msg);
    setTimeout(() => setNotification(''), 3000);
  };

  // 1. Analyze Code Handler (Audit)
  const handleAnalyze = async () => {
    if (!code || code.trim() === '') {
      setErrorMessage('Please enter or paste some code to check.');
      return;
    }

    setErrorMessage('');
    setLoadingAction('analyze');
    setInspectorTab('audit');

    try {
      const data = await analyzeCode(code, language);
      setActiveReview(data);
      if (onReviewSaved) {
        onReviewSaved();
      }
      showNotification('Code audit completed successfully!');
    } catch (err) {
      console.error('Analysis error:', err);
      let msg = err.response?.data?.message || err.message || 'Unable to analyze code right now.';
      if (err.code === 'ECONNABORTED' || msg.toLowerCase().includes('timeout')) {
        msg = 'The analysis request timed out due to high AI service demand. Please click Retry.';
      } else if (
        msg.toLowerCase().includes('unexpected token') ||
        msg.toLowerCase().includes('json') ||
        msg.toLowerCase().includes('parse ai response')
      ) {
        msg = 'The AI response format was defensive. Retrying will provide a complete report.';
      }
      setErrorMessage(msg);
    } finally {
      setLoadingAction(null);
    }
  };

  // 2. Fix Code Handler - Directly updates user code in the editor
  const handleFix = async () => {
    if (!code || code.trim() === '') {
      setErrorMessage('Please enter some code before requesting a fix.');
      return;
    }

    setErrorMessage('');
    setLoadingAction('fix');
    setInspectorTab('fix');

    try {
      const originalCode = code;
      const data = await fixCode(code, language);
      setFixResult(data);

      // Directly apply the clean fixed code into user's editor
      if (data?.fixedCode) {
        setOriginalCodeBeforeFix(originalCode);
        setCode(data.fixedCode);
        showNotification('Security fixes & improvements applied directly to your code in the editor!');
      } else {
        showNotification('Refactored secure code generated!');
      }
    } catch (err) {
      console.error('Fix error:', err);
      let msg = err.response?.data?.message || err.message || 'Unable to generate code fix.';
      if (err.code === 'ECONNABORTED' || msg.toLowerCase().includes('timeout')) {
        msg = 'The fix request timed out due to high AI service demand. Please click Retry.';
      }
      setErrorMessage(msg);
    } finally {
      setLoadingAction(null);
    }
  };

  // Restore original code before the automated fix
  const handleUndoFix = () => {
    if (originalCodeBeforeFix) {
      setCode(originalCodeBeforeFix);
      setOriginalCodeBeforeFix(null);
      showNotification('Restored original code back into the editor.');
    }
  };

  // 3. Explain Code Handler
  const handleExplain = async () => {
    if (!code || code.trim() === '') {
      setErrorMessage('Please enter some code before requesting an explanation.');
      return;
    }

    setErrorMessage('');
    setLoadingAction('explain');
    setInspectorTab('explain');

    try {
      const data = await explainCode(code, language);
      setExplainResult(data);
      showNotification('Code explanation ready!');
    } catch (err) {
      console.error('Explain error:', err);
      let msg = err.response?.data?.message || err.message || 'Unable to generate explanation.';
      if (err.code === 'ECONNABORTED' || msg.toLowerCase().includes('timeout')) {
        msg = 'The explanation request timed out. Please click Retry.';
      }
      setErrorMessage(msg);
    } finally {
      setLoadingAction(null);
    }
  };

  // Replace original code with fixed code in the editor
  const handleApplyFixedCode = () => {
    if (fixResult?.fixedCode) {
      setCode(fixResult.fixedCode);
      showNotification('Fixed code applied to editor! You can now re-audit.');
    }
  };

  // Download fixed code as file
  const handleDownloadFixedCode = () => {
    if (!fixResult?.fixedCode) return;
    const blob = new Blob([fixResult.fixedCode], { type: 'text/plain;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `fixed_${language}_solution.txt`;
    link.click();
    URL.revokeObjectURL(url);
    showNotification('File downloaded!');
  };

  const handleCopyFixedCode = () => {
    if (!fixResult?.fixedCode) return;
    navigator.clipboard.writeText(fixResult.fixedCode);
    showNotification('Fixed code copied to clipboard!');
  };

  const handleCopyExplanation = () => {
    if (!explainResult) return;
    const parts = [];
    const sum = explainResult.summary || explainResult.overview;
    if (sum) parts.push(`### Summary\n${sum}\n`);
    if (explainResult.mainLogic) parts.push(`### Execution Logic\n${explainResult.mainLogic}\n`);
    const funcs = explainResult.keyFunctions || explainResult.functions;
    if (funcs) parts.push(`### Key Components\n${funcs}\n`);
    if (explainResult.potentialProblems) parts.push(`### Watchouts & Considerations\n${explainResult.potentialProblems}\n`);
    if (explainResult.howItWorks) parts.push(`### Key Takeaway\n${explainResult.howItWorks}\n`);

    navigator.clipboard.writeText(parts.join('\n'));
    showNotification('Explanation copied to clipboard!');
  };

  return (
    <div id="ide-workspace-root" className="flex flex-col gap-4 max-w-[1600px] mx-auto w-full pb-10">
      {/* Toast Notification */}
      {notification && (
        <div
          className="fixed bottom-6 right-6 z-50 flex items-center gap-2 px-4 py-2.5 rounded-lg shadow-2xl border text-xs font-medium text-emerald-200 bg-[#064e3b] border-[#059669] animate-in fade-in"
        >
          <FaCheck className="text-emerald-400 text-xs" />
          <span>{notification}</span>
        </div>
      )}

      {/* Top IDE Command Bar */}
      <div
        className="flex flex-col lg:flex-row lg:items-center justify-between gap-3 p-3 rounded-xl border select-none transition-colors"
        style={{
          backgroundColor: isDark ? '#0d1117' : '#ffffff',
          borderColor: isDark ? '#30363d' : '#d0d7de',
        }}
      >
        {/* Left: Language & Real-User Utilities */}
        <div className="flex flex-wrap items-center gap-2.5">
          <LanguageSelector
            selectedLanguage={language}
            onSelectLanguage={(lang) => {
              setLanguage(lang);
            }}
          />

          <div
            className={`flex items-center gap-2 text-xs font-mono px-2.5 py-1.5 rounded-lg border ${
              isDark ? 'bg-[#161b22] border-[#30363d] text-gray-400' : 'bg-gray-50 border-gray-200 text-gray-600'
            }`}
          >
            <span>{(code || '').split('\n').length} lines</span>
            <span>•</span>
            <span>{(code || '').length} chars</span>
          </div>

          <button
            id="cmd-clear-btn"
            type="button"
            onClick={() => {
              setCode('');
              showNotification('Editor cleared. Ready for your code.');
            }}
            className={`flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-xs font-medium border transition-colors cursor-pointer ${
              isDark
                ? 'bg-[#161b22] hover:bg-[#21262d] text-gray-400 hover:text-red-400 border-[#30363d]'
                : 'bg-white hover:bg-red-50 text-gray-500 hover:text-red-600 border-gray-200'
            }`}
            title="Clear all code in the editor"
          >
            <FaTrash className="text-xs" />
            <span>Clear</span>
          </button>
        </div>

        {/* Right: Actions & Layout Mode */}
        <div className="flex flex-wrap items-center gap-3">
          <ReviewButton
            onAnalyze={handleAnalyze}
            onFix={handleFix}
            onExplain={handleExplain}
            loadingAction={loadingAction}
            disabled={!code || code.trim() === ''}
          />

          {/* View Mode Toggle */}
          <div
            className={`hidden md:flex items-center gap-1 p-1 rounded-lg border ${
              isDark ? 'bg-[#161b22] border-[#30363d]' : 'bg-gray-100 border-gray-200'
            }`}
          >
            <button
              onClick={() => setLayoutMode('split')}
              className={`p-1.5 rounded text-xs transition-colors cursor-pointer ${
                layoutMode === 'split'
                  ? isDark
                    ? 'bg-[#30363d] text-white shadow-sm'
                    : 'bg-white text-purple-700 shadow-sm'
                  : isDark
                  ? 'text-gray-400 hover:text-gray-200'
                  : 'text-gray-500 hover:text-gray-800'
              }`}
              title="Split View (Editor + Inspector)"
            >
              <FaTableColumns />
            </button>
            <button
              onClick={() => setLayoutMode('editor')}
              className={`p-1.5 rounded text-xs transition-colors cursor-pointer ${
                layoutMode === 'editor'
                  ? isDark
                    ? 'bg-[#30363d] text-white shadow-sm'
                    : 'bg-white text-purple-700 shadow-sm'
                  : isDark
                  ? 'text-gray-400 hover:text-gray-200'
                  : 'text-gray-500 hover:text-gray-800'
              }`}
              title="Editor Fullscreen"
            >
              <FaCode />
            </button>
            <button
              onClick={() => setLayoutMode('inspector')}
              className={`p-1.5 rounded text-xs transition-colors cursor-pointer ${
                layoutMode === 'inspector'
                  ? isDark
                    ? 'bg-[#30363d] text-white shadow-sm'
                    : 'bg-white text-purple-700 shadow-sm'
                  : isDark
                  ? 'text-gray-400 hover:text-gray-200'
                  : 'text-gray-500 hover:text-gray-800'
              }`}
              title="Quality Inspector Fullscreen"
            >
              <FaShieldHalved />
            </button>
          </div>
        </div>
      </div>

      {/* Error Alert */}
      {errorMessage && (
        <div className="flex items-center gap-3 p-3.5 rounded-xl bg-red-950/40 border border-red-800/60 text-red-200 text-xs">
          <FaTriangleExclamation className="text-red-400 text-sm flex-shrink-0" />
          <div className="flex-1">
            <span className="font-semibold">Notice: </span>
            {errorMessage}
          </div>
          <button
            onClick={() => handleAnalyze()}
            disabled={loadingAction !== null}
            className="text-xs bg-red-800/80 hover:bg-red-700 text-white font-medium px-3 py-1.5 rounded-lg transition-colors cursor-pointer"
          >
            Retry Check
          </button>
          <button
            onClick={() => setErrorMessage('')}
            className="text-xs text-red-400 hover:text-white px-2 py-1 cursor-pointer"
          >
            Dismiss
          </button>
        </div>
      )}

      {/* Dynamic Results Summary Banner (Shows high-level findings clearly when results exist) */}
      {(activeReview || fixResult || explainResult) && !loadingAction && (
        <div
          id="results-summary-banner"
          className={`p-3.5 sm:p-4 rounded-xl border flex flex-col md:flex-row items-start md:items-center justify-between gap-3 shadow-md transition-all ${
            isDark ? 'bg-[#161b22] border-[#30363d]' : 'bg-white border-gray-200'
          }`}
        >
          <div className="flex items-center gap-3 flex-wrap">
            {activeReview?.overallScore !== undefined && (
              <div className="flex items-center gap-2.5">
                <div
                  className={`flex items-center justify-center w-10 h-10 rounded-xl font-bold font-mono text-sm border shadow-xs ${
                    activeReview.overallScore >= 80
                      ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-400'
                      : activeReview.overallScore >= 50
                      ? 'bg-amber-500/10 border-amber-500/30 text-amber-400'
                      : 'bg-red-500/10 border-red-500/30 text-red-400'
                  }`}
                >
                  {activeReview.overallScore}
                </div>
                <div>
                  <div className={`text-xs font-bold ${isDark ? 'text-white' : 'text-gray-900'}`}>
                    Health Score: {activeReview.overallScore}/100
                  </div>
                  <div className={`text-[11px] ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>
                    {activeReview.overallScore < 50
                      ? 'Critical security & bug risks detected'
                      : activeReview.overallScore < 80
                      ? 'Moderate risk, improvements recommended'
                      : 'Clean, production-ready code'}
                  </div>
                </div>
              </div>
            )}

            {/* Quick Metrics */}
            <div className="flex items-center gap-2 text-xs flex-wrap">
              {activeReview?.criticalIssues && (
                <span
                  className={`px-2.5 py-1 rounded-md font-mono text-xs font-semibold border ${
                    activeReview.criticalIssues.length > 0
                      ? 'bg-red-950/50 border-red-800/60 text-red-300'
                      : 'bg-emerald-950/40 border-emerald-800/50 text-emerald-300'
                  }`}
                >
                  {activeReview.criticalIssues.length} Critical Flaws
                </span>
              )}

              {activeReview?.warnings && (
                <span
                  className={`px-2.5 py-1 rounded-md font-mono text-xs font-semibold border ${
                    activeReview.warnings.length > 0
                      ? 'bg-amber-950/50 border-amber-800/60 text-amber-300'
                      : 'bg-gray-800/40 border-gray-700/50 text-gray-300'
                  }`}
                >
                  {activeReview.warnings.length} Warnings
                </span>
              )}

              {fixResult && (
                <span className="px-2.5 py-1 rounded-md font-mono text-xs font-semibold border bg-emerald-950/60 border-emerald-700/60 text-emerald-300 flex items-center gap-1.5">
                  <FaCircleCheck className="text-[11px]" />
                  <span>Fixes Patched to Editor</span>
                </span>
              )}
            </div>
          </div>

          {/* Quick Action Tools in Banner */}
          <div className="flex items-center gap-2 self-stretch md:self-auto justify-end flex-wrap">
            {originalCodeBeforeFix && (
              <button
                type="button"
                onClick={handleUndoFix}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium border transition-colors cursor-pointer ${
                  isDark
                    ? 'bg-[#21262d] hover:bg-[#30363d] text-amber-300 border-amber-800/50'
                    : 'bg-amber-50 hover:bg-amber-100 text-amber-900 border-amber-200'
                }`}
                title="Restore original code into editor"
              >
                <FaRotateLeft className="text-[10px]" />
                <span>Undo Auto-Fix</span>
              </button>
            )}

            {fixResult && (
              <button
                type="button"
                onClick={handleAnalyze}
                disabled={loadingAction !== null}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold text-white bg-purple-600 hover:bg-purple-500 active:bg-purple-700 transition-colors shadow-sm cursor-pointer disabled:opacity-50"
                title="Run audit on the newly patched code"
              >
                <FaArrowsRotate className="text-[10px]" />
                <span>Re-Audit Patched Code</span>
              </button>
            )}

            {!fixResult && (activeReview?.criticalIssues?.length > 0 || (activeReview?.overallScore !== undefined && activeReview?.overallScore < 70)) && (
              <button
                type="button"
                onClick={handleFix}
                disabled={loadingAction !== null}
                className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg text-xs font-bold text-white bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 transition-all shadow-md cursor-pointer disabled:opacity-50"
                title="Auto-fix all vulnerabilities and patch code directly into the editor"
              >
                <FaWrench className="text-[10px]" />
                <span>1-Click Auto-Fix to Editor</span>
              </button>
            )}

            {/* Layout Mode Toggles */}
            <div
              className={`flex items-center rounded-lg border p-0.5 ${
                isDark ? 'bg-[#0d1117] border-[#30363d]' : 'bg-gray-100 border-gray-200'
              }`}
            >
              <button
                type="button"
                onClick={() => setLayoutMode('split')}
                className={`px-2 py-1 rounded text-[11px] font-medium transition-all cursor-pointer ${
                  layoutMode === 'split'
                    ? 'bg-purple-600 text-white shadow-xs'
                    : isDark
                    ? 'text-gray-400 hover:text-white'
                    : 'text-gray-600 hover:text-black'
                }`}
                title="Split 50/50 View"
              >
                Split
              </button>
              <button
                type="button"
                onClick={() => setLayoutMode('inspector')}
                className={`px-2 py-1 rounded text-[11px] font-medium transition-all cursor-pointer ${
                  layoutMode === 'inspector'
                    ? 'bg-purple-600 text-white shadow-xs'
                    : isDark
                    ? 'text-gray-400 hover:text-white'
                    : 'text-gray-600 hover:text-black'
                }`}
                title="Full Results View"
              >
                Full Results
              </button>
              <button
                type="button"
                onClick={() => setLayoutMode('editor')}
                className={`px-2 py-1 rounded text-[11px] font-medium transition-all cursor-pointer ${
                  layoutMode === 'editor'
                    ? 'bg-purple-600 text-white shadow-xs'
                    : isDark
                    ? 'text-gray-400 hover:text-white'
                    : 'text-gray-600 hover:text-black'
                }`}
                title="Full Editor View"
              >
                Full Editor
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Main Responsive Grid Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-4 items-start w-full">
        {/* LEFT COLUMN: Real VS Code Editor */}
        <div
          className={`${
            layoutMode === 'editor'
              ? 'lg:col-span-12'
              : layoutMode === 'inspector'
              ? 'hidden'
              : (activeReview || fixResult || explainResult)
              ? 'lg:col-span-6'
              : 'lg:col-span-7'
          } w-full transition-all flex flex-col`}
        >
          <div
            className={`w-full rounded-xl transition-all ${
              layoutMode === 'editor'
                ? 'h-[750px] xl:h-[820px]'
                : 'h-[520px] sm:h-[600px] lg:h-[calc(100vh-210px)] lg:min-h-[580px] lg:max-h-[860px]'
            }`}
          >
            <CodeEditor
              code={code}
              onChange={setCode}
              language={language}
              onLanguageChange={setLanguage}
              height="100%"
            />
          </div>
        </div>

        {/* RIGHT COLUMN: Code Health & Quality Inspector */}
        <div
          className={`${
            layoutMode === 'inspector'
              ? 'lg:col-span-12'
              : layoutMode === 'editor'
              ? 'hidden'
              : (activeReview || fixResult || explainResult)
              ? 'lg:col-span-6'
              : 'lg:col-span-5'
          } w-full flex flex-col transition-all`}
        >
          {/* Inspector Container */}
          <div
            id="code-quality-inspector"
            className={`flex flex-col rounded-xl border overflow-hidden shadow-2xl transition-all w-full ${
              layoutMode === 'inspector'
                ? 'h-[750px] xl:h-[820px]'
                : 'h-[520px] sm:h-[600px] lg:h-[calc(100vh-210px)] lg:min-h-[580px] lg:max-h-[860px]'
            }`}
            style={{
              backgroundColor: isDark ? '#0d1117' : '#ffffff',
              borderColor: isDark ? '#30363d' : '#d0d7de',
            }}
          >
            {/* Inspector Header / Tabs */}
            <div
              className="flex items-center justify-between px-3.5 border-b text-xs select-none transition-colors flex-shrink-0"
              style={{
                backgroundColor: isDark ? '#161b22' : '#f6f8fa',
                borderColor: isDark ? '#30363d' : '#d0d7de',
                height: '42px',
              }}
            >
              <div className="flex items-center gap-1.5 font-medium">
                <FaShieldHalved className="text-purple-500 text-xs" />
                <span className={`font-semibold ${isDark ? 'text-white' : 'text-gray-900'}`}>
                  Code Quality Inspector
                </span>
                {activeReview?.overallScore !== undefined && (
                  <span
                    className={`text-[10px] px-1.5 py-0.2 rounded font-mono font-bold ${
                      activeReview.overallScore >= 80
                        ? isDark
                          ? 'bg-emerald-950/80 text-emerald-300 border border-emerald-800/40'
                          : 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                        : activeReview.overallScore >= 50
                        ? isDark
                          ? 'bg-yellow-950/80 text-yellow-300 border border-yellow-800/40'
                          : 'bg-amber-50 text-amber-800 border border-amber-200'
                        : isDark
                        ? 'bg-red-950/80 text-red-300 border border-red-800/40'
                        : 'bg-red-50 text-red-700 border border-red-200'
                    }`}
                  >
                    Score: {activeReview.overallScore}/100
                  </span>
                )}
              </div>

              {/* Subtabs for Results & Window Mode Toggle */}
              {(activeReview || fixResult || explainResult) && !loadingAction && (
                <div className="flex items-center gap-1.5">
                  <div className="flex items-center gap-1">
                    {activeReview && (
                      <button
                        onClick={() => setInspectorTab('audit')}
                        className={`px-2.5 py-1 rounded text-[11px] font-medium transition-colors cursor-pointer ${
                          inspectorTab === 'audit'
                            ? isDark
                              ? 'bg-[#30363d] text-white shadow-sm'
                              : 'bg-white text-purple-700 border border-gray-200 shadow-sm'
                            : isDark
                            ? 'text-gray-400 hover:text-gray-200'
                            : 'text-gray-600 hover:text-gray-900'
                        }`}
                      >
                        Audit Report {activeReview?.criticalIssues?.length ? `(${activeReview.criticalIssues.length})` : ''}
                      </button>
                    )}
                    {fixResult && (
                      <button
                        onClick={() => setInspectorTab('fix')}
                        className={`px-2.5 py-1 rounded text-[11px] font-medium transition-colors cursor-pointer ${
                          inspectorTab === 'fix'
                            ? isDark
                              ? 'bg-[#30363d] text-white shadow-sm'
                              : 'bg-white text-purple-700 border border-gray-200 shadow-sm'
                            : isDark
                            ? 'text-gray-400 hover:text-gray-200'
                            : 'text-gray-600 hover:text-gray-900'
                        }`}
                      >
                        Auto-Fix (Applied ✓)
                      </button>
                    )}
                    {explainResult && (
                      <button
                        onClick={() => setInspectorTab('explain')}
                        className={`px-2.5 py-1 rounded text-[11px] font-medium transition-colors cursor-pointer ${
                          inspectorTab === 'explain'
                            ? isDark
                              ? 'bg-[#30363d] text-white shadow-sm'
                              : 'bg-white text-purple-700 border border-gray-200 shadow-sm'
                            : isDark
                            ? 'text-gray-400 hover:text-gray-200'
                            : 'text-gray-600 hover:text-gray-900'
                        }`}
                      >
                        Explain
                      </button>
                    )}
                  </div>

                  <button
                    type="button"
                    onClick={() => setLayoutMode(layoutMode === 'inspector' ? 'split' : 'inspector')}
                    className={`p-1.5 rounded transition-colors cursor-pointer ${
                      isDark ? 'text-gray-400 hover:text-white hover:bg-[#30363d]' : 'text-gray-600 hover:text-gray-900 hover:bg-gray-200'
                    }`}
                    title={layoutMode === 'inspector' ? 'Restore Split View' : 'Maximize Results'}
                  >
                    {layoutMode === 'inspector' ? <FaCompress className="text-xs" /> : <FaExpand className="text-xs" />}
                  </button>
                </div>
              )}
            </div>

            {/* Inspector Content Area with Smooth Responsive Scrolling */}
            <div className="flex-1 min-h-0 p-4 sm:p-5 overflow-y-auto smooth-scroll-container">
              {/* STATE 1: Live Scanning / Auditing (Non-blocking!) */}
              {loadingAction && (
                <div className="flex flex-col items-center justify-center h-full min-h-[360px] gap-6 text-center">
                  <div className="relative flex items-center justify-center">
                    <div className="w-16 h-16 rounded-full border-4 border-purple-500/20 border-t-purple-500 animate-spin" />
                    <FaShieldHalved className="absolute text-purple-500 text-xl animate-pulse" />
                  </div>

                  <div className="space-y-1.5 max-w-sm">
                    <h4 className={`text-sm font-semibold ${isDark ? 'text-white' : 'text-gray-900'}`}>
                      {loadingAction === 'analyze'
                        ? 'Auditing Code Quality & Security'
                        : loadingAction === 'fix'
                        ? 'Refactoring & Generating Secure Code'
                        : 'Generating Step-by-Step Explanation'}
                    </h4>
                    <p className={`text-xs ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
                      Scanning syntax, checking OWASP vulnerabilities, evaluating performance, and calculating risk score...
                    </p>
                  </div>

                  {/* Checklist indicators */}
                  <div
                    className={`flex flex-col gap-2 text-left text-xs font-mono w-full max-w-xs p-3 rounded-lg border ${
                      isDark ? 'bg-[#161b22] border-[#30363d] text-gray-300' : 'bg-gray-50 border-gray-200 text-gray-700'
                    }`}
                  >
                    <div className={`flex items-center gap-2 ${isDark ? 'text-purple-300' : 'text-purple-700'}`}>
                      <FaBolt className="text-xs text-purple-500 animate-bounce" />
                      <span>AST Syntax & Logic Analysis</span>
                    </div>
                    <div className={`flex items-center gap-2 ${isDark ? 'text-blue-300' : 'text-blue-700'}`}>
                      <FaBug className="text-xs text-blue-500" />
                      <span>Injection & Memory Safety Checks</span>
                    </div>
                    <div className={`flex items-center gap-2 ${isDark ? 'text-emerald-300' : 'text-emerald-700'}`}>
                      <FaCheck className="text-xs text-emerald-500" />
                      <span>Best Practices & Score Calculation</span>
                    </div>
                  </div>
                </div>
              )}

              {/* STATE 2: Empty / Initial (Invite user to check code) */}
              {!loadingAction && !activeReview && !fixResult && !explainResult && (
                <div className="flex flex-col items-center justify-center h-full min-h-[400px] text-center p-4">
                  <div
                    className={`w-12 h-12 rounded-2xl flex items-center justify-center mb-3 shadow-inner ${
                      isDark ? 'bg-[#161b22] border border-[#30363d] text-purple-400' : 'bg-purple-50 border border-purple-200 text-purple-600'
                    }`}
                  >
                    <FaShieldHalved className="text-2xl" />
                  </div>
                  <h3 className={`text-base font-bold mb-1 ${isDark ? 'text-white' : 'text-gray-900'}`}>
                    Ready to Inspect Your Code
                  </h3>
                  <p className={`text-xs max-w-xs mb-6 leading-relaxed ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
                    Write or paste your code in the editor, then click <strong>Check Code Quality</strong> to evaluate security, performance, and best practices.
                  </p>

                  <div className="w-full max-w-sm space-y-2 mb-6 text-left">
                    <div
                      className={`flex items-start gap-2.5 p-2.5 rounded-lg border text-xs ${
                        isDark ? 'bg-[#161b22] border-[#30363d]' : 'bg-gray-50 border-gray-200'
                      }`}
                    >
                      <FaBug className="text-red-500 text-sm mt-0.5 flex-shrink-0" />
                      <div>
                        <strong className={isDark ? 'text-gray-200' : 'text-gray-900'}>Security Audit:</strong>
                        <p className={`text-[11px] ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
                          Detects SQL Injection, Buffer Overflows, hardcoded secrets, and XSS.
                        </p>
                      </div>
                    </div>

                    <div
                      className={`flex items-start gap-2.5 p-2.5 rounded-lg border text-xs ${
                        isDark ? 'bg-[#161b22] border-[#30363d]' : 'bg-gray-50 border-gray-200'
                      }`}
                    >
                      <FaBolt className="text-amber-500 text-sm mt-0.5 flex-shrink-0" />
                      <div>
                        <strong className={isDark ? 'text-gray-200' : 'text-gray-900'}>Quality & Health Score:</strong>
                        <p className={`text-[11px] ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
                          Comprehensive 0-100 rating with line-by-line recommendations.
                        </p>
                      </div>
                    </div>

                    <div
                      className={`flex items-start gap-2.5 p-2.5 rounded-lg border text-xs ${
                        isDark ? 'bg-[#161b22] border-[#30363d]' : 'bg-gray-50 border-gray-200'
                      }`}
                    >
                      <FaWrench className="text-purple-500 text-sm mt-0.5 flex-shrink-0" />
                      <div>
                        <strong className={isDark ? 'text-gray-200' : 'text-gray-900'}>1-Click Automated Fix:</strong>
                        <p className={`text-[11px] ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
                          Refactors insecure patterns and applies fixed code directly into editor.
                        </p>
                      </div>
                    </div>
                  </div>

                  <button
                    onClick={handleAnalyze}
                    className="flex items-center gap-2 px-5 py-2.5 rounded-lg text-xs font-semibold text-white bg-purple-600 hover:bg-purple-500 active:bg-purple-700 transition-all shadow-lg cursor-pointer"
                  >
                    <FaShieldHalved className="text-xs" />
                    <span>Run First Code Audit</span>
                  </button>
                </div>
              )}

              {/* STATE 3: Audit Result Tab */}
              {!loadingAction && inspectorTab === 'audit' && activeReview && (
                <AnalysisResult
                  response={activeReview}
                  onApplySnippet={(snippet) => {
                    setCode(snippet);
                    showNotification('Remediation snippet applied to editor!');
                  }}
                  onAutoFix={handleFix}
                  isFixing={loadingAction === 'fix'}
                />
              )}

              {/* STATE 4: Auto-Fix Tab */}
              {!loadingAction && inspectorTab === 'fix' && fixResult && (
                <div className="flex flex-col gap-4">
                  {/* Applied Directly Notification Banner */}
                  <div className="p-4 rounded-xl border border-emerald-700/60 bg-emerald-950/40 text-emerald-200 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 shadow-md">
                    <div className="flex items-center gap-3">
                      <div className="p-2.5 rounded-lg bg-emerald-900/80 border border-emerald-600/50 text-emerald-300">
                        <FaCircleCheck className="text-base" />
                      </div>
                      <div>
                        <h4 className="text-xs font-bold text-emerald-300">
                          Security Fixes Applied Directly To Your Code
                        </h4>
                        <p className="text-[11px] text-emerald-300/80 leading-snug">
                          Your code in the editor on the left has been updated with parameterized queries, secure configurations, and defensive validations.
                        </p>
                      </div>
                    </div>

                    <div className="flex items-center gap-2 flex-shrink-0 self-stretch sm:self-auto justify-end">
                      {originalCodeBeforeFix && (
                        <button
                          type="button"
                          onClick={handleUndoFix}
                          className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold bg-gray-800 hover:bg-gray-700 text-amber-300 border border-amber-800/40 transition-colors cursor-pointer shadow-xs"
                          title="Restore previous code into editor"
                        >
                          <FaRotateLeft className="text-[10px]" />
                          <span>Undo Fix</span>
                        </button>
                      )}

                      <button
                        type="button"
                        onClick={handleAnalyze}
                        disabled={loadingAction !== null}
                        className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg text-xs font-bold bg-emerald-600 hover:bg-emerald-500 active:bg-emerald-700 text-white transition-all shadow-md cursor-pointer disabled:opacity-50"
                        title="Re-run audit to verify new score"
                      >
                        <FaArrowsRotate className="text-[10px]" />
                        <span>Re-Audit Code Now</span>
                      </button>
                    </div>
                  </div>

                  {/* Actions & Utilities Bar */}
                  <div
                    className={`flex items-center justify-between gap-2 p-3 rounded-xl border ${
                      isDark ? 'bg-[#161b22] border-[#30363d]' : 'bg-gray-50 border-gray-200'
                    }`}
                  >
                    <div className="flex items-center gap-2">
                      <FaWrench className="text-purple-400 text-xs" />
                      <span className={`text-xs font-bold ${isDark ? 'text-white' : 'text-gray-900'}`}>
                        Refactored Clean Code Solution
                      </span>
                      <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-purple-950/60 border border-purple-800/50 text-purple-300">
                        {language}
                      </span>
                    </div>

                    <div className="flex items-center gap-1.5">
                      <button
                        type="button"
                        onClick={handleApplyFixedCode}
                        className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold bg-purple-600 hover:bg-purple-500 text-white transition-colors cursor-pointer shadow-sm"
                        title="Re-apply this fixed code to editor"
                      >
                        <FaArrowRight className="text-[10px]" />
                        <span>Re-Apply to Editor</span>
                      </button>

                      <button
                        type="button"
                        onClick={handleCopyFixedCode}
                        className={`flex items-center gap-1 px-2.5 py-1.5 rounded-lg text-xs border transition-colors cursor-pointer ${
                          isDark
                            ? 'bg-[#21262d] hover:bg-[#30363d] text-gray-300 border-[#30363d]'
                            : 'bg-white hover:bg-gray-100 text-gray-700 border-gray-200 shadow-xs'
                        }`}
                        title="Copy fixed code"
                      >
                        <FaCopy className="text-[10px]" />
                        <span className="hidden sm:inline">Copy</span>
                      </button>

                      <button
                        type="button"
                        onClick={handleDownloadFixedCode}
                        className={`p-1.5 rounded-lg text-xs border transition-colors cursor-pointer ${
                          isDark
                            ? 'bg-[#21262d] hover:bg-[#30363d] text-gray-300 border-[#30363d]'
                            : 'bg-white hover:bg-gray-100 text-gray-700 border-gray-200 shadow-xs'
                        }`}
                        title="Download file"
                      >
                        <FaDownload className="text-[10px]" />
                      </button>
                    </div>
                  </div>

                  {/* List of Specific Changes Applied */}
                  {(() => {
                    const changesList = Array.isArray(fixResult.changes) && fixResult.changes.length > 0
                      ? fixResult.changes
                      : Array.isArray(fixResult.improvements) && fixResult.improvements.length > 0
                      ? fixResult.improvements
                      : [];

                    if (changesList.length === 0) return null;

                    return (
                      <div
                        className={`p-4 rounded-xl border space-y-2.5 ${
                          isDark ? 'bg-[#161b22] border-[#30363d]' : 'bg-purple-50/70 border-purple-200'
                        }`}
                      >
                        <div className="flex items-center gap-2">
                          <FaCheck className="text-emerald-400 text-xs" />
                          <h4 className={`text-xs font-bold uppercase tracking-wider ${isDark ? 'text-purple-300' : 'text-purple-900'}`}>
                            Specific Changes Applied ({changesList.length})
                          </h4>
                        </div>
                        <div className="grid grid-cols-1 gap-2">
                          {changesList.map((change, idx) => (
                            <div
                              key={idx}
                              className={`p-2.5 rounded-lg border text-xs flex items-start gap-2.5 ${
                                isDark ? 'bg-[#0d1117] border-[#30363d] text-gray-200' : 'bg-white border-purple-100 text-gray-800 shadow-xs'
                              }`}
                            >
                              <span className="flex-shrink-0 mt-0.5 flex items-center justify-center w-4 h-4 rounded-full bg-emerald-500/20 text-emerald-400 text-[10px] font-bold">
                                ✓
                              </span>
                              <span className="leading-relaxed">{change}</span>
                            </div>
                          ))}
                        </div>
                      </div>
                    );
                  })()}

                  {/* Clean Code Viewer */}
                  <div className="rounded-xl border border-[#30363d] overflow-hidden bg-[#0d1117] shadow-xl">
                    <div className="flex items-center justify-between px-3 py-2 bg-[#161b22] border-b border-[#30363d] text-[11px] text-gray-400">
                      <span className="font-mono">Clean Patched Code</span>
                      <span className="font-mono">{fixResult.fixedCode?.split('\n').length || 0} lines</span>
                    </div>
                    <pre className="p-4 text-xs font-mono text-gray-100 overflow-x-auto leading-relaxed">
                      <code>{fixResult.fixedCode}</code>
                    </pre>
                  </div>
                </div>
              )}

              {/* STATE 5: Explanation Tab - Good Clean UI */}
              {!loadingAction && inspectorTab === 'explain' && explainResult && (
                <div className="flex flex-col gap-3.5">
                  {/* Clean Top Header Card */}
                  <div
                    className={`p-3.5 sm:p-4 rounded-xl border flex items-center justify-between gap-3 shadow-xs ${
                      isDark ? 'bg-[#161b22] border-[#30363d]' : 'bg-white border-gray-200'
                    }`}
                  >
                    <div className="flex items-center gap-2.5">
                      <div className="w-8 h-8 rounded-lg bg-purple-500/10 border border-purple-500/20 text-purple-400 flex items-center justify-center flex-shrink-0">
                        <FaBookOpen className="text-xs" />
                      </div>
                      <div>
                        <h3 className={`text-xs font-bold ${isDark ? 'text-white' : 'text-gray-900'}`}>
                          Code Walkthrough
                        </h3>
                        <p className={`text-[11px] ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>
                          Clear, beginner-friendly walkthrough of logic and behavior.
                        </p>
                      </div>
                    </div>

                    <button
                      type="button"
                      onClick={handleCopyExplanation}
                      className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium border transition-colors cursor-pointer ${
                        isDark
                          ? 'bg-[#21262d] hover:bg-[#30363d] text-gray-300 border-[#30363d]'
                          : 'bg-gray-50 hover:bg-gray-100 text-gray-700 border-gray-200'
                      }`}
                      title="Copy explanation to clipboard"
                    >
                      <FaCopy className="text-[10px]" />
                      <span>Copy</span>
                    </button>
                  </div>

                  {/* Primary Overview & Technologies */}
                  {(explainResult.summary || explainResult.overview) && (
                    <div
                      className={`p-4 rounded-xl border space-y-3 ${
                        isDark ? 'bg-[#161b22] border-[#30363d]' : 'bg-white border-gray-200 shadow-xs'
                      }`}
                    >
                      <div className="space-y-1.5">
                        <h4 className={`text-[11px] font-bold uppercase tracking-wider ${isDark ? 'text-purple-400' : 'text-purple-700'}`}>
                          Overview
                        </h4>
                        <p className={`text-xs leading-relaxed ${isDark ? 'text-gray-200' : 'text-gray-800'}`}>
                          {explainResult.summary || explainResult.overview}
                        </p>
                      </div>

                      {/* Tech Stack Chips */}
                      {(() => {
                        let techs = [];
                        if (Array.isArray(explainResult.technologies)) {
                          techs = explainResult.technologies;
                        } else if (typeof explainResult.technologies === 'string' && explainResult.technologies.trim()) {
                          techs = explainResult.technologies.split(/[,•\n]/).map((t) => t.trim()).filter(Boolean);
                        }
                        if (techs.length === 0) return null;
                        return (
                          <div className="flex items-center gap-1.5 flex-wrap pt-2 border-t border-gray-200/60 dark:border-gray-800/60">
                            <span className={`text-[11px] font-medium ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>
                              Stack & APIs:
                            </span>
                            {techs.map((t, idx) => (
                              <span
                                key={idx}
                                className={`px-2 py-0.5 rounded text-[11px] font-mono border ${
                                  isDark
                                    ? 'bg-[#21262d] text-blue-300 border-[#30363d]'
                                    : 'bg-blue-50 text-blue-700 border-blue-200'
                                }`}
                              >
                                {t}
                              </span>
                            ))}
                          </div>
                        );
                      })()}
                    </div>
                  )}

                  {/* Execution Logic Flow */}
                  {explainResult.mainLogic && (
                    <div
                      className={`p-4 rounded-xl border space-y-2 ${
                        isDark ? 'bg-[#161b22] border-[#30363d]' : 'bg-white border-gray-200 shadow-xs'
                      }`}
                    >
                      <h4 className={`text-[11px] font-bold uppercase tracking-wider ${isDark ? 'text-cyan-400' : 'text-cyan-800'}`}>
                        Execution & Logic Flow
                      </h4>
                      <div className={`text-xs leading-relaxed whitespace-pre-line ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>
                        {explainResult.mainLogic}
                      </div>
                    </div>
                  )}

                  {/* Key Components / Functions (if present) */}
                  {(explainResult.keyFunctions || explainResult.functions) && (
                    <div
                      className={`p-4 rounded-xl border space-y-2 ${
                        isDark ? 'bg-[#161b22] border-[#30363d]' : 'bg-white border-gray-200 shadow-xs'
                      }`}
                    >
                      <h4 className={`text-[11px] font-bold uppercase tracking-wider ${isDark ? 'text-emerald-400' : 'text-emerald-800'}`}>
                        Key Components
                      </h4>
                      <div className={`text-xs leading-relaxed whitespace-pre-line ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>
                        {explainResult.keyFunctions || explainResult.functions}
                      </div>
                    </div>
                  )}

                  {/* Important Considerations & Edge Cases */}
                  {explainResult.potentialProblems && (
                    <div
                      className={`p-3.5 rounded-xl border flex items-start gap-2.5 ${
                        isDark
                          ? 'bg-amber-950/20 border-amber-800/40 text-amber-200'
                          : 'bg-amber-50/80 border-amber-200 text-amber-900 shadow-xs'
                      }`}
                    >
                      <FaTriangleExclamation className="text-amber-500 text-xs mt-0.5 flex-shrink-0" />
                      <div className="space-y-1 text-xs">
                        <span className="font-bold">Watchouts & Edge Cases: </span>
                        <span className="leading-relaxed">{explainResult.potentialProblems}</span>
                      </div>
                    </div>
                  )}

                  {/* How It Works Takeaway */}
                  {explainResult.howItWorks && (
                    <div
                      className={`p-3 rounded-xl border text-xs leading-relaxed ${
                        isDark
                          ? 'bg-[#161b22] border-[#30363d] text-gray-400'
                          : 'bg-gray-50 border-gray-200 text-gray-600'
                      }`}
                    >
                      <span className={`font-semibold ${isDark ? 'text-gray-200' : 'text-gray-800'}`}>
                        Takeaway:
                      </span>{' '}
                      {explainResult.howItWorks}
                    </div>
                  )}

                  {/* Custom / Dynamic Sections if present */}
                  {Array.isArray(explainResult.sections) &&
                    explainResult.sections.map((sec, idx) => (
                      <div
                        key={idx}
                        className={`p-3.5 rounded-xl border space-y-1 ${
                          isDark ? 'bg-[#161b22] border-[#30363d]' : 'bg-white border-gray-200 shadow-xs'
                        }`}
                      >
                        <h4 className={`text-xs font-bold ${isDark ? 'text-purple-300' : 'text-purple-700'}`}>
                          {sec.heading || sec.title}
                        </h4>
                        <p className={`text-xs leading-relaxed ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>
                          {sec.content || sec.explanation}
                        </p>
                      </div>
                    ))}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
