import React, { useEffect, useState } from 'react';
import { getReviews, deleteReview } from '../services/api';
import { FaTrash, FaEye, FaCode, FaCalendarDays, FaSpinner, FaTriangleExclamation } from 'react-icons/fa6';

export default function History({ onSelectReview, onReviewsUpdated }) {
  const [reviews, setReviews] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [deletingId, setDeletingId] = useState(null);

  const fetchHistory = async () => {
    setLoading(true);
    setError('');
    try {
      const data = await getReviews();
      setReviews(Array.isArray(data) ? data : []);
      if (onReviewsUpdated) {
        onReviewsUpdated(data?.length || 0);
      }
    } catch (err) {
      console.error('Failed to load history:', err);
      setError('Unable to load review history right now. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchHistory();
  }, []);

  const handleDelete = async (id, e) => {
    e.stopPropagation();
    if (!window.confirm('Are you sure you want to delete this code review?')) {
      return;
    }

    setDeletingId(id);
    try {
      await deleteReview(id);
      const updated = reviews.filter((r) => (r._id || r.id) !== id);
      setReviews(updated);
      if (onReviewsUpdated) {
        onReviewsUpdated(updated.length);
      }
    } catch (err) {
      console.error('Failed to delete review:', err);
      alert('Failed to delete review. Please try again.');
    } finally {
      setDeletingId(null);
    }
  };

  const formatDate = (isoString) => {
    if (!isoString) return 'Recent';
    try {
      const d = new Date(isoString);
      return d.toLocaleDateString(undefined, {
        month: 'short',
        day: 'numeric',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
      });
    } catch (e) {
      return isoString;
    }
  };

  const getScoreBadge = (score) => {
    if (score >= 80) return 'bg-emerald-950/60 border-emerald-800 text-emerald-400';
    if (score >= 60) return 'bg-yellow-950/60 border-yellow-800 text-yellow-400';
    return 'bg-red-950/60 border-red-800 text-red-400';
  };

  return (
    <div id="history-page-container" className="flex flex-col gap-6 max-w-7xl mx-auto w-full pb-16">
      {/* Header */}
      <div
        className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-6 rounded-xl border"
        style={{
          backgroundColor: 'var(--card-bg)',
          borderColor: 'var(--border-color)',
        }}
      >
        <div>
          <h2 className="text-xl font-bold tracking-tight" style={{ color: 'var(--text-main)' }}>
            Review History
          </h2>
          <p className="text-xs mt-1" style={{ color: 'var(--text-gray)' }}>
            Persisted code audit reports, security scores, and findings.
          </p>
        </div>

        <button
          id="refresh-history-btn"
          onClick={fetchHistory}
          disabled={loading}
          className="flex items-center gap-2 px-3.5 py-1.5 rounded-lg text-xs font-medium border transition-colors cursor-pointer"
          style={{
            borderColor: 'var(--border-color)',
            color: 'var(--text-main)',
            backgroundColor: 'var(--secondary-bg)',
          }}
        >
          {loading ? <FaSpinner className="animate-spin text-xs" /> : <span>Refresh List</span>}
        </button>
      </div>

      {/* Error state */}
      {error && (
        <div className="flex items-center gap-3 p-4 rounded-xl bg-red-950/40 border border-red-800/60 text-red-300 text-sm">
          <FaTriangleExclamation className="text-red-400 flex-shrink-0" />
          <span>{error}</span>
        </div>
      )}

      {/* Loading state */}
      {loading && (
        <div className="flex flex-col items-center justify-center p-12 text-sm" style={{ color: 'var(--text-gray)' }}>
          <FaSpinner className="animate-spin text-2xl text-purple-500 mb-3" />
          <span>Loading historical reviews...</span>
        </div>
      )}

      {/* Empty state */}
      {!loading && !error && reviews.length === 0 && (
        <div
          id="empty-history-state"
          className="flex flex-col items-center justify-center p-12 rounded-xl border text-center"
          style={{
            backgroundColor: 'var(--card-bg)',
            borderColor: 'var(--border-color)',
          }}
        >
          <div
            className="w-12 h-12 rounded-full flex items-center justify-center mb-4"
            style={{ backgroundColor: 'var(--secondary-bg)', color: 'var(--primary)' }}
          >
            <FaCode className="text-xl" />
          </div>
          <h3 className="text-base font-semibold mb-1" style={{ color: 'var(--text-main)' }}>
            No Reviews Saved Yet
          </h3>
          <p className="text-xs max-w-sm" style={{ color: 'var(--text-gray)' }}>
            When you analyze code snippets in the Editor, each review and security audit will be saved
            here automatically.
          </p>
        </div>
      )}

      {/* List of Reviews */}
      {!loading && reviews.length > 0 && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {reviews.map((rev) => {
            const reviewId = rev._id || rev.id;
            const isDeleting = deletingId === reviewId;

            return (
              <div
                key={reviewId}
                id={`history-item-${reviewId}`}
                className="p-5 rounded-xl border flex flex-col justify-between transition-all hover:shadow-lg"
                style={{
                  backgroundColor: 'var(--card-bg)',
                  borderColor: 'var(--border-color)',
                }}
              >
                <div>
                  <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center gap-2">
                      <span
                        className="text-xs font-mono font-bold uppercase px-2.5 py-0.5 rounded border"
                        style={{
                          backgroundColor: 'var(--secondary-bg)',
                          borderColor: 'var(--border-color)',
                          color: 'var(--primary)',
                        }}
                      >
                        {rev.language || 'Code'}
                      </span>
                      <span
                        className={`text-xs font-mono font-bold px-2 py-0.5 rounded border ${getScoreBadge(
                          rev.overallScore || 0
                        )}`}
                      >
                        Score: {rev.overallScore ?? 0}/100
                      </span>
                    </div>

                    <div className="flex items-center gap-1.5 text-xs" style={{ color: 'var(--text-gray)' }}>
                      <FaCalendarDays className="text-[10px]" />
                      <span>{formatDate(rev.createdAt)}</span>
                    </div>
                  </div>

                  {/* Summary preview */}
                  <p className="text-xs line-clamp-2 leading-relaxed mb-4" style={{ color: 'var(--text-main)' }}>
                    {rev.summary || 'Code analysis record.'}
                  </p>

                  {/* Quick badges */}
                  <div className="flex items-center gap-2 text-[11px] font-mono mb-4" style={{ color: 'var(--text-gray)' }}>
                    <span>Critical: {rev.criticalIssues?.length || 0}</span>
                    <span>•</span>
                    <span>Warnings: {rev.warnings?.length || 0}</span>
                    <span>•</span>
                    <span>Risk: {rev.securityAudit?.risk || 'Moderate'}</span>
                  </div>
                </div>

                {/* Actions */}
                <div
                  className="flex items-center justify-between pt-3 border-t"
                  style={{ borderColor: 'var(--border-color)' }}
                >
                  <button
                    id={`view-review-${reviewId}`}
                    onClick={() => onSelectReview(rev)}
                    className="flex items-center gap-1.5 px-3 py-1.5 rounded text-xs font-semibold text-white transition-colors cursor-pointer shadow-sm hover:opacity-90"
                    style={{ backgroundColor: 'var(--primary)' }}
                  >
                    <FaEye className="text-xs" />
                    <span>View Review</span>
                  </button>

                  <button
                    id={`delete-review-${reviewId}`}
                    onClick={(e) => handleDelete(reviewId, e)}
                    disabled={isDeleting}
                    className="flex items-center gap-1.5 px-3 py-1.5 rounded text-xs font-medium hover:text-red-500 hover:bg-red-500/10 transition-colors border border-transparent cursor-pointer"
                    style={{ color: 'var(--text-gray)' }}
                  >
                    {isDeleting ? (
                      <FaSpinner className="animate-spin text-xs" />
                    ) : (
                      <FaTrash className="text-xs" />
                    )}
                    <span>Delete</span>
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
