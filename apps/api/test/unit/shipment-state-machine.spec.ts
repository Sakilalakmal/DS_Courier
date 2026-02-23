import {
  ShipmentStatus,
  shipmentStatuses,
} from "@courierflow/contracts";
import {
  canTransitionShipmentStatus,
  getAllowedNextShipmentStatuses,
} from "@/modules/shipments/shipment-state-machine.js";

describe("shipment state machine", () => {
  it("returns allowed transitions for each status", () => {
    const expected: Record<ShipmentStatus, ShipmentStatus[]> = {
      CREATED: ["SCHEDULED_PICKUP", "CANCELLED"],
      SCHEDULED_PICKUP: ["PICKED_UP", "RESCHEDULED", "CANCELLED"],
      PICKED_UP: ["IN_TRANSIT", "RETURN_TO_SENDER"],
      IN_TRANSIT: ["OUT_FOR_DELIVERY", "RETURN_TO_SENDER"],
      OUT_FOR_DELIVERY: ["DELIVERED", "FAILED_ATTEMPT", "RETURN_TO_SENDER"],
      DELIVERED: [],
      FAILED_ATTEMPT: ["RESCHEDULED", "OUT_FOR_DELIVERY", "RETURN_TO_SENDER"],
      RESCHEDULED: ["SCHEDULED_PICKUP", "CANCELLED"],
      CANCELLED: [],
      RETURN_TO_SENDER: [],
    };

    for (const status of shipmentStatuses) {
      expect(getAllowedNextShipmentStatuses(status)).toEqual(expected[status]);
    }
  });

  it("rejects invalid transitions", () => {
    expect(canTransitionShipmentStatus("CREATED", "IN_TRANSIT")).toBe(false);
    expect(canTransitionShipmentStatus("DELIVERED", "FAILED_ATTEMPT")).toBe(false);
    expect(canTransitionShipmentStatus("CANCELLED", "CREATED")).toBe(false);
  });

  it("accepts valid transitions", () => {
    expect(canTransitionShipmentStatus("CREATED", "SCHEDULED_PICKUP")).toBe(true);
    expect(canTransitionShipmentStatus("FAILED_ATTEMPT", "RESCHEDULED")).toBe(true);
    expect(canTransitionShipmentStatus("IN_TRANSIT", "RETURN_TO_SENDER")).toBe(true);
  });
});
