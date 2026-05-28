import { useNavigate } from "react-router-dom";

export default function Home() {
  const navigate = useNavigate();

  return (
    <div style={{ minHeight: "100svh", background: "#fdfaf2", fontFamily: "system-ui, 'Segoe UI', sans-serif" }}>

      {/* ── Navbar ── */}
      <nav style={{
        position: "sticky", top: 0, zIndex: 10,
        padding: "16px 32px",
        display: "flex", alignItems: "center", justifyContent: "space-between",
        borderBottom: "1px solid #e6dfd3",
        background: "rgba(253,250,242,0.85)",
        backdropFilter: "blur(8px)",
      }}>
        <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
          <span style={{ fontSize: "20px" }}>🏥</span>
          <span style={{ fontWeight: 600, fontSize: "15px", color: "#2b251f" }}>CareFinder</span>
        </div>
        <button
          onClick={() => navigate("/hospitals")}
          style={{
            padding: "8px 20px",
            borderRadius: "8px",
            fontSize: "13px",
            fontWeight: 500,
            cursor: "pointer",
            background: "#a38a70",
            color: "#fff",
            border: "none",
          }}
        >
          Find Hospitals →
        </button>
      </nav>

      {/* ── Hero ── */}
      <section style={{
        maxWidth: "720px",
        margin: "0 auto",
        padding: "96px 24px 80px",
        textAlign: "center",
      }}>
        <span style={{
          display: "inline-block",
          marginBottom: "20px",
          padding: "5px 14px",
          borderRadius: "999px",
          fontSize: "12px",
          fontWeight: 500,
          background: "rgba(163,138,112,0.1)",
          border: "1px solid rgba(163,138,112,0.35)",
          color: "#a38a70",
        }}>
          🇳🇬 Nigeria's Hospital Directory
        </span>

        <h1 style={{
          fontSize: "clamp(36px, 6vw, 58px)",
          fontWeight: 600,
          lineHeight: 1.1,
          letterSpacing: "-1.5px",
          color: "#2b251f",
          margin: "0 0 20px",
        }}>
          Find the right hospital,<br />
          <span style={{ color: "#a38a70" }}>right when you need it.</span>
        </h1>

        <p style={{
          fontSize: "16px",
          lineHeight: 1.7,
          color: "#5c5449",
          maxWidth: "480px",
          margin: "0 auto 40px",
        }}>
          Search hospitals across Nigeria by city, LGA, or specialty.
          Get directions, view details, and share with anyone — instantly.
        </p>

        <div style={{ display: "flex", gap: "12px", justifyContent: "center", flexWrap: "wrap" }}>
          <button
            onClick={() => navigate("/hospitals")}
            style={{
              padding: "13px 32px",
              borderRadius: "10px",
              fontSize: "14px",
              fontWeight: 600,
              cursor: "pointer",
              background: "#a38a70",
              color: "#fff",
              border: "none",
              boxShadow: "rgba(163,138,112,0.3) 0 4px 14px",
            }}
          >
            🏥 Browse Hospitals
          </button>
          <button
            onClick={() => navigate("/hospitals")}
            style={{
              padding: "13px 32px",
              borderRadius: "10px",
              fontSize: "14px",
              fontWeight: 500,
              cursor: "pointer",
              background: "transparent",
              color: "#5c5449",
              border: "1px solid #e6dfd3",
            }}
          >
            📍 Near Me
          </button>
        </div>
      </section>

      {/* ── Feature cards ── */}
      <section style={{
        maxWidth: "960px",
        margin: "0 auto",
        padding: "0 24px 96px",
        display: "grid",
        gridTemplateColumns: "repeat(auto-fit, minmax(240px, 1fr))",
        gap: "20px",
      }}>
        {[
          { icon: "🔍", title: "Search & Filter", desc: "Find hospitals by name, city, LGA, specialty, or ownership type." },
          { icon: "🗺️", title: "Live Map", desc: "See every hospital pinned on an interactive map with popups." },
          { icon: "📍", title: "Near Me", desc: "Use your location to find hospitals within 5, 10, 25 or 50 km." },
          { icon: "📤", title: "Share & Export", desc: "Export results as CSV or share a filtered link with anyone." },
        ].map((f) => (
          <div
            key={f.title}
            style={{
              padding: "24px",
              borderRadius: "16px",
              background: "#f1ebd9",
              border: "1px solid #e6dfd3",
            }}
          >
            <span style={{ fontSize: "28px", display: "block", marginBottom: "12px" }}>{f.icon}</span>
            <p style={{ fontWeight: 600, fontSize: "14px", color: "#2b251f", margin: "0 0 6px" }}>{f.title}</p>
            <p style={{ fontSize: "13px", color: "#5c5449", lineHeight: 1.6, margin: 0 }}>{f.desc}</p>
          </div>
        ))}
      </section>

      {/* ── CTA banner ── */}
      <section style={{
        margin: "0 24px 80px",
        borderRadius: "20px",
        padding: "48px 32px",
        textAlign: "center",
        background: "#a38a70",
        maxWidth: "960px",
        marginLeft: "auto",
        marginRight: "auto",
      }}>
        <h2 style={{ fontSize: "26px", fontWeight: 600, color: "#fff", margin: "0 0 10px", letterSpacing: "-0.5px" }}>
          Ready to find a hospital?
        </h2>
        <p style={{ fontSize: "14px", color: "rgba(255,255,255,0.8)", margin: "0 0 28px" }}>
          Hundreds of hospitals across Nigeria, all in one place.
        </p>
        <button
          onClick={() => navigate("/hospitals")}
          style={{
            padding: "12px 32px",
            borderRadius: "10px",
            fontSize: "14px",
            fontWeight: 600,
            cursor: "pointer",
            background: "#fff",
            color: "#a38a70",
            border: "none",
          }}
        >
          Get Started →
        </button>
      </section>

      {/* ── Footer ── */}
      <footer style={{
        borderTop: "1px solid #e6dfd3",
        padding: "24px",
        textAlign: "center",
        fontSize: "12px",
        color: "#a38a70",
      }}>
        © {new Date().getFullYear()} CareFinder. All rights reserved.
      </footer>
    </div>
  );
}
