import Link from "next/link";
import { requireRole } from "@/lib/auth/guards";
import { ShipmentList } from "@/components/shipments/shipment-list";

export default async function CustomerShipmentsPage() {
  await requireRole(["customer", "admin", "dispatcher", "supervisor", "driver"]);

  return (
    <main className="mx-auto flex min-h-screen w-full max-w-4xl flex-col gap-4 p-6">
      <header className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">My Shipments</h1>
        <Link className="rounded bg-slate-900 px-4 py-2 text-white" href="/customer/shipments/new">
          New Shipment
        </Link>
      </header>

      <ShipmentList />
    </main>
  );
}
