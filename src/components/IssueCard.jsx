import React from 'react';
import { FaSkullCrossbones, FaTriangleExclamation, FaLightbulb, FaCheck } from 'react-icons/fa6';

export default function IssueCard({ criticalIssues = [], warnings = [] }) {
  const hasCritical = criticalIssues.length > 0;
  const hasWarnings = warnings.length > 0;

  return (
    <div className="flex flex-col gap-6">
      {/* 1. Critical Issues Section */}
      <div
        id="critical-issues-section"
        className="p-6 rounded-xl border"
        style={{
          backgroundColor: 'var(--card-bg)',
          borderColor: 'var(--border-color)',
        }}
      >
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-lg bg-red-950/60 text-red-400 border border-red-800/50">
              <FaSkullCrossbones className="text-sm" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-white uppercase tracking-wider">
                Critical Issues ({criticalIssues.length})
              </h3>
              <p className="text-xs text-gray-400">
                Security vulnerabilities or breaking bugs requiring immediate remediation
              </p>
            </div>
          </div>

          <span
            className={`text-xs px-2.5 py-1 rounded-full font-mono font-semibold border ${
              hasCritical
                ? 'bg-red-950/40 border-red-800/60 text-red-400'
                : 'bg-emerald-950/40 border-emerald-800/60 text-emerald-400'
            }`}
          >
            {hasCritical ? `${criticalIssues.length} Vulnerabilities Found` : 'No Critical Vulnerabilities'}
          </span>
        </div>

        {hasCritical ? (
          <div className="flex flex-col gap-3">
            {criticalIssues.map((issue, index) => (
              <div
                key={index}
                className="p-4 rounded-lg border flex flex-col gap-2"
                style={{
                  backgroundColor: 'var(--secondary-bg)',
                  borderColor: 'rgba(239, 68, 68, 0.25)',
                }}
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="px-2 py-0.5 rounded text-[11px] font-bold uppercase tracking-wider bg-red-900/60 text-red-300 border border-red-700/50">
                      CRITICAL
                    </span>
                    <span className="font-semibold text-sm text-red-200">{issue.title}</span>
                  </div>

                  {issue.line !== null && issue.line !== undefined && (
                    <span className="font-mono text-xs px-2 py-0.5 rounded bg-gray-800 border border-gray-700 text-gray-300">
                      Line {issue.line}
                    </span>
                  )}
                </div>

                <p className="text-xs text-gray-300 leading-relaxed">{issue.description}</p>

                {issue.recommendation && (
                  <div className="mt-2 p-2.5 rounded bg-purple-950/20 border border-purple-900/30 flex items-start gap-2">
                    <FaLightbulb className="text-xs text-purple-400 mt-0.5 flex-shrink-0" />
                    <div className="text-xs text-purple-200">
                      <span className="font-semibold text-purple-300">Recommendation: </span>
                      {issue.recommendation}
                    </div>
                  </div>
                )}
              </div>
            ))}
          </div>
        ) : (
          <div className="flex items-center gap-3 p-4 rounded-lg bg-emerald-950/20 border border-emerald-900/30 text-emerald-300 text-xs">
            <FaCheck className="text-emerald-400 text-sm" />
            <span>No severe vulnerabilities detected in this snippet. Good job!</span>
          </div>
        )}
      </div>

      {/* 2. Warnings Section */}
      <div
        id="warnings-section"
        className="p-6 rounded-xl border"
        style={{
          backgroundColor: 'var(--card-bg)',
          borderColor: 'var(--border-color)',
        }}
      >
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-lg bg-yellow-950/60 text-yellow-400 border border-yellow-800/50">
              <FaTriangleExclamation className="text-sm" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-white uppercase tracking-wider">
                Warnings & Code Smells ({warnings.length})
              </h3>
              <p className="text-xs text-gray-400">
                Non-breaking issues, style anomalies, and dead code
              </p>
            </div>
          </div>

          <span
            className={`text-xs px-2.5 py-1 rounded-full font-mono font-semibold border ${
              hasWarnings
                ? 'bg-yellow-950/40 border-yellow-800/60 text-yellow-400'
                : 'bg-emerald-950/40 border-emerald-800/60 text-emerald-400'
            }`}
          >
            {hasWarnings ? `${warnings.length} Warnings` : 'Zero Warnings'}
          </span>
        </div>

        {hasWarnings ? (
          <div className="flex flex-col gap-3">
            {warnings.map((warn, index) => (
              <div
                key={index}
                className="p-3.5 rounded-lg border flex flex-col gap-1.5"
                style={{
                  backgroundColor: 'var(--secondary-bg)',
                  borderColor: 'rgba(234, 179, 8, 0.25)',
                }}
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="px-2 py-0.5 rounded text-[11px] font-bold uppercase tracking-wider bg-yellow-900/60 text-yellow-300 border border-yellow-700/50">
                      WARNING
                    </span>
                    <span className="font-medium text-xs text-yellow-100">{warn.title}</span>
                  </div>

                  {warn.line !== null && warn.line !== undefined && (
                    <span className="font-mono text-xs px-2 py-0.5 rounded bg-gray-800 border border-gray-700 text-gray-300">
                      Line {warn.line}
                    </span>
                  )}
                </div>

                <p className="text-xs text-gray-300">{warn.description}</p>
              </div>
            ))}
          </div>
        ) : (
          <div className="flex items-center gap-3 p-4 rounded-lg bg-emerald-950/20 border border-emerald-900/30 text-emerald-300 text-xs">
            <FaCheck className="text-emerald-400 text-sm" />
            <span>Clean code patterns identified with no significant warnings.</span>
          </div>
        )}
      </div>
    </div>
  );
}
