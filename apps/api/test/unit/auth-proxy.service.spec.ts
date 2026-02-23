import { AuthProxyService } from "@/modules/auth-proxy/auth-proxy.service.js";

describe("AuthProxyService", () => {
  it("keeps set-cookie headers when proxying", async () => {
    const service = new AuthProxyService();
    const req = { headers: { cookie: "abc=1" } } as any;
    const responseHeaders: Record<string, string[] | number> = {};
    const res = {
      setHeader: (name: string, value: string[]) => {
        responseHeaders[name] = value;
      },
      status: (code: number) => {
        responseHeaders.status = code;
        return res;
      },
    } as any;

    const fetchSpy = jest.spyOn(globalThis as any, "fetch").mockResolvedValue({
      status: 200,
      headers: {
        get: (name: string) => (name === "content-type" ? "application/json" : null),
        getSetCookie: () => ["session=abc"],
      },
      json: async () => ({ ok: true }),
      text: async () => "",
    } as any);

    const payload = await service.forward(req, res, "GET", "/api/auth/get-session");

    expect(payload).toEqual({ ok: true });
    expect(responseHeaders["set-cookie"]).toEqual(["session=abc"]);

    fetchSpy.mockRestore();
  });
});
