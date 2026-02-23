"use client";

import { useEffect, useState } from "react";
import type { TrackShipmentResponse } from "@courierflow/contracts";
import { publicApiFetch } from "@/lib/api/client";
import { TrackingCurrentStatusCard } from "./tracking-current-status-card";
import { TrackingTimeline } from "./tracking-timeline";

export function TrackingView({ trackingId }: { trackingId: string }) {
  const [data, setData] = useState<TrackShipmentResponse | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const load = async () => {
      setError(null);

      try {
        const response = await publicApiFetch<TrackShipmentResponse>(`/track/${trackingId}`, {
          method: "GET",
        });

        setData(response);
      } catch (err) {
        setError(err instanceof Error ? err.message : "Failed to fetch tracking info");
      }
    };

    void load();
  }, [trackingId]);

  if (error) {
    return <p className="text-red-600">{error}</p>;
  }

  if (!data) {
    return <p>Loading tracking details...</p>;
  }

  return (
    <div className="space-y-4">
      <TrackingCurrentStatusCard snapshot={data.snapshot} />
      <TrackingTimeline timeline={data.timeline} />
    </div>
  );
}
