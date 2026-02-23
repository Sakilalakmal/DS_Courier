import Link from "next/link";
import { requireRole } from "@/lib/auth/guards";
import { CreateShipmentForm } from "@/components/shipments/create-shipment-form";

export default async function NewShipmentPage() {
  await requireRole(["customer", "admin", "dispatcher", "supervisor", "driver"]);

  return (
    <main className="mx-auto flex min-h-screen w-full max-w-4xl flex-col gap-4 p-6">
      <Link href="/customer/shipments" className="text-sm text-blue-600">
        Back to shipments
      </Link>
      <CreateShipmentForm />
    </main>
  );
}
