import { describe, it, expect } from "vitest";
import { propertySubmissionSchema } from "./property-submission";

const validBase = {
  purpose: "sale" as const,
  propertyType: "apartment" as const,
  city: "tirane",
  grossArea: "85",
  price: "100000",
  photos: ["https://example.com/photo.jpg"],
  ownerName: "Test Owner",
  ownerPhone: "+355691234567",
  ownerEmail: "owner@example.com",
  agreeToTerms: true,
};

describe("propertySubmissionSchema", () => {
  it("accepts a fully-filled valid submission", () => {
    const result = propertySubmissionSchema.safeParse(validBase);
    expect(result.success).toBe(true);
  });

  // Regression test for the bug this session found: leaving an optional
  // numeric field blank silently froze the sell-property wizard, because
  // z.coerce.number() turned "" into 0 before .optional()/.positive() ever
  // saw it as absent. Every optional numeric field must tolerate "".
  it("treats an empty string as absent for every optional numeric field, not as 0", () => {
    const result = propertySubmissionSchema.safeParse({
      ...validBase,
      netArea: "",
      bedrooms: "",
      bathrooms: "",
      floor: "",
      totalFloors: "",
      constructionYear: "",
    });
    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data.netArea).toBeUndefined();
      expect(result.data.constructionYear).toBeUndefined();
    }
  });

  it("still rejects a genuinely invalid optional value (0 net area explicitly given)", () => {
    const result = propertySubmissionSchema.safeParse({ ...validBase, netArea: 0 });
    expect(result.success).toBe(false);
  });

  it("rejects when required fields are missing", () => {
    const withoutGrossArea: Record<string, unknown> = { ...validBase };
    delete withoutGrossArea.grossArea;
    const result = propertySubmissionSchema.safeParse(withoutGrossArea);
    expect(result.success).toBe(false);
  });

  it("rejects when agreeToTerms is false", () => {
    const result = propertySubmissionSchema.safeParse({ ...validBase, agreeToTerms: false });
    expect(result.success).toBe(false);
  });

  it("rejects a submission with no photos", () => {
    const result = propertySubmissionSchema.safeParse({ ...validBase, photos: [] });
    expect(result.success).toBe(false);
  });

  it("rejects when the honeypot field is filled in", () => {
    const result = propertySubmissionSchema.safeParse({ ...validBase, honeypot: "I am a bot" });
    expect(result.success).toBe(false);
  });

  it("accepts when the honeypot field is empty", () => {
    const result = propertySubmissionSchema.safeParse({ ...validBase, honeypot: "" });
    expect(result.success).toBe(true);
  });
});
