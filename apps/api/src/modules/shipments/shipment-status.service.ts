import {
  ConflictException,
  Injectable,
  NotFoundException,
} from "@nestjs/common";
import {
  SHIPMENT_STATUS_UPDATED_TOPIC,
  ShipmentStatus,
  UserRole,
  ShipmentStatusUpdatedEvent,
  shipmentStatusUpdatedEventSchema,
} from "@courierflow/contracts";
import { randomUUID } from "node:crypto";
import { PrismaService } from "@/common/prisma/prisma.service.js";
import {
  canTransitionShipmentStatus,
  getAllowedNextShipmentStatuses,
} from "./shipment-state-machine.js";

type LocationInput = {
  lat: number;
  lng: number;
} | null | undefined;

@Injectable()
export class ShipmentStatusService {
  constructor(private readonly prisma: PrismaService) {}

  async patchStatus(
    trackingId: string,
    nextStatus: ShipmentStatus,
    note: string | undefined,
    location: LocationInput,
    actorId: string,
    actorRole: UserRole,
  ) {
    const shipment = await this.prisma.shipment.findUnique({
      where: { trackingId },
    });

    if (!shipment) {
      throw new NotFoundException("Shipment not found");
    }

    const oldStatus = shipment.status as ShipmentStatus;

    if (!canTransitionShipmentStatus(oldStatus, nextStatus)) {
      throw new ConflictException({
        message: "Invalid shipment status transition",
        oldStatus,
        nextStatus,
        allowedTransitions: getAllowedNextShipmentStatuses(oldStatus),
      });
    }

    const eventId = randomUUID();
    const occurredAt = new Date();

    const event = shipmentStatusUpdatedEventSchema.parse({
      eventType: SHIPMENT_STATUS_UPDATED_TOPIC,
      eventId,
      timestamp: occurredAt.toISOString(),
      payload: {
        trackingId,
        oldStatus,
        newStatus: nextStatus,
        location: location ?? null,
        actorId,
        actorRole,
      },
    }) satisfies ShipmentStatusUpdatedEvent;

    const updatedShipment = await this.prisma.$transaction(async (tx) => {
      const updated = await tx.shipment.update({
        where: { trackingId },
        data: { status: nextStatus },
      });

      await tx.shipmentEvent.create({
        data: {
          eventId,
          shipmentId: updated.id,
          trackingId,
          oldStatus,
          newStatus: nextStatus,
          note,
          actorId,
          actorRole,
          locationLat: location?.lat,
          locationLng: location?.lng,
          occurredAt,
        },
      });

      await tx.shipmentEventOutbox.create({
        data: {
          eventId,
          topic: SHIPMENT_STATUS_UPDATED_TOPIC,
          partitionKey: trackingId,
          payload: JSON.stringify(event),
          status: "PENDING",
          attemptCount: 0,
        },
      });

      return updated;
    });

    return {
      id: updatedShipment.id,
      trackingId: updatedShipment.trackingId,
      title: updatedShipment.title,
      status: updatedShipment.status,
      customerId: updatedShipment.customerId,
      createdAt: updatedShipment.createdAt.toISOString(),
      updatedAt: updatedShipment.updatedAt.toISOString(),
    };
  }
}
