import { requireSession } from "@/lib/auth/guards";
import { ShipmentDetailView } from "@/components/shipments/shipment-detail-view";

export default async function ShipmentDetailPage({
  params,
}: {
  params: Promise<{ trackingId: string }>;
}) {
  await requireSession();
  const { trackingId } = await params;

  return (
    <main className="mx-auto min-h-screen w-full max-w-4xl p-6">
      <ShipmentDetailView trackingId={trackingId} />
    </main>
  );
}
