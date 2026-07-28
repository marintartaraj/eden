import { describe, it, expect } from "vitest";
import { inquirySchema } from "./inquiry";

describe("inquirySchema", () => {
  it("accepts a minimal general inquiry", () => {
    const result = inquirySchema.safeParse({
      type: "general",
      name: "Jane Doe",
      email: "jane@example.com",
    });
    expect(result.success).toBe(true);
  });

  it("requires a preferredDate for viewing requests", () => {
    const withDate = inquirySchema.safeParse({
      type: "viewing_request",
      name: "Jane Doe",
      email: "jane@example.com",
      preferredDate: "2026-08-01",
    });
    expect(withDate.success).toBe(true);

    const withoutDate = inquirySchema.safeParse({
      type: "viewing_request",
      name: "Jane Doe",
      email: "jane@example.com",
    });
    expect(withoutDate.success).toBe(false);
  });

  it("rejects an invalid email", () => {
    const result = inquirySchema.safeParse({
      type: "general",
      name: "Jane Doe",
      email: "not-an-email",
    });
    expect(result.success).toBe(false);
  });

  it("rejects a filled honeypot field", () => {
    const result = inquirySchema.safeParse({
      type: "general",
      name: "Jane Doe",
      email: "jane@example.com",
      honeypot: "spam link",
    });
    expect(result.success).toBe(false);
  });
});
