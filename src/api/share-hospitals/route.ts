import { NextResponse } from "next/server";
import { Resend } from "resend";
import { createClient } from "@supabase/supabase-js";

// ── Supabase (server-side) ──
const supabase = createClient(
  process.env.SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

// ── Resend ──
const resend = new Resend(process.env.RESEND_API_KEY!);

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { email, hospitalIds, filters } = body;

    // ── validation ──
    if (!email || !Array.isArray(hospitalIds) || hospitalIds.length === 0) {
      return NextResponse.json(
        { error: "Email and hospital selection are required." },
        { status: 400 }
      );
    }

    // ── fetch hospitals from Supabase ──
    const { data: hospitals, error } = await supabase
      .from("hospitals")
      .select("*")
      .in("id", hospitalIds);

    if (error) {
      console.error("Supabase error:", error);
      return NextResponse.json(
        { error: "Failed to fetch hospitals." },
        { status: 500 }
      );
    }

    // ── build HTML email ──
    const hospitalListHtml = (hospitals || [])
      .map(
        (h) => `
        <div style="padding:12px;border:1px solid #eee;border-radius:8px;margin-bottom:12px">
          <h3 style="margin:0 0 6px 0">${h.name}</h3>
          <p style="margin:0;color:#555">${h.address}</p>
          <p style="margin:4px 0;color:#777">
            ${h.city} • ${h.lga}
          </p>
          <p style="margin:0;font-size:12px;color:#888">
            Specialties: ${(h.specialties || []).join(", ") || "N/A"}
          </p>
        </div>
      `
      )
      .join("");

    const emailHtml = `
      <div>
        <h2>🏥 Shared Hospital List</h2>
        <p>Here are the hospitals shared with you:</p>
        ${hospitalListHtml}

        <hr />

        <p style="font-size:12px;color:#888">
          Filters used:<br/>
          Search: ${filters?.search || "Any"}<br/>
          City: ${filters?.city || "Any"}<br/>
          Specialty: ${filters?.specialty || "Any"}<br/>
          Radius: ${filters?.radius || "Any"} km
        </p>
      </div>
    `;

    // ── send email via Resend ──
    const result = await resend.emails.send({
      from: "CareFinder <onboarding@resend.dev>",
      to: email,
      subject: "Your Shared Hospital List",
      html: emailHtml,
    });

    return NextResponse.json({
      success: true,
      message: "Email sent successfully",
      data: result,
    });
  } catch (err: any) {
    console.error("Route error:", err);

    return NextResponse.json(
      {
        success: false,
        error: err.message || "Internal server error",
      },
      { status: 500 }
    );
  }
}