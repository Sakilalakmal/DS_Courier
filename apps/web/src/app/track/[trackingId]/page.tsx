import { TrackingView } from "@/components/tracking/tracking-view";

export default async function TrackShipmentPage({
  params,
}: {
  params: Promise<{ trackingId: string }>;
}) {
  const { trackingId } = await params;

  return (
    <main className="mx-auto min-h-screen w-full max-w-4xl space-y-4 p-6">
      <header className="space-y-1">
        <h1 className="text-2xl font-semibold">Track Shipment</h1>
        <p className="text-sm text-slate-600">Public tracking view for {trackingId}</p>
      </header>

      <TrackingView trackingId={trackingId} />
    </main>
  );
}
