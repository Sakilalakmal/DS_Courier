import { z } from "zod";
export declare const userRoles: readonly ["admin", "dispatcher", "supervisor", "driver", "customer"];
export type UserRole = (typeof userRoles)[number];
export declare const shipmentStatuses: readonly ["CREATED", "PICKED_UP", "IN_TRANSIT", "OUT_FOR_DELIVERY", "DELIVERED", "FAILED_ATTEMPT", "CANCELLED"];
export type ShipmentStatus = (typeof shipmentStatuses)[number];
export declare const registerDtoSchema: z.ZodObject<{
    name: z.ZodString;
    email: z.ZodString;
    password: z.ZodString;
}, z.core.$strip>;
export type RegisterDto = z.infer<typeof registerDtoSchema>;
export declare const loginDtoSchema: z.ZodObject<{
    email: z.ZodString;
    password: z.ZodString;
}, z.core.$strip>;
export type LoginDto = z.infer<typeof loginDtoSchema>;
export declare const assignRoleDtoSchema: z.ZodObject<{
    role: z.ZodEnum<{
        admin: "admin";
        dispatcher: "dispatcher";
        supervisor: "supervisor";
        driver: "driver";
        customer: "customer";
    }>;
}, z.core.$strip>;
export type AssignRoleDto = z.infer<typeof assignRoleDtoSchema>;
export declare const addressInputSchema: z.ZodObject<{
    line1: z.ZodString;
    line2: z.ZodOptional<z.ZodString>;
    city: z.ZodString;
    state: z.ZodString;
    postalCode: z.ZodString;
    country: z.ZodString;
}, z.core.$strip>;
export type AddressInput = z.infer<typeof addressInputSchema>;
export declare const createShipmentDtoSchema: z.ZodObject<{
    title: z.ZodString;
    description: z.ZodOptional<z.ZodString>;
    origin: z.ZodObject<{
        line1: z.ZodString;
        line2: z.ZodOptional<z.ZodString>;
        city: z.ZodString;
        state: z.ZodString;
        postalCode: z.ZodString;
        country: z.ZodString;
    }, z.core.$strip>;
    destination: z.ZodObject<{
        line1: z.ZodString;
        line2: z.ZodOptional<z.ZodString>;
        city: z.ZodString;
        state: z.ZodString;
        postalCode: z.ZodString;
        country: z.ZodString;
    }, z.core.$strip>;
    weightKg: z.ZodNumber;
}, z.core.$strip>;
export type CreateShipmentDto = z.infer<typeof createShipmentDtoSchema>;
export declare const updateShipmentStatusDtoSchema: z.ZodObject<{
    status: z.ZodEnum<{
        CREATED: "CREATED";
        PICKED_UP: "PICKED_UP";
        IN_TRANSIT: "IN_TRANSIT";
        OUT_FOR_DELIVERY: "OUT_FOR_DELIVERY";
        DELIVERED: "DELIVERED";
        FAILED_ATTEMPT: "FAILED_ATTEMPT";
        CANCELLED: "CANCELLED";
    }>;
    note: z.ZodOptional<z.ZodString>;
}, z.core.$strip>;
export type UpdateShipmentStatusDto = z.infer<typeof updateShipmentStatusDtoSchema>;
export declare const shipmentSummarySchema: z.ZodObject<{
    id: z.ZodString;
    trackingId: z.ZodString;
    title: z.ZodString;
    status: z.ZodEnum<{
        CREATED: "CREATED";
        PICKED_UP: "PICKED_UP";
        IN_TRANSIT: "IN_TRANSIT";
        OUT_FOR_DELIVERY: "OUT_FOR_DELIVERY";
        DELIVERED: "DELIVERED";
        FAILED_ATTEMPT: "FAILED_ATTEMPT";
        CANCELLED: "CANCELLED";
    }>;
    customerId: z.ZodString;
    createdAt: z.ZodString;
    updatedAt: z.ZodString;
}, z.core.$strip>;
export type ShipmentSummary = z.infer<typeof shipmentSummarySchema>;
export declare const shipmentDetailSchema: z.ZodObject<{
    id: z.ZodString;
    trackingId: z.ZodString;
    title: z.ZodString;
    status: z.ZodEnum<{
        CREATED: "CREATED";
        PICKED_UP: "PICKED_UP";
        IN_TRANSIT: "IN_TRANSIT";
        OUT_FOR_DELIVERY: "OUT_FOR_DELIVERY";
        DELIVERED: "DELIVERED";
        FAILED_ATTEMPT: "FAILED_ATTEMPT";
        CANCELLED: "CANCELLED";
    }>;
    customerId: z.ZodString;
    createdAt: z.ZodString;
    updatedAt: z.ZodString;
    description: z.ZodNullable<z.ZodString>;
    weightKg: z.ZodNumber;
    originAddressId: z.ZodString;
    destinationAddressId: z.ZodString;
    events: z.ZodArray<z.ZodObject<{
        id: z.ZodString;
        status: z.ZodEnum<{
            CREATED: "CREATED";
            PICKED_UP: "PICKED_UP";
            IN_TRANSIT: "IN_TRANSIT";
            OUT_FOR_DELIVERY: "OUT_FOR_DELIVERY";
            DELIVERED: "DELIVERED";
            FAILED_ATTEMPT: "FAILED_ATTEMPT";
            CANCELLED: "CANCELLED";
        }>;
        note: z.ZodNullable<z.ZodString>;
        actorId: z.ZodString;
        createdAt: z.ZodString;
    }, z.core.$strip>>;
}, z.core.$strip>;
export type ShipmentDetail = z.infer<typeof shipmentDetailSchema>;
