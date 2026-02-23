"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import type { ShipmentDetail } from "@courierflow/contracts";
import { apiFetch } from "@/lib/api/client";

type ShipmentDetailResponse = {
  shipment: ShipmentDetail;
};

export function ShipmentDetailView({ trackingId }: { trackingId: string }) {
  const [shipment, setShipment] = useState<ShipmentDetail | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const run = async () => {
      try {
        const response = await apiFetch<ShipmentDetailResponse>(`/shipments/${trackingId}`, {
          method: "GET",
        });
        setShipment(response.shipment);
      } catch (err) {
        setError(err instanceof Error ? err.message : "Failed to load shipment");
      }
    };

    void run();
  }, [trackingId]);

  if (error) {
    return <p className="text-red-600">{error}</p>;
  }

  if (!shipment) {
    return <p>Loading shipment details...</p>;
  }

  return (
    <section className="space-y-4 rounded border bg-white p-6">
      <div>
        <h1 className="text-xl font-semibold">{shipment.trackingId}</h1>
        <p className="text-sm text-slate-600">{shipment.title}</p>
      </div>

      <p>Status: <strong>{shipment.status}</strong></p>
      <div className="flex flex-wrap gap-3 text-sm">
        <Link className="text-blue-600 hover:underline" href={`/track/${shipment.trackingId}`}>
          Public tracking view
        </Link>
        <Link className="text-blue-600 hover:underline" href={`/staff/shipments/${shipment.trackingId}`}>
          Staff status management
        </Link>
      </div>

      <div>
        <h2 className="mb-2 text-sm font-semibold uppercase text-slate-500">Events</h2>
        <ul className="space-y-2">
          {shipment.events.map((event) => (
            <li key={event.id} className="rounded border p-3">
              <p className="font-medium">{event.oldStatus} {"->"} {event.newStatus}</p>
              <p className="text-xs text-slate-500">{new Date(event.occurredAt).toLocaleString()}</p>
              <p className="text-xs text-slate-600">By {event.actorRole}</p>
              {event.location ? (
                <a
                  className="text-xs text-blue-600 hover:underline"
                  href={`https://www.openstreetmap.org/?mlat=${event.location.lat}&mlon=${event.location.lng}#map=16/${event.location.lat}/${event.location.lng}`}
                  target="_blank"
                  rel="noreferrer"
                >
                  {event.location.lat.toFixed(5)}, {event.location.lng.toFixed(5)}
                </a>
              ) : null}
              {event.note ? <p className="text-sm">{event.note}</p> : null}
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}
