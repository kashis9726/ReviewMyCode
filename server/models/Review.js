import mongoose from 'mongoose';

const ReviewSchema = new mongoose.Schema(
  {
    code: {
      type: String,
      required: true,
    },
    language: {
      type: String,
      required: true,
      default: 'javascript',
    },
    overallScore: {
      type: Number,
      required: true,
      min: 0,
      max: 100,
    },
    scores: {
      security: { type: Number, default: 0 },
      bestPractices: { type: Number, default: 0 },
      maintainability: { type: Number, default: 0 },
      errorHandling: { type: Number, default: 0 },
      performance: { type: Number, default: 0 },
      readability: { type: Number, default: 0 },
    },
    summary: {
      type: String,
      required: true,
    },
    criticalIssues: [
      {
        title: { type: String, required: true },
        description: { type: String, required: true },
        severity: { type: String, default: 'Critical' },
        line: { type: Number, default: null },
        recommendation: { type: String, default: '' },
      },
    ],
    warnings: [
      {
        title: { type: String, required: true },
        description: { type: String, required: true },
        line: { type: Number, default: null },
        severity: { type: String, default: 'Warning' },
      },
    ],
    securityAudit: {
      risk: { type: String, default: 'Moderate' },
      injectionRisk: { type: String, default: 'Low' },
      authenticationStrength: { type: String, default: 'Moderate' },
      accessControl: { type: String, default: 'Moderate' },
      secretExposureRisk: { type: String, default: 'Low' },
    },
    compliance: {
      owasp: { type: String, default: 'Needs Review' },
      pciDss: { type: String, default: 'Needs Review' },
      gdpr: { type: String, default: 'Needs Review' },
    },
    proTips: [
      {
        type: String,
      },
    ],
    createdAt: {
      type: Date,
      default: Date.now,
    },
  },
  {
    timestamps: true,
  }
);

export const Review = mongoose.models.Review || mongoose.model('Review', ReviewSchema);
export default Review;
