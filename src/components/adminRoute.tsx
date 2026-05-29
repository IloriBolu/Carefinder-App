import { useEffect, useState } from "react";
import { supabase } from "../lib/supabase";
import { Navigate } from "react-router-dom";

export default function AdminRoute({ children }: { children: React.ReactNode }) {
  const [status, setStatus] = useState<"loading" | "allowed" | "denied">("loading");

  useEffect(() => {
    async function check() {
      // 1. Get session
      const { data: { session } } = await supabase.auth.getSession();

      if (!session) {
        console.log("[AdminRoute] No session");
        setStatus("denied");
        return;
      }

      console.log("[AdminRoute] Logged in as:", session.user.email, "id:", session.user.id);

      // 2. Check admins table
      const { data, error } = await supabase
        .from("admins")
        .select("user_id")
        .eq("user_id", session.user.id)
        .single();

      console.log("[AdminRoute] admins query →", { data, error });

      if (error || !data) {
        setStatus("denied");
        return;
      }

      setStatus("allowed");
    }

    check();

    const { data: { subscription } } = supabase.auth.onAuthStateChange(() => {
      check();
    });

    return () => subscription.unsubscribe();
  }, []);

  if (status === "loading") {
    return (
      <div style={{ display: "flex", alignItems: "center", justifyContent: "center", height: "100svh", background: "var(--bg)" }}>
        <p style={{ color: "var(--text)" }}>Checking access…</p>
      </div>
    );
  }

  if (status === "denied") {
    return <Navigate to="/admin/login" replace />;
  }

  return <>{children}</>;
}


