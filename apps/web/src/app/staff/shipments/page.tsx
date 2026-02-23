import Link from "next/link";
import { requireRole } from "@/lib/auth/guards";
import { StaffTrackingNavigator } from "@/components/shipments/staff-tracking-navigator";

export default async function StaffShipmentsPage() {
  await requireRole(["admin", "dispatcher", "supervisor", "driver"]);

  return (
    <main className="mx-auto min-h-screen w-full max-w-3xl space-y-4 p-6">
      <h1 className="text-2xl font-semibold">Staff Shipment Management</h1>
      <p className="text-sm text-slate-600">
        Enter a tracking ID to apply lifecycle status transitions.
      </p>
      <StaffTrackingNavigator />
      <Link className="text-sm text-blue-600 hover:underline" href="/customer/shipments">
        Open shipment list
      </Link>
    </main>
  );
}
