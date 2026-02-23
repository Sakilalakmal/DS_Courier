import {
  Injectable,
  NotFoundException,
} from "@nestjs/common";
import {
  TrackShipmentResponse,
  trackShipmentResponseSchema,
  ShipmentStatusUpdatedEvent,
} from "@courierflow/contracts";
import { PrismaService } from "@/common/prisma/prisma.service.js";

@Injectable()
export class TrackingProjectionService {
  constructor(private readonly prisma: PrismaService) {}

  async applyShipmentStatusUpdatedEvent(event: ShipmentStatusUpdatedEvent) {
    try {
      await this.prisma.$transaction(async (tx) => {
        const existing = await tx.trackingTimelineCache.findUnique({
          where: {
            eventId: event.eventId,
          },
        });

        if (existing) {
          return;
        }

        const occurredAt = new Date(event.timestamp);

        await tx.trackingTimelineCache.create({
          data: {
            trackingId: event.payload.trackingId,
            eventId: event.eventId,
            status: event.payload.newStatus,
            occurredAt,
            locationLat: event.payload.location?.lat,
            locationLng: event.payload.location?.lng,
            actorId: event.payload.actorId,
            actorRole: event.payload.actorRole,
          },
        });

        const snapshot = await tx.trackingSnapshot.findUnique({
          where: {
            trackingId: event.payload.trackingId,
          },
        });

        if (!snapshot) {
          await tx.trackingSnapshot.create({
            data: {
              trackingId: event.payload.trackingId,
              currentStatus: event.payload.newStatus,
              currentStatusAt: occurredAt,
              lastEventId: event.eventId,
              lastLocationLat: event.payload.location?.lat,
              lastLocationLng: event.payload.location?.lng,
            },
          });
          return;
        }

        if (occurredAt >= snapshot.currentStatusAt) {
          await tx.trackingSnapshot.update({
            where: {
              trackingId: event.payload.trackingId,
            },
            data: {
              currentStatus: event.payload.newStatus,
              currentStatusAt: occurredAt,
              lastEventId: event.eventId,
              lastLocationLat: event.payload.location?.lat,
              lastLocationLng: event.payload.location?.lng,
            },
          });
        }
      });
    } catch (error) {
      if (this.isUniqueViolation(error)) {
        return;
      }

      throw error;
    }
  }

  async getTrackingByTrackingId(trackingId: string): Promise<TrackShipmentResponse> {
    const [snapshot, timeline] = await Promise.all([
      this.prisma.trackingSnapshot.findUnique({
        where: { trackingId },
      }),
      this.prisma.trackingTimelineCache.findMany({
        where: { trackingId },
        orderBy: { occurredAt: "asc" },
      }),
    ]);

    if (!snapshot && timeline.length === 0) {
      throw new NotFoundException("Tracking record not found");
    }

    const computedSnapshot = snapshot ?? this.deriveSnapshotFromTimeline(trackingId, timeline);

    return trackShipmentResponseSchema.parse({
      snapshot: {
        trackingId: computedSnapshot.trackingId,
        currentStatus: computedSnapshot.currentStatus,
        currentStatusAt: computedSnapshot.currentStatusAt.toISOString(),
        lastEventId: computedSnapshot.lastEventId,
        lastLocation:
          computedSnapshot.lastLocationLat != null && computedSnapshot.lastLocationLng != null
            ? {
                lat: computedSnapshot.lastLocationLat,
                lng: computedSnapshot.lastLocationLng,
              }
            : null,
        updatedAt: computedSnapshot.updatedAt.toISOString(),
      },
      timeline: timeline.map((item) => ({
        eventId: item.eventId,
        status: item.status,
        occurredAt: item.occurredAt.toISOString(),
        location:
          item.locationLat != null && item.locationLng != null
            ? {
                lat: item.locationLat,
                lng: item.locationLng,
              }
            : null,
        actorId: item.actorId,
        actorRole: item.actorRole,
      })),
    });
  }

  private deriveSnapshotFromTimeline(
    trackingId: string,
    timeline: Array<{
      eventId: string;
      status: string;
      occurredAt: Date;
      locationLat: number | null;
      locationLng: number | null;
      createdAt: Date;
    }>,
  ) {
    const latest = this.binarySearchLatest(timeline, new Date());

    if (!latest) {
      throw new NotFoundException("Tracking record not found");
    }

    return {
      trackingId,
      currentStatus: latest.status,
      currentStatusAt: latest.occurredAt,
      lastEventId: latest.eventId,
      lastLocationLat: latest.locationLat,
      lastLocationLng: latest.locationLng,
      updatedAt: latest.createdAt,
    };
  }

  private binarySearchLatest(
    timeline: Array<{
      eventId: string;
      status: string;
      occurredAt: Date;
      locationLat: number | null;
      locationLng: number | null;
      createdAt: Date;
    }>,
    target: Date,
  ) {
    if (timeline.length === 0) {
      return null;
    }

    let left = 0;
    let right = timeline.length - 1;
    let bestIndex = 0;

    while (left <= right) {
      const mid = Math.floor((left + right) / 2);
      const value = timeline[mid];
      if (!value) {
        break;
      }

      if (value.occurredAt <= target) {
        bestIndex = mid;
        left = mid + 1;
      } else {
        right = mid - 1;
      }
    }

    return timeline[bestIndex];
  }

  private isUniqueViolation(error: unknown) {
    return (
      typeof error === "object" &&
      error !== null &&
      "code" in error &&
      (error as { code?: string }).code === "P2002"
    );
  }
}
