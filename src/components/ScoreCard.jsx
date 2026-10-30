import React from 'react';
import {
  FaShieldHalved,
  FaCheckDouble,
  FaWrench,
  FaTriangleExclamation,
  FaGaugeHigh,
  FaEye,
} from 'react-icons/fa6';

// Helper to determine score tier colors
function getScoreColor(score) {
  if (score >= 80) return { text: 'text-emerald-400', bg: 'bg-emerald-500', border: 'border-emerald-500/30' };
  if (score >= 60) return { text: 'text-yellow-400', bg: 'bg-yellow-500', border: 'border-yellow-500/30' };
  return { text: 'text-red-400', bg: 'bg-red-500', border: 'border-red-500/30' };
}

function getRatingLabel(score) {
  if (score >= 90) return 'Excellent';
  if (score >= 80) return 'Good';
  if (score >= 65) return 'Needs Work';
  if (score >= 50) return 'Suboptimal';
  return 'Critical Attention';
}

export default function ScoreCard({ overallScore = 0, scores = {} }) {
  const overallColors = getScoreColor(overallScore);
  const ratingLabel = getRatingLabel(overallScore);

  const scoreItems = [
    { key: 'security', label: 'Security', icon: FaShieldHalved, value: scores.security ?? 0 },
    { key: 'bestPractices', label: 'Best Practices', icon: FaCheckDouble, value: scores.bestPractices ?? 0 },
    { key: 'maintainability', label: 'Maintainability', icon: FaWrench, value: scores.maintainability ?? 0 },
    { key: 'errorHandling', label: 'Error Handling', icon: FaTriangleExclamation, value: scores.errorHandling ?? 0 },
    { key: 'performance', label: 'Performance', icon: FaGaugeHigh, value: scores.performance ?? 0 },
    { key: 'readability', label: 'Readability', icon: FaEye, value: scores.readability ?? 0 },
  ];

  // SVG Circular progress math
  const radius = 48;
  const circumference = 2 * Math.PI * radius;
  const strokeDashoffset = circumference - (overallScore / 100) * circumference;

  return (
    <div
      id="score-dashboard"
      className="p-6 rounded-xl border"
      style={{
        backgroundColor: 'var(--card-bg)',
        borderColor: 'var(--border-color)',
      }}
    >
      <div className="flex flex-col md:flex-row items-center justify-between gap-6 pb-6 border-b border-gray-800">
        {/* Overall Score Circle */}
        <div className="flex items-center gap-5">
          <div className="relative flex items-center justify-center w-28 h-28">
            <svg className="w-full h-full transform -rotate-90" viewBox="0 0 120 120">
              <circle
                cx="60"
                cy="60"
                r={radius}
                className="stroke-gray-800"
                strokeWidth="10"
                fill="transparent"
              />
              <circle
                cx="60"
                cy="60"
                r={radius}
                stroke="currentColor"
                strokeWidth="10"
                strokeDasharray={circumference}
                strokeDashoffset={strokeDashoffset}
                strokeLinecap="round"
                fill="transparent"
                className={`transition-all duration-1000 ${overallColors.text}`}
              />
            </svg>
            <div className="absolute flex flex-col items-center justify-center">
              <span className="text-3xl font-black tracking-tight text-white font-mono">
                {overallScore}
              </span>
              <span className="text-[10px] uppercase font-bold text-gray-400">/ 100</span>
            </div>
          </div>

          <div>
            <span className="text-xs uppercase font-mono tracking-wider text-gray-400">
              Overall Quality Score
            </span>
            <div className="flex items-center gap-2 mt-1">
              <span
                className={`px-2.5 py-0.5 rounded-full text-xs font-semibold border ${overallColors.border} ${overallColors.text}`}
                style={{ backgroundColor: 'var(--secondary-bg)' }}
              >
                {ratingLabel}
              </span>
            </div>
            <p className="text-xs text-gray-400 mt-1 max-w-xs">
              Based on comprehensive evaluation of security, patterns, errors, and performance.
            </p>
          </div>
        </div>

        {/* Quick summary metric chips */}
        <div className="flex flex-wrap gap-2 justify-center md:justify-end">
          <div
            className="px-3 py-2 rounded-lg border text-center min-w-[90px]"
            style={{ backgroundColor: 'var(--secondary-bg)', borderColor: 'var(--border-color)' }}
          >
            <span className="text-[10px] text-gray-400 uppercase font-mono block">Security</span>
            <span className={`text-base font-bold font-mono ${getScoreColor(scores.security || 0).text}`}>
              {scores.security ?? 0}%
            </span>
          </div>
          <div
            className="px-3 py-2 rounded-lg border text-center min-w-[90px]"
            style={{ backgroundColor: 'var(--secondary-bg)', borderColor: 'var(--border-color)' }}
          >
            <span className="text-[10px] text-gray-400 uppercase font-mono block">Performance</span>
            <span className={`text-base font-bold font-mono ${getScoreColor(scores.performance || 0).text}`}>
              {scores.performance ?? 0}%
            </span>
          </div>
          <div
            className="px-3 py-2 rounded-lg border text-center min-w-[90px]"
            style={{ backgroundColor: 'var(--secondary-bg)', borderColor: 'var(--border-color)' }}
          >
            <span className="text-[10px] text-gray-400 uppercase font-mono block">Readability</span>
            <span className={`text-base font-bold font-mono ${getScoreColor(scores.readability || 0).text}`}>
              {scores.readability ?? 0}%
            </span>
          </div>
        </div>
      </div>

      {/* Breakdown Scores Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 pt-6">
        {scoreItems.map((item) => {
          const Icon = item.icon;
          const colors = getScoreColor(item.value);

          return (
            <div
              key={item.key}
              className="p-3.5 rounded-lg border flex flex-col justify-between"
              style={{
                backgroundColor: 'var(--secondary-bg)',
                borderColor: 'var(--border-color)',
              }}
            >
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center gap-2">
                  <div className="p-1.5 rounded bg-gray-800 text-gray-300 text-xs">
                    <Icon />
                  </div>
                  <span className="text-xs font-semibold text-gray-200">{item.label}</span>
                </div>
                <span className={`text-sm font-mono font-bold ${colors.text}`}>
                  {item.value} <span className="text-[10px] text-gray-500">/ 100</span>
                </span>
              </div>

              {/* Linear Progress Bar */}
              <div className="w-full bg-gray-800 rounded-full h-2 overflow-hidden">
                <div
                  className={`h-full rounded-full transition-all duration-700 ${colors.bg}`}
                  style={{ width: `${Math.min(100, Math.max(0, item.value))}%` }}
                />
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
