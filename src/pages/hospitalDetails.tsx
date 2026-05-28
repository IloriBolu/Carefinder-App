import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { supabase } from "../lib/supabase";

type Hospital = {
  id: string;
  name: string;
  city: string;
  lga: string;
  address: string;
  latitude: number;
  longitude: number;
  description: string;
  rating: string;
  phone: string;
};

export default function HospitalDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [hospital, setHospital] = useState<Hospital | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchHospital() {
      const { data, error } = await supabase
        .from("hospitals")
        .select("*")
        .eq("id", id)
        .single();

      if (error) {
        console.error(error);
        setLoading(false);
        return;
      }

      setHospital(data);
      setLoading(false);
    }

    fetchHospital();
  }, [id]);

  if (loading) {
    return (
      <div className="flex flex-col min-h-screen" style={{ background: "var(--bg)" }}>
        {/* Back bar skeleton */}
        <div className="px-6 py-4" style={{ borderBottom: "1px solid var(--border)" }}>
          <div className="h-4 w-24 rounded animate-pulse" style={{ background: "var(--border)" }} />
        </div>
        {/* Content skeleton */}
        <div className="max-w-2xl mx-auto w-full px-6 py-10 flex flex-col gap-4">
          <div className="h-8 w-3/4 rounded animate-pulse" style={{ background: "var(--border)" }} />
          <div className="h-4 w-full rounded animate-pulse" style={{ background: "var(--border)" }} />
          <div className="h-4 w-2/3 rounded animate-pulse" style={{ background: "var(--border)" }} />
          <div className="h-4 w-1/2 rounded animate-pulse" style={{ background: "var(--border)" }} />
        </div>
      </div>
    );
  }

  if (!hospital) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen gap-4" style={{ background: "var(--bg)" }}>
        <span className="text-5xl">🏥</span>
        <p className="text-base" style={{ color: "var(--text)" }}>Hospital not found.</p>
        <button
          onClick={() => navigate("/hospitals")}
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

  return (
    <div className="flex flex-col min-h-screen" style={{ background: "var(--bg)" }}>

      {/* ── Top nav bar ── */}
      <header
        className="sticky top-0 z-10 px-6 py-4 flex items-center gap-3"
        style={{ borderBottom: "1px solid var(--border)", background: "var(--bg)" }}
      >
        <button
          onClick={() => navigate("/hospitals")}
          className="inline-flex items-center gap-1.5 text-sm transition"
          style={{ color: "var(--accent)" }}
        >
          <svg width="16" height="16" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
            <path d="M19 12H5M12 5l-7 7 7 7" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
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
          <InfoRow icon="🏘" label="LGA" value={`${hospital.lga} LGA`} />
          <Divider />
          <InfoRow icon="📖" label="Description" value={hospital.description} />
          <Divider />
          <InfoRow icon="⭐" label="Star Rating" value={hospital.rating} />
                    <Divider />
          <InfoRow icon="📱" label="Phone number" value={hospital.phone} />
        </div>

        {/* Description */}
        {hospital.description && (
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
        )}

        <div className="flex gap-3 flex-wrap">
          {hospital.latitude && hospital.longitude && (
            <a
              href={`https://www.google.com/maps/search/?api=1&query=${hospital.latitude},${hospital.longitude}`}
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
          )}
          <button
            onClick={() => navigate("/hospitals")}
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
      </main>
    </div>
  );
}

/* ── Small helper components ── */

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
