import { describe, it, expect } from "vitest";
import { slugify, randomSuffix } from "./slug";

describe("slugify", () => {
  it("lowercases and hyphenates", () => {
    expect(slugify("Modern 3-Bedroom Apartment")).toBe("modern-3-bedroom-apartment");
  });

  it("strips diacritics (Albanian characters)", () => {
    expect(slugify("Apartament në Tiranë")).toBe("apartament-ne-tirane");
  });

  it("collapses non-alphanumeric runs into a single hyphen", () => {
    expect(slugify("a!!!b   c___d")).toBe("a-b-c-d");
  });

  it("trims leading/trailing hyphens", () => {
    expect(slugify("  --hello--  ")).toBe("hello");
  });

  it("handles empty input", () => {
    expect(slugify("")).toBe("");
  });
});

describe("randomSuffix", () => {
  it("returns a non-empty alphanumeric string", () => {
    expect(randomSuffix()).toMatch(/^[a-z0-9]+$/);
  });

  it("is not obviously constant across calls", () => {
    const values = new Set(Array.from({ length: 20 }, () => randomSuffix()));
    expect(values.size).toBeGreaterThan(1);
  });
});
