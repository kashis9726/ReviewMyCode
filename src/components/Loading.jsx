import React, { useEffect, useState } from 'react';
import { FaSpinner, FaShieldHalved, FaCheckDouble, FaGaugeHigh, FaLightbulb } from 'react-icons/fa6';

const LOADING_STEPS = [
  { text: 'Analyzing your code...', icon: FaSpinner },
  { text: 'Checking security...', icon: FaShieldHalved },
  { text: 'Checking best practices...', icon: FaCheckDouble },
  { text: 'Checking performance...', icon: FaGaugeHigh },
  { text: 'Generating recommendations...', icon: FaLightbulb },
];

export default function Loading({ title = 'Gemini AI is reviewing your code' }) {
  const [currentStepIndex, setCurrentStepIndex] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentStepIndex((prev) => (prev + 1) % LOADING_STEPS.length);
    }, 1800);

    return () => clearInterval(interval);
  }, []);

  return (
    <div
      id="loading-state-card"
      className="flex flex-col items-center justify-center p-8 rounded-xl border text-center my-6"
      style={{
        backgroundColor: 'var(--card-bg)',
        borderColor: 'var(--border-color)',
      }}
    >
      {/* Animated radar / pulsing icon */}
      <div className="relative flex items-center justify-center w-16 h-16 mb-4">
        <div
          className="absolute inset-0 rounded-full animate-ping opacity-25"
          style={{ backgroundColor: 'var(--primary)' }}
        />
        <div
          className="relative flex items-center justify-center w-14 h-14 rounded-full shadow-lg"
          style={{
            backgroundColor: 'var(--secondary-bg)',
            border: '2px solid var(--primary)',
            color: 'var(--primary)',
          }}
        >
          <FaSpinner className="text-2xl animate-spin" />
        </div>
      </div>

      <h3 className="text-base font-semibold text-white mb-1">{title}</h3>
      
      {/* Dynamic step text */}
      <div
        className="text-sm font-mono font-medium px-4 py-1.5 rounded-full border mt-2 inline-flex items-center gap-2 transition-all"
        style={{
          backgroundColor: 'var(--secondary-bg)',
          borderColor: 'var(--border-color)',
          color: '#c4b5fd', // Light purple
        }}
      >
        <span className="w-2 h-2 rounded-full bg-purple-400 animate-pulse" />
        <span>{LOADING_STEPS[currentStepIndex].text}</span>
      </div>

      {/* Scannable step list */}
      <div className="flex flex-col gap-1.5 mt-6 w-full max-w-sm text-left text-xs">
        {LOADING_STEPS.map((step, idx) => {
          const isDone = idx < currentStepIndex;
          const isCurrent = idx === currentStepIndex;

          return (
            <div
              key={step.text}
              className={`flex items-center justify-between px-3 py-1.5 rounded transition-colors ${
                isCurrent
                  ? 'bg-purple-950/40 text-purple-200 border border-purple-800/40'
                  : isDone
                  ? 'text-gray-400 opacity-60'
                  : 'text-gray-600'
              }`}
            >
              <div className="flex items-center gap-2">
                <span className="text-[10px] font-mono">0{idx + 1}.</span>
                <span>{step.text}</span>
              </div>
              {isDone && <span className="text-emerald-400 text-xs">✓</span>}
              {isCurrent && <span className="w-1.5 h-1.5 rounded-full bg-purple-400 animate-ping" />}
            </div>
          );
        })}
      </div>
    </div>
  );
}
