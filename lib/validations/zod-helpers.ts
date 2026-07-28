import { z } from "zod";

// z.coerce.number() runs before .optional() gets a chance to see the field
// as absent, so an empty <input type="number"> (raw value "") coerces to 0
// rather than undefined — silently failing constraints like .positive() or
// .min(1800) that exclude 0, even though the field is meant to be optional.
// Stripping "" to undefined first fixes that without changing valid inputs.
// (Found via the sell-property wizard silently freezing on step 3/4 when
// Net Area / Construction Year were left blank — see git history on
// lib/validations/property-submission.ts.)
export function optionalNumber<T extends z.ZodTypeAny>(schema: T) {
  return z.preprocess((val) => (val === "" ? undefined : val), schema.optional());
}
