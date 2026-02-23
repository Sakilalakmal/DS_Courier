import { Injectable } from "@nestjs/common";
import type { Request, Response } from "express";

@Injectable()
export class AuthProxyService {
  private readonly baseUrl = process.env.BETTER_AUTH_URL ?? "http://localhost:3000";

  async forward(
    request: Request,
    response: Response,
    method: "GET" | "POST",
    path: string,
    body?: Record<string, unknown>,
  ) {
    const headers = new Headers();
    headers.set("accept", "application/json");
    if (body) {
      headers.set("content-type", "application/json");
    }

    if (request.headers.cookie) {
      headers.set("cookie", request.headers.cookie);
    }

    const upstreamResponse = await fetch(`${this.baseUrl}${path}`, {
      method,
      headers,
      body: body ? JSON.stringify(body) : undefined,
    });

    const setCookie = this.readSetCookie(upstreamResponse);
    if (setCookie.length > 0) {
      response.setHeader("set-cookie", setCookie);
    }

    response.status(upstreamResponse.status);

    const contentType = upstreamResponse.headers.get("content-type") ?? "";
    if (contentType.includes("application/json")) {
      return upstreamResponse.json();
    }

    return { message: await upstreamResponse.text() };
  }

  private readSetCookie(upstreamResponse: globalThis.Response): string[] {
    const maybeHeaders = upstreamResponse.headers as Headers & {
      getSetCookie?: () => string[];
    };

    if (typeof maybeHeaders.getSetCookie === "function") {
      return maybeHeaders.getSetCookie();
    }

    const singleCookie = upstreamResponse.headers.get("set-cookie");
    return singleCookie ? [singleCookie] : [];
  }
}
