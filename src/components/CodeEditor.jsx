import React, { useState, useRef, useEffect } from 'react';
import Editor from '@monaco-editor/react';
import {
  FaTrash,
  FaCopy,
  FaCheck,
  FaCode,
  FaAlignLeft,
  FaUpload,
  FaPaste,
  FaCloudArrowUp,
} from 'react-icons/fa6';
import { useTheme } from '../context/ThemeContext';

// Language identifier mapping for Monaco Editor
export const MONACO_LANGUAGE_MAP = {
  javascript: 'javascript',
  js: 'javascript',
  python: 'python',
  py: 'python',
  cpp: 'cpp',
  'c++': 'cpp',
  c: 'c',
  java: 'java',
  csharp: 'csharp',
  'c#': 'csharp',
  sql: 'sql',
  html: 'html',
  css: 'css',
  json: 'json',
  typescript: 'typescript',
  ts: 'typescript',
};

// File name mapping for tab display
export const LANGUAGE_FILE_NAMES = {
  javascript: 'index.js',
  typescript: 'app.ts',
  python: 'main.py',
  cpp: 'solution.cpp',
  c: 'program.c',
  java: 'Application.java',
  csharp: 'Program.cs',
  sql: 'query.sql',
  html: 'index.html',
  css: 'styles.css',
  json: 'data.json',
};

// Comprehensive sample snippets for all supported languages
export const SAMPLE_CODES = {
  javascript: `// Insecure Express API route with SQL Injection & secret exposure
const express = require('express');
const mysql = require('mysql');
const app = express();

const DB_SECRET_KEY = "SUPER_SECRET_PRODUCTION_KEY_12345"; // Hardcoded secret!

app.post('/api/login', (req, res) => {
  const { username, password } = req.body;
  
  // Vulnerable to SQL Injection! User input directly concatenated
  const query = "SELECT * FROM users WHERE username = '" + username + "' AND password = '" + password + "'";
  
  db.query(query, (err, results) => {
    if (err) {
      // Exposes internal database error and stack trace to client
      return res.status(500).json({ error: err.message, stack: err.stack });
    }
    
    if (results.length > 0) {
      res.json({ success: true, token: DB_SECRET_KEY, user: results[0] });
    } else {
      res.status(401).json({ error: "Invalid credentials" });
    }
  });
});`,

  python: `# Insecure Python endpoint with command injection & weak password hashing
import os
import hashlib
from flask import Flask, request, jsonify

app = Flask(__name__)
API_SECRET = "sk_live_987654321_secret_token"

@app.route('/ping', methods=['POST'])
def ping_server():
    host = request.json.get('host')
    # Critical: Command Injection vulnerability via unchecked shell execution!
    os.system("ping -c 1 " + host)
    return jsonify({"status": "pinged"})

@app.route('/hash', methods=['POST'])
def hash_password():
    pwd = request.json.get('password')
    # Weak MD5 hash without salt or work-factor
    hashed = hashlib.md5(pwd.encode()).hexdigest()
    return jsonify({"hash": hashed})
`,

  cpp: `// Insecure C++ program with Buffer Overflow and Unchecked User Input
#include <iostream>
#include <cstring>
#include <cstdio>

void processUserData(char* userInput) {
    char buffer[32]; // Fixed small buffer
    
    // Critical: Buffer overflow vulnerability! No bounds check
    strcpy(buffer, userInput);
    
    // Format string vulnerability
    printf(buffer);
}

int main(int argc, char* argv[]) {
    if (argc > 1) {
        processUserData(argv[1]);
    }
    return 0;
}`,

  c: `// Insecure C code using deprecated gets() and format string flaw
#include <stdio.h>
#include <stdlib.h>

void readMessage() {
    char message[64];
    printf("Enter message: ");
    // Critical flaw: gets() does not perform bounds checking
    gets(message);
    printf("You entered: ");
    printf(message); // Format string attack
}

int main() {
    readMessage();
    return 0;
}`,

  typescript: `// TypeScript code with missing type validations and direct eval
function executeDynamicCode(userInput: any) {
  // Critical: Arbitrary Code Execution flaw
  const result = eval(userInput.expression);
  return result;
}

export function handleRequest(data: any) {
  if (data) {
    return executeDynamicCode(data);
  }
}`,

  java: `// Vulnerable Java endpoint with unvalidated XML External Entity (XXE)
import javax.xml.parsers.DocumentBuilderFactory;
import javax.xml.parsers.DocumentBuilder;
import org.w3c.dom.Document;
import java.io.StringReader;
import org.xml.sax.InputSource;

public class XMLParser {
    public static void parse(String xmlData) throws Exception {
        // Vulnerable to XXE injection: external entities not disabled
        DocumentBuilderFactory factory = DocumentBuilderFactory.newInstance();
        DocumentBuilder builder = factory.newDocumentBuilder();
        Document doc = builder.parse(new InputSource(new StringReader(xmlData)));
        System.out.println("Parsed root: " + doc.getDocumentElement().getNodeName());
    }
}`,

  sql: `-- Insecure SQL query prone to SQL injection
SELECT id, username, email, password_hash 
FROM users 
WHERE status = 'active' 
  AND department_id = 10 
ORDER BY id DESC;`,

  html: `<!-- Sample HTML template with inline script vulnerability -->
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <title>User Profile</title>
</head>
<body>
  <h1>Welcome, <span id="username"></span></h1>
  <script>
    // Vulnerable to DOM-based XSS
    const name = new URLSearchParams(window.location.search).get('name');
    document.getElementById('username').innerHTML = name;
  </script>
</body>
</html>`,

  css: `/* Modern CSS Reset & Theme Rules */
:root {
  --primary-color: #9333ea;
  --bg-color: #0b0f19;
  --text-main: #f9fafb;
}

body {
  margin: 0;
  padding: 0;
  font-family: system-ui, sans-serif;
  background-color: var(--bg-color);
  color: var(--text-main);
  line-height: 1.6;
}`,

  json: `{
  "projectName": "ReviewMyCode AI",
  "version": "2.0.0",
  "features": [
    "multi-language-analysis",
    "security-audit",
    "auto-fix",
    "beginner-explanation"
  ],
  "securityConfig": {
    "enableOWASPChecks": true,
    "maxPayloadBytes": 1048576
  }
}`,
};

export default function CodeEditor({
  code = '',
  onChange,
  language = 'javascript',
  onLanguageChange,
  readOnly = false,
  height = '500px',
  className = '',
  onFormat,
}) {
  const { theme } = useTheme();
  const isDark = theme === 'dark';

  const [copied, setCopied] = useState(false);
  const [pasted, setPasted] = useState(false);
  const [isDragOver, setIsDragOver] = useState(false);
  const [monacoLoaded, setMonacoLoaded] = useState(false);
  const [editorMode, setEditorMode] = useState('monaco'); // 'monaco' | 'textarea'
  const [cursorPos, setCursorPos] = useState({ line: 1, col: 1 });

  const editorRef = useRef(null);
  const monacoRef = useRef(null);
  const textareaRef = useRef(null);
  const gutterRef = useRef(null);
  const fileInputRef = useRef(null);

  // Normalize language for Monaco
  const monacoLang = MONACO_LANGUAGE_MAP[language.toLowerCase()] || 'javascript';
  const fileName = LANGUAGE_FILE_NAMES[language.toLowerCase()] || `code.${monacoLang}`;

  // Define custom themes for Monaco
  const handleEditorWillMount = (monaco) => {
    monacoRef.current = monaco;

    // 1. Dark Theme
    monaco.editor.defineTheme('vscode-custom-dark', {
      base: 'vs-dark',
      inherit: true,
      rules: [
        { token: 'comment', foreground: '6a737d', fontStyle: 'italic' },
        { token: 'keyword', foreground: 'f97583' },
        { token: 'string', foreground: '9ecbff' },
        { token: 'number', foreground: '79b8ff' },
        { token: 'type', foreground: 'b392f0' },
        { token: 'function', foreground: 'b392f0' },
        { token: 'variable', foreground: 'e1e4e8' },
      ],
      colors: {
        'editor.background': '#0d1117',
        'editor.foreground': '#e6edf3',
        'editorCursor.foreground': '#58a6ff',
        'editor.lineHighlightBackground': '#161b22',
        'editorLineNumber.foreground': '#484f58',
        'editorLineNumber.activeForeground': '#c9d1d9',
        'editor.selectionBackground': '#1f6feb40',
        'editorGutter.background': '#0d1117',
        'editorIndentGuide.background': '#21262d',
        'editorIndentGuide.activeBackground': '#30363d',
      },
    });

    // 2. Light Theme
    monaco.editor.defineTheme('vscode-custom-light', {
      base: 'vs',
      inherit: true,
      rules: [
        { token: 'comment', foreground: '6e7781', fontStyle: 'italic' },
        { token: 'keyword', foreground: 'cf222e' },
        { token: 'string', foreground: '0a3069' },
        { token: 'number', foreground: '0550ae' },
        { token: 'type', foreground: '8250df' },
        { token: 'function', foreground: '8250df' },
        { token: 'variable', foreground: '24292f' },
      ],
      colors: {
        'editor.background': '#ffffff',
        'editor.foreground': '#1f2328',
        'editorCursor.foreground': '#0969da',
        'editor.lineHighlightBackground': '#f6f8fa',
        'editorLineNumber.foreground': '#8c959f',
        'editorLineNumber.activeForeground': '#1f2328',
        'editor.selectionBackground': '#b6e3ff',
        'editorGutter.background': '#ffffff',
        'editorIndentGuide.background': '#d0d7de',
        'editorIndentGuide.activeBackground': '#afb8c1',
      },
    });
  };

  const handleEditorDidMount = (editor, monaco) => {
    editorRef.current = editor;
    monacoRef.current = monaco;
    setMonacoLoaded(true);

    // Track cursor movement for status bar
    editor.onDidChangeCursorPosition((e) => {
      setCursorPos({ line: e.position.lineNumber, col: e.position.column });
    });
  };

  // Sync Monaco theme whenever `theme` changes
  useEffect(() => {
    if (monacoRef.current) {
      monacoRef.current.editor.setTheme(isDark ? 'vscode-custom-dark' : 'vscode-custom-light');
    }
  }, [isDark]);


  const detectLanguageFromFileName = (name) => {
    if (!name) return null;
    const ext = name.split('.').pop()?.toLowerCase();
    switch (ext) {
      case 'js':
      case 'jsx':
      case 'mjs':
      case 'cjs':
        return 'javascript';
      case 'ts':
      case 'tsx':
        return 'typescript';
      case 'py':
        return 'python';
      case 'cpp':
      case 'cc':
      case 'cxx':
      case 'hpp':
        return 'cpp';
      case 'c':
      case 'h':
        return 'c';
      case 'java':
        return 'java';
      case 'cs':
        return 'csharp';
      case 'sql':
        return 'sql';
      case 'html':
      case 'htm':
        return 'html';
      case 'css':
        return 'css';
      case 'json':
        return 'json';
      default:
        return null;
    }
  };

  const handleFileContent = (file) => {
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (e) => {
      const text = e.target?.result;
      if (typeof text === 'string') {
        if (onChange) onChange(text);
        const detected = detectLanguageFromFileName(file.name);
        if (detected && onLanguageChange) {
          onLanguageChange(detected);
        }
      }
    };
    reader.readAsText(file);
  };

  const handleFileUploadClick = () => {
    fileInputRef.current?.click();
  };

  const handleFileInputChange = (e) => {
    const file = e.target.files?.[0];
    if (file) {
      handleFileContent(file);
      e.target.value = '';
    }
  };

  const handlePasteClipboard = async () => {
    try {
      const text = await navigator.clipboard.readText();
      if (text) {
        if (onChange) onChange(text);
        setPasted(true);
        setTimeout(() => setPasted(false), 2000);
      }
    } catch (err) {
      if (editorRef.current) {
        editorRef.current.focus();
      } else if (textareaRef.current) {
        textareaRef.current.focus();
      }
    }
  };

  const handleDragOver = (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (!readOnly) setIsDragOver(true);
  };

  const handleDragLeave = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragOver(false);
  };

  const handleDrop = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragOver(false);
    if (readOnly) return;
    const file = e.dataTransfer?.files?.[0];
    if (file) {
      handleFileContent(file);
    }
  };

  const handleClear = () => {
    if (onChange) onChange('');
  };

  const handleCopy = () => {
    if (!code) return;
    navigator.clipboard.writeText(code);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleFormatCode = () => {
    if (editorRef.current && editorMode === 'monaco') {
      try {
        editorRef.current.getAction('editor.action.formatDocument')?.run();
      } catch (e) {
        // format action fallback
      }
    }
  };

  // Support Tab key in fallback textarea (inserts 2 spaces)
  const handleTextareaKeyDown = (e) => {
    if (e.key === 'Tab') {
      e.preventDefault();
      const start = e.target.selectionStart;
      const end = e.target.selectionEnd;
      const val = e.target.value;
      const newVal = val.substring(0, start) + '  ' + val.substring(end);
      if (onChange) onChange(newVal);
      setTimeout(() => {
        if (textareaRef.current) {
          textareaRef.current.selectionStart = textareaRef.current.selectionEnd = start + 2;
        }
      }, 0);
    }
  };

  // Track cursor position in fallback textarea
  const handleTextareaSelect = (e) => {
    const textBefore = e.target.value.substring(0, e.target.selectionStart);
    const line = textBefore.split('\n').length;
    const lastLine = textBefore.split('\n').pop();
    const col = (lastLine ? lastLine.length : 0) + 1;
    setCursorPos({ line, col });
  };

  // Sync scrolling between gutter and textarea in fallback mode
  const handleTextareaScroll = (e) => {
    if (gutterRef.current) {
      gutterRef.current.scrollTop = e.target.scrollTop;
    }
  };

  const lines = (code || '').split('\n');
  const totalLines = Math.max(lines.length, 1);

  return (
    <div
      id="vs-code-editor"
      className={`flex flex-col rounded-xl border overflow-hidden shadow-xl transition-all w-full h-full relative ${className}`}
      style={{
        backgroundColor: isDark ? '#0d1117' : '#ffffff',
        borderColor: isDark ? '#30363d' : '#d0d7de',
        minHeight: height || '440px',
      }}
      onDragOver={handleDragOver}
      onDragLeave={handleDragLeave}
      onDrop={handleDrop}
    >
      {/* Hidden File Input for uploading code files */}
      <input
        type="file"
        ref={fileInputRef}
        onChange={handleFileInputChange}
        accept=".js,.jsx,.mjs,.cjs,.ts,.tsx,.py,.java,.cpp,.c,.cs,.sql,.html,.css,.json,.txt"
        className="hidden"
        aria-hidden="true"
      />

      {/* Drag & Drop Visual Overlay */}
      {isDragOver && (
        <div className="absolute inset-0 z-30 flex flex-col items-center justify-center bg-purple-950/80 backdrop-blur-xs border-2 border-dashed border-purple-400 rounded-xl text-white gap-2 pointer-events-none">
          <FaCloudArrowUp className="text-3xl text-purple-300 animate-bounce" />
          <span className="text-sm font-semibold">Drop code file to import</span>
          <span className="text-xs text-purple-200">Automatically loads file content into editor</span>
        </div>
      )}

      {/* VS Code Tab Bar Header */}
      <div
        className="flex items-center justify-between px-3 border-b select-none text-xs flex-shrink-0"
        style={{
          backgroundColor: isDark ? '#161b22' : '#f6f8fa',
          borderColor: isDark ? '#30363d' : '#d0d7de',
          height: '42px',
        }}
      >
        {/* Active File Tab */}
        <div className="flex items-center gap-1">
          <div
            className={`flex items-center gap-2 px-3 py-1.5 rounded-t-md font-mono text-xs font-medium border-t-2 border-purple-500 border-x shadow-sm ${
              isDark
                ? 'bg-[#0d1117] text-white border-[#30363d]'
                : 'bg-white text-gray-900 border-[#d0d7de]'
            }`}
          >
            <FaCode className="text-purple-500 text-xs" />
            <span>{fileName}</span>
            <span className="w-1.5 h-1.5 rounded-full bg-purple-500 ml-1" title="Active File" />
          </div>

          <span
            className={`hidden sm:inline-block text-[11px] font-mono px-2 uppercase ${
              isDark ? 'text-gray-500' : 'text-gray-400'
            }`}
          >
            {language}
          </span>
        </div>

        {/* Real User Toolbar Actions */}
        <div className="flex items-center gap-1.5">
          {!readOnly && (
            <>
              <button
                id="editor-upload-file-btn"
                onClick={handleFileUploadClick}
                type="button"
                className={`flex items-center gap-1 px-2.5 py-1 rounded text-xs border transition-colors cursor-pointer ${
                  isDark
                    ? 'text-gray-300 hover:text-white bg-[#21262d] hover:bg-[#30363d] border-[#30363d]'
                    : 'text-gray-700 hover:text-gray-900 bg-white hover:bg-gray-100 border-gray-300'
                }`}
                title="Upload code file (.js, .py, .ts, .cpp, .java, etc.)"
              >
                <FaUpload className="text-[11px]" />
                <span className="hidden sm:inline">Upload</span>
              </button>

              <button
                id="editor-paste-btn"
                onClick={handlePasteClipboard}
                type="button"
                className={`flex items-center gap-1 px-2.5 py-1 rounded text-xs border transition-colors cursor-pointer ${
                  isDark
                    ? 'text-gray-300 hover:text-white bg-[#21262d] hover:bg-[#30363d] border-[#30363d]'
                    : 'text-gray-700 hover:text-gray-900 bg-white hover:bg-gray-100 border-gray-300'
                }`}
                title="Paste code from clipboard"
              >
                {pasted ? <FaCheck className="text-[11px] text-emerald-500" /> : <FaPaste className="text-[11px]" />}
                <span className="hidden sm:inline">{pasted ? 'Pasted' : 'Paste'}</span>
              </button>
            </>
          )}

          {editorMode === 'monaco' && (
            <button
              id="editor-format-btn"
              onClick={handleFormatCode}
              type="button"
              className={`flex items-center gap-1 px-2.5 py-1 rounded text-xs border transition-colors cursor-pointer ${
                isDark
                  ? 'text-gray-300 hover:text-white bg-[#21262d] hover:bg-[#30363d] border-[#30363d]'
                  : 'text-gray-700 hover:text-gray-900 bg-white hover:bg-gray-100 border-gray-300'
              }`}
              title="Auto-format source code"
            >
              <FaAlignLeft className="text-[11px]" />
              <span className="hidden md:inline">Format</span>
            </button>
          )}

          <button
            id="editor-copy-btn"
            onClick={handleCopy}
            type="button"
            className={`flex items-center gap-1 px-2.5 py-1 rounded text-xs border transition-colors cursor-pointer ${
              isDark
                ? 'text-gray-300 hover:text-white bg-[#21262d] hover:bg-[#30363d] border-[#30363d]'
                : 'text-gray-700 hover:text-gray-900 bg-white hover:bg-gray-100 border-gray-300'
            }`}
            title="Copy code to clipboard"
          >
            {copied ? <FaCheck className="text-[11px] text-emerald-500" /> : <FaCopy className="text-[11px]" />}
            <span>{copied ? 'Copied' : 'Copy'}</span>
          </button>

          {!readOnly && (
            <button
              id="editor-clear-btn"
              onClick={handleClear}
              type="button"
              className={`flex items-center gap-1 px-2 py-1 rounded text-xs transition-colors cursor-pointer ${
                isDark
                  ? 'text-gray-400 hover:text-red-400 hover:bg-red-950/40'
                  : 'text-gray-500 hover:text-red-600 hover:bg-red-50'
              }`}
              title="Clear all code"
            >
              <FaTrash className="text-[11px]" />
              <span className="hidden lg:inline">Clear</span>
            </button>
          )}
        </div>
      </div>

      {/* Main Code Editing Canvas */}
      <div
        className="relative flex-1 min-h-0 w-full overflow-hidden"
        style={{
          backgroundColor: isDark ? '#0d1117' : '#ffffff',
        }}
      >
        {editorMode === 'monaco' ? (
          <Editor
            height="100%"
            width="100%"
            language={monacoLang}
            value={code}
            theme={isDark ? 'vscode-custom-dark' : 'vscode-custom-light'}
            beforeMount={handleEditorWillMount}
            onMount={handleEditorDidMount}
            onChange={(val) => {
              if (onChange) onChange(val ?? '');
            }}
            options={{
              readOnly,
              minimap: { enabled: false },
              fontSize: 13,
              lineNumbers: 'on',
              scrollBeyondLastLine: false,
              automaticLayout: true,
              tabSize: 2,
              wordWrap: 'on',
              cursorBlinking: 'smooth',
              cursorSmoothCaretAnimation: 'on',
              renderLineHighlight: 'all',
              fontFamily: "'JetBrains Mono', 'Fira Code', 'Cascadia Code', Consolas, monospace",
              padding: { top: 12, bottom: 12 },
              bracketPairColorization: { enabled: true },
              formatOnPaste: true,
              autoClosingBrackets: 'always',
              suggestOnTriggerCharacters: true,
              smoothScrolling: true,
              mouseWheelScrollSensitivity: 1,
              fastScrollSensitivity: 4,
              scrollbar: {
                vertical: 'visible',
                horizontal: 'visible',
                verticalScrollbarSize: 9,
                horizontalScrollbarSize: 9,
                useShadows: false,
                alwaysConsumeMouseWheel: false,
              },
            }}
            loading={
              /* Fallback while Monaco initializes */
              <div
                className={`flex flex-col items-center justify-center h-full gap-3 text-xs font-mono ${
                  isDark ? 'text-gray-400 bg-[#0d1117]' : 'text-gray-600 bg-white'
                }`}
              >
                <div className="w-6 h-6 border-2 border-purple-500 border-t-transparent rounded-full animate-spin" />
                <span>Launching VS Code Environment...</span>
              </div>
            }
          />
        ) : (
          /* Native Interactive Code Editor */
          <div
            className={`relative flex w-full h-full font-mono overflow-hidden ${
              isDark ? 'bg-[#0d1117]' : 'bg-white'
            }`}
          >
            <div
              ref={gutterRef}
              className={`select-none py-3 px-3 text-right border-r overflow-hidden ${
                isDark
                  ? 'text-gray-500 bg-[#161b22] border-[#30363d]'
                  : 'text-gray-400 bg-gray-50 border-gray-200'
              }`}
              style={{ fontSize: '13px', lineHeight: '1.6', minWidth: '3.4rem' }}
            >
              {Array.from({ length: totalLines }).map((_, i) => (
                <div key={i}>{i + 1}</div>
              ))}
            </div>
            <textarea
              id="code-editor-textarea"
              ref={textareaRef}
              value={code}
              onChange={(e) => onChange && onChange(e.target.value)}
              onKeyDown={handleTextareaKeyDown}
              onSelect={handleTextareaSelect}
              onScroll={handleTextareaScroll}
              readOnly={readOnly}
              placeholder="Write or paste your code here to inspect..."
              spellCheck={false}
              className={`flex-1 w-full h-full p-3 bg-transparent resize-none outline-none leading-[1.6] font-mono ${
                isDark ? 'text-gray-100 selection:bg-purple-900/60' : 'text-gray-900 selection:bg-purple-100'
              }`}
              style={{
                fontSize: '13px',
                fontFamily: "'JetBrains Mono', 'Fira Code', Consolas, monospace",
                tabSize: 2,
              }}
            />
          </div>
        )}
      </div>

      {/* VS Code Bottom Status Bar */}
      <div
        className={`flex items-center justify-between px-3 border-t text-[11px] font-mono select-none ${
          isDark ? 'text-gray-400' : 'text-gray-600'
        }`}
        style={{
          backgroundColor: isDark ? '#161b22' : '#f6f8fa',
          borderColor: isDark ? '#30363d' : '#d0d7de',
          height: '26px',
        }}
      >
        {/* Left: Position & Line Count */}
        <div className="flex items-center gap-4">
          <span className="hover:opacity-80 cursor-pointer">
            Ln {cursorPos.line}, Col {cursorPos.col}
          </span>
          <span className="hidden sm:inline">
            Lines: <strong className={isDark ? 'text-gray-200' : 'text-gray-800'}>{totalLines}</strong>
          </span>
          <span className="hidden md:inline">
            Chars: <strong className={isDark ? 'text-gray-200' : 'text-gray-800'}>{(code || '').length}</strong>
          </span>
        </div>

        {/* Right: Encoding, Indent, Language & Engine Switcher */}
        <div className="flex items-center gap-3">
          <span className="hidden sm:inline">Spaces: 2</span>
          <span className="hidden sm:inline">UTF-8</span>
          <span className="text-purple-600 dark:text-purple-400 uppercase font-semibold">{language}</span>
          <button
            onClick={() => setEditorMode(editorMode === 'monaco' ? 'textarea' : 'monaco')}
            className={`text-[10px] px-1.5 py-0.2 rounded border cursor-pointer ${
              isDark
                ? 'bg-[#21262d] text-gray-300 hover:text-white border-[#30363d]'
                : 'bg-white text-gray-700 hover:text-gray-900 border-gray-300'
            }`}
            title="Toggle between Monaco engine and Native Editor"
          >
            {editorMode === 'monaco' ? 'Monaco' : 'Native'}
          </button>
        </div>
      </div>
    </div>
  );
}
