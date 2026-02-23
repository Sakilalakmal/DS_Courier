import { Controller, Get, Param } from "@nestjs/common";
import { TrackingProjectionService } from "./tracking-projection.service.js";

@Controller("track")
export class TrackController {
  constructor(private readonly trackingProjectionService: TrackingProjectionService) {}

  @Get(":trackingId")
  async getTrackByTrackingId(@Param("trackingId") trackingId: string) {
    return this.trackingProjectionService.getTrackingByTrackingId(trackingId);
  }
}
