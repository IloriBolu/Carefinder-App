import { useEffect, useState, useCallback } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { supabase } from "../lib/supabase";

type Hospital = {
  id: string;
  name: string;
  city: string;
  lga: string;
  address: string;
  latitude: number | null;
  longitude: number | null;
  description: string | null;
  rating: string | null;
  phone: string | null;
};

type ReviewData = {
  id: string;
  hospital_id: string;
  user_id: string;
  rating: number;
  review: string;
  approved: boolean;
};

// Extracted Sub-Components to optimize DOM updates
function InfoRow({ icon, label, value }: { icon: string; label: string; value: string }) {
  return (
    <div className="flex items-start gap-3">
      <span className="text-base mt-0.5 shrink-0" aria-hidden="true">{icon}</span>
      <div>
        <p className="text-xs font-medium mb-0.5" style={{ color: "var(--accent)" }}>{label}</p>
        <p className="text-sm" style={{ color: "var(--text-h)" }}>{value}</p>
      </div>
    </div>
  );
}

function Divider() {
  return <div className="h-px w-full" style={{ background: "var(--border)" }} />;
}

export default function HospitalDetail() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();

  // Component States
  const [hospital, setHospital] = useState<Hospital | null>(null);
  const [reviews, setReviews] = useState<ReviewData[]>([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  
  // User Form Submission States
  const [rating, setRating] = useState(5);
  const [reviewText, setReviewText] = useState("");

  // Fetch Hospital Core Profile details
  const fetchHospital = useCallback(async () => {
    if (!id) return;
    
    const { data, error } = await supabase
      .from("hospitals")
      .select("*")
      .eq("id", id)
      .single();

    if (error) {
      console.error("Error fetching hospital:", error);
      setHospital(null);
    } else {
      setHospital(data);
    }
    setLoading(false);
  }, [id]);

  // Fetch verified user reviews
  const fetchReviews = useCallback(async () => {
    if (!id) return;

    const { data, error } = await supabase
      .from("reviews")
      .select("*")
      .eq("hospital_id", id)
      .eq("approved", true);

    if (error) {
      console.error("Error pulling reviews:", error);
    } else {
      setReviews(data || []);
    }
  }, [id]);

  // Aggregate initialization handler
  useEffect(() => {
    setLoading(true);
    fetchHospital();
    fetchReviews();
  }, [id, fetchHospital, fetchReviews]);

  // Calculate rating metrics on-the-fly from active local memory state
  const totalReviews = reviews.length;
  const averageRating = totalReviews > 0 
    ? (reviews.reduce((sum, r) => sum + r.rating, 0) / totalReviews).toFixed(1) 
    : "No reviews yet";

  // Form Submission Controller
  async function submitReview(e: React.FormEvent) {
    e.preventDefault();
    if (!hospital) return;
    if (!reviewText.trim()) { alert("Please write a description first."); return; }

    setSubmitting(true);
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
      alert("You must log in to review hospitals.");
      setSubmitting(false);
      return;
    }

    const { error } = await supabase.from("reviews").insert({
      hospital_id: hospital.id,
      user_id: user.id,
      rating,
      review: reviewText.trim(),
    });

    setSubmitting(false);

    if (error) {
      console.error(error);
      alert("Could not post review. Try again.");
    } else {
      alert("Review submitted and pending authorization!");
      setReviewText("");
      setRating(5);
      fetchReviews();
    }
  }

  if (loading) {
    return (
      <div className="flex flex-col min-h-screen" style={{ background: "var(--bg)" }}>
        <div className="px-6 py-4" style={{ borderBottom: "1px solid var(--border)" }}>
          <div className="h-4 w-24 rounded animate-pulse" style={{ background: "var(--border)" }} />
        </div>
        <div className="max-w-2xl mx-auto w-full px-6 py-10 flex flex-col gap-4">
          <div className="h-8 w-3/4 rounded animate-pulse" style={{ background: "var(--border)" }} />
          <div className="h-4 w-full rounded animate-pulse" style={{ background: "var(--border)" }} />
          <div className="h-4 w-2/3 rounded animate-pulse" style={{ background: "var(--border)" }} />
        </div>
      </div>
    );
  }

  if (!hospital) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen gap-4" style={{ background: "var(--bg)" }}>
        <span className="text-5xl">🏥</span>
        <p className="text-base" style={{ color: "var(--text)" }}>Hospital profile not found.</p>
        <button
          onClick={() => navigate("/hospitals")}
          className="text-sm px-5 py-2 rounded-lg transition"
          style={{ background: "var(--accent-bg)", border: "1px solid var(--accent-border)", color: "var(--accent)" }}
        >
          ← Back to directory
        </button>
      </div>
    );
  }

  return (
    <div className="flex flex-col min-h-screen" style={{ background: "var(--bg)" }}>
      <header
        className="sticky top-0 z-10 px-6 py-4 flex items-center gap-3"
        style={{ borderBottom: "1px solid var(--border)", background: "var(--bg)" }}
      >
        <button
          onClick={() => navigate("/hospitals")}
          className="text-sm transition hover:opacity-80"
          style={{ color: "var(--accent)" }}
        >
          ← Back to directory
        </button>
      </header>

      <main className="flex-1 w-full max-w-2xl mx-auto px-6 py-10 text-left">
        <span
          className="inline-flex items-center gap-1.5 mb-5 px-3 py-1 rounded-full text-xs font-medium"
          style={{ background: "var(--accent-bg)", border: "1px solid var(--accent-border)", color: "var(--accent)" }}
        >
          🏥 Hospital Details
        </span>

        <h1 className="mb-6 leading-tight font-bold" style={{ color: "var(--text-h)", fontSize: "32px", letterSpacing: "-0.5px" }}>
          {hospital.name}
        </h1>

        <div className="rounded-2xl p-6 flex flex-col gap-4 mb-6" style={{ background: "var(--code-bg)", border: "1px solid var(--border)" }}>
          <InfoRow icon="📍" label="Address" value={hospital.address} />
          <Divider />
          <InfoRow icon="🏙" label="City" value={hospital.city} />
          <Divider />
          <InfoRow icon="🏘" label="Local Government Area (LGA)" value={`${hospital.lga} LGA`} />
          <Divider />
          <InfoRow icon="⭐" label="Community Rating" value={totalReviews > 0 ? `${averageRating} / 5 (${totalReviews} verified reviews)` : "No reviews yet"} />
          <Divider />
          <InfoRow icon="📱" label="Phone line" value={hospital.phone || "Not listed"} />
        </div>

        {/* Unified description summary platform */}
        {hospital.description && (
          <div className="rounded-2xl p-6 mb-6" style={{ background: "var(--code-bg)", border: "1px solid var(--border)" }}>
            <p className="text-xs font-semibold uppercase tracking-widest mb-3" style={{ color: "var(--accent)" }}>About Facility</p>
            <p className="text-sm leading-relaxed" style={{ color: "var(--text)" }}>{hospital.description}</p>
          </div>
        )}

        <div className="flex gap-3 flex-wrap mb-10">
          {hospital.latitude && hospital.longitude && (
            <a
              href={`https://www.google.com/maps/search/?api=1&query=${hospital.latitude},${hospital.longitude}`}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 text-sm px-5 py-2.5 rounded-lg transition hover:opacity-90"
              style={{ background: "var(--accent-bg)", border: "1px solid var(--accent-border)", color: "var(--accent)" }}
            >
              Open in Google Maps
            </a>
          )}
          <button
            onClick={() => navigate("/hospitals")}
            className="inline-flex items-center gap-2 text-sm px-5 py-2.5 rounded-lg transition"
            style={{ background: "var(--code-bg)", border: "1px solid var(--border)", color: "var(--text)" }}
          >
            ← Back to list
          </button>
        </div>

        <Divider />

        {/* Reviews workspace content section */}
        <section className="mt-10">
          <h2 className="font-semibold mb-6" style={{ color: "var(--text-h)", fontSize: "20px", letterSpacing: "-0.3px" }}>
            Community Feedback
          </h2>

          <form onSubmit={submitReview} className="rounded-2xl p-6 mb-8 flex flex-col gap-4" style={{ background: "var(--code-bg)", border: "1px solid var(--border)" }}>
            <p className="text-xs font-semibold uppercase tracking-widest" style={{ color: "var(--accent)" }}>Share your experience</p>

            <div className="flex flex-col gap-1.5">
              <label className="text-xs font-medium" style={{ color: "var(--text)" }}>Select Rating</label>
              <select
                value={rating}
                onChange={(e) => setRating(Number(e.target.value))}
                className="text-sm px-3 py-2.5 rounded-lg outline-none cursor-pointer w-32"
                style={{ background: "var(--bg)", border: "1px solid var(--border)", color: "var(--text-h)" }}
              >
                {[5, 4, 3, 2, 1].map((n) => (
                  <option key={n} value={n}>{n} {n === 1 ? "Star" : "Stars"}</option>
                ))}
              </select>
            </div>

            <div className="flex flex-col gap-1.5">
              <label className="text-xs font-medium" style={{ color: "var(--text)" }}>Your Review</label>
              <textarea
                value={reviewText}
                onChange={(e) => setReviewText(e.target.value)}
                placeholder="How was your visit? Write your experience here..."
                rows={4}
                required
                className="text-sm p-4 rounded-xl outline-none transition resize-none w-full leading-relaxed"
                style={{ background: "var(--bg)", border: "1px solid var(--border)", color: "var(--text-h)" }}
              />
            </div>

            <button
              type="submit"
              disabled={submitting}
              className="inline-flex justify-center items-center text-sm font-medium px-5 py-2.5 rounded-lg transition self-start disabled:opacity-50 disabled:cursor-not-allowed"
              style={{ background: "var(--accent-bg)", border: "1px solid var(--accent-border)", color: "var(--accent)" }}
            >
              {submitting ? "Submitting..." : "Submit Review"}
            </button>
          </form>

          {/* Render Active Reviews */}
          <div className="flex flex-col gap-4">
            {totalReviews === 0 ? (
              <p className="text-sm text-center py-6 italic" style={{ color: "var(--text)" }}>No verified reviews left yet.</p>
            ) : (
              reviews.map((r) => (
                <div key={r.id} className="rounded-2xl p-5 flex flex-col gap-2" style={{ background: "var(--code-bg)", border: "1px solid var(--border)" }}>
                  <div className="flex items-center justify-between gap-4">
                    <span className="text-xs font-mono opacity-70" style={{ color: "var(--text-h)" }}>
                      User_{r.user_id ? r.user_id.slice(0, 8) : r.id.slice(0, 5)}
                    </span>
                    <span className="text-xs font-semibold px-2.5 py-0.5 rounded-full" style={{ background: "var(--bg)", border: "1px solid var(--border)", color: "var(--text-h)" }}>
                      ⭐ {r.rating}/5
                    </span>
                  </div>
                  <p className="text-sm leading-relaxed" style={{ color: "var(--text-h)" }}>{r.review}</p>
                </div>
              ))
            )}
          </div>
        </section>
      </main>
    </div>
  );
}
