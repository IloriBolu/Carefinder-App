import React, { use, useState } from "react";
import { supabase } from "../../lib/supabase";

interface AddHospitalProps {
  onSuccess: () => void;
  onCancel: () => void;
}

export default function AddHospital({ onSuccess, onCancel }: AddHospitalProps) {
  const [name, setName] = useState<string>("");
  const [address, setAddress] = useState<string>("");
  const [city, setCity] = useState<string>("");
  const [lga, setLga] = useState<string>("");
  const [ownershipType, setOwnershipType] = useState<string>("");
  const [latitude, setLatitude] = useState<string>("");
  const [longitude, setLongitude] = useState<string>("");
  const [specialties, setSpecialties] = useState<string>("");
  const [description, setDescription] = useState<string>("");

  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError(null);
    setLoading(true);
    const specialtiesArray = specialties
      ? specialties.split(",").map((item) => item.trim())
      : [];

    const latValue = latitude ? parseFloat(latitude) : null;
    const lngValue = longitude ? parseFloat(longitude) : null;

    try {
      const { error } = await supabase.from("hospitals").insert({
        name: name.trim(),
        address: address.trim(),
        city: city.trim(),
        lga: lga.trim(),
        ownership_type: ownershipType || null,
        latitude: latValue,
        longitude: lngValue,
        specialties: specialtiesArray,
        description: description.trim() || null,
      });

      if (error) {
        setError(error.message);
      } else {
        setName("");
        setAddress("");
        setCity("");
        setLga("");
        setOwnershipType("");
        setLatitude("");
        setLongitude("");
        setSpecialties("");
        setDescription("");
        
        onSuccess();
      }
    } catch (err: any) {
      setError("Something went wrong");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center px-4"
      style={{ background: "rgba(0,0,0,0.45)", backdropFilter: "blur(3px)", color:"white" }}
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
          <h2 className="text-xl font-bold" style={{ color: "var(--text-h)" }}>
            Add Hospital
          </h2>
          <button 
            type="button"
            onClick={onCancel} 
            className="border rounded-lg px-4 py-1.5 text-sm cursor-pointer"
            style={{ border: "1px solid var(--border)", background: "var(--code-bg)", color: "var(--text)" }}
          >
            ✕ Cancel
          </button>
        </div>

        {error && (
          <div className="mb-4 px-4 py-3 rounded-lg text-sm"
            style={{ background: "rgba(229,62,62,0.08)", border: "1px solid rgba(229,62,62,0.25)", color: "#c53030" }}>
            ⚠️ {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          <div className="flex flex-col gap-1.5">
            <label className="text-xs font-medium" style={{ color: "var(--text)" }}>Hospital Name *</label>
            <input 
              type="text"
              className="w-full p-2.5 rounded-lg text-sm outline-none" style={{ background: "var(--code-bg)", border: "1px solid var(--border)", color: "var(--text-h)" }}
              value={name} 
              onChange={(e) => setName(e.target.value)} 
              required 
              placeholder="e.g. Lagos Island General Hospital" 
            />
          </div>

          <div className="flex flex-col gap-1.5">
            <label className="text-xs font-medium" style={{ color: "var(--text)" }}>Address *</label>
            <input 
              type="text"
              className="w-full p-2.5 rounded-lg text-sm outline-none" style={{ background: "var(--code-bg)", border: "1px solid var(--border)", color: "var(--text-h)" }}
              value={address} 
              onChange={(e) => setAddress(e.target.value)} 
              required 
              placeholder="e.g. 1 Hospital Road, Lagos Island" 
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="flex flex-col gap-1.5">
              <label className="text-xs font-medium" style={{ color: "var(--text)" }}>City *</label>
              <input 
                type="text"
                className="w-full p-2.5 rounded-lg text-sm outline-none" style={{ background: "var(--code-bg)", border: "1px solid var(--border)", color: "var(--text-h)" }}
                value={city} 
                onChange={(e) => setCity(e.target.value)} 
                required 
                placeholder="e.g. Lagos" 
              />
            </div>
            <div className="flex flex-col gap-1.5">
              <label className="text-xs font-medium" style={{ color: "var(--text)" }}>LGA *</label>
              <input 
                type="text"
                className="w-full p-2.5 rounded-lg text-sm outline-none" style={{ background: "var(--code-bg)", border: "1px solid var(--border)", color: "var(--text-h)" }}
                value={lga} 
                onChange={(e) => setLga(e.target.value)} 
                required 
                placeholder="e.g. Lagos Island" 
              />
            </div>
          </div>

          <div className="flex flex-col gap-1.5">
            <label className="text-xs font-medium" style={{ color: "var(--text)" }}>Ownership Type</label>
            <select 
              className="w-full p-2.5 rounded-lg text-sm outline-none" style={{ background: "var(--code-bg)", border: "1px solid var(--border)", color: "var(--text-h)" }}
              value={ownershipType} 
              onChange={(e) => setOwnershipType(e.target.value)}
            >
              <option value="">Select…</option>
              <option value="Public">Public</option>
              <option value="Private">Private</option>
            </select>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="flex flex-col gap-1.5">
              <label className="text-xs font-medium" style={{ color: "var(--text)" }}>Latitude</label>
              <input 
                className="w-full p-2.5 rounded-lg text-sm outline-none" style={{ background: "var(--code-bg)", border: "1px solid var(--border)", color: "var(--text-h)" }}
                type="number" 
                step="any" 
                value={latitude} 
                onChange={(e) => setLatitude(e.target.value)} 
                placeholder="e.g. 6.4550" 
              />
            </div>
            <div className="flex flex-col gap-1.5">
              <label className="text-xs font-medium" style={{ color: "var(--text)" }}>Longitude</label>
              <input 
                className="w-full p-2.5 rounded-lg text-sm outline-none" style={{ background: "var(--code-bg)", border: "1px solid var(--border)", color: "var(--text-h)" }}
                type="number" 
                step="any" 
                value={longitude} 
                onChange={(e) => setLongitude(e.target.value)} 
                placeholder="e.g. 3.3841" 
              />
            </div>
          </div>

          <div className="flex flex-col gap-1.5">
            <label className="text-xs font-medium" style={{ color: "var(--text)" }}>Specialties <span style={{ opacity: 0.6, fontWeight: 400 }}>— comma-separated</span></label>
            <input 
              type="text"
              className="w-full p-2.5 rounded-lg text-sm outline-none" style={{ background: "var(--code-bg)", border: "1px solid var(--border)", color: "var(--text-h)" }}
              value={specialties} 
              onChange={(e) => setSpecialties(e.target.value)} 
              placeholder="Cardiology, Pediatrics, Surgery..." 
            />
          </div>

          <div className="flex flex-col gap-1.5">
            <label className="text-xs font-medium" style={{ color: "var(--text)" }}>Description</label>
            <textarea 
              className="w-full p-2.5 rounded-lg text-sm outline-none resize-none" style={{ background: "var(--code-bg)", border: "1px solid var(--border)", color: "var(--text-h)" }}
              value={description} 
              onChange={(e) => setDescription(e.target.value)} 
              placeholder="Brief description…" 
              rows={3} 
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full py-2.5 rounded-lg text-sm font-medium transition mt-2"
            style={{
              background: loading ? "var(--accent-bg)" : "var(--accent)",
              color: loading ? "var(--accent)" : "#fff",
              border: "1px solid var(--accent-border)",
              cursor: loading ? "not-allowed" : "pointer",
              opacity: loading ? 0.7 : 1,
            }}
          >
            {loading ? "Saving…" : "Add Hospital"}
          </button>
        </form>
      </div>
    </div>
  );
}

