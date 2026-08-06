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

// Same root cause as optionalNumber above, for enum-backed <select> fields
// instead of <input type="number">: a native <select>'s unselected/placeholder
// option (<option value="">) submits as "", and z.enum([...]).optional()
// only treats undefined as absent — "" fails enum validation outright. That
// silently blocks the whole form submit with no visible field error (neither
// PropertyCoreFields nor AgentPropertyForm renders one for these fields),
// so an agent/admin leaving Furnishing, Construction Condition, or
// Certificate Status on its placeholder option gets a dead "Create
// Property"/"Save Changes" button and no explanation why.
export function optionalEnum<T extends z.ZodTypeAny>(schema: T) {
  return z.preprocess((val) => (val === "" ? undefined : val), schema.optional());
}
