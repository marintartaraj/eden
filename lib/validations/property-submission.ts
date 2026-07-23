import { z } from "zod";
import { PROPERTY_TYPES } from "@/lib/property-types";
import {
  FURNISHING_STATUSES,
  CONSTRUCTION_CONDITIONS,
  CERTIFICATE_STATUSES,
} from "@/lib/property-enums";

export const propertySubmissionSchema = z.object({
  purpose: z.enum(["sale", "rent"]),

  propertyType: z.enum(PROPERTY_TYPES),
  city: z.string().min(1),
  neighborhood: z.string().optional(),
  addressLine: z.string().max(200).optional(),

  grossArea: z.coerce.number().positive(),
  netArea: z.coerce.number().positive().optional(),
  bedrooms: z.coerce.number().int().min(0).max(50).optional(),
  bathrooms: z.coerce.number().int().min(0).max(50).optional(),
  floor: z.coerce.number().int().min(-2).max(200).optional(),
  totalFloors: z.coerce.number().int().min(0).max(200).optional(),
  furnishing: z.enum(FURNISHING_STATUSES).optional(),
  hasElevator: z.boolean().optional(),
  hasParking: z.boolean().optional(),

  constructionCondition: z.enum(CONSTRUCTION_CONDITIONS).optional(),
  constructionYear: z.coerce.number().int().min(1800).max(2100).optional(),
  certificateStatus: z.enum(CERTIFICATE_STATUSES).optional(),

  price: z.coerce.number().positive(),

  photos: z.array(z.string().url()).min(1),

  ownerName: z.string().trim().min(2).max(120),
  ownerPhone: z.string().trim().min(6).max(30),
  ownerEmail: z.string().trim().min(1).email(),

  agreeToTerms: z.boolean().refine((v) => v === true),
});

// Split input/output: fields using z.coerce (the numeric ones) have a wider
// input type (whatever the raw <input> gives us) than their validated output
// type (number). react-hook-form's form state matches the input shape;
// onSubmit receives the resolver's validated output shape.
export type PropertySubmissionInput = z.input<typeof propertySubmissionSchema>;
export type PropertySubmissionOutput = z.output<typeof propertySubmissionSchema>;

export const STEP_FIELDS: (keyof PropertySubmissionInput)[][] = [
  ["purpose"],
  ["propertyType", "city", "neighborhood"],
  [
    "grossArea",
    "netArea",
    "bedrooms",
    "bathrooms",
    "floor",
    "totalFloors",
    "furnishing",
    "hasElevator",
    "hasParking",
  ],
  ["constructionCondition", "constructionYear", "certificateStatus"],
  ["price"],
  ["photos"],
  ["ownerName", "ownerPhone", "ownerEmail"],
  ["agreeToTerms"],
];
