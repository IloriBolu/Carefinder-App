import { useEffect, useState } from "react";
import { supabase } from "../lib/supabase";
import MapView from "../components/Map";

type Hospital = {
  id: string;
  name: string;
  city: string;
  lga: string;
  address: string;
  latitude: number;
  longitude: number;
};

export default function Hospitals() {
  const [hospitals, setHospitals] = useState<Hospital[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [cityFilter, setCityFilter] = useState("");
  const [lgaFilter, setLgaFilter] = useState("");
  const [selectedId, setSelectedId] = useState<string | null>(null);

  useEffect(() => {
    async function fetchHospitals() {
      const { data, error } = await supabase
  .from("hospitals")
  .select("*");
      if (error) {
        console.error(error);
        return;
      }
      setHospitals(data || []);
      setLoading(false);
    }
    fetchHospitals();
  }, []);

  const cities = [...new Set(hospitals.map((h) => h.city))].sort();
  const lgas = [...new Set(hospitals.map((h) => h.lga))].sort();

  const filteredHospitals = hospitals.filter((h) => {
    const matchesSearch =
      h.name.toLowerCase().includes(search.toLowerCase()) ||
      h.city.toLowerCase().includes(search.toLowerCase()) ||
      h.lga.toLowerCase().includes(search.toLowerCase());
    const matchesCity = cityFilter ? h.city === cityFilter : true;
    const matchesLga = lgaFilter ? h.lga === lgaFilter : true;
    return matchesSearch && matchesCity && matchesLga;
  });

  const selectedHospital = hospitals.find((h) => h.id === selectedId);

  return (
    <div className="flex flex-col" style={{ minHeight: "100svh" }}>

      <header
        className="sticky top-0 z-10 px-6 py-4 flex flex-col gap-3 sm:flex-row sm:items-center sm:gap-4"
        style={{ borderBottom: "1px solid var(--border)", background: "var(--bg)" }}
      >
        <span
          className="text-base font-semibold shrink-0"
          style={{ color: "var(--text-h)" }}
        >
          🏥 CareFinder
        </span>

        {/* Search */}
        <div className="relative flex-1">
          <svg
            className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 pointer-events-none"
            style={{ color: "var(--accent)" }}
            fill="none"
            stroke="currentColor"
            strokeWidth={2}
            viewBox="0 0 24 24"
          >
            <circle cx="11" cy="11" r="8" />
            <path d="m21 21-4.35-4.35" />
          </svg>
          <input
            type="text"
            placeholder="Search hospitals, city, or LGA…"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-9 pr-4 py-2 rounded-lg text-sm outline-none transition"
            style={{
              background: "var(--code-bg)",
              border: "1px solid var(--border)",
              color: "var(--text-h)",
            }}
          />
        </div>

        {/* Filters */}
        <div className="flex gap-2 shrink-0">
          <select
            value={cityFilter}
            onChange={(e) => setCityFilter(e.target.value)}
            className="text-sm px-3 py-2 rounded-lg outline-none cursor-pointer"
            style={{
              background: "var(--code-bg)",
              border: "1px solid var(--border)",
              color: "var(--text)",
            }}
          >
            <option value="">All Cities</option>
            {cities.map((city) => (
              <option key={city} value={city}>{city}</option>
            ))}
          </select>

          <select
            value={lgaFilter}
            onChange={(e) => setLgaFilter(e.target.value)}
            className="text-sm px-3 py-2 rounded-lg outline-none cursor-pointer"
            style={{
              background: "var(--code-bg)",
              border: "1px solid var(--border)",
              color: "var(--text)",
            }}
          >
            <option value="">All LGAs</option>
            {lgas.map((lga) => (
              <option key={lga} value={lga}>{lga}</option>
            ))}
          </select>
        </div>
      </header>

      {/* ── Body ── */}
      <div className="flex flex-1 overflow-hidden">

        {/* ── Left: hospital list ── */}
        <aside
          className="w-full sm:w-2/5 overflow-y-auto px-4 py-4 flex flex-col gap-3"
          style={{ borderRight: "1px solid var(--border)" }}
        >
          {/* Result count */}
          <p className="text-xs px-1" style={{ color: "var(--text)" }}>
            {loading
              ? "Loading…"
              : `${filteredHospitals.length} hospital${filteredHospitals.length !== 1 ? "s" : ""} found`}
          </p>

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
                onClick={() => { setSearch(""); setCityFilter(""); setLgaFilter(""); }}
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
                  onClick={() => setSelectedId(isSelected ? null : h.id)}
                  className="text-left rounded-xl p-4 transition-all w-full"
                  style={{
                    background: isSelected ? "var(--accent-bg)" : "var(--code-bg)",
                    border: `1px solid ${isSelected ? "var(--accent-border)" : "var(--border)"}`,
                    boxShadow: isSelected ? "var(--shadow)" : "none",
                  }}
                >
                  {/* Hospital name */}
                  <h2
                    className="text-sm font-semibold mb-1 leading-snug"
                    style={{ color: "var(--text-h)", fontSize: "15px" }}
                  >
                    {h.name}
                  </h2>

                  {/* Address */}
                  <p className="text-xs mb-2 leading-relaxed" style={{ color: "var(--text)" }}>
                    {h.address}
                  </p>

                  {/* Tags */}
                  <div className="flex gap-2 flex-wrap">
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
                  </div>
                </button>
              );
            })
          )}
        </aside>

        {/* ── Right: map panel ── */}
        <main className="hidden sm:block flex-1 relative" style={{ background: "var(--code-bg)" }}>
          {/* Map always visible */}
          <MapView hospitals={filteredHospitals} selectedId={selectedId} />

          {/* Detail card overlaid on top when a hospital is selected */}
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
