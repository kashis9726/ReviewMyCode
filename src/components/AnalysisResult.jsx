import React, { useState, useMemo } from 'react';
import { useTheme } from '../context/ThemeContext';
import {
  FaShieldHalved,
  FaCheckDouble,
  FaWrench,
  FaTriangleExclamation,
  FaGaugeHigh,
  FaEye,
  FaFileLines,
  FaSkullCrossbones,
  FaCheck,
  FaCopy,
  FaLightbulb,
  FaRocket,
  FaCode,
  FaChevronDown,
  FaChevronUp,
  FaArrowRight,
  FaDownload,
  FaMagnifyingGlass,
  FaFilter,
  FaBug,
  FaLock,
  FaCircleCheck,
  FaCircleExclamation,
  FaCircleXmark,
  FaShareNodes,
} from 'react-icons/fa6';

/**
 * Safely parses and normalizes the JSON response from the code analysis API.
 * Handles JSON strings, markdown code blocks, Axios response envelopes, or raw objects.
 */
export function parseAnalysisResponse(input) {
  if (!input) return null;

  let parsed = input;

  // 1. If it's a string, clean and parse
  if (typeof input === 'string') {
    let cleaned = input.trim();
    if (cleaned.startsWith('```')) {
      cleaned = cleaned.replace(/^```(?:json)?\s*/i, '').replace(/```\s*$/, '').trim();
    }

    try {
      parsed = JSON.parse(cleaned);
    } catch (e) {
      console.error('Failed to parse analysis JSON string:', e);
      return { error: 'Invalid JSON response from analysis API', raw: input };
    }
  }

  // 2. Unpack Axios or custom API wrappers if present
  if (parsed?.data && typeof parsed.data === 'object' && !parsed.overallScore) {
    parsed = parsed.data;
  }

  // 3. Fallback and normalize properties
  const overallScore = Math.max(0, Math.min(100, Math.round(Number(parsed?.overallScore ?? 0))));
  const scores = {
    security: Math.max(0, Math.min(100, Math.round(Number(parsed?.scores?.security ?? 0)))),
    bestPractices: Math.max(0, Math.min(100, Math.round(Number(parsed?.scores?.bestPractices ?? 0)))),
    maintainability: Math.max(0, Math.min(100, Math.round(Number(parsed?.scores?.maintainability ?? 0)))),
    errorHandling: Math.max(0, Math.min(100, Math.round(Number(parsed?.scores?.errorHandling ?? 0)))),
    performance: Math.max(0, Math.min(100, Math.round(Number(parsed?.scores?.performance ?? 0)))),
    readability: Math.max(0, Math.min(100, Math.round(Number(parsed?.scores?.readability ?? 0)))),
  };

  const summary = parsed?.summary || 'Code analysis completed with structured quality evaluation.';

  const criticalIssues = Array.isArray(parsed?.criticalIssues)
    ? parsed.criticalIssues.map((issue, idx) => ({
        id: `crit-${idx}-${issue?.line ?? 'x'}`,
        line: issue?.line !== null && issue?.line !== undefined ? issue.line : 'N/A',
        title: issue?.title || 'Security Vulnerability',
        description: issue?.description || '',
        severity: issue?.severity || 'Critical',
        risk: issue?.risk || 'High risk of exploitation, data breach, or fatal runtime crash.',
        recommendation: issue?.recommendation || issue?.fix || '',
        codeSnippet: issue?.codeSnippet || '',
      }))
    : [];

  const warnings = Array.isArray(parsed?.warnings)
    ? parsed.warnings.map((w, idx) => ({
        id: `warn-${idx}-${w?.line ?? 'x'}`,
        line: w?.line !== null && w?.line !== undefined ? w.line : 'N/A',
        title: w?.title || 'Code Smell / Anti-Pattern',
        description: w?.description || '',
        severity: w?.severity || 'Warning',
        recommendation: w?.recommendation || w?.tip || '',
      }))
    : [];

  const securityAudit = {
    overallRisk:
      parsed?.securityAudit?.overallRisk ||
      parsed?.securityAudit?.risk ||
      (criticalIssues.length > 0 ? 'Critical' : 'Low'),
    injectionRisk: parsed?.securityAudit?.injectionRisk || 'Low',
    authRisk:
      parsed?.securityAudit?.authRisk ||
      parsed?.securityAudit?.authenticationStrength ||
      'N/A',
    accessControl: parsed?.securityAudit?.accessControl || 'N/A',
    secretExposure:
      parsed?.securityAudit?.secretExposure ||
      parsed?.securityAudit?.secretExposureRisk ||
      'None Detected',
    sensitiveDataExposure: parsed?.securityAudit?.sensitiveDataExposure || 'Low',
  };

  const compliance = {
    owaspTop10:
      parsed?.compliance?.owaspTop10 ||
      parsed?.compliance?.owasp ||
      (criticalIssues.length > 0 ? 'Critical Failure' : 'Compliant'),
    pciDss: parsed?.compliance?.pciDss || 'Compliant',
    gdpr: parsed?.compliance?.gdpr || 'Compliant',
  };

  const proTips =
    Array.isArray(parsed?.proTips) && parsed.proTips.length > 0
      ? parsed.proTips
      : [
          'Use parameterized queries or ORM models to eliminate SQL injection vectors.',
          'Never hardcode API secrets, private keys, or tokens in source code files.',
          'Validate and sanitize all external user inputs at application boundaries.',
        ];

  return {
    overallScore,
    scores,
    summary,
    criticalIssues,
    warnings,
    securityAudit,
    compliance,
    proTips,
    language: parsed?.language || 'code',
    createdAt: parsed?.createdAt || new Date().toISOString(),
    raw: parsed,
  };
}

// Helpers for score badges and color styles
function getScoreTier(score) {
  if (score >= 85) {
    return {
      text: 'text-emerald-400',
      bg: 'bg-emerald-500',
      border: 'border-emerald-500/30',
      ringColor: '#10b981',
      badgeClass: 'bg-emerald-950/70 border-emerald-800/60 text-emerald-300',
      grade: 'A+ Production Ready',
      description: 'Clean, secure, and production-grade implementation.',
    };
  }
  if (score >= 70) {
    return {
      text: 'text-emerald-300',
      bg: 'bg-emerald-400',
      border: 'border-emerald-400/30',
      ringColor: '#34d399',
      badgeClass: 'bg-emerald-950/60 border-emerald-800/50 text-emerald-300',
      grade: 'B Solid Architecture',
      description: 'Minor optimizations needed before production deployment.',
    };
  }
  if (score >= 50) {
    return {
      text: 'text-amber-400',
      bg: 'bg-amber-500',
      border: 'border-amber-500/30',
      ringColor: '#f59e0b',
      badgeClass: 'bg-amber-950/70 border-amber-800/60 text-amber-300',
      grade: 'C Needs Optimization',
      description: 'Noticeable anti-patterns, input leaks, or code smells detected.',
    };
  }
  return {
    text: 'text-red-400',
    bg: 'bg-red-500',
    border: 'border-red-500/30',
    ringColor: '#ef4444',
    badgeClass: 'bg-red-950/80 border-red-800/70 text-red-300',
    grade: 'F Critical Vulnerabilities',
    description: 'High-risk security flaws or fatal exceptions present.',
  };
}

function getRiskBadgeClass(level = '') {
  const norm = String(level).toLowerCase();
  if (
    norm.includes('high') ||
    norm.includes('crit') ||
    norm.includes('fail') ||
    norm.includes('poor')
  ) {
    return 'bg-red-950/70 border-red-800/70 text-red-300';
  }
  if (
    norm.includes('mod') ||
    norm.includes('med') ||
    norm.includes('warn') ||
    norm.includes('need')
  ) {
    return 'bg-amber-950/70 border-amber-800/70 text-amber-300';
  }
  if (
    norm.includes('low') ||
    norm.includes('comp') ||
    norm.includes('strong') ||
    norm.includes('good') ||
    norm.includes('pass')
  ) {
    return 'bg-emerald-950/70 border-emerald-800/70 text-emerald-300';
  }
  return 'bg-gray-900/80 border-gray-700/60 text-gray-300';
}

/**
 * Responsive & Dynamic AnalysisResult Component
 * Dynamically renders:
 * 1. Responsive Score Cards (Hero Circular Metric, 6 Core Pillar Progress Cards)
 * 2. Executive Summary
 * 3. Dynamic Critical Issues & Warnings with search, category filtering & interactive resolution
 * 4. Comprehensive Security Audit & Regulatory Compliance Matrix
 * 5. Senior Engineer Pro Tips & Export Utilities
 */
export default function AnalysisResult({ response, onApplySnippet, onAutoFix, isFixing }) {
  const { theme } = useTheme();
  const isDark = theme === 'dark';

  const [copiedSnippetId, setCopiedSnippetId] = useState(null);
  const [copiedReport, setCopiedReport] = useState(false);
  const [showRawJson, setShowRawJson] = useState(false);
  const [activeSectionFilter, setActiveSectionFilter] = useState('all'); // 'all' | 'scores' | 'critical' | 'warnings' | 'audit' | 'tips'
  const [searchQuery, setSearchQuery] = useState('');
  const [resolvedIssueIds, setResolvedIssueIds] = useState(new Set());
  const [collapsedIssueIds, setCollapsedIssueIds] = useState(new Set());
  const [activeScorePillar, setActiveScorePillar] = useState(null);

  // Parse and normalize the input response
  const data = useMemo(() => parseAnalysisResponse(response), [response]);

  if (!data) {
    return null;
  }

  // Handle JSON parsing error gracefully
  if (data.error) {
    return (
      <div
        id="analysis-parse-error"
        className="p-5 rounded-xl border flex flex-col gap-3 text-red-300 bg-red-950/30 border-red-800/40"
      >
        <div className="flex items-center gap-2 font-semibold text-sm">
          <FaTriangleExclamation className="text-red-400 text-base" />
          <span>Unable to parse analysis response</span>
        </div>
        <p className="text-xs text-gray-400">{data.error}</p>
        <pre className="p-3 rounded-lg bg-black/50 text-xs font-mono text-gray-300 overflow-x-auto border border-gray-800">
          {typeof data.raw === 'string' ? data.raw : JSON.stringify(data.raw, null, 2)}
        </pre>
      </div>
    );
  }

  const {
    overallScore,
    scores,
    summary,
    criticalIssues,
    warnings,
    securityAudit,
    compliance,
    proTips,
    language,
  } = data;

  const overallTier = getScoreTier(overallScore);

  // Math for SVG Circular Progress
  const radius = 46;
  const circumference = 2 * Math.PI * radius;
  const strokeDashoffset = circumference - (overallScore / 100) * circumference;

  // 6 Dynamic Core Pillars
  const scoreCategories = [
    {
      key: 'security',
      label: 'Security & Hardening',
      icon: FaShieldHalved,
      value: scores.security,
      desc: 'Injection vectors, buffer safety & secret handling',
    },
    {
      key: 'bestPractices',
      label: 'Best Practices',
      icon: FaCheckDouble,
      value: scores.bestPractices,
      desc: 'Idiomatic patterns, conventions & standards',
    },
    {
      key: 'maintainability',
      label: 'Maintainability',
      icon: FaWrench,
      value: scores.maintainability,
      desc: 'Modular cohesion, coupling & technical debt',
    },
    {
      key: 'errorHandling',
      label: 'Error Resilience',
      icon: FaTriangleExclamation,
      value: scores.errorHandling,
      desc: 'Exception handling, bounds checking & null safety',
    },
    {
      key: 'performance',
      label: 'Performance',
      icon: FaGaugeHigh,
      value: scores.performance,
      desc: 'Algorithmic efficiency, allocations & I/O',
    },
    {
      key: 'readability',
      label: 'Readability',
      icon: FaEye,
      value: scores.readability,
      desc: 'Naming clarity, structure & documentation',
    },
  ];

  // Filter issues based on search query
  const filteredCriticalIssues = useMemo(() => {
    if (!searchQuery.trim()) return criticalIssues;
    const q = searchQuery.toLowerCase();
    return criticalIssues.filter(
      (iss) =>
        iss.title.toLowerCase().includes(q) ||
        iss.description.toLowerCase().includes(q) ||
        iss.recommendation.toLowerCase().includes(q) ||
        String(iss.line).includes(q)
    );
  }, [criticalIssues, searchQuery]);

  const filteredWarnings = useMemo(() => {
    if (!searchQuery.trim()) return warnings;
    const q = searchQuery.toLowerCase();
    return warnings.filter(
      (w) =>
        w.title.toLowerCase().includes(q) ||
        w.description.toLowerCase().includes(q) ||
        w.recommendation.toLowerCase().includes(q) ||
        String(w.line).includes(q)
    );
  }, [warnings, searchQuery]);

  // Toggle issue resolution
  const handleToggleResolved = (id) => {
    setResolvedIssueIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) {
        next.delete(id);
      } else {
        next.add(id);
      }
      return next;
    });
  };

  // Toggle issue collapse
  const handleToggleCollapse = (id) => {
    setCollapsedIssueIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) {
        next.delete(id);
      } else {
        next.add(id);
      }
      return next;
    });
  };

  // Copy code snippet
  const handleCopySnippet = (snippet, id) => {
    navigator.clipboard.writeText(snippet);
    setCopiedSnippetId(id);
    setTimeout(() => setCopiedSnippetId(null), 2000);
  };

  // Copy full Markdown summary
  const handleCopyMarkdownReport = () => {
    const md = `
# Code Quality & Security Audit Report
**Language:** ${language.toUpperCase()} | **Overall Score:** ${overallScore}/100 (${overallTier.grade})
**Threat Level:** ${securityAudit.overallRisk} | **OWASP Top 10:** ${compliance.owaspTop10}

## Executive Summary
${summary}

## Quality Score Pillars
- **Security:** ${scores.security}%
- **Best Practices:** ${scores.bestPractices}%
- **Maintainability:** ${scores.maintainability}%
- **Error Handling:** ${scores.errorHandling}%
- **Performance:** ${scores.performance}%
- **Readability:** ${scores.readability}%

## Critical Vulnerabilities (${criticalIssues.length})
${criticalIssues
  .map(
    (iss, i) =>
      `### ${i + 1}. ${iss.title} (Line ${iss.line})
- **Description:** ${iss.description}
- **Impact:** ${iss.risk}
- **Remediation:**
\`\`\`${language}
${iss.recommendation}
\`\`\``
  )
  .join('\n\n')}

## Security & Compliance Matrix
- **Overall Risk:** ${securityAudit.overallRisk}
- **Injection Flaws:** ${securityAudit.injectionRisk}
- **Authentication:** ${securityAudit.authRisk}
- **Access Control:** ${securityAudit.accessControl}
- **Secret Exposure:** ${securityAudit.secretExposure}
- **OWASP Top 10:** ${compliance.owaspTop10}
- **PCI-DSS:** ${compliance.pciDss}
- **GDPR:** ${compliance.gdpr}

## Senior Engineer Recommendations
${proTips.map((tip) => `- ${tip}`).join('\n')}
    `.trim();

    navigator.clipboard.writeText(md);
    setCopiedReport(true);
    setTimeout(() => setCopiedReport(false), 2500);
  };

  // Download structured JSON
  const handleDownloadJson = () => {
    const jsonStr = JSON.stringify(data.raw || data, null, 2);
    const blob = new Blob([jsonStr], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `code_audit_${language}_${new Date().toISOString().slice(0, 10)}.json`;
    link.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div id="dynamic-analysis-results" className="flex flex-col gap-4 w-full text-gray-200">
      {/* =========================================================
          CONTROLS BAR: SECTION FILTER TABS & SEARCH
          ========================================================= */}
      <div
        id="results-filter-bar"
        className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-3 rounded-xl border"
        style={{
          backgroundColor: isDark ? '#161b22' : '#f6f8fa',
          borderColor: isDark ? '#30363d' : '#d0d7de',
        }}
      >
        {/* Navigation / Filter Chips */}
        <div className="flex flex-wrap items-center gap-1.5 overflow-x-auto pb-1 sm:pb-0">
          <button
            type="button"
            onClick={() => setActiveSectionFilter('all')}
            className={`px-2.5 py-1 rounded-lg text-xs font-medium transition-all cursor-pointer ${
              activeSectionFilter === 'all'
                ? 'bg-purple-600 text-white shadow-md'
                : 'text-gray-400 hover:text-gray-200 hover:bg-[#21262d]'
            }`}
          >
            All Reports
          </button>

          <button
            type="button"
            onClick={() => setActiveSectionFilter('scores')}
            className={`flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-medium transition-all cursor-pointer ${
              activeSectionFilter === 'scores'
                ? 'bg-purple-600 text-white shadow-md'
                : 'text-gray-400 hover:text-gray-200 hover:bg-[#21262d]'
            }`}
          >
            <FaGaugeHigh className="text-[11px]" />
            <span>Scores</span>
            <span className="text-[10px] font-mono px-1.5 py-0.2 rounded-full bg-black/40 text-purple-200">
              {overallScore}
            </span>
          </button>

          <button
            type="button"
            onClick={() => setActiveSectionFilter('critical')}
            className={`flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-medium transition-all cursor-pointer ${
              activeSectionFilter === 'critical'
                ? 'bg-red-600 text-white shadow-md'
                : 'text-gray-400 hover:text-gray-200 hover:bg-[#21262d]'
            }`}
          >
            <FaSkullCrossbones className="text-[11px]" />
            <span>Critical</span>
            {criticalIssues.length > 0 && (
              <span className="text-[10px] font-mono px-1.5 py-0.2 rounded-full bg-red-950 text-red-300 border border-red-800/50">
                {criticalIssues.length}
              </span>
            )}
          </button>

          <button
            type="button"
            onClick={() => setActiveSectionFilter('warnings')}
            className={`flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-medium transition-all cursor-pointer ${
              activeSectionFilter === 'warnings'
                ? 'bg-amber-600 text-white shadow-md'
                : 'text-gray-400 hover:text-gray-200 hover:bg-[#21262d]'
            }`}
          >
            <FaTriangleExclamation className="text-[11px]" />
            <span>Warnings</span>
            {warnings.length > 0 && (
              <span className="text-[10px] font-mono px-1.5 py-0.2 rounded-full bg-amber-950 text-amber-300 border border-amber-800/50">
                {warnings.length}
              </span>
            )}
          </button>

          <button
            type="button"
            onClick={() => setActiveSectionFilter('audit')}
            className={`flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-medium transition-all cursor-pointer ${
              activeSectionFilter === 'audit'
                ? 'bg-purple-600 text-white shadow-md'
                : 'text-gray-400 hover:text-gray-200 hover:bg-[#21262d]'
            }`}
          >
            <FaShieldHalved className="text-[11px]" />
            <span>Security Audit</span>
          </button>
        </div>

        {/* Action Buttons: Export & Search */}
        <div className="flex items-center gap-2">
          {/* Quick Search */}
          <div className="relative flex-1 sm:w-44">
            <FaMagnifyingGlass className="absolute left-2.5 top-1/2 -translate-y-1/2 text-[10px] text-gray-500" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search findings..."
              className="w-full pl-7 pr-2.5 py-1 rounded-lg text-xs bg-[#0d1117] border border-[#30363d] text-gray-200 placeholder-gray-500 focus:outline-none focus:border-purple-500"
            />
          </div>

          {/* Copy Report */}
          <button
            type="button"
            onClick={handleCopyMarkdownReport}
            className="flex items-center gap-1 px-2.5 py-1 rounded-lg text-xs bg-[#21262d] hover:bg-[#30363d] text-gray-300 hover:text-white border border-[#30363d] transition-colors cursor-pointer"
            title="Copy audit report as Markdown"
          >
            {copiedReport ? <FaCheck className="text-emerald-400 text-[10px]" /> : <FaCopy className="text-[10px]" />}
            <span className="hidden md:inline">{copiedReport ? 'Copied' : 'Copy'}</span>
          </button>

          {/* Download JSON */}
          <button
            type="button"
            onClick={handleDownloadJson}
            className="p-1.5 rounded-lg text-xs bg-[#21262d] hover:bg-[#30363d] text-gray-300 hover:text-white border border-[#30363d] transition-colors cursor-pointer"
            title="Download JSON Report"
          >
            <FaDownload className="text-[10px]" />
          </button>
        </div>
      </div>

      {/* =========================================================
          SECTION 1: SCORE CARDS (Hero Circular Gauge + 6 Pillar Grid)
          ========================================================= */}
      {(activeSectionFilter === 'all' || activeSectionFilter === 'scores') && (
        <div
          id="score-cards-dashboard"
          className="p-4 sm:p-5 rounded-xl border flex flex-col gap-5 shadow-xl transition-all"
          style={{
            backgroundColor: isDark ? '#0d1117' : '#ffffff',
            borderColor: isDark ? '#30363d' : '#d0d7de',
          }}
        >
          {/* Header Row: Circular Gauge + Verdict */}
          <div className="flex flex-col md:flex-row items-center justify-between gap-5 pb-5 border-b border-[#30363d]">
            {/* Circular Gauge */}
            <div className="flex flex-col sm:flex-row items-center gap-4 text-center sm:text-left">
              <div className="relative flex items-center justify-center w-24 h-24 flex-shrink-0">
                <svg className="w-full h-full transform -rotate-90" viewBox="0 0 110 110">
                  <circle
                    cx="55"
                    cy="55"
                    r={radius}
                    className="stroke-[#21262d]"
                    strokeWidth="9"
                    fill="transparent"
                  />
                  <circle
                    cx="55"
                    cy="55"
                    r={radius}
                    stroke={overallTier.ringColor}
                    strokeWidth="9"
                    strokeDasharray={circumference}
                    strokeDashoffset={strokeDashoffset}
                    strokeLinecap="round"
                    fill="transparent"
                    className="transition-all duration-1000 ease-out"
                  />
                </svg>
                <div className="absolute flex flex-col items-center justify-center">
                  <span className="text-2xl font-black font-mono text-white tracking-tight">
                    {overallScore}
                  </span>
                  <span className="text-[9px] uppercase font-bold text-gray-400">/ 100</span>
                </div>
              </div>

              <div>
                <div className="flex flex-wrap items-center justify-center sm:justify-start gap-2 mb-1">
                  <span className="text-xs uppercase font-mono tracking-wider text-gray-400">
                    Overall Code Health
                  </span>
                  <span
                    className={`px-2.5 py-0.5 rounded-full text-xs font-semibold border ${overallTier.badgeClass}`}
                  >
                    {overallTier.grade}
                  </span>
                </div>
                <p className="text-xs text-gray-400 max-w-sm leading-relaxed">
                  {overallTier.description}
                </p>
              </div>
            </div>

            {/* Quick Diagnostic Badges */}
            <div className="grid grid-cols-3 gap-2 w-full md:w-auto">
              {/* Critical count */}
              <div
                className={`flex flex-col items-center justify-center px-3.5 py-2 rounded-lg border min-w-[5rem] ${
                  criticalIssues.length > 0
                    ? 'bg-red-950/40 border-red-800/60'
                    : 'bg-[#161b22] border-[#30363d]'
                }`}
              >
                <span
                  className={`text-lg font-bold font-mono ${
                    criticalIssues.length > 0 ? 'text-red-400' : 'text-emerald-400'
                  }`}
                >
                  {criticalIssues.length}
                </span>
                <span className="text-[10px] uppercase font-mono text-gray-400">Critical</span>
              </div>

              {/* Warnings count */}
              <div
                className={`flex flex-col items-center justify-center px-3.5 py-2 rounded-lg border min-w-[5rem] ${
                  warnings.length > 0
                    ? 'bg-amber-950/40 border-amber-800/60'
                    : 'bg-[#161b22] border-[#30363d]'
                }`}
              >
                <span
                  className={`text-lg font-bold font-mono ${
                    warnings.length > 0 ? 'text-amber-400' : 'text-gray-300'
                  }`}
                >
                  {warnings.length}
                </span>
                <span className="text-[10px] uppercase font-mono text-gray-400">Warnings</span>
              </div>

              {/* Threat Tier */}
              <div
                className={`flex flex-col items-center justify-center px-3.5 py-2 rounded-lg border min-w-[5rem] ${getRiskBadgeClass(
                  securityAudit.overallRisk
                )}`}
              >
                <span className="text-base font-bold font-mono truncate max-w-[5.5rem]">
                  {securityAudit.overallRisk}
                </span>
                <span className="text-[10px] uppercase font-mono text-gray-400">Threat</span>
              </div>
            </div>
          </div>

          {/* Dynamic 6-Pillar Score Cards Grid */}
          <div className="flex flex-col gap-2">
            <div className="flex items-center justify-between text-xs text-gray-400 px-0.5">
              <span className="font-semibold uppercase tracking-wider text-[11px] text-gray-400">
                Core Quality Pillars
              </span>
              <span className="text-[11px] font-mono text-gray-500">
                Click a card to filter issues
              </span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2.5">
              {scoreCategories.map((item) => {
                const Icon = item.icon;
                const tier = getScoreTier(item.value);
                const isPillarActive = activeScorePillar === item.key;

                return (
                  <button
                    key={item.key}
                    type="button"
                    onClick={() =>
                      setActiveScorePillar(isPillarActive ? null : item.key)
                    }
                    className={`p-3 rounded-lg border flex flex-col gap-2 text-left transition-all cursor-pointer ${
                      isPillarActive
                        ? 'border-purple-500 bg-[#21262d] ring-1 ring-purple-500/40'
                        : 'bg-[#161b22] border-[#30363d] hover:border-gray-600 hover:bg-[#1c2128]'
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <div
                          className={`p-1.5 rounded-md ${
                            item.value >= 70
                              ? 'bg-emerald-950/60 text-emerald-400'
                              : item.value >= 50
                              ? 'bg-amber-950/60 text-amber-400'
                              : 'bg-red-950/60 text-red-400'
                          }`}
                        >
                          <Icon className="text-xs" />
                        </div>
                        <div>
                          <h4 className="text-xs font-semibold text-gray-200">
                            {item.label}
                          </h4>
                          <span className="text-[10px] text-gray-500 line-clamp-1">
                            {item.desc}
                          </span>
                        </div>
                      </div>
                      <span className="text-xs font-mono font-bold text-white ml-2 flex-shrink-0">
                        {item.value}%
                      </span>
                    </div>

                    {/* Animated Progress Bar */}
                    <div className="w-full h-1.5 rounded-full bg-[#21262d] overflow-hidden">
                      <div
                        className={`h-full rounded-full transition-all duration-700 ${tier.bg}`}
                        style={{ width: `${item.value}%` }}
                      />
                    </div>
                  </button>
                );
              })}
            </div>
          </div>
        </div>
      )}

      {/* =========================================================
          SECTION 2: EXECUTIVE SUMMARY CARD
          ========================================================= */}
      {(activeSectionFilter === 'all' || activeSectionFilter === 'scores') && (
        <div
          id="executive-summary-card"
          className="p-4 rounded-xl border flex flex-col gap-2.5 shadow-md"
          style={{
            backgroundColor: '#0d1117',
            borderColor: '#30363d',
          }}
        >
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <FaFileLines className="text-purple-400 text-xs" />
              <h3 className="text-xs font-bold text-white uppercase tracking-wider">
                Executive Findings Summary
              </h3>
            </div>
            <span className="text-[11px] font-mono text-purple-300 bg-purple-950/60 border border-purple-800/40 px-2 py-0.5 rounded">
              {language.toUpperCase()}
            </span>
          </div>

          <p className="text-xs text-gray-300 leading-relaxed font-normal">
            {summary}
          </p>
        </div>
      )}

      {/* =========================================================
          SECTION 3: CRITICAL ISSUES (Dynamic Cards & Fix Injection)
          ========================================================= */}
      {(activeSectionFilter === 'all' ||
        activeSectionFilter === 'critical' ||
        activeSectionFilter === 'warnings') && (
        <div
          id="critical-issues-container"
          className="p-4 sm:p-5 rounded-xl border flex flex-col gap-4 shadow-xl"
          style={{
            backgroundColor: isDark ? '#0d1117' : '#ffffff',
            borderColor: isDark ? '#30363d' : '#d0d7de',
          }}
        >
          {/* Header Row */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-3 border-b border-[#30363d]">
            <div className="flex items-center gap-2.5">
              <div
                className={`p-2 rounded-lg border ${
                  filteredCriticalIssues.length > 0
                    ? 'bg-red-950/60 text-red-400 border-red-800/50'
                    : 'bg-emerald-950/60 text-emerald-400 border-emerald-800/50'
                }`}
              >
                {filteredCriticalIssues.length > 0 ? (
                  <FaSkullCrossbones className="text-sm" />
                ) : (
                  <FaCircleCheck className="text-sm" />
                )}
              </div>
              <div>
                <h3 className="text-xs font-bold text-white uppercase tracking-wider flex items-center gap-2">
                  <span>Security & Critical Findings</span>
                  <span
                    className={`text-[10px] px-2 py-0.2 rounded-full font-mono font-semibold border ${
                      filteredCriticalIssues.length > 0
                        ? 'bg-red-950/60 border-red-800/60 text-red-300'
                        : 'bg-emerald-950/60 border-emerald-800/60 text-emerald-300'
                    }`}
                  >
                    {filteredCriticalIssues.length} Critical
                  </span>
                </h3>
                <p className="text-[11px] text-gray-400">
                  Flaws that allow remote exploitation, unauthorized access, or fatal execution errors.
                </p>
              </div>
            </div>

            {/* Action Buttons: Auto-Fix & Resolved tracker */}
            <div className="flex items-center gap-2 flex-wrap">
              {onAutoFix && criticalIssues.length > 0 && (
                <button
                  type="button"
                  onClick={onAutoFix}
                  disabled={isFixing}
                  className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold text-white bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 active:from-emerald-700 active:to-teal-700 transition-all shadow-md cursor-pointer disabled:opacity-50"
                  title="Auto-fix all vulnerabilities and patch code directly into the editor"
                >
                  <FaWrench className="text-[10px]" />
                  <span>{isFixing ? 'Applying Fixes to Code...' : 'Auto-Fix All (Direct to Editor)'}</span>
                </button>
              )}

              {criticalIssues.length > 0 && (
                <div className={`text-[11px] font-mono px-2.5 py-1 rounded-md border self-start sm:self-auto ${
                  isDark ? 'text-gray-400 bg-[#161b22] border-[#30363d]' : 'text-gray-600 bg-gray-50 border-gray-200'
                }`}>
                  <span className="text-emerald-400 font-bold">
                    {Array.from(resolvedIssueIds).filter((id) => id.startsWith('crit-')).length}
                  </span>
                  {' / '}
                  {criticalIssues.length} resolved
                </div>
              )}
            </div>
          </div>

          {/* List of Critical Issues */}
          {filteredCriticalIssues.length > 0 ? (
            <div className="flex flex-col gap-3">
              {filteredCriticalIssues.map((issue) => {
                const isResolved = resolvedIssueIds.has(issue.id);
                const isCollapsed = collapsedIssueIds.has(issue.id);

                return (
                  <div
                    key={issue.id}
                    id={`issue-card-${issue.id}`}
                    className={`rounded-lg border transition-all overflow-hidden ${
                      isResolved
                        ? 'bg-[#161b22]/50 border-emerald-800/40 opacity-75'
                        : 'bg-[#161b22] border-red-900/50 hover:border-red-700/70'
                    }`}
                  >
                    {/* Issue Header */}
                    <div className="flex items-center justify-between p-3 gap-2 bg-[#1c2128]/80 border-b border-[#30363d]/60">
                      <div className="flex items-center gap-2 min-w-0">
                        {/* Checkbox to mark as resolved */}
                        <button
                          type="button"
                          onClick={() => handleToggleResolved(issue.id)}
                          className={`flex items-center justify-center w-4 h-4 rounded border transition-colors cursor-pointer flex-shrink-0 ${
                            isResolved
                              ? 'bg-emerald-600 border-emerald-500 text-white'
                              : 'border-gray-600 hover:border-gray-400 bg-[#0d1117]'
                          }`}
                          title={isResolved ? 'Mark as unresolved' : 'Mark as resolved'}
                        >
                          {isResolved && <FaCheck className="text-[9px]" />}
                        </button>

                        <span
                          className={`text-[9px] font-bold uppercase tracking-wider px-1.5 py-0.5 rounded border flex-shrink-0 ${
                            isResolved
                              ? 'bg-emerald-950 text-emerald-300 border-emerald-800'
                              : 'bg-red-950 text-red-300 border-red-800'
                          }`}
                        >
                          {isResolved ? 'RESOLVED' : issue.severity.toUpperCase()}
                        </span>

                        <h4
                          className={`text-xs font-semibold truncate ${
                            isResolved ? 'line-through text-gray-400' : 'text-white'
                          }`}
                        >
                          {issue.title}
                        </h4>
                      </div>

                      <div className="flex items-center gap-1.5 flex-shrink-0">
                        <span className="text-[10px] font-mono text-purple-300 bg-purple-950/60 px-2 py-0.5 rounded border border-purple-900/50">
                          Line {issue.line}
                        </span>

                        <button
                          type="button"
                          onClick={() => handleToggleCollapse(issue.id)}
                          className="p-1 rounded text-gray-400 hover:text-gray-200 transition-colors cursor-pointer"
                        >
                          {isCollapsed ? (
                            <FaChevronDown className="text-[10px]" />
                          ) : (
                            <FaChevronUp className="text-[10px]" />
                          )}
                        </button>
                      </div>
                    </div>

                    {/* Issue Body */}
                    {!isCollapsed && (
                      <div className="p-3.5 flex flex-col gap-3">
                        {/* Explanation */}
                        <p className="text-xs text-gray-300 leading-relaxed font-normal">
                          {issue.description}
                        </p>

                        {/* Risk / Impact Callout */}
                        {issue.risk && (
                          <div className="p-2.5 rounded-lg bg-red-950/30 border border-red-900/40 text-xs text-red-200 flex items-start gap-2">
                            <FaBug className="text-red-400 text-xs mt-0.5 flex-shrink-0" />
                            <div>
                              <strong className="text-red-300 font-semibold mr-1">
                                Exploit Impact:
                              </strong>
                              <span>{issue.risk}</span>
                            </div>
                          </div>
                        )}

                        {/* Concrete Remediation / Fix */}
                        {issue.recommendation && (
                          <div className="flex flex-col gap-1.5 mt-1">
                            <div className="flex items-center justify-between text-[11px] font-mono">
                              <span className="flex items-center gap-1.5 font-bold text-emerald-400">
                                <FaCheck className="text-[10px]" /> Recommended Remediation
                              </span>

                              <div className="flex items-center gap-1">
                                {onApplySnippet && (
                                  <button
                                    type="button"
                                    onClick={() => onApplySnippet(issue.recommendation)}
                                    className="flex items-center gap-1 text-[10px] text-emerald-300 hover:text-white px-2 py-0.5 rounded bg-emerald-950/60 hover:bg-emerald-900/80 border border-emerald-800/60 cursor-pointer transition-colors"
                                    title="Inject this remediation snippet into the code editor"
                                  >
                                    <FaArrowRight className="text-[9px]" />
                                    <span>Apply to Editor</span>
                                  </button>
                                )}

                                <button
                                  type="button"
                                  onClick={() => handleCopySnippet(issue.recommendation, issue.id)}
                                  className="flex items-center gap-1 text-[10px] text-gray-400 hover:text-white px-2 py-0.5 rounded bg-[#21262d] hover:bg-[#30363d] border border-[#30363d] cursor-pointer transition-colors"
                                >
                                  {copiedSnippetId === issue.id ? (
                                    <FaCheck className="text-emerald-400 text-[9px]" />
                                  ) : (
                                    <FaCopy className="text-[9px]" />
                                  )}
                                  <span>{copiedSnippetId === issue.id ? 'Copied' : 'Copy'}</span>
                                </button>
                              </div>
                            </div>

                            <pre className="p-3 rounded-lg bg-[#0b0f19] text-xs font-mono text-emerald-300 overflow-x-auto border border-emerald-900/30 leading-relaxed max-h-48">
                              <code>{issue.recommendation}</code>
                            </pre>
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          ) : (
            <div className="flex items-center gap-3 p-3.5 rounded-lg bg-emerald-950/20 border border-emerald-900/40 text-emerald-300 text-xs">
              <FaCircleCheck className="text-emerald-400 text-lg flex-shrink-0" />
              <div>
                <strong className="font-semibold block text-emerald-200">
                  No Critical Vulnerabilities Found
                </strong>
                <span className="text-gray-400 text-[11px]">
                  Your code passes key memory bounds, parameterized querying, and defensive security baselines.
                </span>
              </div>
            </div>
          )}

          {/* =========================================================
              SUBSECTION: WARNINGS & CODE SMELLS
              ========================================================= */}
          {filteredWarnings.length > 0 && (
            <div className="mt-3 pt-4 border-t border-[#30363d] flex flex-col gap-3">
              <div className="flex items-center justify-between">
                <h4 className="text-xs font-bold uppercase tracking-wider text-amber-400 flex items-center gap-2">
                  <FaTriangleExclamation className="text-xs" />
                  <span>Code Smells & Defensive Warnings ({filteredWarnings.length})</span>
                </h4>
              </div>

              <div className="flex flex-col gap-2">
                {filteredWarnings.map((warn) => {
                  const isResolved = resolvedIssueIds.has(warn.id);

                  return (
                    <div
                      key={warn.id}
                      className={`p-3 rounded-lg border text-xs flex flex-col gap-1.5 transition-all ${
                        isResolved
                          ? 'bg-[#161b22]/40 border-gray-800 opacity-70'
                          : 'bg-[#161b22] border-amber-800/40 hover:border-amber-700/60'
                      }`}
                    >
                      <div className="flex items-center justify-between gap-2">
                        <div className="flex items-center gap-2">
                          <button
                            type="button"
                            onClick={() => handleToggleResolved(warn.id)}
                            className={`flex items-center justify-center w-3.5 h-3.5 rounded border transition-colors cursor-pointer flex-shrink-0 ${
                              isResolved
                                ? 'bg-emerald-600 border-emerald-500 text-white'
                                : 'border-gray-600 hover:border-gray-400 bg-[#0d1117]'
                            }`}
                          >
                            {isResolved && <FaCheck className="text-[8px]" />}
                          </button>
                          <span
                            className={`font-semibold ${
                              isResolved ? 'line-through text-gray-400' : 'text-gray-200'
                            }`}
                          >
                            {warn.title}
                          </span>
                        </div>
                        <span className="text-[10px] font-mono text-gray-400 bg-[#21262d] px-1.5 py-0.5 rounded border border-[#30363d]">
                          Line {warn.line}
                        </span>
                      </div>

                      <p className="text-gray-300 text-[11px] leading-relaxed">
                        {warn.description}
                      </p>

                      {warn.recommendation && (
                        <div className="text-[11px] text-amber-300 font-mono bg-amber-950/20 p-2 rounded border border-amber-900/30">
                          <span className="font-semibold mr-1">Fix Suggestion:</span>
                          {warn.recommendation}
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>
          )}
        </div>
      )}

      {/* =========================================================
          SECTION 4: SECURITY AUDIT & REGULATORY COMPLIANCE MATRIX
          ========================================================= */}
      {(activeSectionFilter === 'all' || activeSectionFilter === 'audit') && (
        <div
          id="security-audit-matrix"
          className="p-4 sm:p-5 rounded-xl border flex flex-col gap-5 shadow-xl"
          style={{
            backgroundColor: isDark ? '#0d1117' : '#ffffff',
            borderColor: isDark ? '#30363d' : '#d0d7de',
          }}
        >
          <div className="flex items-center justify-between pb-3 border-b border-[#30363d]">
            <div className="flex items-center gap-2">
              <FaShieldHalved className="text-purple-400 text-sm" />
              <h3 className="text-xs font-bold text-white uppercase tracking-wider">
                Threat Vectors & Regulatory Compliance Matrix
              </h3>
            </div>
            <span
              className={`text-xs px-2.5 py-0.5 rounded-full font-mono font-semibold border ${getRiskBadgeClass(
                securityAudit.overallRisk
              )}`}
            >
              Threat: {securityAudit.overallRisk}
            </span>
          </div>

          {/* Threat Vector Cards Grid */}
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-2.5">
            {/* Injection Flaws */}
            <div className="p-3 rounded-lg bg-[#161b22] border border-[#30363d] flex flex-col gap-1.5">
              <span className="text-[10px] uppercase font-mono text-gray-400">
                Injection Flaws
              </span>
              <span
                className={`text-xs font-bold px-2 py-0.5 rounded border inline-block w-fit ${getRiskBadgeClass(
                  securityAudit.injectionRisk
                )}`}
              >
                {securityAudit.injectionRisk}
              </span>
              <span className="text-[10px] text-gray-500">
                SQL, Shell, XSS, Buffer
              </span>
            </div>

            {/* Auth & Sessions */}
            <div className="p-3 rounded-lg bg-[#161b22] border border-[#30363d] flex flex-col gap-1.5">
              <span className="text-[10px] uppercase font-mono text-gray-400">
                Auth & Sessions
              </span>
              <span
                className={`text-xs font-bold px-2 py-0.5 rounded border inline-block w-fit ${getRiskBadgeClass(
                  securityAudit.authRisk
                )}`}
              >
                {securityAudit.authRisk}
              </span>
              <span className="text-[10px] text-gray-500">
                Tokens, Hashes, Cookies
              </span>
            </div>

            {/* Access Control */}
            <div className="p-3 rounded-lg bg-[#161b22] border border-[#30363d] flex flex-col gap-1.5">
              <span className="text-[10px] uppercase font-mono text-gray-400">
                Access Control
              </span>
              <span
                className={`text-xs font-bold px-2 py-0.5 rounded border inline-block w-fit ${getRiskBadgeClass(
                  securityAudit.accessControl
                )}`}
              >
                {securityAudit.accessControl}
              </span>
              <span className="text-[10px] text-gray-500">
                IDOR & Permissions
              </span>
            </div>

            {/* Secret Exposure */}
            <div className="p-3 rounded-lg bg-[#161b22] border border-[#30363d] flex flex-col gap-1.5">
              <span className="text-[10px] uppercase font-mono text-gray-400">
                Secret Exposure
              </span>
              <span
                className={`text-xs font-bold px-2 py-0.5 rounded border inline-block w-fit ${getRiskBadgeClass(
                  securityAudit.secretExposure
                )}`}
              >
                {securityAudit.secretExposure}
              </span>
              <span className="text-[10px] text-gray-500">
                Hardcoded keys & envs
              </span>
            </div>

            {/* Sensitive Data */}
            <div className="p-3 rounded-lg bg-[#161b22] border border-[#30363d] flex flex-col gap-1.5 col-span-2 sm:col-span-1">
              <span className="text-[10px] uppercase font-mono text-gray-400">
                Data Leakage
              </span>
              <span
                className={`text-xs font-bold px-2 py-0.5 rounded border inline-block w-fit ${getRiskBadgeClass(
                  securityAudit.sensitiveDataExposure
                )}`}
              >
                {securityAudit.sensitiveDataExposure}
              </span>
              <span className="text-[10px] text-gray-500">
                PII, stacks & logs
              </span>
            </div>
          </div>

          {/* Standards & Compliance Matrix */}
          <div className="flex flex-col gap-2">
            <h4 className="text-xs font-bold uppercase tracking-wider text-gray-300 flex items-center gap-2">
              <FaRocket className="text-purple-400 text-xs" />
              <span>Industry Frameworks & Compliance Readiness</span>
            </h4>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
              <div className="p-3 rounded-lg bg-[#161b22] border border-[#30363d] flex items-center justify-between">
                <div>
                  <span className="text-xs font-semibold text-gray-200 block">
                    OWASP Top 10
                  </span>
                  <span className="text-[10px] text-gray-500">Web App Standard</span>
                </div>
                <span
                  className={`text-xs px-2 py-0.5 rounded border font-mono font-bold ${getRiskBadgeClass(
                    compliance.owaspTop10
                  )}`}
                >
                  {compliance.owaspTop10}
                </span>
              </div>

              <div className="p-3 rounded-lg bg-[#161b22] border border-[#30363d] flex items-center justify-between">
                <div>
                  <span className="text-xs font-semibold text-gray-200 block">
                    PCI-DSS v4.0
                  </span>
                  <span className="text-[10px] text-gray-500">Cardholder Security</span>
                </div>
                <span
                  className={`text-xs px-2 py-0.5 rounded border font-mono font-bold ${getRiskBadgeClass(
                    compliance.pciDss
                  )}`}
                >
                  {compliance.pciDss}
                </span>
              </div>

              <div className="p-3 rounded-lg bg-[#161b22] border border-[#30363d] flex items-center justify-between">
                <div>
                  <span className="text-xs font-semibold text-gray-200 block">
                    GDPR / Privacy
                  </span>
                  <span className="text-[10px] text-gray-500">Data Protection</span>
                </div>
                <span
                  className={`text-xs px-2 py-0.5 rounded border font-mono font-bold ${getRiskBadgeClass(
                    compliance.gdpr
                  )}`}
                >
                  {compliance.gdpr}
                </span>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* =========================================================
          SECTION 5: SENIOR ENGINEER PRO-TIPS
          ========================================================= */}
      {(activeSectionFilter === 'all' || activeSectionFilter === 'tips') &&
        proTips &&
        proTips.length > 0 && (
          <div
            id="senior-engineer-recommendations"
            className="p-4 rounded-xl border flex flex-col gap-2.5 shadow-md bg-[#0d1117] border-[#30363d]"
          >
            <h4 className="text-xs font-bold uppercase tracking-wider text-purple-300 flex items-center gap-2">
              <FaLightbulb className="text-yellow-400 text-xs" />
              <span>Senior Engineer Defensive Architecture Tips</span>
            </h4>
            <ul className="flex flex-col gap-2 text-xs text-gray-300">
              {proTips.map((tip, idx) => (
                <li
                  key={idx}
                  className="flex items-start gap-2.5 p-2 rounded-lg bg-[#161b22] border border-[#30363d]/50"
                >
                  <span className="text-purple-400 mt-0.5 text-xs font-mono">•</span>
                  <span className="leading-relaxed">{tip}</span>
                </li>
              ))}
            </ul>
          </div>
        )}

      {/* =========================================================
          SECTION 6: RAW API RESPONSE VIEWER (COLLAPSIBLE)
          ========================================================= */}
      <div className="pt-1 flex flex-col gap-2">
        <div className="flex items-center justify-between px-1">
          <button
            type="button"
            onClick={() => setShowRawJson(!showRawJson)}
            className="flex items-center gap-1.5 text-xs font-mono text-gray-400 hover:text-gray-200 cursor-pointer transition-colors"
          >
            <FaCode className="text-[11px]" />
            <span>{showRawJson ? 'Hide Raw Audit JSON' : 'Inspect Raw AI Analysis Payload'}</span>
            {showRawJson ? (
              <FaChevronUp className="text-[9px]" />
            ) : (
              <FaChevronDown className="text-[9px]" />
            )}
          </button>

          {showRawJson && (
            <button
              type="button"
              onClick={() => handleCopySnippet(JSON.stringify(data.raw || data, null, 2), 'raw-json')}
              className="flex items-center gap-1 text-[10px] text-gray-400 hover:text-white px-2 py-0.5 rounded bg-[#21262d] border border-[#30363d] cursor-pointer"
            >
              {copiedSnippetId === 'raw-json' ? (
                <FaCheck className="text-emerald-400 text-[9px]" />
              ) : (
                <FaCopy className="text-[9px]" />
              )}
              <span>{copiedSnippetId === 'raw-json' ? 'Copied' : 'Copy JSON'}</span>
            </button>
          )}
        </div>

        {showRawJson && (
          <pre className="p-3.5 rounded-lg bg-[#0b0f19] border border-[#30363d] text-[11px] font-mono text-gray-300 overflow-x-auto max-h-64 leading-relaxed">
            {JSON.stringify(data.raw || data, null, 2)}
          </pre>
        )}
      </div>
    </div>
  );
}
