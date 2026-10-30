import express from 'express';
import {
  analyzeReview,
  fixReview,
  explainReview,
  getReviews,
  getReviewById,
  deleteReview,
} from '../controllers/reviewController.js';

const router = express.Router();

// Analyze, Fix, Explain
router.post('/analyze', analyzeReview);
router.post('/fix', fixReview);
router.post('/explain', explainReview);

// CRUD for review history
router.get('/', getReviews);
router.get('/:id', getReviewById);
router.delete('/:id', deleteReview);

export default router;
