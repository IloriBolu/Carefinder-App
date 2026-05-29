import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "../lib/supabase";

type Review = {
  id: string;
  rating: number;
  review: string;
  approved: boolean;
  created_at: string;
  hospitals: { name: string } | null;
};

export default function Moderation() {
  const [reviews, setReviews] = useState<Review[]>([]);
  const [loading, setLoading] = useState(true);
  const [actionId, setActionId] = useState<string | null>(null);
  const navigate = useNavigate();

  async function fetchReviews() {
    setLoading(true);
    const { data, error } = await supabase
      .from("reviews")
      .select("*, hospitals(name)")
      .eq("approved", false)
      .order("created_at", { ascending: false });

    if (error) { console.error(error); setLoading(false); return; }
    setReviews(data || []);
    setLoading(false);
  }

  useEffect(() => { fetchReviews(); }, []);

  async function approveReview(id: string) {
    setActionId(id);
    const { error } = await supabase.from("reviews").update({ approved: true }).eq("id", id);
    if (error) { console.error(error); setActionId(null); return; }
    setActionId(null);
    fetchReviews();
  }

  async function deleteReview(id: string) {
    setActionId(id);
    const { error } = await supabase.from("reviews").delete().eq("id", id);
    if (error) { console.error(error); setActionId(null); return; }
    setActionId(null);
    fetchReviews();
  }

  function StarRating({ rating }: { rating: number }) {
    return (
      <div className="flex gap-0.5">
        {[1, 2, 3, 4, 5].map((s) => (
          <span key={s} style={{ color: s <= rating ? "#d97706" : "#e6dfd3", fontSize: "14px" }}>★</span>
        ))}
      </div>
    );
  }

  return (
    <div className="flex flex-col min-h-screen" style={{ background: "var(--bg)" }}>

      {/* ── Top bar ── */}
      <header
        className="sticky top-0 z-10 px-6 py-4 flex items-center justify-between"
        style={{ borderBottom: "1px solid var(--border)", background: "var(--bg)" }}
      >
        <div className="flex items-center gap-3">
          <button
            onClick={() => navigate("/admin")}
            className="inline-flex items-center gap-1.5 text-sm transition"
            style={{ color: "var(--accent)" }}
          >
            ← Return to Dashboard
          </button>
          <span style={{ color: "var(--border)" }}>/</span>
          <span className="text-sm font-semibold" style={{ color: "var(--text-h)" }}>Review Moderation</span>
        </div>

        <span
          className="text-xs px-3 py-1 rounded-full"
          style={{
            background: reviews.length > 0 ? "rgba(217,119,6,0.1)" : "var(--accent-bg)",
            border: `1px solid ${reviews.length > 0 ? "rgba(217,119,6,0.3)" : "var(--accent-border)"}`,
            color: reviews.length > 0 ? "#d97706" : "var(--accent)",
          }}
        >
          {loading ? "…" : `${reviews.length} pending`}
        </span>
      </header>

      {/* ── Content ── */}
      <main className="flex-1 max-w-3xl w-full mx-auto px-6 py-8">

        {loading ? (
          /* Skeleton */
          <div className="flex flex-col gap-4">
            {[1, 2, 3].map((i) => (
              <div key={i} className="rounded-2xl p-5 animate-pulse"
                style={{ background: "var(--code-bg)", border: "1px solid var(--border)" }}>
                <div className="h-4 rounded w-1/3 mb-3" style={{ background: "var(--border)" }} />
                <div className="h-3 rounded w-full mb-2" style={{ background: "var(--border)" }} />
                <div className="h-3 rounded w-2/3" style={{ background: "var(--border)" }} />
              </div>
            ))}
          </div>
        ) : reviews.length === 0 ? (
          /* Empty state */
          <div className="flex flex-col items-center justify-center py-24 gap-3">
            <span className="text-5xl">✅</span>
            <p className="text-base font-medium" style={{ color: "var(--text-h)" }}>All caught up</p>
            <p className="text-sm" style={{ color: "var(--text)" }}>No reviews pending moderation.</p>
          </div>
        ) : (
          /* Review cards */
          <div className="flex flex-col gap-4">
            {reviews.map((review) => {
              const busy = actionId === review.id;
              return (
                <div
                  key={review.id}
                  className="rounded-2xl p-5"
                  style={{
                    background: "var(--code-bg)",
                    border: "1px solid var(--border)",
                    opacity: busy ? 0.6 : 1,
                    transition: "opacity 0.2s",
                  }}
                >
                  {/* Hospital name + date */}
                  <div className="flex items-start justify-between gap-4 mb-3">
                    <div>
                      <p className="text-sm font-semibold" style={{ color: "var(--text-h)" }}>
                        {review.hospitals?.name ?? "Unknown Hospital"}
                      </p>
                      <p className="text-xs mt-0.5" style={{ color: "var(--text)" }}>
                        {new Date(review.created_at).toLocaleDateString("en-GB", {
                          day: "numeric", month: "short", year: "numeric",
                        })}
                      </p>
                    </div>
                    <StarRating rating={review.rating} />
                  </div>

                  {/* Review text */}
                  <p className="text-sm leading-relaxed mb-4" style={{ color: "var(--text)" }}>
                    {review.review || <span style={{ opacity: 0.5 }}>No written review.</span>}
                  </p>

                  {/* Actions */}
                  <div className="flex gap-2">
                    <button
                      onClick={() => approveReview(review.id)}
                      disabled={busy}
                      className="text-xs px-4 py-2 rounded-lg font-medium transition"
                      style={{
                        background: "rgba(22,163,74,0.1)",
                        border: "1px solid rgba(22,163,74,0.3)",
                        color: "#16a34a",
                        cursor: busy ? "not-allowed" : "pointer",
                      }}
                    >
                      {busy ? "…" : "✓ Approve"}
                    </button>
                    <button
                      onClick={() => deleteReview(review.id)}
                      disabled={busy}
                      className="text-xs px-4 py-2 rounded-lg font-medium transition"
                      style={{
                        background: "rgba(229,62,62,0.08)",
                        border: "1px solid rgba(229,62,62,0.2)",
                        color: "#c53030",
                        cursor: busy ? "not-allowed" : "pointer",
                      }}
                    >
                      {busy ? "…" : "🗑 Delete"}
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </main>
    </div>
  );
}
