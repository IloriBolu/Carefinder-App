import { useEffect, useState } from "react";
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

export default function HospitalDetail() {
  const { id } = useParams<string>();
  const navigate = useNavigate();
  const [hospital, setHospital] = useState<Hospital | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [rating, setRating] = useState<number>(5);
  const [review, setReview] = useState<string>("");
  const [reviews, setReviews] = useState<ReviewData[]>([]);
  const [averageRating, setAverageRating] = useState<number>(0);
  const [reviewCount, setReviewCount] = useState<number>(0);
  

  async function fetchHospital() {
    const { data, error } = await supabase
      .from("hospitals")
      .select("*")
      .eq("id", id)
      .single();

    if (error) {
      console.log("Error fetching hospital:", error);
      setLoading(false);
      return;
    }

    if (data) {
      setHospital(data);
    } else {
      setHospital(null);
    }
    setLoading(false);
  }

  async function fetchReviews() {
    if (id === undefined) {
      return;
    }

    const { data, error } = await supabase
      .from("reviews")
      .select("*")
      .eq("hospital_id", id)
      .eq("approved", true);

    if (error) {
      console.error(error);
      return;
    }

    if (data) {
      const approvedReviews: ReviewData[] = data;
      setReviews(approvedReviews);
      setReviewCount(approvedReviews.length);

      if (approvedReviews.length > 0) {
        let total: number = 0;
        approvedReviews.forEach((r) => {
          total = total + r.rating;
        });
        setAverageRating(total / approvedReviews.length);
      } else {
        setAverageRating(0);
      }
    } else {
      setReviews([]);
      setReviewCount(0);
      setAverageRating(0);
    }
  }

  useEffect(() => {
    if (id === undefined) {
      return;
    }

    fetchHospital();
    fetchReviews();
  }, [id]);

  if (loading === true) {
    return (
      <div className="flex flex-col min-h-screen" style={{ background: "var(--bg)" }}>
        <div className="px-6 py-4" style={{ borderBottom: "1px solid var(--border)" }}>
          <div className="h-4 w-24 rounded animate-pulse" style={{ background: "var(--border)" }} />
        </div>
        <div className="max-w-2xl mx-auto w-full px-6 py-10 flex flex-col gap-4">
          <div className="h-8 w-3/4 rounded animate-pulse" style={{ background: "var(--border)" }} />
          <div className="h-4 w-full rounded animate-pulse" style={{ background: "var(--border)" }} />
          <div className="h-4 w-2/3 rounded animate-pulse" style={{ background: "var(--border)" }} />
          <div className="h-4 w-1/2 rounded animate-pulse" style={{ background: "var(--border)" }} />
        </div>
      </div>
    );
  }

  if (hospital === null) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen gap-4" style={{ background: "var(--bg)" }}>
        <span className="text-5xl">🏥</span>
        <p className="text-base" style={{ color: "var(--text)" }}>Hospital not found.</p>
        <button
          onClick={() => { navigate("/hospitals"); }}
          className="text-sm px-5 py-2 rounded-lg transition"
          style={{
            background: "var(--accent-bg)",
            border: "1px solid var(--accent-border)",
            color: "var(--accent)",
          }}
        >
          ← Back to hospitals
        </button>
      </div>
    );
  }

async function submitReview() {
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    alert("You must log in to review");
    return;
  }
  const { error } = await supabase.from("reviews").insert({
    hospital_id: hospital.id,
    user_id: user.id,
    rating,
    review,
  });

  if (error) {
    console.error(error);
    return;
  }

  alert("Review submitted!");

  setReview("");
  setRating(5);

  fetchReviews();
}

  return (
    <div className="flex flex-col min-h-screen" style={{ background: "var(--bg)" }}>
      <header
        className="sticky top-0 z-10 px-6 py-4 flex items-center gap-3"
        style={{ borderBottom: "1px solid var(--border)", background: "var(--bg)" }}
      >
        <button
          onClick={() => { navigate("/hospitals"); }}
          className="inline-flex items-center gap-1.5 text-sm transition"
          style={{ color: "var(--accent)" }}
        >
          Back to hospitals
        </button>
      </header>

      <main className="flex-1 w-full max-w-2xl mx-auto px-6 py-10 text-left">
        <span
          className="inline-flex items-center gap-1.5 mb-5 px-3 py-1 rounded-full text-xs font-medium"
          style={{
            background: "var(--accent-bg)",
            border: "1px solid var(--accent-border)",
            color: "var(--accent)",
          }}
        >
          🏥 Hospital Details
        </span>

        <h1
          className="mb-6 leading-tight"
          style={{ color: "var(--text-h)", fontSize: "32px", letterSpacing: "-0.5px" }}
        >
          {hospital.name}
        </h1>
        <div
          className="rounded-2xl p-6 flex flex-col gap-4 mb-6"
          style={{
            background: "var(--code-bg)",
            border: "1px solid var(--border)",
          }}
        >
          <InfoRow icon="📍" label="Address" value={hospital.address} />
          <Divider />
          <InfoRow icon="🏙" label="City" value={hospital.city} />
          <Divider />
          <InfoRow icon="🏘" label="LGA" value={hospital.lga + " " + "LGA"} />
          <Divider />
          <InfoRow icon="📖" label="Description" value={hospital.description ? hospital.description : "No description"} />
          <Divider />
          <InfoRow icon="⭐" label="Rating" value={reviewCount > 0 ? averageRating.toFixed(1) + " / 5 (" + reviewCount + " review(s))" : "No reviews yet"}/>
          <Divider />
          <InfoRow icon="📱" label="Phone number" value={hospital.phone ? hospital.phone : "No phone number"} />
        </div>

        {hospital.description ? (
          <div
            className="rounded-2xl p-6 mb-6"
            style={{
              background: "var(--code-bg)",
              border: "1px solid var(--border)",
            }}
          >
            <p
              className="text-xs font-semibold uppercase tracking-widest mb-3"
              style={{ color: "var(--accent)" }}
            >
              About
            </p>
            <p className="text-sm leading-relaxed" style={{ color: "var(--text)" }}>
              {hospital.description}
            </p>
          </div>
        ) : null}

        <div className="flex gap-3 flex-wrap mb-10">
          {hospital.latitude !== null && hospital.longitude !== null ? (
            <a
              href={"https://www.google.com/maps/search/?api=1&query=" + hospital.latitude + "," + hospital.longitude}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 text-sm px-5 py-2.5 rounded-lg transition"
              style={{
                background: "var(--accent-bg)",
                border: "1px solid var(--accent-border)",
                color: "var(--accent)",
              }}
            >
              Open in Google Maps
            </a>
          ) : null}
          <button
            onClick={() => { navigate("/hospitals"); }}
            className="inline-flex items-center gap-2 text-sm px-5 py-2.5 rounded-lg transition"
            style={{
              background: "var(--code-bg)",
              border: "1px solid var(--border)",
              color: "var(--text)",
            }}
          >
            ← Back to list
          </button>
        </div>

        <Divider />

        {/* --- STYLED REVIEWS SECTION --- */}
        <section className="mt-10">
          <h2 
            className="font-semibold mb-6" 
            style={{ color: "var(--text-h)", fontSize: "20px", letterSpacing: "-0.3px" }}
          >
            Community Reviews
          </h2>

          {/* Form Card */}
          <div 
            className="rounded-2xl p-6 mb-8 flex flex-col gap-4"
            style={{
              background: "var(--code-bg)",
              border: "1px solid var(--border)",
            }}
          >
            <p className="text-xs font-semibold uppercase tracking-widest" style={{ color: "var(--accent)" }}>
              Share your experience
            </p>

            <div className="flex flex-col gap-1.5">
              <label className="text-xs font-medium" style={{ color: "var(--text)" }}>Rating</label>
              <select
                value={rating}
                onChange={(e: React.ChangeEvent<HTMLSelectElement>) => setRating(Number(e.target.value))}
                className="text-sm px-3 py-2.5 rounded-lg outline-none transition w-32"
                style={{
                  background: "var(--bg)",
                  border: "1px solid var(--border)",
                  color: "var(--text-h)",
                }}
              >
                {[1, 2, 3, 4, 5].map((n) => (
                  <option key={n} value={n}>
                    {n} {n === 1 ? "Star" : "Stars"}
                  </option>
                ))}
              </select>
            </div>

            <div className="flex flex-col gap-1.5">
              <label className="text-xs font-medium" style={{ color: "var(--text)" }}>Your Review</label>
              <textarea
                value={review}
                onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) => setReview(e.target.value)}
                placeholder="How was your visit? Write your review here..."
                rows={4}
                className="text-sm p-4 rounded-xl outline-none transition resize-none w-full leading-relaxed"
                style={{
                  background: "var(--bg)",
                  border: "1px solid var(--border)",
                  color: "var(--text-h)",
                }}
              />
            </div>

            <button
              onClick={submitReview}
              className="inline-flex justify-center items-center text-sm font-medium px-5 py-2.5 rounded-lg transition self-start"
              style={{
                background: "var(--accent-bg)",
                border: "1px solid var(--accent-border)",
                color: "var(--accent)",
              }}
            >
              Submit Review
            </button>
          </div>


          <div className="flex flex-col gap-4">
            {reviews.length === 0 ? (
              <p className="text-sm text-center py-6" style={{ color: "var(--text)" }}>
                No reviews yet. Be first to leave one
              </p>
            ) : (
              reviews.map((r) => (
                <div
                  key={r.id}
                  className="rounded-2xl p-5 flex flex-col gap-2"
                  style={{
                    background: "var(--code-bg)",
                    border: "1px solid var(--border)",
                  }}
                >
                  <div className="flex items-center justify-between gap-4">
                    <span className="text-xs font-medium" style={{ color: "var(--accent)" }}>
                      User {r.user_id ? r.user_id.slice(0, 8) : r.id.slice(0, 5)}...
                    </span>
                    <span 
                      className="text-xs font-semibold px-2.5 py-0.5 rounded-full"
                      style={{ background: "var(--bg)", border: "1px solid var(--border)", color: "var(--text-h)" }}
                    >
                      ⭐ {r.rating}/5
                    </span>
                  </div>
                  <p className="text-sm leading-relaxed" style={{ color: "var(--text-h)" }}>
                    {r.review}
                  </p>
                </div>
              ))
            )}
          </div>
        </section>
      </main>
    </div>
  );
}

function InfoRow({ icon, label, value }: { icon: string; label: string; value: string }) {
  return (
    <div className="flex items-start gap-3">
      <span className="text-base mt-0.5 shrink-0">{icon}</span>
      <div>
        <p className="text-xs font-medium mb-0.5" style={{ color: "var(--accent)" }}>
          {label}
        </p>
        <p className="text-sm" style={{ color: "var(--text-h)" }}>
          {value}
        </p>
      </div>
    </div>
  );
}

function Divider() {
  return <div className="h-px w-full" style={{ background: "var(--border)" }} />;
}