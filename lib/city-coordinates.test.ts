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

  it("applies a small, deterministic offset to precise coordinates when a privacy seed is given", () => {
    const first = resolveCoordinates(41.0, 20.0, "tirane", "property-123");
    const second = resolveCoordinates(41.0, 20.0, "tirane", "property-123");
    const third = resolveCoordinates(41.0, 20.0, "tirane", "property-456");

    expect(first?.precise).toBe(true);
    // Never the exact input — some offset was actually applied.
    expect(first?.lat).not.toBe(41.0);
    expect(first?.lng).not.toBe(20.0);
    // Deterministic: the same property always gets the same fuzzed point.
    expect(first).toEqual(second);
    // Different properties get different offsets, not the same shift.
    expect(first).not.toEqual(third);
    // The offset is small (well under 1km, i.e. under ~0.01 degrees).
    expect(Math.abs((first?.lat ?? 0) - 41.0)).toBeLessThan(0.01);
    expect(Math.abs((first?.lng ?? 0) - 20.0)).toBeLessThan(0.01);
  });

  it("returns the exact coordinate when no privacy seed is provided (existing callers unaffected)", () => {
    const result = resolveCoordinates(41.0, 20.0, "tirane");
    expect(result).toEqual({ lat: 41.0, lng: 20.0, precise: true });
  });
});
