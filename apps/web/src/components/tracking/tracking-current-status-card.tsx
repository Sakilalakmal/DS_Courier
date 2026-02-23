import type { TrackingSnapshot } from "@courierflow/contracts";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

export function TrackingCurrentStatusCard({ snapshot }: { snapshot: TrackingSnapshot }) {
  const location = snapshot.lastLocation
    ? `${snapshot.lastLocation.lat.toFixed(5)}, ${snapshot.lastLocation.lng.toFixed(5)}`
    : "No location available";

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center justify-between gap-2">
          <span>Current Status</span>
          <Badge variant="outline">{snapshot.currentStatus}</Badge>
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-2 text-sm text-slate-700">
        <p>
          Tracking ID: <strong>{snapshot.trackingId}</strong>
        </p>
        <p>Last updated: {new Date(snapshot.currentStatusAt).toLocaleString()}</p>
        <p>Last location: {location}</p>
      </CardContent>
    </Card>
  );
}
