import { z } from "zod";

export const userRoles = ["admin", "dispatcher", "supervisor", "driver", "customer"] as const;
export type UserRole = (typeof userRoles)[number];

export const shipmentStatuses = [
  "CREATED",
  "PICKED_UP",
  "IN_TRANSIT",
  "OUT_FOR_DELIVERY",
  "DELIVERED",
  "FAILED_ATTEMPT",
  "CANCELLED",
] as const;
export type ShipmentStatus = (typeof shipmentStatuses)[number];

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

export const updateShipmentStatusDtoSchema = z.object({
  status: z.enum(shipmentStatuses),
  note: z.string().optional(),
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
      status: z.enum(shipmentStatuses),
      note: z.string().nullable(),
      actorId: z.string(),
      createdAt: z.string(),
    }),
  ),
});
export type ShipmentDetail = z.infer<typeof shipmentDetailSchema>;
