import crypto from 'crypto';
import { Review } from '../models/Review.js';
import { getIsConnected, readLocalReviews, writeLocalReviews } from '../config/db.js';
import { analyzeCode, fixCode, explainCode } from '../services/geminiService.js';

const MAX_CODE_LENGTH = 75000;

/**
 * POST /api/reviews/analyze
 * Analyze code using Gemini and persist the review
 */
export const analyzeReview = async (req, res, next) => {
  try {
    const { code, language = 'javascript' } = req.body;

    if (!code || typeof code !== 'string' || code.trim() === '') {
      return res.status(400).json({ message: 'Please enter some code before analyzing.' });
    }

    if (code.length > MAX_CODE_LENGTH) {
      return res.status(400).json({
        message: 'Code snippet is too large. Please limit code to 75,000 characters for analysis.',
      });
    }

    // Perform analysis via Gemini Service
    const aiResult = await analyzeCode(code, language);

    const reviewData = {
      code,
      language: language.toLowerCase(),
      overallScore: aiResult.overallScore,
      scores: aiResult.scores,
      summary: aiResult.summary,
      criticalIssues: aiResult.criticalIssues,
      warnings: aiResult.warnings,
      securityAudit: aiResult.securityAudit,
      compliance: aiResult.compliance,
      proTips: aiResult.proTips,
      createdAt: new Date().toISOString(),
    };

    let savedReview;

    if (getIsConnected()) {
      // Persist to MongoDB
      savedReview = await Review.create(reviewData);
    } else {
      // Persist to local storage
      const localReviews = readLocalReviews();
      const id = crypto.randomUUID();
      savedReview = { _id: id, id, ...reviewData };
      localReviews.unshift(savedReview);
      writeLocalReviews(localReviews);
    }

    return res.status(201).json(savedReview);
  } catch (error) {
    next(error);
  }
};

/**
 * POST /api/reviews/fix
 * Generate refactored / fixed code without replacing original without user action
 */
export const fixReview = async (req, res, next) => {
  try {
    const { code, language = 'javascript' } = req.body;

    if (!code || typeof code !== 'string' || code.trim() === '') {
      return res.status(400).json({ message: 'Please enter some code to fix.' });
    }

    if (code.length > MAX_CODE_LENGTH) {
      return res.status(400).json({ message: 'Code snippet is too large to fix in one request.' });
    }

    const fixResult = await fixCode(code, language);
    return res.status(200).json(fixResult);
  } catch (error) {
    next(error);
  }
};

/**
 * POST /api/reviews/explain
 * Generate beginner-friendly multi-section explanation
 */
export const explainReview = async (req, res, next) => {
  try {
    const { code, language = 'javascript' } = req.body;

    if (!code || typeof code !== 'string' || code.trim() === '') {
      return res.status(400).json({ message: 'Please enter some code to explain.' });
    }

    if (code.length > MAX_CODE_LENGTH) {
      return res.status(400).json({ message: 'Code snippet is too large to explain in one request.' });
    }

    const explanation = await explainCode(code, language);
    return res.status(200).json(explanation);
  } catch (error) {
    next(error);
  }
};

/**
 * GET /api/reviews
 * Retrieve all past reviews
 */
export const getReviews = async (req, res, next) => {
  try {
    if (getIsConnected()) {
      const reviews = await Review.find().sort({ createdAt: -1 }).limit(100);
      return res.status(200).json(reviews);
    } else {
      const localReviews = readLocalReviews();
      return res.status(200).json(localReviews);
    }
  } catch (error) {
    next(error);
  }
};

/**
 * GET /api/reviews/:id
 * Retrieve a specific review by ID
 */
export const getReviewById = async (req, res, next) => {
  try {
    const { id } = req.params;

    if (getIsConnected()) {
      const review = await Review.findById(id);
      if (!review) {
        return res.status(404).json({ message: 'Review not found.' });
      }
      return res.status(200).json(review);
    } else {
      const localReviews = readLocalReviews();
      const found = localReviews.find((r) => r._id === id || r.id === id);
      if (!found) {
        return res.status(404).json({ message: 'Review not found.' });
      }
      return res.status(200).json(found);
    }
  } catch (error) {
    next(error);
  }
};

/**
 * DELETE /api/reviews/:id
 * Delete a specific review by ID
 */
export const deleteReview = async (req, res, next) => {
  try {
    const { id } = req.params;

    if (getIsConnected()) {
      const deleted = await Review.findByIdAndDelete(id);
      if (!deleted) {
        return res.status(404).json({ message: 'Review not found.' });
      }
      return res.status(200).json({ message: 'Review deleted successfully.' });
    } else {
      const localReviews = readLocalReviews();
      const filtered = localReviews.filter((r) => r._id !== id && r.id !== id);
      if (filtered.length === localReviews.length) {
        return res.status(404).json({ message: 'Review not found.' });
      }
      writeLocalReviews(filtered);
      return res.status(200).json({ message: 'Review deleted successfully.' });
    }
  } catch (error) {
    next(error);
  }
};
