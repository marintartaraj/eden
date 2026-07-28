import { describe, it, expect } from "vitest";
import { agentPropertySchema } from "./agent-property";

const validBase = {
  purpose: "sale" as const,
  propertyType: "apartment" as const,
  status: "draft" as const,
  titleSq: "Apartament modern",
  city: "tirane",
  price: "150000",
  grossArea: "90",
};

describe("agentPropertySchema", () => {
  it("accepts a minimal valid property", () => {
    const result = agentPropertySchema.safeParse(validBase);
    expect(result.success).toBe(true);
  });

  // Same class of bug as propertySubmissionSchema (see zod-helpers.ts) —
  // this schema shares the identical optional-numeric-field shape, so it
  // needs the same regression coverage.
  it("treats an empty string as absent for optional numeric fields", () => {
    const result = agentPropertySchema.safeParse({
      ...validBase,
      netArea: "",
      constructionYear: "",
    });
    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data.netArea).toBeUndefined();
      expect(result.data.constructionYear).toBeUndefined();
    }
  });

  it("rejects a status value agents aren't allowed to set directly", () => {
    const result = agentPropertySchema.safeParse({ ...validBase, status: "active" });
    expect(result.success).toBe(false);
  });
});
