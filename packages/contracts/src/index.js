import { z } from "zod";
export const userRoles = ["admin", "dispatcher", "supervisor", "driver", "customer"];
export const shipmentStatuses = [
    "CREATED",
    "PICKED_UP",
    "IN_TRANSIT",
    "OUT_FOR_DELIVERY",
    "DELIVERED",
    "FAILED_ATTEMPT",
    "CANCELLED",
];
export const registerDtoSchema = z.object({
    name: z.string().min(2),
    email: z.string().email(),
    password: z.string().min(8),
});
export const loginDtoSchema = z.object({
    email: z.string().email(),
    password: z.string().min(8),
});
export const assignRoleDtoSchema = z.object({
    role: z.enum(userRoles),
});
export const addressInputSchema = z.object({
    line1: z.string().min(1),
    line2: z.string().optional(),
    city: z.string().min(1),
    state: z.string().min(1),
    postalCode: z.string().min(1),
    country: z.string().min(1),
});
export const createShipmentDtoSchema = z.object({
    title: z.string().min(3),
    description: z.string().optional(),
    origin: addressInputSchema,
    destination: addressInputSchema,
    weightKg: z.number().positive(),
});
export const updateShipmentStatusDtoSchema = z.object({
    status: z.enum(shipmentStatuses),
    note: z.string().optional(),
});
export const shipmentSummarySchema = z.object({
    id: z.string(),
    trackingId: z.string(),
    title: z.string(),
    status: z.enum(shipmentStatuses),
    customerId: z.string(),
    createdAt: z.string(),
    updatedAt: z.string(),
});
export const shipmentDetailSchema = shipmentSummarySchema.extend({
    description: z.string().nullable(),
    weightKg: z.number(),
    originAddressId: z.string(),
    destinationAddressId: z.string(),
    events: z.array(z.object({
        id: z.string(),
        status: z.enum(shipmentStatuses),
        note: z.string().nullable(),
        actorId: z.string(),
        createdAt: z.string(),
    })),
});
//# sourceMappingURL=index.js.map