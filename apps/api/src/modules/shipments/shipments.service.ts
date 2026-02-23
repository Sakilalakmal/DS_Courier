import {
  ForbiddenException,
  Injectable,
  NotFoundException,
} from "@nestjs/common";
import {
  CreateShipmentDto,
  SHIPMENT_STATUS_UPDATED_TOPIC,
  ShipmentStatus,
  ShipmentStatusUpdatedEvent,
  UserRole,
  shipmentStatusUpdatedEventSchema,
  userRoles,
} from "@courierflow/contracts";
import { randomUUID } from "node:crypto";
import { PrismaService } from "@/common/prisma/prisma.service.js";

const STAFF_ROLES: UserRole[] = ["admin", "dispatcher", "supervisor", "driver"];

@Injectable()
export class ShipmentsService {
  constructor(private readonly prisma: PrismaService) {}

  async create(userId: string, role: string, payload: CreateShipmentDto) {
    if (!userId) {
      throw new ForbiddenException("Invalid user");
    }

    const actorRole = this.normalizeUserRole(role);

    const shipment = await this.prisma.$transaction(async (tx) => {
      const origin = await tx.address.create({
        data: {
          userId,
          ...payload.origin,
        },
      });

      const destination = await tx.address.create({
        data: {
          userId,
          ...payload.destination,
        },
      });

      const createdShipment = await tx.shipment.create({
        data: {
          trackingId: this.generateTrackingId(),
          customerId: userId,
          title: payload.title,
          description: payload.description,
          status: "CREATED",
          weightKg: payload.weightKg,
          originAddressId: origin.id,
          destinationAddressId: destination.id,
        },
      });

      const eventId = randomUUID();
      const occurredAt = new Date();
      const event = shipmentStatusUpdatedEventSchema.parse({
        eventType: SHIPMENT_STATUS_UPDATED_TOPIC,
        eventId,
        timestamp: occurredAt.toISOString(),
        payload: {
          trackingId: createdShipment.trackingId,
          oldStatus: "CREATED",
          newStatus: "CREATED",
          location: null,
          actorId: userId,
          actorRole,
        },
      }) satisfies ShipmentStatusUpdatedEvent;

      await tx.shipmentEvent.create({
        data: {
          eventId,
          shipmentId: createdShipment.id,
          trackingId: createdShipment.trackingId,
          oldStatus: "CREATED",
          newStatus: "CREATED",
          note: actorRole === "customer" ? "Created by customer" : "Created by staff",
          actorId: userId,
          actorRole,
          occurredAt,
          locationLat: null,
          locationLng: null,
        },
      });

      await tx.shipmentEventOutbox.create({
        data: {
          eventId,
          topic: SHIPMENT_STATUS_UPDATED_TOPIC,
          partitionKey: createdShipment.trackingId,
          payload: JSON.stringify(event),
          status: "PENDING",
          attemptCount: 0,
        },
      });

      return createdShipment;
    });

    return this.toSummary(shipment);
  }

  async list(userId: string, role: string) {
    const isStaff = STAFF_ROLES.includes(role as UserRole);

    const shipments = await this.prisma.shipment.findMany({
      where: isStaff ? undefined : { customerId: userId },
      orderBy: { createdAt: "desc" },
    });

    return { shipments: shipments.map((shipment) => this.toSummary(shipment)) };
  }

  async getByTrackingId(trackingId: string, userId: string, role: string) {
    const shipment = await this.prisma.shipment.findUnique({
      where: { trackingId },
      include: {
        events: {
          orderBy: { occurredAt: "asc" },
        },
      },
    });

    if (!shipment) {
      throw new NotFoundException("Shipment not found");
    }

    const isStaff = STAFF_ROLES.includes(role as UserRole);
    if (!isStaff && shipment.customerId !== userId) {
      throw new ForbiddenException("Shipment not accessible");
    }

    return {
      shipment: {
        ...this.toSummary(shipment),
        description: shipment.description,
        weightKg: shipment.weightKg,
        originAddressId: shipment.originAddressId,
        destinationAddressId: shipment.destinationAddressId,
        events: shipment.events.map((event) => ({
          id: event.id,
          eventId: event.eventId,
          oldStatus: event.oldStatus,
          newStatus: event.newStatus,
          note: event.note,
          actorId: event.actorId,
          actorRole: event.actorRole,
          location:
            event.locationLat != null && event.locationLng != null
              ? {
                  lat: event.locationLat,
                  lng: event.locationLng,
                }
              : null,
          occurredAt: event.occurredAt.toISOString(),
          createdAt: event.createdAt.toISOString(),
        })),
      },
    };
  }

  private normalizeUserRole(role: string): UserRole {
    if (userRoles.includes(role as UserRole)) {
      return role as UserRole;
    }

    return "customer";
  }

  private generateTrackingId() {
    const now = new Date();
    const y = now.getUTCFullYear();
    const m = String(now.getUTCMonth() + 1).padStart(2, "0");
    const d = String(now.getUTCDate()).padStart(2, "0");
    const seed = "ABCDEFGHJKLMNPQRSTUVWXYZ0123456789";

    let randomChunk = "";
    for (let i = 0; i < 6; i += 1) {
      randomChunk += seed[Math.floor(Math.random() * seed.length)];
    }

    return `CF-${y}${m}${d}-${randomChunk}`;
  }

  private toSummary(shipment: {
    id: string;
    trackingId: string;
    title: string;
    status: string;
    customerId: string;
    createdAt: Date;
    updatedAt: Date;
  }) {
    return {
      id: shipment.id,
      trackingId: shipment.trackingId,
      title: shipment.title,
      status: shipment.status as ShipmentStatus,
      customerId: shipment.customerId,
      createdAt: shipment.createdAt.toISOString(),
      updatedAt: shipment.updatedAt.toISOString(),
    };
  }
}
