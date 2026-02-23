"use client";

import { FormEvent, useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

export function StaffTrackingNavigator() {
  const router = useRouter();
  const [trackingId, setTrackingId] = useState("");

  const submit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    if (!trackingId.trim()) {
      return;
    }

    router.push(`/staff/shipments/${trackingId.trim()}`);
  };

  return (
    <form onSubmit={submit} className="flex flex-col gap-3 sm:flex-row">
      <Input
        value={trackingId}
        onChange={(event) => setTrackingId(event.target.value)}
        placeholder="Enter tracking ID (CF-YYYYMMDD-XXXXXX)"
      />
      <Button type="submit">Manage Shipment</Button>
    </form>
  );
}
