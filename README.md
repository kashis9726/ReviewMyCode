# ReviewMyCode AI

An enterprise-grade, beginner-friendly **AI Code Reviewer & Security Auditor** built with the **MERN** stack (MongoDB, Express, React, Node.js) and powered by **Google Gemini AI**.

---

## 1. Project Overview

**ReviewMyCode AI** provides automated, multi-dimensional code reviews for modern development teams. Developers can paste or type source code across 9+ programming languages into a Monaco-powered developer environment and receive instant, comprehensive quality metrics, security audits, OWASP/PCI-DSS compliance assessments, line-specific vulnerability highlights, automated code refactoring, and structured architectural explanations.

---

## 2. Features

- **Multi-Language Monaco Editor**: Built with VS Code's Monaco engine supporting JavaScript, Python, Java, C, C++, C#, SQL, HTML, and CSS with syntax highlighting and line numbers.
- **Deep Security Audit**: Detects SQL injections, secret leaks, unvalidated inputs, remote code execution risks, and OWASP Top 10 vulnerabilities.
- **Dimensional Score Cards**: Calculates an overall score (0–100) alongside individual scores for Security, Best Practices, Maintainability, Error Handling, Performance, and Readability.
- **Automated Fix Code**: Refactors problematic code into secure, production-ready code with actionable change logs, code comparison, clipboard copy, file download, and one-click replacement.
- **Beginner-Friendly Code Explanations**: Breaks code down into 8 easy-to-understand sections: Overview, Technologies, Setup, Main Logic, Database, Functions, Potential Problems, and How It Works.
- **Persistent Review History**: Saves past audits and scores to MongoDB (or local storage fallback), allowing quick retrieval, re-inspection, and deletion.
- **Modern Dark Developer Theme**: High-contrast, accessibility-compliant developer UI styled with custom CSS variables and responsive design.

---

## 3. Tech Stack

### Frontend
- **React.js (v19)**
- **Vite**
- **JavaScript (ES6+)**
- **Monaco Editor (`@monaco-editor/react`)**
- **Axios**
- **React Icons**
- **Tailwind CSS**

### Backend
- **Node.js**
- **Express.js**
- **Axios**
- **CORS & Dotenv**

### Database
- **MongoDB**
- **Mongoose** (with graceful local persistence fallback)

### AI
- **Google Gemini API (`@google/genai`)** with `gemini-3.8-flash`

---

## 4. Folder Structure

```text
ai-code-reviewer/
│
├── server/
│   ├── config/
│   │   └── db.js                 # MongoDB connection & local JSON fallback
│   ├── controllers/
│   │   └── reviewController.js   # Route handler logic for reviews, fixes & explanations
│   ├── middleware/
│   │   └── errorMiddleware.js    # Sanitized error handler and 404 handler
│   ├── models/
│   │   └── Review.js             # Mongoose Review schema
│   ├── routes/
│   │   └── reviewRoutes.js       # Express routes for /api/reviews
│   ├── services/
│   │   └── geminiService.js      # Google Gemini AI prompts & response parsers
│   └── server.js                 # Express server entry point
│
├── src/                          # Frontend Application
│   ├── components/
│   │   ├── CodeEditor.jsx        # Monaco code editor with sample loader
│   │   ├── IssueCard.jsx         # Critical vulnerabilities & warnings
│   │   ├── LanguageSelector.jsx  # Multi-language selector dropdown
│   │   ├── Loading.jsx           # Multi-stage animated loading state
│   │   ├── Navbar.jsx            # Top navigation & review counter
│   │   ├── ReviewButton.jsx      # Action trigger buttons
│   │   ├── ReviewSummary.jsx     # Executive summary & compliance grid
│   │   └── ScoreCard.jsx         # Circular overall score & metric bars
│   ├── pages/
│   │   ├── History.jsx           # Historical review list with view/delete
│   │   └── Home.jsx              # Main review workspace & tabs
│   ├── services/
│   │   └── api.js                # Axios client communication layer
│   ├── App.jsx                   # Main React layout
│   ├── index.css                 # Dark theme CSS variables
│   └── main.tsx                  # React DOM entry
│
├── index.html                    # Single-page HTML entry point
├── metadata.json                 # AI Studio configuration
├── package.json                  # Dependencies & scripts
└── README.md
```

---

## 5. Installation

1. Clone or download the repository:
   ```bash
   git clone <repository-url>
   cd ai-code-reviewer
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

---

## 6. Environment Variables (Zero-Config)

No database configuration or setup is needed. The application automatically initializes and manages persistent storage out-of-the-box.

The only required variable is:
```env
# Google Gemini API key (automatically injected in AI Studio)
GEMINI_API_KEY=your_gemini_api_key_here
```

---

## 7. How to Run Frontend & Backend

### Development Mode (Unified Full-Stack)
Run the Vite development server on port `3000` with the embedded Express API middleware:

```bash
npm run dev
```

The application is now accessible at `http://localhost:3000` (or the AI Studio development URL).

### Standalone Backend Server (Optional)
To run Express independently on port `5000`:

```bash
node server/server.js
```

---

## 8. API Endpoints

| Method | Endpoint | Description | Request Body |
| :--- | :--- | :--- | :--- |
| `POST` | `/api/reviews/analyze` | Analyzes code with Gemini AI & saves review | `{ code: string, language: string }` |
| `POST` | `/api/reviews/fix` | Returns refactored secure code & changes list | `{ code: string, language: string }` |
| `POST` | `/api/reviews/explain` | Returns 8 beginner-friendly explanation sections | `{ code: string, language: string }` |
| `GET` | `/api/reviews` | Retrieves all historical code reviews | None |
| `GET` | `/api/reviews/:id` | Retrieves a single review by ID | None |
| `DELETE` | `/api/reviews/:id` | Deletes a historical review | None |
| `GET` | `/api/health` | Backend status and Gemini configuration check | None |

---

## 9. Screenshots & UI Previews

- **Dark Developer Dashboard**: High-contrast layout with `--bg-color: #0b0f19` and purple accent `--primary: #7c3aed`.
- **Score Visualization**: SVG circular gauge showing overall score (0–100) with color-coded breakdown bars for Security, Best Practices, Maintainability, Error Handling, Performance, and Readability.
- **Fix Code Comparison**: Dual-state viewer with diff bullet points, copy, download, and instant code substitution.
- **History Page**: Scannable review archive with language tags, score pills, formatted timestamps, and one-click reload.

---

## 10. Future Improvements

1. **GitHub PR Webhook Integration**: Automatic code reviews on pull requests.
2. **Side-by-Side Monaco Diff Editor**: Visual side-by-side git-style diffing for the Fix Code feature.
3. **Custom Review Guidelines**: User-defined linting and company-specific architectural rules.
4. **PDF / Markdown Export**: Download complete security audit reports for compliance records.
