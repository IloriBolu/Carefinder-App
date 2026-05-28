import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "../lib/supabase";
import MapView from "../components/Map";
import Papa from "papaparse";
import { useSearchParams } from "react-router-dom";


type Hospital = {
  id: string;
  name: string;
  city: string;
  lga: string;
  address: string;
  latitude: number;
  longitude: number;
  ownership_type: string;
  specialties: string[];
};


export default function Hospitals() {
  const [searchParams, setSearchParams] = useSearchParams();
  const [hospitals, setHospitals] = useState<Hospital[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState(searchParams.get("search") || "");
  const [ownershipFilter, setOwnershipFilter] = useState(searchParams.get("ownership") || "");
  const [lgaFilter, setLgaFilter] = useState(searchParams.get("lga") || "");
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [radius, setRadius] = useState<number>(Number(searchParams.get("radius")) || 10);
  const [userLocation, setUserLocation] = useState<{
  lat: number;
  lng: number;
} | null>(null);
  const [specialtyFilter, setSpecialtyFilter] = useState(searchParams.get("specialty") || "");
  const [locationError, setLocationError] = useState<string | null>(null);
  const [selectedForEmail, setSelectedForEmail] = useState<string[]>([]);
  const [email, setEmail] = useState("");
  const [cityFilter, setCityFilter] = useState(searchParams.get("city") || "");
  const navigate = useNavigate();

  useEffect(() => {
  const params: Record<string, string> = {};

  if (search) params.search = search;
  if (ownershipFilter) params.ownership = ownershipFilter;
  if (lgaFilter) params.lga = lgaFilter;
  if (specialtyFilter) params.specialty = specialtyFilter;
  if (radius) params.radius = radius.toString();

  setSearchParams(params);
}, [
  search,
  ownershipFilter,
  lgaFilter,
  specialtyFilter,
  radius,
]);

  // Fetch all hospitals or nearby ones if coords are provided
  async function fetchHospitals(lat?: number, lng?: number, km = radius) {
    setLoading(true);
    setLocationError(null);

    let data, error;

    if (lat !== undefined && lng !== undefined) {
      ({ data, error } = await supabase.rpc("nearby_hospitals", {
        lat,
        lng,
        radius_meters: km * 1000,
      }));
    } else {
      ({ data, error } = await supabase.from("hospitals").select("*"));
    }

    if (error) {
      console.error(error);
      setLoading(false);
      return;
    }

    setHospitals(data || []);
    setLoading(false);
  }

  useEffect(() => {
    let cancelled = false;
    (async () => {
      const { data, error } = await supabase.from("hospitals").select("*");
      if (cancelled) return;
      if (error) { console.error(error); setLoading(false); return; }
      setHospitals(data || []);
      setLoading(false);
    })();
    return () => { cancelled = true; };
  }, []);

function getLocation(km = radius) {
  if (!navigator.geolocation) {
    setLocationError("Geolocation is not supported by your browser.");
    return;
  }
  setLoading(true);
  navigator.geolocation.getCurrentPosition(
    (pos) => {
      const lat = pos.coords.latitude;
      const lng = pos.coords.longitude;
      setUserLocation({ lat, lng });
      fetchHospitals(lat, lng, km);
    },
    (err) => {
      setLoading(false);
      if (err.code === err.PERMISSION_DENIED) {
        setLocationError("Location access was denied. Please allow it in your browser settings.");
      } else if (err.code === err.TIMEOUT) {
        setLocationError("Location request timed out. Try again.");
      } else {
        setLocationError("Could not get your location. Try again.");
      }
    },
    { timeout: 10000 }
  );
}

  // Re-fetch when radius changes, but only if we already have a location
  useEffect(() => {
    if (userLocation) {
      fetchHospitals(userLocation.lat, userLocation.lng, radius);
    }
  }, [radius]);

  const ownership = [...new Set(hospitals.map((h) => h.ownership_type))].sort();
  const specialties = [...new Set(hospitals.flatMap((h) => h.specialties || [])),].sort();

  const filteredHospitals = hospitals.filter((h) => {
    const matchesSearch =
      h.name.toLowerCase().includes(search.toLowerCase()) ||
      h.city.toLowerCase().includes(search.toLowerCase()) ||
      h.lga.toLowerCase().includes(search.toLowerCase());
    const matchesOwnership = ownershipFilter ? h.ownership_type === ownershipFilter : true;
    const matchesLga = lgaFilter ? h.lga === lgaFilter : true;
    const matchesSpecialty = specialtyFilter ? h.specialties?.includes(specialtyFilter): true;
    return matchesSearch && matchesOwnership && matchesLga && matchesSpecialty;
  });

  const selectedHospital = hospitals.find((h) => h.id === selectedId);

  function exportHospitals() {
  const rows = filteredHospitals.map((h) => ({
    name: h.name,
    address: h.address,
    city: h.city,
    lga: h.lga,
    specialties: h.specialties?.join(", "),
    ownership: h.ownership_type,
  }));

  const csv = Papa.unparse(rows);

  const blob = new Blob([csv], {
    type: "text/csv;charset=utf-8;",
  });

  const url = URL.createObjectURL(blob);

  const link = document.createElement("a");
  link.href = url;

  const date = new Date().toISOString().split("T")[0];

  link.download = `hospitals-${search || "all"}-${date}.csv`;

  link.click();
}

  return (
    <div className="flex flex-col" style={{ height: "100svh", overflow: "hidden" }}>

      {/* ── Row 1: branding + search + near me ── */}
      <header
        className="sticky top-0 z-10 px-4 py-3 flex items-center gap-3"
        style={{ borderBottom: "1px solid var(--border)", background: "var(--bg)" }}
      >
        {/* Logo */}
        <span className="text-sm font-semibold shrink-0" style={{ color: "var(--text-h)" }}>
          🏥 CareFinder
        </span>

        {/* Search */}
        <div className="relative flex-1">
          <input
            type="text"
            placeholder="Search hospitals…"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-9 pr-4 py-2 rounded-lg text-sm outline-none"
            style={{ background: "white", border: "1px solid var(--border)", color: "black" }}
          />
        </div>

        {/* Near me pill buttons */}
        <div className="hidden sm:flex items-center shrink-0 rounded-lg overflow-hidden"
          style={{ border: "1px solid var(--accent-border)" }}>
          {[5, 10, 25, 50].map((km) => (
            <button
              key={km}
              onClick={() => { setRadius(km); getLocation(km); }}
              className="text-xs px-2.5 py-2 transition"
              style={{
                background: radius === km && userLocation ? "var(--accent-bg)" : "var(--code-bg)",
                color: radius === km && userLocation ? "var(--accent)" : "var(--text)",
                borderRight: km !== 50 ? "1px solid var(--accent-border)" : "none",
              }}
            >
              📍 {km}km
            </button>
          ))}
        </div>
      </header>

      {/* ── Row 2: filters + actions toolbar ── */}
      <div
        className="px-4 py-2 flex items-center gap-2 flex-wrap"
        style={{ borderBottom: "1px solid var(--border)", background: "var(--bg)" }}
      >
        {/* Ownership filter */}
        <select
          value={ownershipFilter}
          onChange={(e) => setOwnershipFilter(e.target.value)}
          className="text-xs px-2.5 py-1.5 rounded-lg outline-none cursor-pointer"
          style={{ background: "var(--code-bg)", border: "1px solid var(--border)", color: "var(--text)" }}
        >
          <option value="">All ownership</option>
          {ownership.map((o) => <option key={o} value={o}>{o}</option>)}
        </select>

        {/* LGA filter */}
        <select
          value={lgaFilter}
          onChange={(e) => setLgaFilter(e.target.value)}
          className="text-xs px-2.5 py-1.5 rounded-lg outline-none cursor-pointer"
          style={{ background: "var(--code-bg)", border: "1px solid var(--border)", color: "var(--text)" }}
        >
          <option value="">All LGAs</option>
          {[...new Set(hospitals.map((h) => h.lga))].sort().map((lga) => (
            <option key={lga} value={lga}>{lga}</option>
          ))}
        </select>

        {/* Specialty filter */}
        <select
          value={specialtyFilter}
          onChange={(e) => setSpecialtyFilter(e.target.value)}
          className="text-xs px-2.5 py-1.5 rounded-lg outline-none cursor-pointer"
          style={{ background: "var(--code-bg)", border: "1px solid var(--border)", color: "var(--text)" }}
        >
          <option value="">All specialties</option>
          {specialties.map((s) => <option key={s} value={s}>{s}</option>)}
        </select>

        {/* Spacer */}
        <div className="flex-1" />


        <input
  type="email"
  placeholder="Recipient email"
  value={email}
  onChange={(e) => setEmail(e.target.value)}
   className="pl-9 pr-4 py-2 rounded-lg text-sm outline-none"
            style={{ background: "white", border: "1px solid var(--border)", color: "black" }}
/>

<button
          className="text-xs px-3 py-1.5 rounded-lg transition shrink-0"
          style={{ background: "var(--code-bg)", border: "1px solid var(--border)", color: "var(--text)" }}
  onClick={async () => {
    if (!email) { alert("Enter a recipient email first."); return; }
    if (selectedForEmail.length === 0) { alert("Select at least one hospital."); return; }
    try {
      const res = await fetch(
        `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/share-hospitals`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            "Authorization": `Bearer ${import.meta.env.VITE_SUPABASE_ANON_KEY}`,
          },
          body: JSON.stringify({
            email,
            hospitalIds: selectedForEmail,
            filters: { search, ownership: ownershipFilter, specialty: specialtyFilter, radius },
          }),
        }
      );
      const json = await res.json();
      if (json.success) {
        alert(`Email sent to ${email}`);
        setEmail("");
        setSelectedForEmail([]);
      } else {
        alert(`Failed: ${json.error}`);
      }
    } catch (err) {
      alert("Something went wrong sending the email.");
    }
  }}
>
  Send Email
</button>

<div className="flex-1" />

        {/* Result count */}
        <span className="text-xs shrink-0" style={{ color: "var(--text)" }}>
          {loading ? "Loading…" : `${filteredHospitals.length} hospital${filteredHospitals.length !== 1 ? "s" : ""}`}
        </span>

        {/* Export CSV */}
        <button
          onClick={exportHospitals}
          className="text-xs px-3 py-1.5 rounded-lg transition shrink-0"
          style={{ background: "var(--code-bg)", border: "1px solid var(--border)", color: "var(--text)" }}
        >
          ↓ Export CSV
        </button>

        {/* Copy link */}
        <button
          onClick={() => { navigator.clipboard.writeText(window.location.href); alert("Link copied!"); }}
          className="text-xs px-3 py-1.5 rounded-lg transition shrink-0"
          style={{ background: "var(--code-bg)", border: "1px solid var(--border)", color: "var(--text)" }}
        >
          Copy link
        </button>

        {/* Clear all */}
        {(search || ownershipFilter || lgaFilter || specialtyFilter || userLocation) && (
          <button
            onClick={() => { setSearch(""); setOwnershipFilter(""); setLgaFilter(""); setSpecialtyFilter(""); setUserLocation(null); fetchHospitals(); }}
            className="text-xs px-3 py-1.5 rounded-lg transition shrink-0"
            style={{ background: "rgba(229,62,62,0.08)", border: "1px solid rgba(229,62,62,0.2)", color: "#c53030" }}
          >
            ✕ Clear all
          </button>
        )}
      </div>

      {/* Location error banner */}
      {locationError && (
        <div
          className="px-6 py-3 text-sm flex items-center justify-between gap-4"
          style={{
            background: "rgba(229,62,62,0.08)",
            borderBottom: "1px solid rgba(229,62,62,0.2)",
            color: "#c53030",
          }}
        >
          <span>⚠️ {locationError}</span>
          <button
            onClick={() => { setLocationError(null); fetchHospitals(); }}
            className="text-xs underline shrink-0"
          >
            Show all hospitals
          </button>
        </div>
      )}

      {/* ── Body ── */}
      <div className="flex flex-1 overflow-hidden">
        {/* ── Left: hospital list ── */}
        <aside
          className="w-full sm:w-2/5 flex flex-col"
          style={{ borderRight: "1px solid var(--border)", overflow: "hidden" }}
        >
          {/* Scrollable list area */}
          <div className="flex-1 overflow-y-auto px-4 py-4 flex flex-col gap-3">

          {loading ? (
            Array.from({ length: 5 }).map((_, i) => (
              <div
                key={i}
                className="rounded-xl p-4 animate-pulse"
                style={{ background: "var(--code-bg)", border: "1px solid var(--border)" }}
              >
                <div className="h-4 rounded mb-2 w-3/4" style={{ background: "var(--border)" }} />
                <div className="h-3 rounded mb-1 w-full" style={{ background: "var(--border)" }} />
                <div className="h-3 rounded w-1/2" style={{ background: "var(--border)" }} />
              </div>
            ))
          ) : filteredHospitals.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-20 gap-3">
              <span className="text-4xl">🔍</span>
              <p className="text-sm" style={{ color: "var(--text)" }}>
                No hospitals match your search.
              </p>
              <button
                onClick={() => {
                  setSearch("");
                  setOwnershipFilter("");
                  setLgaFilter("");
                  fetchHospitals();
                }}
                className="text-xs px-4 py-2 rounded-lg transition"
                style={{
                  background: "var(--accent-bg)",
                  border: "1px solid var(--accent-border)",
                  color: "var(--accent)",
                }}
              >
                Clear filters
              </button>
            </div>
          ) : (
            filteredHospitals.map((h) => {
              const isSelected = h.id === selectedId;
              return (
                <button
                  key={h.id}
                  onClick={() => navigate(`/hospital/${h.id}`)}
                  className="text-left rounded-xl p-4 transition-all w-full"
                  style={{
                    background: isSelected ? "var(--accent-bg)" : "var(--code-bg)",
                    border: `1px solid ${isSelected ? "var(--accent-border)" : "var(--border)"}`,
                    boxShadow: isSelected ? "var(--shadow)" : "none",
                  }}
                >
                  <h2
                    className="text-sm font-semibold mb-1 leading-snug"
                    style={{ color: "var(--text-h)", fontSize: "15px" }}
                  ><strong>
                    {h.name}</strong>
                  </h2>

                  <p className="text-xs mb-2 leading-relaxed" style={{ color: "var(--text)" }}>
                    {h.address}
                  </p>

                  <div className="flex gap-2 flex-wrap mt-2">
                      <span
                        className="inline-flex items-center gap-1 text-xs px-2 py-0.5 rounded-full"
                        style={{
                          background: "var(--accent-bg)",
                          border: "1px solid var(--accent-border)",
                          color: "var(--accent)",
                        }}
                      >
                        📍 {h.city}
                      </span>
                      <span
                        className="inline-flex items-center gap-1 text-xs px-2 py-0.5 rounded-full"
                        style={{
                          background: "var(--accent-bg)",
                          border: "1px solid var(--accent-border)",
                          color: "var(--accent)",
                        }}
                      >
                        🏘 {h.lga}
                      </span>
                      <input
  type="checkbox"
  checked={selectedForEmail.includes(h.id)}
  onClick={(e) => e.stopPropagation()}
  onChange={() => {
    setSelectedForEmail((prev) =>
      prev.includes(h.id)
        ? prev.filter((id) => id !== h.id)
        : [...prev, h.id]
    );
  }}
/>
                  </div>
                </button>
              );
            })
          )}
          </div>

          {/* Footer pinned at bottom of list panel */}
          <div
            className="px-4 py-3 text-center text-xs shrink-0"
            style={{ borderTop: "1px solid var(--border)", color: "var(--text)" }}
          >
            © {new Date().getFullYear()} Carefinder. All rights reserved.
          </div>
        </aside>

        {/* ── Right: map panel ── */}
        <main className="hidden sm:block flex-1 relative" style={{ background: "var(--code-bg)" }}>
          <MapView hospitals={filteredHospitals} selectedId={selectedId} />

          {selectedHospital && (
            <div
              className="absolute bottom-6 left-1/2 -translate-x-1/2 w-80 rounded-2xl p-5 text-left z-10"
              style={{
                background: "var(--bg)",
                border: "1px solid var(--border)",
                boxShadow: "var(--shadow)",
              }}
            >
              <span
                className="inline-flex items-center gap-1.5 mb-3 px-3 py-1 rounded-full text-xs font-medium"
                style={{
                  background: "var(--accent-bg)",
                  border: "1px solid var(--accent-border)",
                  color: "var(--accent)",
                }}
              >
                🏥 Hospital Details
              </span>

              <h2
                className="mb-3 leading-snug"
                style={{ color: "var(--text-h)", fontSize: "16px" }}
              >
                {selectedHospital.name}
              </h2>

              <div className="flex flex-col gap-2 text-sm" style={{ color: "var(--text)" }}>
                <div className="flex items-start gap-2">
                  <span>📍</span>
                  <span>{selectedHospital.address}</span>
                </div>
                <div className="flex items-center gap-2">
                  <span>🏙</span>
                  <span>{selectedHospital.city}</span>
                </div>
                <div className="flex items-center gap-2">
                  <span>🏘</span>
                  <span>{selectedHospital.lga} LGA</span>
                </div>
              </div>

              <button
                onClick={() => setSelectedId(null)}
                className="mt-4 text-xs px-4 py-2 rounded-lg transition"
                style={{
                  background: "var(--accent-bg)",
                  border: "1px solid var(--accent-border)",
                  color: "var(--accent)",
                }}
              >
                ✕ Close
              </button>
            </div>
          )}
        </main>
      </div>
    </div>
  );
}