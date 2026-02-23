import {
  ShipmentStatus,
  getAllowedTransitions,
  isValidShipmentTransition,
} from "@courierflow/contracts";

export function getAllowedNextShipmentStatuses(status: ShipmentStatus) {
  return getAllowedTransitions(status);
}

export function canTransitionShipmentStatus(from: ShipmentStatus, to: ShipmentStatus) {
  return isValidShipmentTransition(from, to);
}
