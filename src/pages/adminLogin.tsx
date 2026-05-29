import { useState } from "react";
import { supabase } from "../lib/supabase";
import { useNavigate } from "react-router-dom";

export default function AdminLogin() {
  const [email, setEmail] = useState<string>("");
  const [password, setPassword] = useState<string>(""); 
  const [error, setError] = useState<string | null>(null); 
  const [loading, setLoading] = useState<boolean>(false); 

  const navigate = useNavigate();

  async function handleLogin(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    
    setError(null);
    setLoading(true); 

    const { data, error: authError } = await supabase.auth.signInWithPassword({ 
      email: email, 
      password: password 
    });

    setLoading(false);

    if (authError !== null) {
      console.log("Authentication failed:", authError.message);
      setError(authError.message);
    } else {
      console.log("Login successful! Data:", data);
      navigate("/admin");
    }
  }

  return (
    <div
      className="flex items-center justify-center min-h-screen px-4"
      style={{ background: "var(--bg)" }}
    >
      <div
        className="w-full max-w-sm rounded-2xl p-8"
        style={{
          background: "var(--code-bg)",
          border: "1px solid var(--border)",
          boxShadow: "var(--shadow)",
        }}
      >
        <div className="text-center mb-8">
          <span className="text-4xl">🏥</span>
          <h1
            className="mt-3 mb-1"
            style={{ fontSize: "22px", letterSpacing: "-0.3px", color: "var(--text-h)" }}
          >
            CareFinder Admin User
          </h1>
          <p className="text-sm" style={{ color: "var(--text)" }}>
            Sign in to access the dashboard
          </p>
        </div>
        {error !== null ? (
          <div
            className="mb-5 px-4 py-3 rounded-lg text-sm"
            style={{
              background: "rgba(229,62,62,0.08)",
              border: "1px solid rgba(229,62,62,0.25)",
              color: "#c53030",
            }}
          >
            ⚠️ {error}
          </div>
        ) : null}
        <form onSubmit={handleLogin} className="flex flex-col gap-4">
          <div className="flex flex-col gap-1.5">
            <label className="text-xs font-medium" style={{ color: "var(--text)" }}>
              Email Address
            </label>
            <input
              type="email"
              placeholder="admin@example.com"
              value={email}
              onChange={(e: React.ChangeEvent<HTMLInputElement>) => { setEmail(e.target.value); }}
              required={true}
              className="px-4 py-2.5 rounded-lg text-sm outline-none transition"
              style={{
                background: "var(--bg)",
                border: "1px solid var(--border)",
                color: "var(--text-h)",
              }}
            />
          </div>
          <div className="flex flex-col gap-1.5">
            <label className="text-xs font-medium" style={{ color: "var(--text)" }}>
              Password
            </label>
            <input
              type="password"
              placeholder="••••••••"
              value={password}
              onChange={(e: React.ChangeEvent<HTMLInputElement>) => { setPassword(e.target.value); }}
              required={true}
              className="px-4 py-2.5 rounded-lg text-sm outline-none transition"
              style={{
                background: "var(--bg)",
                border: "1px solid var(--border)",
                color: "var(--text-h)",
              }}
            />
          </div>
          <button
            type="submit"
            disabled={loading === true}
            className="mt-2 py-2.5 rounded-lg text-sm font-medium transition"
            style={{
              background: loading === true ? "var(--accent-bg)" : "var(--accent)",
              color: loading === true ? "var(--accent)" : "#fff",
              border: "1px solid var(--accent-border)",
              cursor: loading === true ? "not-allowed" : "pointer",
              opacity: loading === true ? 0.7 : 1,
            }}
          >
            {loading === true ? "Signing in…" : "Sign in"}
          </button>
        </form>
      </div>
    </div>
  );
}