import { describe, it, expect, beforeAll, afterAll } from "vitest";
import { buildServer } from "../src/server";

describe("server", () => {
  let server: Awaited<ReturnType<typeof buildServer>>;
  beforeAll(async () => {
    server = await buildServer({ port: 0, host: "127.0.0.1" });
    await server.listen({ port: 0, host: "127.0.0.1" });
  });
  afterAll(async () => {
    await server.close();
  });

  it("responds to /api/health with 200", async () => {
    const res = await server.inject({ method: "GET", url: "/api/health" });
    expect(res.statusCode).toBe(200);
    const body = res.json() as { status: string };
    expect(body.status).toBe("ok");
  });
});
