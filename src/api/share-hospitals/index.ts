import { createClient } from "https://esm.sh/@supabase/supabase-js@2";
import { Resend } from "https://esm.sh/resend@2";

const resend = new Resend(Deno.env.get("RESEND_API_KEY")!);

const supabase = createClient(
  Deno.env.get("SUPABASE_URL")!,
  Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!
);

// Standardize CORS responses and headers
const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type, Authorization",
};

interface Hospital {
  name: string;
  address: string;
  city: string;
  lga: string;
  specialties: string[] | null;
}

interface RequestBody {
  email?: string;
  hospitalIds?: string[];
  filters?: {
    search?: string;
    ownership?: string;
    specialty?: string;
    radius?: string | number;
  };
}

Deno.serve(async (req: Request) => {
  if (req.method === "OPTIONS") {
    return new Response(null, {
      status: 204,
      headers: corsHeaders,
    });
  }

  try {
    const body: RequestBody = await req.json();
    const { email, hospitalIds, filters } = body;

    if (email === undefined || !Array.isArray(hospitalIds) || hospitalIds.length === 0) {
      return new Response(
        JSON.stringify({ error: "Email and at least one hospital are required." }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }
    const { data: hospitals, error } = await supabase
      .from("hospitals")
      .select("name, address, city, lga, specialties")
      .in("id", hospitalIds);

    if (error !== null) {
      console.error("Supabase error:", error);
      return new Response(
        JSON.stringify({ error: "Failed to fetch hospitals." }),
        { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const hospitalList: Hospital[] = hospitals || [];
    const rows = hospitalList
      .map(
        (h) => `
        <div style="padding:12px 16px;border:1px solid #e6dfd3;border-radius:10px;margin-bottom:12px;font-family:system-ui,sans-serif">
          <p style="margin:0 0 4px;font-weight:600;font-size:15px;color:#2b251f">${h.name}</p>
          <p style="margin:0 0 2px;font-size:13px;color:#5c5449">📍 ${h.address}</p>
          <p style="margin:0 0 2px;font-size:13px;color:#5c5449">🏙 ${h.city} &bull; ${h.lga} LGA</p>
          ${Array.isArray(h.specialties) && h.specialties.length > 0 ? `<p style="margin:4px 0 0;font-size:12px;color:#a38a70">Specialties: ${h.specialties.join(", ")}</p>` : ""}
        </div>`
      )
      .join("");

    const filterSummary = [
      filters?.search ? `Search: <strong>${filters.search}</strong>` : "",
      filters?.ownership ? `Ownership: <strong>${filters.ownership}</strong>` : "",
      filters?.specialty ? `Specialty: <strong>${filters.specialty}</strong>` : "",
      filters?.radius ? `Radius: <strong>${filters.radius} km</strong>` : "",
    ]
      .filter((str) => str !== "")
      .join(" &nbsp;·&nbsp; ");

    const html = `
      <div style="max-width:560px;margin:0 auto;font-family:system-ui,sans-serif;color:#2b251f">
        <h2 style="margin:0 0 4px;font-size:22px">🏥 Hospital List</h2>
        <p style="margin:0 0 20px;font-size:14px;color:#5c5449">
          Someone shared this list of hospitals with you via CareFinder.
        </p>
        ${rows}
        ${filterSummary !== "" ? `<p style="margin-top:20px;font-size:12px;color:#a38a70">Filters applied: ${filterSummary}</p>` : ""}
        <hr style="border:none;border-top:1px solid #e6dfd3;margin:24px 0" />
        <p style="font-size:11px;color:#a38a70;margin:0">Sent via CareFinder</p>
      </div>
    `;

    const result = await resend.emails.send({
      from: "CareFinder <onboarding@resend.dev>",
      to: email,
      subject: `${hospitalList.length} hospital${hospitalList.length !== 1 ? "s" : ""} shared with you`,
      html: html,
    });

    return new Response(
      JSON.stringify({ success: true, data: result }),
      { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (err: unknown) {
    console.error("Edge function error:", err);
    const errorMessage = err instanceof Error ? err.message : "Internal server error";
    return new Response(
      JSON.stringify({ success: false, error: errorMessage }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});