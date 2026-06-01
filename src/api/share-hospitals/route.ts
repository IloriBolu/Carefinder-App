import { NextResponse } from "next/server";
import { Resend } from "resend";
import { createClient } from "@supabase/supabase-js";

const supabase = createClient(
  process.env.SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

const resend = new Resend(process.env.RESEND_API_KEY!);

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
    city?: string;
    specialty?: string;
    radius?: string | number;
  };
}

export async function POST(request: Request) {
  try {
    const body: RequestBody = await request.json();
    const { email, hospitalIds, filters } = body;
    if (email === undefined || !Array.isArray(hospitalIds) || hospitalIds.length === 0) {
      return NextResponse.json(
        { error: "Email and hospital selection are required." },
        { status: 400 }
      );
    }
    const { data: hospitals, error } = await supabase
      .from("hospitals")
      .select("name, address, city, lga, specialties")
      .in("id", hospitalIds);

    if (error !== null) {
      console.error("Supabase error:", error);
      return NextResponse.json(
        { error: "Failed to fetch hospitals." },
        { status: 500 }
      );
    }

    const hospitalList: Hospital[] = hospitals || [];
    const hospitalListHtml = hospitalList
      .map(
        (h) => `
        <div style="padding:12px;border:1px solid #eee;border-radius:8px;margin-bottom:12px">
          <h3 style="margin:0 0 6px 0">${h.name}</h3>
          <p style="margin:0;color:#555">${h.address}</p>
          <p style="margin:4px 0;color:#777">
            ${h.city} • ${h.lga}
          </p>
          <p style="margin:0;font-size:12px;color:#888">
            Specialties: ${Array.isArray(h.specialties) && h.specialties.length > 0 ? h.specialties.join(", ") : "N/A"}
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
  } catch (err: unknown) {
    console.error("Route error:", err);
    const errorMessage = err instanceof Error ? err.message : "Internal server error";

    return NextResponse.json(
      {
        success: false,
        error: errorMessage,
      },
      { status: 500 }
    );
  }
}