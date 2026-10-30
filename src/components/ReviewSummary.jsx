import React from 'react';
import { FaShieldHalved, FaCheckDouble, FaRocket, FaFileLines } from 'react-icons/fa6';

function getRiskBadge(level = '') {
  const norm = level.toLowerCase();
  if (norm.includes('high') || norm.includes('critical') || norm.includes('fail') || norm.includes('poor')) {
    return 'bg-red-950/60 border-red-800/60 text-red-300';
  }
  if (norm.includes('mod') || norm.includes('need') || norm.includes('warn')) {
    return 'bg-yellow-950/60 border-yellow-800/60 text-yellow-300';
  }
  return 'bg-emerald-950/60 border-emerald-800/60 text-emerald-300';
}

export default function ReviewSummary({
  summary = '',
  securityAudit = {},
  compliance = {},
  proTips = [],
}) {
  return (
    <div className="flex flex-col gap-6">
      {/* 1. Executive Summary */}
      <div
        id="review-summary-card"
        className="p-6 rounded-xl border"
        style={{
          backgroundColor: 'var(--card-bg)',
          borderColor: 'var(--border-color)',
        }}
      >
        <div className="flex items-center gap-2 mb-3">
          <FaFileLines className="text-purple-400 text-sm" />
          <h3 className="text-sm font-bold text-white uppercase tracking-wider">
            Executive Summary
          </h3>
        </div>
        <p className="text-sm text-gray-300 leading-relaxed font-normal">
          {summary || 'No summary available.'}
        </p>
      </div>

      {/* 2. Security Audit Grid */}
      <div
        id="security-audit-card"
        className="p-6 rounded-xl border"
        style={{
          backgroundColor: 'var(--card-bg)',
          borderColor: 'var(--border-color)',
        }}
      >
        <div className="flex items-center gap-2 mb-4">
          <FaShieldHalved className="text-purple-400 text-sm" />
          <h3 className="text-sm font-bold text-white uppercase tracking-wider">
            Security Audit
          </h3>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3">
          <div
            className="p-3 rounded-lg border flex flex-col items-center text-center"
            style={{ backgroundColor: 'var(--secondary-bg)', borderColor: 'var(--border-color)' }}
          >
            <span className="text-[10px] text-gray-400 uppercase font-mono mb-1">Overall Risk</span>
            <span className={`text-xs font-semibold px-2 py-0.5 rounded border ${getRiskBadge(securityAudit.risk)}`}>
              {securityAudit.risk || 'Moderate'}
            </span>
          </div>

          <div
            className="p-3 rounded-lg border flex flex-col items-center text-center"
            style={{ backgroundColor: 'var(--secondary-bg)', borderColor: 'var(--border-color)' }}
          >
            <span className="text-[10px] text-gray-400 uppercase font-mono mb-1">Injection Risk</span>
            <span className={`text-xs font-semibold px-2 py-0.5 rounded border ${getRiskBadge(securityAudit.injectionRisk)}`}>
              {securityAudit.injectionRisk || 'Low'}
            </span>
          </div>

          <div
            className="p-3 rounded-lg border flex flex-col items-center text-center"
            style={{ backgroundColor: 'var(--secondary-bg)', borderColor: 'var(--border-color)' }}
          >
            <span className="text-[10px] text-gray-400 uppercase font-mono mb-1">Auth Strength</span>
            <span className={`text-xs font-semibold px-2 py-0.5 rounded border ${getRiskBadge(securityAudit.authenticationStrength)}`}>
              {securityAudit.authenticationStrength || 'Moderate'}
            </span>
          </div>

          <div
            className="p-3 rounded-lg border flex flex-col items-center text-center"
            style={{ backgroundColor: 'var(--secondary-bg)', borderColor: 'var(--border-color)' }}
          >
            <span className="text-[10px] text-gray-400 uppercase font-mono mb-1">Access Control</span>
            <span className={`text-xs font-semibold px-2 py-0.5 rounded border ${getRiskBadge(securityAudit.accessControl)}`}>
              {securityAudit.accessControl || 'Moderate'}
            </span>
          </div>

          <div
            className="p-3 rounded-lg border flex flex-col items-center text-center"
            style={{ backgroundColor: 'var(--secondary-bg)', borderColor: 'var(--border-color)' }}
          >
            <span className="text-[10px] text-gray-400 uppercase font-mono mb-1">Secret Exposure</span>
            <span className={`text-xs font-semibold px-2 py-0.5 rounded border ${getRiskBadge(securityAudit.secretExposureRisk)}`}>
              {securityAudit.secretExposureRisk || 'Low'}
            </span>
          </div>
        </div>
      </div>

      {/* 3. Compliance & Standards */}
      <div
        id="compliance-card"
        className="p-6 rounded-xl border"
        style={{
          backgroundColor: 'var(--card-bg)',
          borderColor: 'var(--border-color)',
        }}
      >
        <div className="flex items-center gap-2 mb-4">
          <FaCheckDouble className="text-purple-400 text-sm" />
          <h3 className="text-sm font-bold text-white uppercase tracking-wider">
            Standards & Compliance
          </h3>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          <div
            className="p-3.5 rounded-lg border flex items-center justify-between"
            style={{ backgroundColor: 'var(--secondary-bg)', borderColor: 'var(--border-color)' }}
          >
            <span className="text-xs font-semibold text-gray-200">OWASP Top 10</span>
            <span className={`text-xs font-semibold px-2 py-0.5 rounded border ${getRiskBadge(compliance.owasp)}`}>
              {compliance.owasp || 'Needs Review'}
            </span>
          </div>

          <div
            className="p-3.5 rounded-lg border flex items-center justify-between"
            style={{ backgroundColor: 'var(--secondary-bg)', borderColor: 'var(--border-color)' }}
          >
            <span className="text-xs font-semibold text-gray-200">PCI-DSS</span>
            <span className={`text-xs font-semibold px-2 py-0.5 rounded border ${getRiskBadge(compliance.pciDss)}`}>
              {compliance.pciDss || 'Needs Review'}
            </span>
          </div>

          <div
            className="p-3.5 rounded-lg border flex items-center justify-between"
            style={{ backgroundColor: 'var(--secondary-bg)', borderColor: 'var(--border-color)' }}
          >
            <span className="text-xs font-semibold text-gray-200">GDPR Privacy</span>
            <span className={`text-xs font-semibold px-2 py-0.5 rounded border ${getRiskBadge(compliance.gdpr)}`}>
              {compliance.gdpr || 'Needs Review'}
            </span>
          </div>
        </div>
      </div>

      {/* 4. Pro Tips */}
      {proTips && proTips.length > 0 && (
        <div
          id="pro-tips-card"
          className="p-6 rounded-xl border"
          style={{
            backgroundColor: 'var(--card-bg)',
            borderColor: 'var(--border-color)',
          }}
        >
          <div className="flex items-center gap-2 mb-4">
            <FaRocket className="text-purple-400 text-sm" />
            <h3 className="text-sm font-bold text-white uppercase tracking-wider">
              Senior Developer Pro Tips
            </h3>
          </div>

          <div className="flex flex-col gap-2.5">
            {proTips.map((tip, index) => (
              <div
                key={index}
                className="flex items-start gap-3 p-3 rounded-lg border text-xs text-gray-300 leading-relaxed"
                style={{
                  backgroundColor: 'var(--secondary-bg)',
                  borderColor: 'var(--border-color)',
                }}
              >
                <span className="w-5 h-5 rounded-full flex items-center justify-center font-mono text-[10px] font-bold bg-purple-950/80 text-purple-300 border border-purple-800/60 flex-shrink-0">
                  {index + 1}
                </span>
                <span>{tip}</span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
