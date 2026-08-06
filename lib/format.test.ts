import { describe, it, expect } from "vitest";
import { formatPrice, formatArea, formatDate, formatDateWithDay } from "./format";

describe("formatPrice", () => {
  it("formats EUR for English locale without a period suffix", () => {
    expect(formatPrice(185000, "EUR", "en")).toBe("€185,000");
  });

  it("appends a monthly period suffix in the target locale", () => {
    expect(formatPrice(650, "EUR", "en", "month")).toBe("€650/mo");
    expect(formatPrice(650, "EUR", "sq", "month")).toContain("/muaj");
  });

  it("omits the suffix when pricePeriod is null/undefined", () => {
    expect(formatPrice(100000, "EUR", "en", null)).toBe("€100,000");
    expect(formatPrice(100000, "EUR", "en")).toBe("€100,000");
  });

  it("appends the correct suffix for week/year/day periods, not always /mo", () => {
    expect(formatPrice(200, "EUR", "en", "week")).toBe("€200/wk");
    expect(formatPrice(24000, "EUR", "en", "year")).toBe("€24,000/yr");
    expect(formatPrice(50, "EUR", "en", "day")).toBe("€50/day");
  });

  it("fails safe (no suffix) for an unrecognized period value instead of mislabeling it /mo", () => {
    expect(formatPrice(100, "EUR", "en", "fortnight")).toBe("€100");
  });
});

describe("formatArea", () => {
  it("appends the m² unit", () => {
    expect(formatArea(85, "en")).toBe("85 m²");
  });

  it("uses locale-appropriate thousands separators", () => {
    expect(formatArea(1234, "en")).toBe("1,234 m²");
  });
});

describe("formatDate", () => {
  it("formats a date string as month + year", () => {
    const result = formatDate("2026-03-15T00:00:00.000Z", "en");
    expect(result).toMatch(/March 2026/);
  });
});

describe("formatDateWithDay", () => {
  it("includes the day, unlike formatDate", () => {
    const result = formatDateWithDay("2026-03-15T00:00:00.000Z", "en");
    expect(result).toMatch(/March 15, 2026/);
  });

  it("distinguishes two dates in the same month that formatDate would conflate", () => {
    const first = formatDateWithDay("2026-03-02T00:00:00.000Z", "en");
    const second = formatDateWithDay("2026-03-28T00:00:00.000Z", "en");
    expect(first).not.toBe(second);
    expect(formatDate("2026-03-02T00:00:00.000Z", "en")).toBe(
      formatDate("2026-03-28T00:00:00.000Z", "en"),
    );
  });
});
