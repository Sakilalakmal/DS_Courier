import { requireRole } from "@/lib/auth/guards";
import { StaffStatusUpdateForm } from "@/components/shipments/staff-status-update-form";

export default async function StaffShipmentStatusPage({
  params,
}: {
  params: Promise<{ trackingId: string }>;
}) {
  await requireRole(["admin", "dispatcher", "supervisor", "driver"]);
  const { trackingId } = await params;

  return (
    <main className="mx-auto min-h-screen w-full max-w-3xl space-y-4 p-6">
      <header>
        <h1 className="text-2xl font-semibold">Staff Shipment Status Update</h1>
      </header>
      <StaffStatusUpdateForm trackingId={trackingId} />
    </main>
  );
}
