import { describe, it, expect } from "vitest";
import { signUpSchema, signInSchema, forgotPasswordSchema } from "./auth";

describe("signUpSchema", () => {
  const valid = {
    fullName: "Jane Doe",
    email: "jane@example.com",
    password: "password123",
    confirmPassword: "password123",
  };

  it("accepts matching passwords", () => {
    expect(signUpSchema.safeParse(valid).success).toBe(true);
  });

  it("rejects mismatched passwords", () => {
    const result = signUpSchema.safeParse({ ...valid, confirmPassword: "different" });
    expect(result.success).toBe(false);
  });

  it("rejects a password shorter than 8 characters", () => {
    const result = signUpSchema.safeParse({
      ...valid,
      password: "short",
      confirmPassword: "short",
    });
    expect(result.success).toBe(false);
  });

  it("rejects a filled honeypot field", () => {
    const result = signUpSchema.safeParse({ ...valid, honeypot: "bot" });
    expect(result.success).toBe(false);
  });
});

describe("signInSchema", () => {
  it("accepts any non-empty password (length is not re-validated at login)", () => {
    const result = signInSchema.safeParse({ email: "jane@example.com", password: "x" });
    expect(result.success).toBe(true);
  });

  it("rejects an empty password", () => {
    const result = signInSchema.safeParse({ email: "jane@example.com", password: "" });
    expect(result.success).toBe(false);
  });
});

describe("forgotPasswordSchema", () => {
  it("rejects an invalid email", () => {
    const result = forgotPasswordSchema.safeParse({ email: "not-an-email" });
    expect(result.success).toBe(false);
  });
});
