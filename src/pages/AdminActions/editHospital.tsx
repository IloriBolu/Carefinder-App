import { useState } from "react";
// They likely import supabase directly from the package or basic helper file
import { supabase } from "../../lib/supabase";

// Defining types exactly how it's done in Slide 1/Everyday Types
interface Hospital {
  id: string;
  name: string;
  address: string;
  city: string;
  lga: string;
  ownership_type: string;
  latitude: number | null;
  longitude: number | null;
  specialties: string[];
  description: string | null;
}

interface Props {
  hospital: Hospital;
  onSuccess: () => void;
  onCancel: () => void;
}

// Inlined styles or a plain object because they are still mastering CSS-in-JS
const inputStyle = {
  width: "100%",
  padding: "8px 12px",
  borderRadius: "8px",
  fontSize: "14px",
  outline: "none",
  background: "var(--code-bg)",
  border: "1px solid var(--border)",
  color: "var(--text-h)",
  boxSizing: "border-box" as const,
};

export default function EditHospital({ hospital, onSuccess, onCancel }: Props) {
  const [name, setName] = useState<string>(hospital.name);
  const [address, setAddress] = useState<string>(hospital.address);
  const [city, setCity] = useState<string>(hospital.city);
  const [lga, setLga] = useState<string>(hospital.lga);
  const [ownershipType, setOwnershipType] = useState<string>(hospital.ownership_type || "");
  const [latitude, setLatitude] = useState<string>(hospital.latitude !== null ? hospital.latitude.toString() : "");
  const [longitude, setLongitude] = useState<string>(hospital.longitude !== null ? hospital.longitude.toString() : "");
  const initialSpecialties = hospital.specialties ? hospital.specialties.join(", ") : "";
  const [specialties, setSpecialties] = useState<string>(initialSpecialties);
  const [description, setDescription] = useState<string>(hospital.description || "");
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);


  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setLoading(true);

    let specialtiesArray: string[] = [];
    if (specialties.trim() !== "") {
      specialtiesArray = specialties.split(",").map(function (item) {
        return item.trim();
      });
    }

    const finalLat = latitude ? parseFloat(latitude) : null;
    const finalLng = longitude ? parseFloat(longitude) : null;

    const result = await supabase
      .from("hospitals")
      .update({
        name: name.trim(),
        address: address.trim(),
        city: city.trim(),
        lga: lga.trim(),
        ownership_type: ownershipType.trim() || null,
        latitude: finalLat,
        longitude: finalLng,
        specialties: specialtiesArray,
        description: description.trim() || null,
      })
      .eq("id", hospital.id);

    setLoading(false);

    if (result.error) {
      setError(result.error.message);
    } else {
      onSuccess();
    }
  }

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center px-4"
      style={{ background: "rgba(0,0,0,0.45)", backdropFilter: "blur(3px)" }}
    >
      <div
        className="w-full max-w-lg rounded-2xl p-6 overflow-y-auto"
        style={{
          background: "var(--bg)",
          border: "1px solid var(--border)",
          boxShadow: "var(--shadow)",
          maxHeight: "90svh",
        }}
      >
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <h2 style={{ color: "var(--text-h)", fontSize: "18px", margin: 0 }}>
            Edit Hospital
          </h2>
          <button onClick={onCancel} style={{ ...inputStyle, width: "auto", padding: "6px 14px", cursor: "pointer" }}>
            ✕ Cancel
          </button>
        </div>

        {/* Error Notification */}
        {error !== null ? (
          <div className="mb-4 px-4 py-3 rounded-lg text-sm"
            style={{ background: "rgba(229,62,62,0.08)", border: "1px solid rgba(229,62,62,0.25)", color: "#c53030" }}>
            ⚠️ {error}
          </div>
        ) : null}

        <form onSubmit={handleSubmit} className="flex flex-col gap-4">

          <div className="flex flex-col gap-1.5">
            <label className="text-xs font-medium" style={{ color: "var(--text)" }}>Hospital Name *</label>
            <input style={inputStyle} value={name} onChange={(e) => setName(e.target.value)} required />
          </div>

          <div className="flex flex-col gap-1.5">
            <label className="text-xs font-medium" style={{ color: "var(--text)" }}>Address *</label>
            <input style={inputStyle} value={address} onChange={(e) => setAddress(e.target.value)} required />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="flex flex-col gap-1.5">
              <label className="text-xs font-medium" style={{ color: "var(--text)" }}>City *</label>
              <input style={inputStyle} value={city} onChange={(e) => setCity(e.target.value)} required />
            </div>
            <div className="flex flex-col gap-1.5">
              <label className="text-xs font-medium" style={{ color: "var(--text)" }}>LGA *</label>
              <input style={inputStyle} value={lga} onChange={(e) => setLga(e.target.value)} required />
            </div>
          </div>

          <div className="flex flex-col gap-1.5">
            <label className="text-xs font-medium" style={{ color: "var(--text)" }}>Ownership Type</label>
            <select style={inputStyle} value={ownershipType} onChange={(e) => setOwnershipType(e.target.value)}>
              <option value="">Select…</option>
              <option value="Public">Government</option>
              <option value="Private">Private</option>
            </select>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="flex flex-col gap-1.5">
              <label className="text-xs font-medium" style={{ color: "var(--text)" }}>Latitude</label>
              <input style={inputStyle} type="number" step="any" value={latitude} onChange={(e) => setLatitude(e.target.value)} />
            </div>
            <div className="flex flex-col gap-1.5">
              <label className="text-xs font-medium" style={{ color: "var(--text)" }}>Longitude</label>
              <input style={inputStyle} type="number" step="any" value={longitude} onChange={(e) => setLongitude(e.target.value)} />
            </div>
          </div>

          <div className="flex flex-col gap-1.5">
            <label className="text-xs font-medium" style={{ color: "var(--text)" }}>Specialties — comma-separated</label>
            <input style={inputStyle} value={specialties} onChange={(e) => setSpecialties(e.target.value)} />
          </div>

          <div className="flex flex-col gap-1.5">
            <label className="text-xs font-medium" style={{ color: "var(--text)" }}>Description</label>
            <textarea style={{ ...inputStyle, resize: "none" }} value={description}
              onChange={(e) => setDescription(e.target.value)} rows={3} />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="py-2.5 rounded-lg text-sm font-medium transition mt-2"
            style={{
              background: loading ? "var(--accent-bg)" : "var(--accent)",
              color: loading ? "var(--accent)" : "#fff",
              border: "1px solid var(--accent-border)",
              cursor: loading ? "not-allowed" : "pointer",
              opacity: loading ? 0.7 : 1,
            }}
          >
            {loading ? "Saving…" : "Save Changes"}
          </button>
        </form>
      </div>
    </div>
  );
}