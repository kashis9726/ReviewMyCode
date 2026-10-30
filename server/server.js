import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import { connectDB } from './config/db.js';
import reviewRoutes from './routes/reviewRoutes.js';
import { notFound, errorHandler } from './middleware/errorMiddleware.js';

// Load environment variables
dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;

// Connect to MongoDB (or fallback to local file store gracefully)
connectDB();

// CORS configuration - supports local dev and Cloud Run reverse proxy
app.use(
  cors({
    origin: '*',
    methods: ['GET', 'POST', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization'],
  })
);

// Body parser
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Health check endpoint
app.get('/api/health', (req, res) => {
  res.status(200).json({
    status: 'success',
    app: 'ReviewMyCode AI Server',
    geminiConfigured: !!process.env.GEMINI_API_KEY,
  });
});

// Mount Review routes
app.use('/api/reviews', reviewRoutes);

// Error handling middleware
app.use(notFound);
app.use(errorHandler);

// Start server when executed directly from CLI (e.g. node server/server.js)
const isDirectlyExecuted =
  process.argv[1] &&
  (process.argv[1].endsWith('server.js') || process.argv[1].endsWith('server.ts'));

if (isDirectlyExecuted && !process.env.VITE_EMBEDDED) {
  app.listen(PORT, () => {
    console.log(`🚀 ReviewMyCode AI backend running on http://localhost:${PORT}`);
  });
}

export default app;
