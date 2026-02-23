import { z } from "zod";

export const userRoles = ["admin", "dispatcher", "supervisor", "driver", "customer"] as const;
export type UserRole = (typeof userRoles)[number];

export const shipmentStatuses = [
  "CREATED",
  "SCHEDULED_PICKUP",
  "PICKED_UP",
  "IN_TRANSIT",
  "OUT_FOR_DELIVERY",
  "DELIVERED",
  "FAILED_ATTEMPT",
  "RESCHEDULED",
  "CANCELLED",
  "RETURN_TO_SENDER",
] as const;
export type ShipmentStatus = (typeof shipmentStatuses)[number];

export const allowedShipmentTransitions: Record<ShipmentStatus, ShipmentStatus[]> = {
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

export function getAllowedTransitions(status: ShipmentStatus) {
  return allowedShipmentTransitions[status];
}

export function isValidShipmentTransition(from: ShipmentStatus, to: ShipmentStatus) {
  return allowedShipmentTransitions[from].includes(to);
}

export const registerDtoSchema = z.object({
  name: z.string().min(2),
  email: z.string().email(),
  password: z.string().min(8),
});
export type RegisterDto = z.infer<typeof registerDtoSchema>;

export const loginDtoSchema = z.object({
  email: z.string().email(),
  password: z.string().min(8),
});
export type LoginDto = z.infer<typeof loginDtoSchema>;

export const assignRoleDtoSchema = z.object({
  role: z.enum(userRoles),
});
export type AssignRoleDto = z.infer<typeof assignRoleDtoSchema>;

export const addressInputSchema = z.object({
  line1: z.string().min(1),
  line2: z.string().optional(),
  city: z.string().min(1),
  state: z.string().min(1),
  postalCode: z.string().min(1),
  country: z.string().min(1),
});
export type AddressInput = z.infer<typeof addressInputSchema>;

export const createShipmentDtoSchema = z.object({
  title: z.string().min(3),
  description: z.string().optional(),
  origin: addressInputSchema,
  destination: addressInputSchema,
  weightKg: z.number().positive(),
});
export type CreateShipmentDto = z.infer<typeof createShipmentDtoSchema>;

export const locationSchema = z.object({
  lat: z.number().min(-90).max(90),
  lng: z.number().min(-180).max(180),
});
export type Location = z.infer<typeof locationSchema>;

export const updateShipmentStatusDtoSchema = z.object({
  status: z.enum(shipmentStatuses),
  note: z.string().optional(),
  location: locationSchema.nullable().optional(),
});
export type UpdateShipmentStatusDto = z.infer<typeof updateShipmentStatusDtoSchema>;

export const shipmentSummarySchema = z.object({
  id: z.string(),
  trackingId: z.string(),
  title: z.string(),
  status: z.enum(shipmentStatuses),
  customerId: z.string(),
  createdAt: z.string(),
  updatedAt: z.string(),
});
export type ShipmentSummary = z.infer<typeof shipmentSummarySchema>;

export const shipmentDetailSchema = shipmentSummarySchema.extend({
  description: z.string().nullable(),
  weightKg: z.number(),
  originAddressId: z.string(),
  destinationAddressId: z.string(),
  events: z.array(
    z.object({
      id: z.string(),
      eventId: z.string(),
      oldStatus: z.enum(shipmentStatuses),
      newStatus: z.enum(shipmentStatuses),
      note: z.string().nullable(),
      actorId: z.string(),
      actorRole: z.enum(userRoles),
      location: locationSchema.nullable(),
      occurredAt: z.string(),
      createdAt: z.string(),
    }),
  ),
});
export type ShipmentDetail = z.infer<typeof shipmentDetailSchema>;

export const SHIPMENT_STATUS_UPDATED_TOPIC = "shipment.status.updated";

export const shipmentStatusUpdatedEventSchema = z.object({
  eventType: z.literal(SHIPMENT_STATUS_UPDATED_TOPIC),
  eventId: z.string().min(1),
  timestamp: z.string().datetime(),
  payload: z.object({
    trackingId: z.string().min(1),
    oldStatus: z.enum(shipmentStatuses),
    newStatus: z.enum(shipmentStatuses),
    location: locationSchema.nullable(),
    actorId: z.string().min(1),
    actorRole: z.enum(userRoles),
  }),
});
export type ShipmentStatusUpdatedEvent = z.infer<typeof shipmentStatusUpdatedEventSchema>;

export const trackingTimelineItemSchema = z.object({
  eventId: z.string(),
  status: z.enum(shipmentStatuses),
  occurredAt: z.string(),
  location: locationSchema.nullable(),
  actorId: z.string(),
  actorRole: z.enum(userRoles),
});
export type TrackingTimelineItem = z.infer<typeof trackingTimelineItemSchema>;

export const trackingSnapshotSchema = z.object({
  trackingId: z.string(),
  currentStatus: z.enum(shipmentStatuses),
  currentStatusAt: z.string(),
  lastEventId: z.string(),
  lastLocation: locationSchema.nullable(),
  updatedAt: z.string(),
});
export type TrackingSnapshot = z.infer<typeof trackingSnapshotSchema>;

export const trackShipmentResponseSchema = z.object({
  snapshot: trackingSnapshotSchema,
  timeline: z.array(trackingTimelineItemSchema),
});
export type TrackShipmentResponse = z.infer<typeof trackShipmentResponseSchema>;
