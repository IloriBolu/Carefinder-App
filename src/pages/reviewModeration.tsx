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

// Fixed: Moved helper component outside parent to prevent re-creation lag
function StarRating({ rating }: { rating: number }) {
  return (
    <div className="flex gap-0.5 text-sm">
      {[1, 2, 3, 4, 5].map((star) => (
        <span 
          key={star} 
          style={{ color: star <= rating ? "#d97706" : "#e6dfd3" }}
        >
          ★
        </span>
      ))}
    </div>
  );
}

export default function Moderation() {
  const navigate = useNavigate();
  
  // State Management
  const [reviews, setReviews] = useState<Review[]>([]);
  const [loading, setLoading] = useState(true);
  const [processingId, setProcessingId] = useState<string | null>(null);

  async function fetchReviews() {
    setLoading(true);
    const { data, error } = await supabase
      .from("reviews")
      .select("*, hospitals(name)")
      .eq("approved", false)
      .order("created_at", { ascending: false });

    if (error) {
      console.error("Error fetching reviews:", error);
    } else {
      setReviews(data || []);
    }
    setLoading(false);
  }

  useEffect(() => {
    fetchReviews();
  }, []);

  async function handleModeration(id: string, action: "approve" | "delete") {
    setProcessingId(id);
    
    const query = action === "approve" 
      ? supabase.from("reviews").update({ approved: true }).eq("id", id)
      : supabase.from("reviews").delete().eq("id", id);

    const { error } = await query;

    if (error) {
      console.error(`Failed to ${action} review:`, error);
      alert(`Could not complete action. Please try again.`);
    } else {
      // Optimistically remove the review from state without making a second database trip
      setReviews((prev) => prev.filter((review) => review.id !== id));
    }
    
    setProcessingId(null);
  }

  return (
    <div className="flex flex-col min-h-screen" style={{ background: "var(--bg)" }}>

      {/* Header Room */}
      <header
        className="sticky top-0 z-10 px-6 py-4 flex items-center justify-between"
        style={{ borderBottom: "1px solid var(--border)", background: "var(--bg)" }}
      >
        <div className="flex items-center gap-3">
          <button
            onClick={() => navigate("/admin")}
            className="text-sm transition hover:opacity-80"
            style={{ color: "var(--accent)" }}
          >
            ← Return to Dashboard
          </button>
          <span style={{ color: "var(--border)" }}>/</span>
          <span className="text-sm font-semibold" style={{ color: "var(--text-h)" }}>Review Moderation</span>
        </div>

        <span
          className="text-xs px-3 py-1 rounded-full font-medium"
          style={{
            background: reviews.length ? "rgba(217,119,6,0.1)" : "var(--accent-bg)",
            border: `1px solid ${reviews.length ? "rgba(217,119,6,0.3)" : "var(--accent-border)"}`,
            color: reviews.length ? "#d97706" : "var(--accent)",
          }}
        >
          {loading ? "Loading…" : `${reviews.length} pending`}
        </span>
      </header>

      {/* Main Container Workspace */}
      <main className="flex-1 max-w-3xl w-full mx-auto px-6 py-8">
        {loading ? (
          <div className="flex flex-col gap-4">
            {[1, 2, 3].map((i) => (
              <div 
                key={i} 
                className="rounded-2xl p-5 animate-pulse"
                style={{ background: "var(--code-bg)", border: "1px solid var(--border)" }}
              >
                <div className="h-4 rounded w-1/3 mb-3" style={{ background: "var(--border)" }} />
                <div className="h-3 rounded w-full mb-2" style={{ background: "var(--border)" }} />
                <div className="h-3 rounded w-2/3" style={{ background: "var(--border)" }} />
              </div>
            ))}
          </div>
        ) : reviews.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-24 gap-3">
            <span className="text-5xl">✅</span>
            <p className="text-base font-medium" style={{ color: "var(--text-h)" }}>All caught up</p>
            <p className="text-sm" style={{ color: "var(--text)" }}>No reviews pending moderation.</p>
          </div>
        ) : (
          <div className="flex flex-col gap-4">
            {reviews.map((item) => {
              const isBusy = processingId === item.id;
              return (
                <div
                  key={item.id}
                  className="rounded-2xl p-5 transition-opacity duration-200"
                  style={{
                    background: "var(--code-bg)",
                    border: "1px solid var(--border)",
                    opacity: isBusy ? 0.5 : 1,
                  }}
                >
                  <div className="flex items-start justify-between gap-4 mb-3">
                    <div>
                      <h3 className="text-sm font-semibold" style={{ color: "var(--text-h)" }}>
                        {item.hospitals?.name || "Unknown Hospital"}
                      </h3>
                      <p className="text-xs mt-0.5" style={{ color: "var(--text)" }}>
                        {new Date(item.created_at).toLocaleDateString("en-GB", {
                          day: "numeric", month: "short", year: "numeric",
                        })}
                      </p>
                    </div>
                    <StarRating rating={item.rating} />
                  </div>

                  <p className="text-sm leading-relaxed mb-4" style={{ color: "var(--text)" }}>
                    {item.review || <span className="italic opacity-50">No written review.</span>}
                  </p>

                  <div className="flex gap-2">
                    <button
                      onClick={() => handleModeration(item.id, "approve")}
                      disabled={isBusy}
                      className="text-xs px-4 py-2 rounded-lg font-medium transition disabled:cursor-not-allowed"
                      style={{
                        background: "rgba(22,163,74,0.1)",
                        border: "1px solid rgba(22,163,74,0.3)",
                        color: "#16a34a",
                      }}
                    >
                      {isBusy ? "Processing..." : "✓ Approve"}
                    </button>
                    <button
                      onClick={() => handleModeration(item.id, "delete")}
                      disabled={isBusy}
                      className="text-xs px-4 py-2 rounded-lg font-medium transition disabled:cursor-not-allowed"
                      style={{
                        background: "rgba(229,62,62,0.08)",
                        border: "1px solid rgba(229,62,62,0.2)",
                        color: "#c53030",
                      }}
                    >
                      {isBusy ? "Processing..." : "🗑 Delete"}
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