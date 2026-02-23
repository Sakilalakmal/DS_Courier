import {
  ForbiddenException,
  Injectable,
  NotFoundException,
} from "@nestjs/common";
import {
  type CreateShipmentDto,
  type ShipmentStatus,
  type UserRole,
} from "@courierflow/contracts";
import { PrismaService } from "@/common/prisma/prisma.service.js";

const STAFF_ROLES: UserRole[] = ["admin", "dispatcher", "supervisor", "driver"];

@Injectable()
export class ShipmentsService {
  constructor(private readonly prisma: PrismaService) {}

  async create(userId: string, role: string, payload: CreateShipmentDto) {
    if (!userId) {
      throw new ForbiddenException("Invalid user");
    }

    const origin = await this.prisma.address.create({
      data: {
        userId,
        ...payload.origin,
      },
    });

    const destination = await this.prisma.address.create({
      data: {
        userId,
        ...payload.destination,
      },
    });

    const shipment = await this.prisma.shipment.create({
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

    await this.prisma.shipmentEvent.create({
      data: {
        shipmentId: shipment.id,
        status: "CREATED",
        note: role === "customer" ? "Created by customer" : "Created by staff",
        actorId: userId,
      },
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
          orderBy: { createdAt: "asc" },
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
          status: event.status,
          note: event.note,
          actorId: event.actorId,
          createdAt: event.createdAt.toISOString(),
        })),
      },
    };
  }

  async patchStatus(trackingId: string, status: ShipmentStatus, note: string | undefined, actorId: string) {
    const shipment = await this.prisma.shipment.findUnique({ where: { trackingId } });

    if (!shipment) {
      throw new NotFoundException("Shipment not found");
    }

    const updatedShipment = await this.prisma.shipment.update({
      where: { trackingId },
      data: {
        status,
      },
    });

    await this.prisma.shipmentEvent.create({
      data: {
        shipmentId: shipment.id,
        status,
        note,
        actorId,
      },
    });

    return this.toSummary(updatedShipment);
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
      status: shipment.status,
      customerId: shipment.customerId,
      createdAt: shipment.createdAt.toISOString(),
      updatedAt: shipment.updatedAt.toISOString(),
    };
  }
}
