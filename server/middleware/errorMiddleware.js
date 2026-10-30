/**
 * Custom 404 Not Found Middleware
 */
export const notFound = (req, res, next) => {
  const error = new Error(`Not Found - ${req.originalUrl}`);
  res.status(404);
  next(error);
};

/**
 * Central Error Handler Middleware
 * Hides internal credentials, raw stack traces, and database internals from clients
 */
export const errorHandler = (err, req, res, next) => {
  const statusCode = res.statusCode === 200 ? 500 : res.statusCode;
  console.error(`[API Error] ${req.method} ${req.originalUrl}:`, err.message);

  let clientMessage = err.message || 'Unable to analyze the code right now. Please try again.';

  // Sanitize specific known errors
  if (err.message?.includes('API_KEY') || err.message?.includes('apiKey')) {
    clientMessage = 'AI Service configuration issue. Please ensure GEMINI_API_KEY is properly set in Settings > Secrets.';
  } else if (err.name === 'ValidationError') {
    clientMessage = 'Invalid data provided for code review.';
  } else if (err.name === 'CastError') {
    clientMessage = 'Invalid review ID format.';
  } else if (err.message?.includes('timeout') || err.message?.includes('timed out')) {
    clientMessage = 'The AI model is experiencing high demand and timed out. Please try again in a few moments.';
  } else if (err.message?.includes('Unexpected token') || err.message?.includes('JSON') || err.message?.includes('parse AI response')) {
    clientMessage = 'The AI analysis service encountered a temporary formatting issue. Please click Analyze Code to retry.';
  }

  res.status(statusCode).json({
    status: 'error',
    message: clientMessage,
  });
};
