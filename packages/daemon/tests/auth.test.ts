import { describe, it, expect } from "vitest";
import { hashPassword, verifyPassword } from "../src/auth/auth";

describe("auth", () => {
  it("hashes and verifies a password", async () => {
    const hash = await hashPassword("hunter2");
    expect(hash).not.toBe("hunter2");
    expect(await verifyPassword("hunter2", hash)).toBe(true);
    expect(await verifyPassword("wrong", hash)).toBe(false);
  });

  it("produces different hashes for the same input (salted)", async () => {
    const a = await hashPassword("same");
    const b = await hashPassword("same");
    expect(a).not.toBe(b);
  });
});
