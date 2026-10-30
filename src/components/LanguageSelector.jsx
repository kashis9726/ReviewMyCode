import React from 'react';
import { FaCode } from 'react-icons/fa6';
import { useTheme } from '../context/ThemeContext';

export const SUPPORTED_LANGUAGES = [
  { id: 'javascript', label: 'JavaScript', monacoId: 'javascript', ext: '.js' },
  { id: 'typescript', label: 'TypeScript', monacoId: 'typescript', ext: '.ts' },
  { id: 'python', label: 'Python', monacoId: 'python', ext: '.py' },
  { id: 'java', label: 'Java', monacoId: 'java', ext: '.java' },
  { id: 'c', label: 'C', monacoId: 'c', ext: '.c' },
  { id: 'cpp', label: 'C++', monacoId: 'cpp', ext: '.cpp' },
  { id: 'csharp', label: 'C#', monacoId: 'csharp', ext: '.cs' },
  { id: 'sql', label: 'SQL', monacoId: 'sql', ext: '.sql' },
  { id: 'html', label: 'HTML', monacoId: 'html', ext: '.html' },
  { id: 'css', label: 'CSS', monacoId: 'css', ext: '.css' },
  { id: 'json', label: 'JSON', monacoId: 'json', ext: '.json' },
];

export default function LanguageSelector({ selectedLanguage, onSelectLanguage }) {
  const { theme } = useTheme();
  const isDark = theme === 'dark';

  return (
    <div className="flex items-center gap-2">
      <div className="relative flex items-center">
        <div className="pointer-events-none absolute left-2.5 flex items-center text-purple-400">
          <FaCode className="text-xs" />
        </div>
        <select
          id="language-select"
          value={selectedLanguage}
          onChange={(e) => onSelectLanguage(e.target.value)}
          className="appearance-none text-xs font-mono font-semibold pl-7 pr-8 py-1.5 rounded-lg border transition-all cursor-pointer outline-none focus:ring-2 focus:ring-purple-500/50 shadow-sm"
          style={{
            backgroundColor: 'var(--input-bg)',
            borderColor: 'var(--border-color)',
            color: 'var(--text-main)',
          }}
          aria-label="Select Programming Language"
        >
          {SUPPORTED_LANGUAGES.map((lang) => (
            <option
              key={lang.id}
              value={lang.id}
              style={{
                backgroundColor: isDark ? '#161b22' : '#ffffff',
                color: isDark ? '#f0f6fc' : '#1f2328',
              }}
            >
              {lang.label} ({lang.ext})
            </option>
          ))}
        </select>
        <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-2.5 text-gray-400">
          <svg className="w-3.5 h-3.5 fill-current" viewBox="0 0 20 20">
            <path d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" />
          </svg>
        </div>
      </div>
    </div>
  );
}

