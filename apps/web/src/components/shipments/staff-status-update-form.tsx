"use client";

import { useEffect, useMemo, useState } from "react";
import {
  ShipmentDetail,
  ShipmentStatus,
  allowedShipmentTransitions,
} from "@courierflow/contracts";
import { apiFetch } from "@/lib/api/client";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

type ShipmentDetailResponse = {
  shipment: ShipmentDetail;
};

export function StaffStatusUpdateForm({ trackingId }: { trackingId: string }) {
  const [shipment, setShipment] = useState<ShipmentDetail | null>(null);
  const [status, setStatus] = useState<ShipmentStatus | "">("");
  const [note, setNote] = useState("");
  const [lat, setLat] = useState("");
  const [lng, setLng] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const load = async () => {
      try {
        const response = await apiFetch<ShipmentDetailResponse>(`/shipments/${trackingId}`, {
          method: "GET",
        });
        setShipment(response.shipment);
      } catch (err) {
        setError(err instanceof Error ? err.message : "Failed to load shipment");
      }
    };

    void load();
  }, [trackingId]);

  const allowedStatuses = useMemo(() => {
    if (!shipment) {
      return [];
    }

    return allowedShipmentTransitions[shipment.status] ?? [];
  }, [shipment]);

  useEffect(() => {
    const [first] = allowedStatuses;
    if (first) {
      setStatus(first);
    }
  }, [allowedStatuses]);

  const submit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    if (!status) {
      setError("Please select a valid next status");
      return;
    }

    setError(null);
    setSuccess(null);
    setLoading(true);

    try {
      await apiFetch(`/shipments/${trackingId}/status`, {
        method: "PATCH",
        body: JSON.stringify({
          status,
          note: note || undefined,
          location:
            lat.trim() && lng.trim()
              ? {
                  lat: Number(lat),
                  lng: Number(lng),
                }
              : null,
        }),
      });

      setSuccess(`Status updated to ${status}`);

      const response = await apiFetch<ShipmentDetailResponse>(`/shipments/${trackingId}`, {
        method: "GET",
      });
      setShipment(response.shipment);
      setNote("");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to update status");
    } finally {
      setLoading(false);
    }
  };

  if (error && !shipment) {
    return <p className="text-red-600">{error}</p>;
  }

  if (!shipment) {
    return <p>Loading shipment...</p>;
  }

  return (
    <div className="space-y-4">
      <Card>
        <CardHeader>
          <CardTitle>Shipment {shipment.trackingId}</CardTitle>
        </CardHeader>
        <CardContent className="space-y-1 text-sm">
          <p>Title: {shipment.title}</p>
          <p>
            Current Status: <strong>{shipment.status}</strong>
          </p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Update Status</CardTitle>
        </CardHeader>
        <CardContent>
          <form className="space-y-4" onSubmit={submit}>
            <div className="space-y-2">
              <Label>Allowed Next Status</Label>
              <Select value={status} onValueChange={(value) => setStatus(value as ShipmentStatus)}>
                <SelectTrigger>
                  <SelectValue placeholder="Select status" />
                </SelectTrigger>
                <SelectContent>
                  {allowedStatuses.map((item) => (
                    <SelectItem key={item} value={item}>
                      {item}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label>Note (optional)</Label>
              <Input value={note} onChange={(event) => setNote(event.target.value)} placeholder="Status note" />
            </div>

            <div className="grid gap-3 md:grid-cols-2">
              <div className="space-y-2">
                <Label>Latitude (optional)</Label>
                <Input value={lat} onChange={(event) => setLat(event.target.value)} placeholder="6.9271" />
              </div>
              <div className="space-y-2">
                <Label>Longitude (optional)</Label>
                <Input value={lng} onChange={(event) => setLng(event.target.value)} placeholder="79.8612" />
              </div>
            </div>

            {error ? <p className="text-sm text-red-600">{error}</p> : null}
            {success ? <p className="text-sm text-green-700">{success}</p> : null}

            <Button type="submit" disabled={loading || allowedStatuses.length === 0}>
              {loading ? "Updating..." : "Update Status"}
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
