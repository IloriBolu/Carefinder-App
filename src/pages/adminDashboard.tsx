import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "../lib/supabase";
import AddHospital from "./AdminActions/addHospital";
import EditHospital from "./AdminActions/editHospital";


type Hospital = {
  id: string;
  name: string;
  city: string;
  lga: string;
  address: string;
  ownership_type: string; 
  latitude: number | null; 
  longitude: number | null;
  specialties: string[];
  description: string | null;
};

export default function AdminDashboard() {
  const navigate = useNavigate();
  const [hospitals, setHospitals] = useState<Hospital[]>([]);
  const [loading, setLoading] = useState<boolean>(true); 
  const [search, setSearch] = useState<string>(""); 
  const [showAdd, setShowAdd] = useState<boolean>(false);
  const [editTarget, setEditTarget] = useState<Hospital | null>(null);

  async function fetchHospitals() {
    setLoading(true); 
    const { data, error } = await supabase.from("hospitals").select("*");
    
    if (error) { 
      console.log("Omo, error happened:", error);
      setLoading(false); 
      return; 
    }
    
    if (data) {
      setHospitals(data);
    } else {
      setHospitals([]);
    }
    
    setLoading(false); 
  }

  useEffect(() => { 
    fetchHospitals(); 
  }, []);

  const filteredHospitals = hospitals.filter((hospital) => {
    const nameMatch = hospital.name.toLowerCase().includes(search.toLowerCase());
    const cityMatch = hospital.city.toLowerCase().includes(search.toLowerCase());
    const lgaMatch = hospital.lga.toLowerCase().includes(search.toLowerCase());
    
    return nameMatch || cityMatch || lgaMatch;
  });
  const uniqueCities: string[] = [];
  hospitals.forEach((h) => {
    if (!uniqueCities.includes(h.city)) {
      uniqueCities.push(h.city);
    }
  });

  const uniqueLgas: string[] = [];
  hospitals.forEach((h) => {
    if (!uniqueLgas.includes(h.lga)) {
      uniqueLgas.push(h.lga);
    }
  });

  return (
    <div className="flex flex-col min-h-screen" style={{ background: "var(--bg)" }}>

      {/* ── Top Navigation Bar ── */}
      <header
        className="sticky top-0 z-10 px-6 py-4 flex items-center justify-between gap-4"
        style={{ borderBottom: "1px solid var(--border)", background: "var(--bg)" }}
      >
        <div className="flex items-center gap-3">
          <span className="text-lg">🏥</span>
          <div>
            <p className="text-xs" style={{ color: "var(--text)" }}>CareFinder</p>
            <p className="text-sm font-semibold leading-none" style={{ color: "var(--text-h)" }}>
              Admin Dashboard
            </p>
          </div>
        </div>

        {/* Centre — back button */}
        <button
          onClick={() => navigate("/hospitals")}
          className="inline-flex items-center gap-1.5 text-sm px-4 py-2 rounded-lg transition"
          style={{
            background: "var(--code-bg)",
            border: "1px solid var(--border)",
            color: "var(--text)",
          }}
        >
          Back to Hospitals
        </button>

        <button
          onClick={() => navigate("/admin/moderation")}
          className="inline-flex items-center gap-1.5 text-sm px-4 py-2 rounded-lg transition"
          style={{
            background: "grey",
            border: "1px solid var(--border)",
            color: "white",
          }}
        >
          Review Moderations
        </button>

        {/* Click handler to open the Add Modal */}
        <button
          onClick={() => { setShowAdd(true); }}
          className="inline-flex items-center gap-1.5 text-sm px-4 py-2 rounded-lg transition"
          style={{
            background: "var(--accent)",
            color: "#fff",
            border: "1px solid var(--accent-border)",
          }}
        >
           + Add Hospital
        </button>
      </header>

      {/* ── Main Content Area ── */}
      <main className="flex-1 px-6 py-6 max-w-5xl w-full mx-auto">

        {/* Stats Row Cards */}
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-4 mb-6">
          
          {/* Card 1: Total */}
          <div className="rounded-xl px-5 py-4" style={{ background: "var(--code-bg)", border: "1px solid var(--border)" }}>
            <p className="text-xs mb-1" style={{ color: "var(--text)" }}>Total Hospitals</p>
            <p className="text-2xl font-semibold" style={{ color: "var(--text-h)" }}>
              {loading === true ? "—" : hospitals.length}
            </p>
          </div>

          {/* Card 2: Cities */}
          <div className="rounded-xl px-5 py-4" style={{ background: "var(--code-bg)", border: "1px solid var(--border)" }}>
            <p className="text-xs mb-1" style={{ color: "var(--text)" }}>Cities</p>
            <p className="text-2xl font-semibold" style={{ color: "var(--text-h)" }}>
              {loading === true ? "—" : uniqueCities.length}
            </p>
          </div>

          {/* Card 3: LGAs */}
          <div className="rounded-xl px-5 py-4" style={{ background: "var(--code-bg)", border: "1px solid var(--border)" }}>
            <p className="text-xs mb-1" style={{ color: "var(--text)" }}>LGAs</p>
            <p className="text-2xl font-semibold" style={{ color: "var(--text-h)" }}>
              {loading === true ? "—" : uniqueLgas.length}
            </p>
          </div>

        </div>

        {/* Search Input Filter */}
        <div className="relative mb-4">
          <input
            type="text"
            placeholder="Search hospitals…"
            value={search}
            onChange={(event) => { setSearch(event.target.value); }}
            className="w-full pl-9 pr-4 py-2.5 rounded-lg text-sm outline-none"
            style={{
              background: "var(--code-bg)",
              border: "1px solid var(--border)",
              color: "var(--text-h)",
            }}
          />
        </div>

        {/* Main Data Table */}
        <div className="rounded-xl overflow-hidden" style={{ border: "1px solid var(--border)" }}>
          
          {/* Table Grid Headers */}
          <div
            className="grid text-xs font-medium px-4 py-3"
            style={{
              gridTemplateColumns: "1fr 120px 120px 130px 120px",
              background: "var(--code-bg)",
              borderBottom: "1px solid var(--border)",
              color: "var(--text)",
            }}
          >
            <span>Hospital</span>
            <span>City</span>
            <span>LGA</span>
            <span>Ownership</span>
            <span className="text-right">Actions</span>
          </div>

          {/* Table Body Content Rows */}
          <div className="divide-y" style={{ borderColor: "var(--border)" }}>
            
            {/* checking if loading is true */}
            {loading === true ? (
              // Manual skeleton arrays because they aren't fully confident with shorthand Array generation
              [1, 2, 3, 4, 5].map((item) => (
                <div
                  key={item}
                  className="grid px-4 py-3 animate-pulse"
                  style={{ gridTemplateColumns: "1fr 120px 120px 130px 120px" }}
                >
                  <div className="h-3 rounded w-3/4" style={{ background: "var(--border)" }} />
                  <div className="h-3 rounded w-2/3" style={{ background: "var(--border)" }} />
                  <div className="h-3 rounded w-1/2" style={{ background: "var(--border)" }} />
                  <div className="h-3 rounded w-2/3" style={{ background: "var(--border)" }} />
                  <div className="h-3 rounded w-full" style={{ background: "var(--border)" }} />
                </div>
              ))
            ) : filteredHospitals.length === 0 ? (
            
              <div className="flex flex-col items-center justify-center py-16 gap-2">
                <span className="text-3xl">🔍</span>
                <p className="text-sm" style={{ color: "var(--text)" }}>No hospitals found.</p>
              </div>
            ) : (
              
              filteredHospitals.map((hospital) => (
                <div
                  key={hospital.id}
                  className="grid px-4 py-3 items-center text-sm transition hover:bg-[var(--code-bg)]"
                  style={{ gridTemplateColumns: "1fr 120px 120px 130px 120px" }}
                >
                  {/* Name and Address display */}
                  <div className="pr-4 min-w-0">
                    <p className="font-medium truncate" style={{ color: "var(--text-h)" }}>{hospital.name}</p>
                    <p className="text-xs truncate mt-0.5" style={{ color: "var(--text)" }}>{hospital.address}</p>
                  </div>

                  <span className="text-xs truncate" style={{ color: "var(--text)" }}>{hospital.city}</span>
                  <span className="text-xs truncate" style={{ color: "var(--text)" }}>{hospital.lga}</span>

                  {/* Ownership type label */}
                  <span>
                    <span
                      className="inline-flex text-xs px-2 py-0.5 rounded-full"
                      style={{
                        background: "var(--accent-bg)",
                        border: "1px solid var(--accent-border)",
                        color: "var(--accent)",
                      }}
                    >
                      {hospital.ownership_type ? hospital.ownership_type : "—"}
                    </span>
                  </span>

                  {/* Action buttons (Edit & Delete) */}
                  <div className="flex items-center justify-end gap-2">
                    <button
                      onClick={() => { setEditTarget(hospital); }}
                      className="text-xs px-3 py-1.5 rounded-lg transition"
                      style={{
                        background: "var(--code-bg)",
                        border: "1px solid var(--border)",
                        color: "var(--text)",
                      }}
                    >
                      Edit
                    </button>
                    <button
                      onClick={() => { alert("Delete functionality coming soon!"); }}
                      className="text-xs px-3 py-1.5 rounded-lg transition"
                      style={{
                        background: "rgba(229,62,62,0.08)",
                        border: "1px solid rgba(229,62,62,0.2)",
                        color: "#c53030",
                      }}
                    >
                      Delete
                    </button>
                  </div>
                </div>
              ))
            )}
          </div>

          {/* Table Footer Stats */}
          {loading === false && filteredHospitals.length > 0 ? (
            <div
              className="px-4 py-3 text-xs"
              style={{
                borderTop: "1px solid var(--border)",
                background: "var(--code-bg)",
                color: "var(--text)",
              }}
            >
              Showing {filteredHospitals.length} of {hospitals.length} hospitals
            </div>
          ) : null}
        </div>
      </main>

      {/* ── MODAL POPUPS FOR ADMIN ACTIONS ── */}
      {showAdd === true ? (
        <AddHospital
          onSuccess={() => { 
            setShowAdd(false); 
            fetchHospitals(); 
          }}
          onCancel={() => { 
            setShowAdd(false); 
          }}
        />
      ) : null}

      {editTarget !== null ? (
        <EditHospital
          hospital={editTarget}
          onSuccess={() => { 
            setEditTarget(null); 
            fetchHospitals(); 
          }}
          onCancel={() => { 
            setEditTarget(null); 
          }}
        />
      ) : null}

    </div>
  );
}