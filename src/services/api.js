import axios from 'axios';

// Base API instance configured with optional environment variable
const API = axios.create({
  baseURL: import.meta.env.VITE_API_URL || '/api',
  headers: {
    'Content-Type': 'application/json',
  },
  timeout: 90000, // 90s resilient timeout for complex AI reviews
});

/**
 * Check backend health
 */
export const checkHealth = async () => {
  const response = await API.get('/health');
  return response.data;
};

/**
 * POST /api/reviews/analyze
 * Request comprehensive code review from Gemini AI
 */
export const analyzeCode = async (code, language) => {
  const response = await API.post('/reviews/analyze', { code, language });
  return response.data;
};

/**
 * POST /api/reviews/fix
 * Request refactored, secure code from Gemini AI
 */
export const fixCode = async (code, language) => {
  const response = await API.post('/reviews/fix', { code, language });
  return response.data;
};

/**
 * POST /api/reviews/explain
 * Request beginner-friendly multi-section explanation
 */
export const explainCode = async (code, language) => {
  const response = await API.post('/reviews/explain', { code, language });
  return response.data;
};

/**
 * GET /api/reviews
 * Fetch all past reviews
 */
export const getReviews = async () => {
  const response = await API.get('/reviews');
  return response.data;
};

/**
 * GET /api/reviews/:id
 * Fetch a single review by ID
 */
export const getReviewById = async (id) => {
  const response = await API.get(`/reviews/${id}`);
  return response.data;
};

/**
 * DELETE /api/reviews/:id
 * Delete a review from history
 */
export const deleteReview = async (id) => {
  const response = await API.delete(`/reviews/${id}`);
  return response.data;
};

export default API;
