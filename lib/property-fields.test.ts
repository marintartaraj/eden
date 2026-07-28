import { describe, it, expect } from "vitest";
import { toPropertyFields } from "./property-fields";
import type { AgentPropertyOutput } from "@/lib/validations/agent-property";

const baseInput: Omit<AgentPropertyOutput, "status"> = {
  purpose: "sale",
  propertyType: "apartment",
  titleSq: "Apartament modern",
  city: "tirane",
  price: 150000,
  grossArea: 90,
};

const city = { id: "city-123" };

describe("toPropertyFields", () => {
  it("maps camelCase input to snake_case DB columns", () => {
    const result = toPropertyFields(baseInput, city, null);
    expect(result.title_sq).toBe("Apartament modern");
    expect(result.city_id).toBe("city-123");
    expect(result.gross_area).toBe(90);
  });

  it("sets price_period to 'month' for rentals and null for sales", () => {
    expect(toPropertyFields(baseInput, city, null).price_period).toBeNull();
    expect(toPropertyFields({ ...baseInput, purpose: "rent" }, city, null).price_period).toBe(
      "month",
    );
  });

  it("passes the given neighborhoodId through, or null", () => {
    expect(toPropertyFields(baseInput, city, "n-1").neighborhood_id).toBe("n-1");
    expect(toPropertyFields(baseInput, city, null).neighborhood_id).toBeNull();
  });

  it("defaults optional fields to null/false rather than undefined", () => {
    const result = toPropertyFields(baseInput, city, null);
    expect(result.net_area).toBeNull();
    expect(result.bedrooms).toBeNull();
    expect(result.has_elevator).toBe(false);
    expect(result.has_parking).toBe(false);
  });

  it("treats an empty titleEn as null rather than an empty string", () => {
    const result = toPropertyFields({ ...baseInput, titleEn: "" }, city, null);
    expect(result.title_en).toBeNull();
  });
});
