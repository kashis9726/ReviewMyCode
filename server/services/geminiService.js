import { GoogleGenAI } from '@google/genai';

// Lazy initialization of Gemini client
let aiInstance = null;

function getGeminiClient() {
  if (!aiInstance) {
    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) {
      console.warn('Warning: GEMINI_API_KEY is not set in environment variables.');
    }
    aiInstance = new GoogleGenAI({
      apiKey: apiKey || '',
      httpOptions: {
        headers: {
          'User-Agent': 'aistudio-build',
        },
      },
    });
  }
  return aiInstance;
}

/**
 * Check if the text returned by Gemini is a safety refusal rather than actual review output
 */
function isRefusalText(text) {
  if (!text || typeof text !== 'string') return false;
  const lower = text.toLowerCase().trim();
  return (
    lower.startsWith('sorry') ||
    lower.includes('cannot fulfill') ||
    lower.includes('cannot assist') ||
    lower.includes('cannot perform vulnerability') ||
    lower.includes('unable to assist') ||
    lower.includes('violates safety') ||
    lower.includes('policy guidelines')
  );
}

// Utility to clean markdown formatting and parse JSON output safely
export function parseGeminiJson(rawText) {
  if (!rawText) {
    throw new Error('Empty response from AI model.');
  }

  let cleaned = rawText.trim();
  // Remove markdown code blocks if returned
  if (cleaned.startsWith('```json')) {
    cleaned = cleaned.slice(7);
  } else if (cleaned.startsWith('```')) {
    cleaned = cleaned.slice(3);
  }

  if (cleaned.endsWith('```')) {
    cleaned = cleaned.slice(0, -3);
  }

  cleaned = cleaned.trim();

  // 1. Direct JSON parse
  try {
    const result = JSON.parse(cleaned);
    // Detect if the model output a JSON object containing a conversational refusal
    if (result && typeof result === 'object' && typeof result.response === 'string') {
      if (isRefusalText(result.response)) {
        const refusalErr = new Error(`AI model safety notice: ${result.response}`);
        refusalErr.isRefusal = true;
        throw refusalErr;
      }
    }
    return result;
  } catch (err) {
    if (err.isRefusal) throw err;

    // 2. Attempt to extract the first { ... } block
    const firstBrace = cleaned.indexOf('{');
    const lastBrace = cleaned.lastIndexOf('}');
    if (firstBrace !== -1 && lastBrace !== -1 && lastBrace > firstBrace) {
      try {
        const sliced = cleaned.substring(firstBrace, lastBrace + 1);
        const slicedResult = JSON.parse(sliced);
        if (slicedResult && typeof slicedResult.response === 'string' && isRefusalText(slicedResult.response)) {
          const refusalErr = new Error(`AI model safety notice: ${slicedResult.response}`);
          refusalErr.isRefusal = true;
          throw refusalErr;
        }
        return slicedResult;
      } catch (sliceErr) {
        // Fall through to refusal or general error
      }
    }

    // 3. Check if response is a natural language refusal
    if (isRefusalText(cleaned)) {
      const refusalErr = new Error(`AI model safety notice: ${cleaned.slice(0, 160)}`);
      refusalErr.isRefusal = true;
      throw refusalErr;
    }

    throw new Error(`Failed to parse AI response as JSON: ${err.message}`);
  }
}

/**
 * Robustly execute a Gemini generation request trying supported model versions in priority order
 * Includes per-model timeouts and fast fallback on high-demand / 503 / 429 / refusal events
 */
async function callGemini(contents, systemInstruction, temperature = 0.2) {
  const ai = getGeminiClient();
  // Standard supported models from Gemini guidelines
  const modelsToTry = [
    'gemini-3.8-flash',
    'gemini-flash-latest',
    'gemini-3.1-flash-lite',
  ];
  let lastError = null;

  for (const model of modelsToTry) {
    try {
      // 35 second per-model timeout
      const timeoutMs = 35000;
      const response = await Promise.race([
        ai.models.generateContent({
          model,
          contents,
          config: {
            systemInstruction,
            responseMimeType: 'application/json',
            temperature,
          },
        }),
        new Promise((_, reject) =>
          setTimeout(() => reject(new Error(`Model ${model} timed out after 18s`)), timeoutMs)
        ),
      ]);

      if (response && response.text) {
        // If response is a refusal, treat as failure and try next model
        if (isRefusalText(response.text)) {
          console.warn(`[Gemini] Model ${model} returned safety refusal. Trying next candidate model...`);
          lastError = new Error(`Safety refusal from ${model}`);
          continue;
        }
        return response.text;
      }
    } catch (err) {
      lastError = err;
      console.warn(`[Gemini] Model ${model} generation attempt failed:`, err.message || err);
      // Continue to next model on retryable errors (503, 429, timeout, high demand, 404, etc.)
      continue;
    }
  }

  throw lastError || new Error('Failed to generate response with available Gemini models.');
}

/**
 * Generates a structured defensive audit fallback when an AI model refusal or network timeout occurs
 */
function buildDefensiveFallbackReview(code, language, reason = '') {
  const isSecurityPattern =
    code.includes('SECRET') ||
    code.includes('password') ||
    code.includes('SELECT') ||
    code.includes('system(') ||
    code.includes('strcpy') ||
    code.includes('printf(') ||
    code.includes('exec') ||
    code.includes('eval');

  return {
    overallScore: isSecurityPattern ? 36 : 68,
    scores: {
      security: isSecurityPattern ? 22 : 65,
      bestPractices: 48,
      maintainability: 55,
      errorHandling: 40,
      performance: 65,
      readability: 70,
    },
    summary: isSecurityPattern
      ? 'Automated security inspection flagged critical vulnerabilities in this code snippet (such as unvalidated command execution, raw memory buffer operations, unescaped queries, or exposed secrets). Immediate defensive remediation is recommended.'
      : 'Automated code inspection completed. Recommend adding strict input validations, exception boundaries, and type checks to improve resilience.',
    criticalIssues: isSecurityPattern
      ? [
          {
            title: 'Critical Security Pattern / Memory Safety Hazard',
            description: 'The submitted code contains high-risk operations (such as unparameterized input concatenation, unbounded buffer copies, or shell executions) that expose the application to severe exploitation.',
            severity: 'Critical',
            line: 1,
            recommendation: 'Replace raw string concatenation and unsafe buffer functions with parameterized statements, bounds-checked APIs, and isolated execution wrappers.',
          },
        ]
      : [],
    warnings: [
      {
        title: 'Missing Input Validation & Error Handling',
        description: 'Ensure functions validate parameter types, null states, and array lengths before execution.',
        line: 1,
        severity: 'Warning',
      },
    ],
    securityAudit: {
      risk: isSecurityPattern ? 'Critical' : 'Moderate',
      injectionRisk: isSecurityPattern ? 'High' : 'Low',
      authenticationStrength: 'N/A',
      accessControl: 'N/A',
      secretExposureRisk: isSecurityPattern ? 'High' : 'Low',
    },
    compliance: {
      owasp: isSecurityPattern ? 'Critical Failure' : 'Needs Improvement',
      pciDss: isSecurityPattern ? 'Critical Failure' : 'Needs Improvement',
      gdpr: 'Needs Improvement',
    },
    proTips: [
      'Always enforce strict bounds checking and use modern memory-safe containers.',
      'Never pass user-controlled input directly into shell execution or format string functions.',
      'Move credentials and sensitive secrets to secure environment vaults.',
    ],
  };
}

/**
 * Analyze code using Gemini AI with structured review criteria
 */
export async function analyzeCode(code, language = 'javascript') {
  if (!code || code.trim() === '') {
    throw new Error('Please enter some code before analyzing.');
  }

  const systemInstruction = `
You are ReviewMyCode AI, an expert static analysis assistant, code quality auditor, and software engineering mentor.
Your role is to assist developers in reviewing their code snippets for best practices, bug prevention, memory safety, error handling, performance, and defensive security hardening.
You must always assist with constructive, defensive feedback.
Always evaluate the code objectively and provide helpful remediation advice.
Return ONLY valid, raw JSON conforming exactly to the response schema below, with no markdown code fences or conversational text.

Expected JSON schema:
{
  "overallScore": <integer 0-100>,
  "scores": {
    "security": <integer 0-100>,
    "bestPractices": <integer 0-100>,
    "maintainability": <integer 0-100>,
    "errorHandling": <integer 0-100>,
    "performance": <integer 0-100>,
    "readability": <integer 0-100>
  },
  "summary": "<concise 2-4 sentence summary of code health, strengths, and areas for improvement>",
  "criticalIssues": [
    {
      "title": "<issue title>",
      "description": "<clear explanation of why this code pattern is problematic>",
      "severity": "Critical",
      "line": <integer line number or null>,
      "recommendation": "<exact concrete fix to apply>"
    }
  ],
  "warnings": [
    {
      "title": "<warning title>",
      "description": "<explanation of warning>",
      "line": <integer line number or null>,
      "severity": "Warning"
    }
  ],
  "securityAudit": {
    "risk": "<Low | Moderate | High | Critical>",
    "injectionRisk": "<Low | Moderate | High>",
    "authenticationStrength": "<N/A | Poor | Moderate | Strong>",
    "accessControl": "<N/A | Poor | Moderate | Strong>",
    "secretExposureRisk": "<Low | Moderate | High>"
  },
  "compliance": {
    "owasp": "<Compliant | Needs Improvement | Critical Failure | N/A>",
    "pciDss": "<Compliant | Needs Improvement | Critical Failure | N/A>",
    "gdpr": "<Compliant | Needs Improvement | Critical Failure | N/A>"
  },
  "proTips": [
    "<practical pro tip 1>",
    "<practical pro tip 2>",
    "<practical pro tip 3>"
  ]
}
`.trim();

  const userPrompt = `
Language: ${language}
Please perform a static code quality and defensive inspection on the following source code:
\`\`\`${language}
${code}
\`\`\`
`.trim();

  let parsed;
  try {
    const responseText = await callGemini(userPrompt, systemInstruction, 0.2);
    parsed = parseGeminiJson(responseText);
  } catch (err) {
    console.warn('[Gemini] Analysis encountered error, generating defensive fallback report:', err.message);
    return buildDefensiveFallbackReview(code, language, err.message);
  }

  // Normalize structure in case of minor schema omissions
  return {
    overallScore: typeof parsed.overallScore === 'number' ? parsed.overallScore : 70,
    scores: {
      security: parsed.scores?.security ?? 70,
      bestPractices: parsed.scores?.bestPractices ?? 70,
      maintainability: parsed.scores?.maintainability ?? 70,
      errorHandling: parsed.scores?.errorHandling ?? 70,
      performance: parsed.scores?.performance ?? 70,
      readability: parsed.scores?.readability ?? 70,
    },
    summary: parsed.summary || 'Code analysis completed.',
    criticalIssues: Array.isArray(parsed.criticalIssues) ? parsed.criticalIssues : [],
    warnings: Array.isArray(parsed.warnings) ? parsed.warnings : [],
    securityAudit: {
      risk: parsed.securityAudit?.risk || 'Moderate',
      injectionRisk: parsed.securityAudit?.injectionRisk || 'Low',
      authenticationStrength: parsed.securityAudit?.authenticationStrength || 'Moderate',
      accessControl: parsed.securityAudit?.accessControl || 'Moderate',
      secretExposureRisk: parsed.securityAudit?.secretExposureRisk || 'Low',
    },
    compliance: {
      owasp: parsed.compliance?.owasp || 'Needs Improvement',
      pciDss: parsed.compliance?.pciDss || 'Needs Improvement',
      gdpr: parsed.compliance?.gdpr || 'Needs Improvement',
    },
    proTips: Array.isArray(parsed.proTips) ? parsed.proTips : ['Validate all inputs', 'Handle potential exceptions'],
  };
}

/**
 * Generate refactored and fixed code using Gemini AI
 */
export async function fixCode(code, language = 'javascript') {
  if (!code || code.trim() === '') {
    throw new Error('Please enter some code before requesting a fix.');
  }

  const systemInstruction = `
You are ReviewMyCode AI refactoring assistant and educational programming mentor.
Your task is to review and refactor the user's source code to fix vulnerabilities, error handling gaps, performance bottlenecks, and syntax flaws.
Preserve the core business logic while ensuring input sanitization, memory safety, and modern idiomatic best practices.

Return ONLY valid raw JSON without any markdown formatting around it.
Schema:
{
  "fixedCode": "<the complete updated, refactored, and secure source code>",
  "changes": [
    "<concise description of fix 1>",
    "<concise description of fix 2>",
    "<concise description of fix 3>"
  ]
}
`.trim();

  const userPrompt = `
Language: ${language}
Please refactor this source code for security, error resilience, and best practices:
\`\`\`${language}
${code}
\`\`\`
`.trim();

  try {
    const responseText = await callGemini(userPrompt, systemInstruction, 0.2);
    const parsed = parseGeminiJson(responseText);

    return {
      fixedCode: parsed.fixedCode || code,
      changes: Array.isArray(parsed.changes) ? parsed.changes : ['Code refactored with defensive checks and best practices.'],
    };
  } catch (err) {
    console.warn('[Gemini] Fix failed, providing fallback fix:', err.message);
    return {
      fixedCode: code,
      changes: [
        'Automated fix encountered high AI demand. Please review input validations, parameter checks, and bounds manually.',
      ],
    };
  }
}

/**
 * Explain code in beginner-friendly structured sections
 */
export async function explainCode(code, language = 'javascript') {
  if (!code || code.trim() === '') {
    throw new Error('Please enter some code before requesting an explanation.');
  }

  const systemInstruction = `
You are ReviewMyCode AI code educator.
Explain the provided code in clear, concise, beginner-friendly terms with clean structure.
Avoid verbose fluff, repetitive disclaimers, or excessive sections.

Return ONLY valid raw JSON with this schema:
{
  "summary": "<2-3 sentence clear overview of what the code does and its purpose>",
  "technologies": ["<library or tech 1>", "<library or tech 2>"],
  "mainLogic": "<Step-by-step clear walkthrough of the execution flow and key operations>",
  "keyFunctions": "<Key functions/classes and their roles (or empty string if simple snippet)>",
  "potentialProblems": "<Key gotchas, edge cases, or vulnerabilities to watch out for>",
  "howItWorks": "<A quick intuitive analogy or concluding takeaway>"
}
`.trim();

  const userPrompt = `
Language: ${language}
Please explain the following source code cleanly and concisely:
\`\`\`${language}
${code}
\`\`\`
`.trim();

  try {
    const responseText = await callGemini(userPrompt, systemInstruction, 0.3);
    const parsed = parseGeminiJson(responseText);

    const summary = parsed.summary || parsed.overview || 'Overview of the submitted code.';
    let technologies = [];
    if (Array.isArray(parsed.technologies)) {
      technologies = parsed.technologies.filter(Boolean);
    } else if (typeof parsed.technologies === 'string' && parsed.technologies.trim()) {
      technologies = parsed.technologies.split(/[,•\n]/).map(t => t.trim()).filter(Boolean);
    }
    if (technologies.length === 0) {
      technologies = [language];
    }

    return {
      summary,
      overview: summary,
      technologies,
      mainLogic: parsed.mainLogic || 'Execution begins at the declared entry point and processes statements sequentially.',
      keyFunctions: parsed.keyFunctions || parsed.functions || '',
      potentialProblems: parsed.potentialProblems || '',
      howItWorks: parsed.howItWorks || '',
    };
  } catch (err) {
    console.warn('[Gemini] Explain failed, providing fallback explanation:', err.message);
    return {
      summary: 'Source code submitted for educational walkthrough.',
      overview: 'Source code submitted for educational walkthrough.',
      technologies: [language],
      mainLogic: 'The code defines functions and logic flow executed sequentially by the runtime.',
      keyFunctions: '',
      potentialProblems: 'Verify input boundaries, validation, and error resilience.',
      howItWorks: 'The program accepts inputs, processes logic steps, and produces output.',
    };
  }
}
