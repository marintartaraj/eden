import { describe, it, expect } from "vitest";
import { resolveCoordinates } from "./city-coordinates";

describe("resolveCoordinates", () => {
  it("prefers precise lat/lng when both are present", () => {
    const result = resolveCoordinates(41.0, 20.0, "tirane");
    expect(result).toEqual({ lat: 41.0, lng: 20.0, precise: true });
  });

  it("falls back to the city center when lat/lng are null", () => {
    const result = resolveCoordinates(null, null, "tirane");
    expect(result?.precise).toBe(false);
    expect(result?.lat).toBeCloseTo(41.3275, 2);
  });

  it("returns null when neither coordinates nor a known city are available", () => {
    expect(resolveCoordinates(null, null, null)).toBeNull();
    expect(resolveCoordinates(null, null, "not-a-real-city")).toBeNull();
  });

  it("does not fall back if only one of lat/lng is present (treated as absent)", () => {
    const result = resolveCoordinates(41.0, null, "tirane");
    expect(result?.precise).toBe(false);
  });
});
