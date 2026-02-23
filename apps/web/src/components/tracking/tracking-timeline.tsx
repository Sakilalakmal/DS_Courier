import type { TrackingTimelineItem } from "@courierflow/contracts";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

function locationLink(location: { lat: number; lng: number } | null) {
  if (!location) {
    return null;
  }

  const href = `https://www.openstreetmap.org/?mlat=${location.lat}&mlon=${location.lng}#map=16/${location.lat}/${location.lng}`;
  return {
    href,
    label: `${location.lat.toFixed(5)}, ${location.lng.toFixed(5)}`,
  };
}

export function TrackingTimeline({ timeline }: { timeline: TrackingTimelineItem[] }) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Shipment Timeline</CardTitle>
      </CardHeader>
      <CardContent>
        <ul className="space-y-3">
          {timeline.map((item) => {
            const location = locationLink(item.location);
            return (
              <li key={item.eventId} className="rounded-md border p-3">
                <p className="font-medium">{item.status}</p>
                <p className="text-xs text-slate-500">{new Date(item.occurredAt).toLocaleString()}</p>
                <p className="text-sm text-slate-600">Actor: {item.actorRole}</p>
                {location ? (
                  <a className="text-sm text-blue-600 hover:underline" href={location.href} target="_blank" rel="noreferrer">
                    View location: {location.label}
                  </a>
                ) : (
                  <p className="text-sm text-slate-500">Location unavailable</p>
                )}
              </li>
            );
          })}
        </ul>
      </CardContent>
    </Card>
  );
}
