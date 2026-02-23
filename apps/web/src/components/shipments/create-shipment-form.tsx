"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { apiFetch } from "@/lib/api/client";

const initialAddress = {
  line1: "",
  line2: "",
  city: "",
  state: "",
  postalCode: "",
  country: "",
};

export function CreateShipmentForm() {
  const router = useRouter();
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [weightKg, setWeightKg] = useState("1");
  const [origin, setOrigin] = useState(initialAddress);
  const [destination, setDestination] = useState(initialAddress);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const submit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setLoading(true);
    setError(null);

    try {
      await apiFetch("/shipments", {
        method: "POST",
        body: JSON.stringify({
          title,
          description,
          weightKg: Number(weightKg),
          origin,
          destination,
        }),
      });
      router.push("/customer/shipments");
      router.refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to create shipment");
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={submit} className="space-y-3 rounded border bg-white p-6">
      <h1 className="text-lg font-semibold">Create Shipment</h1>
      <input className="w-full rounded border px-3 py-2" placeholder="Title" value={title} onChange={(e) => setTitle(e.target.value)} required />
      <textarea className="w-full rounded border px-3 py-2" placeholder="Description" value={description} onChange={(e) => setDescription(e.target.value)} />
      <input className="w-full rounded border px-3 py-2" placeholder="Weight (kg)" type="number" min="0.1" step="0.1" value={weightKg} onChange={(e) => setWeightKg(e.target.value)} required />

      <fieldset className="rounded border p-3">
        <legend className="px-1 text-sm font-medium">Origin</legend>
        <div className="grid gap-2 md:grid-cols-2">
          <input className="rounded border px-3 py-2" placeholder="Line 1" value={origin.line1} onChange={(e) => setOrigin((prev) => ({ ...prev, line1: e.target.value }))} required />
          <input className="rounded border px-3 py-2" placeholder="Line 2" value={origin.line2} onChange={(e) => setOrigin((prev) => ({ ...prev, line2: e.target.value }))} />
          <input className="rounded border px-3 py-2" placeholder="City" value={origin.city} onChange={(e) => setOrigin((prev) => ({ ...prev, city: e.target.value }))} required />
          <input className="rounded border px-3 py-2" placeholder="State" value={origin.state} onChange={(e) => setOrigin((prev) => ({ ...prev, state: e.target.value }))} required />
          <input className="rounded border px-3 py-2" placeholder="Postal" value={origin.postalCode} onChange={(e) => setOrigin((prev) => ({ ...prev, postalCode: e.target.value }))} required />
          <input className="rounded border px-3 py-2" placeholder="Country" value={origin.country} onChange={(e) => setOrigin((prev) => ({ ...prev, country: e.target.value }))} required />
        </div>
      </fieldset>

      <fieldset className="rounded border p-3">
        <legend className="px-1 text-sm font-medium">Destination</legend>
        <div className="grid gap-2 md:grid-cols-2">
          <input className="rounded border px-3 py-2" placeholder="Line 1" value={destination.line1} onChange={(e) => setDestination((prev) => ({ ...prev, line1: e.target.value }))} required />
          <input className="rounded border px-3 py-2" placeholder="Line 2" value={destination.line2} onChange={(e) => setDestination((prev) => ({ ...prev, line2: e.target.value }))} />
          <input className="rounded border px-3 py-2" placeholder="City" value={destination.city} onChange={(e) => setDestination((prev) => ({ ...prev, city: e.target.value }))} required />
          <input className="rounded border px-3 py-2" placeholder="State" value={destination.state} onChange={(e) => setDestination((prev) => ({ ...prev, state: e.target.value }))} required />
          <input className="rounded border px-3 py-2" placeholder="Postal" value={destination.postalCode} onChange={(e) => setDestination((prev) => ({ ...prev, postalCode: e.target.value }))} required />
          <input className="rounded border px-3 py-2" placeholder="Country" value={destination.country} onChange={(e) => setDestination((prev) => ({ ...prev, country: e.target.value }))} required />
        </div>
      </fieldset>

      {error ? <p className="text-sm text-red-600">{error}</p> : null}
      <button type="submit" disabled={loading} className="rounded bg-slate-900 px-4 py-2 text-white">
        {loading ? "Creating..." : "Create Shipment"}
      </button>
    </form>
  );
}
