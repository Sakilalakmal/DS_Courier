"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import type { ShipmentSummary } from "@courierflow/contracts";
import { apiFetch } from "@/lib/api/client";

type ShipmentsResponse = {
  shipments: ShipmentSummary[];
};

export function ShipmentList() {
  const [shipments, setShipments] = useState<ShipmentSummary[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const run = async () => {
      try {
        const response = await apiFetch<ShipmentsResponse>("/shipments", {
          method: "GET",
        });
        setShipments(response.shipments);
      } catch (err) {
        setError(err instanceof Error ? err.message : "Failed to load shipments");
      } finally {
        setLoading(false);
      }
    };

    void run();
  }, []);

  if (loading) {
    return <p>Loading shipments...</p>;
  }

  if (error) {
    return <p className="text-red-600">{error}</p>;
  }

  if (shipments.length === 0) {
    return <p>No shipments yet.</p>;
  }

  return (
    <div className="space-y-3">
      {shipments.map((shipment) => (
        <article key={shipment.id} className="rounded border p-4">
          <p className="font-medium">{shipment.trackingId}</p>
          <p className="text-sm text-slate-600">{shipment.title}</p>
          <p className="text-xs uppercase text-slate-500">{shipment.status}</p>
          <Link className="mt-2 inline-block text-sm text-blue-600" href={`/shipments/${shipment.trackingId}`}>
            View details
          </Link>
        </article>
      ))}
    </div>
  );
}
