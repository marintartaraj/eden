import type { FieldErrors, UseFormRegister, UseFormSetValue, UseFormWatch } from "react-hook-form";
import { useTranslations, useLocale } from "next-intl";
import { Input } from "@/components/ui/Input";
import { Select } from "@/components/ui/Select";
import { Checkbox } from "@/components/ui/Checkbox";
import { CollapsibleSection } from "@/components/ui/CollapsibleSection";
import { PROPERTY_TYPES } from "@/lib/property-types";
import {
  FURNISHING_STATUSES,
  CONSTRUCTION_CONDITIONS,
  CERTIFICATE_STATUSES,
} from "@/lib/property-enums";
import { localize } from "@/lib/localize";
import type { AppLocale } from "@/i18n/routing";
import type { AgentPropertyInput } from "@/lib/validations/agent-property";
import type { Database } from "@/types/supabase";

type CityRow = Database["public"]["Tables"]["cities"]["Row"];
type NeighborhoodRow = Database["public"]["Tables"]["neighborhoods"]["Row"];

// Shared by AgentPropertyForm and AdminPropertyForm — same underlying
// property fields either way. Typed against AgentPropertyInput; the admin
// form (whose schema widens `status` beyond AgentPropertyInput's subset)
// casts its register/watch/setValue/errors when passing them in — react-
// hook-form's Path<T> mapped type doesn't resolve field-name string
// literals against a generic `T extends AgentPropertyInput` bound, so a
// concrete type here (with the cast pushed to the two call sites) is more
// reliable than trying to keep this component itself generic.
export function PropertyCoreFields({
  register,
  errors,
  watch,
  setValue,
  cities,
  neighborhoods,
  statusOptions,
  showStatus,
}: {
  register: UseFormRegister<AgentPropertyInput>;
  errors: FieldErrors<AgentPropertyInput>;
  watch: UseFormWatch<AgentPropertyInput>;
  setValue: UseFormSetValue<AgentPropertyInput>;
  cities: CityRow[];
  neighborhoods: NeighborhoodRow[];
  statusOptions: readonly string[];
  showStatus: boolean;
}) {
  const t = useTranslations("agentProperties.form");
  const typesT = useTranslations("propertyTypes");
  const furnishingT = useTranslations("furnishingStatus");
  const conditionT = useTranslations("constructionCondition");
  const certificateT = useTranslations("certificateStatus");
  const statusT = useTranslations("agentProperties.status");
  const locale = useLocale() as AppLocale;

  const city = watch("city");
  const hasElevator = watch("hasElevator");
  const hasParking = watch("hasParking");
  const selectedCity = cities.find((c) => c.slug === city);
  const availableNeighborhoods = selectedCity
    ? neighborhoods.filter((n) => n.city_id === selectedCity.id)
    : [];

  return (
    <>
      <div className="rounded-2xl border border-border bg-card p-6">
        <CollapsibleSection title={t("sectionBasics")}>
          <div className="flex flex-col gap-4">
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <div>
                <label className="mb-2 block text-sm font-medium text-foreground">{t("purpose")}</label>
                <Select {...register("purpose")}>
                  <option value="sale">{t("purposeSale")}</option>
                  <option value="rent">{t("purposeRent")}</option>
                </Select>
              </div>
              <div>
                <label className="mb-2 block text-sm font-medium text-foreground">{t("propertyType")}</label>
                <Select {...register("propertyType")}>
                  <option value="">{t("propertyTypePlaceholder")}</option>
                  {PROPERTY_TYPES.map((type) => (
                    <option key={type} value={type}>
                      {typesT(type)}
                    </option>
                  ))}
                </Select>
                {errors.propertyType && <p className="mt-1 text-xs text-danger">{t("requiredError")}</p>}
              </div>
            </div>

            {showStatus && (
              <div>
                <label className="mb-2 block text-sm font-medium text-foreground">{t("status")}</label>
                <Select {...register("status")}>
                  {statusOptions.map((status) => (
                    <option key={status} value={status}>
                      {statusT(status)}
                    </option>
                  ))}
                </Select>
                <p className="mt-1 text-xs text-muted">{t("statusHint")}</p>
              </div>
            )}

            <div>
              <label className="mb-2 block text-sm font-medium text-foreground">{t("titleSq")}</label>
              <Input {...register("titleSq")} />
              {errors.titleSq && <p className="mt-1 text-xs text-danger">{t("requiredError")}</p>}
            </div>
            <div>
              <label className="mb-2 block text-sm font-medium text-foreground">{t("titleEn")}</label>
              <Input {...register("titleEn")} />
            </div>
            <div>
              <label className="mb-2 block text-sm font-medium text-foreground">{t("descriptionSq")}</label>
              <textarea
                {...register("descriptionSq")}
                rows={4}
                className="w-full rounded-xl border border-border bg-background px-4 py-3 text-sm text-foreground placeholder:text-muted focus:border-accent focus:outline-none focus:ring-1 focus:ring-accent"
              />
            </div>
            <div>
              <label className="mb-2 block text-sm font-medium text-foreground">{t("descriptionEn")}</label>
              <textarea
                {...register("descriptionEn")}
                rows={4}
                className="w-full rounded-xl border border-border bg-background px-4 py-3 text-sm text-foreground placeholder:text-muted focus:border-accent focus:outline-none focus:ring-1 focus:ring-accent"
              />
            </div>
          </div>
        </CollapsibleSection>
      </div>

      <div className="rounded-2xl border border-border bg-card p-6">
        <CollapsibleSection title={t("sectionLocation")}>
          <div className="flex flex-col gap-4">
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <div>
                <label className="mb-2 block text-sm font-medium text-foreground">{t("city")}</label>
                <Select {...register("city")}>
                  <option value="">{t("cityPlaceholder")}</option>
                  {cities.map((c) => (
                    <option key={c.id} value={c.slug}>
                      {localize(c.name_sq, c.name_en, locale)}
                    </option>
                  ))}
                </Select>
                {errors.city && <p className="mt-1 text-xs text-danger">{t("requiredError")}</p>}
              </div>
              <div>
                <label className="mb-2 block text-sm font-medium text-foreground">{t("neighborhood")}</label>
                <Select {...register("neighborhood")} disabled={!city}>
                  <option value="">{t("neighborhoodPlaceholder")}</option>
                  {availableNeighborhoods.map((n) => (
                    <option key={n.id} value={n.slug}>
                      {localize(n.name_sq, n.name_en, locale)}
                    </option>
                  ))}
                </Select>
              </div>
            </div>
            <div>
              <label className="mb-2 block text-sm font-medium text-foreground">{t("addressLine")}</label>
              <Input {...register("addressLine")} />
            </div>
          </div>
        </CollapsibleSection>
      </div>

      <div className="rounded-2xl border border-border bg-card p-6">
        <CollapsibleSection title={t("sectionCharacteristics")}>
          <div className="flex flex-col gap-4">
            <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
              <div>
                <label className="mb-2 block text-sm font-medium text-foreground">{t("grossArea")}</label>
                <Input type="number" step="0.01" {...register("grossArea")} />
                {errors.grossArea && <p className="mt-1 text-xs text-danger">{t("requiredError")}</p>}
              </div>
              <div>
                <label className="mb-2 block text-sm font-medium text-foreground">{t("netArea")}</label>
                <Input type="number" step="0.01" {...register("netArea")} />
              </div>
              <div>
                <label className="mb-2 block text-sm font-medium text-foreground">{t("bedrooms")}</label>
                <Input type="number" {...register("bedrooms")} />
              </div>
              <div>
                <label className="mb-2 block text-sm font-medium text-foreground">{t("bathrooms")}</label>
                <Input type="number" {...register("bathrooms")} />
              </div>
              <div>
                <label className="mb-2 block text-sm font-medium text-foreground">{t("floor")}</label>
                <Input type="number" {...register("floor")} />
              </div>
              <div>
                <label className="mb-2 block text-sm font-medium text-foreground">{t("totalFloors")}</label>
                <Input type="number" {...register("totalFloors")} />
              </div>
              <div>
                <label className="mb-2 block text-sm font-medium text-foreground">{t("furnishing")}</label>
                <Select {...register("furnishing")}>
                  <option value="">{t("furnishingPlaceholder")}</option>
                  {FURNISHING_STATUSES.map((f) => (
                    <option key={f} value={f}>
                      {furnishingT(f)}
                    </option>
                  ))}
                </Select>
                {errors.furnishing && <p className="mt-1 text-xs text-danger">{t("requiredError")}</p>}
              </div>
            </div>
            <div className="flex flex-wrap gap-6">
              <Checkbox
                checked={Boolean(hasElevator)}
                onChange={(checked) => setValue("hasElevator", checked)}
                label={t("hasElevator")}
              />
              <Checkbox
                checked={Boolean(hasParking)}
                onChange={(checked) => setValue("hasParking", checked)}
                label={t("hasParking")}
              />
            </div>
          </div>
        </CollapsibleSection>
      </div>

      <div className="rounded-2xl border border-border bg-card p-6">
        <CollapsibleSection title={t("sectionCondition")}>
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
            <div>
              <label className="mb-2 block text-sm font-medium text-foreground">{t("constructionCondition")}</label>
              <Select {...register("constructionCondition")}>
                <option value="">{t("constructionConditionPlaceholder")}</option>
                {CONSTRUCTION_CONDITIONS.map((c) => (
                  <option key={c} value={c}>
                    {conditionT(c)}
                  </option>
                ))}
              </Select>
              {errors.constructionCondition && (
                <p className="mt-1 text-xs text-danger">{t("requiredError")}</p>
              )}
            </div>
            <div>
              <label className="mb-2 block text-sm font-medium text-foreground">{t("constructionYear")}</label>
              <Input type="number" {...register("constructionYear")} />
            </div>
            <div>
              <label className="mb-2 block text-sm font-medium text-foreground">{t("certificateStatus")}</label>
              <Select {...register("certificateStatus")}>
                <option value="">{t("certificateStatusPlaceholder")}</option>
                {CERTIFICATE_STATUSES.map((c) => (
                  <option key={c} value={c}>
                    {certificateT(c)}
                  </option>
                ))}
              </Select>
              {errors.certificateStatus && (
                <p className="mt-1 text-xs text-danger">{t("requiredError")}</p>
              )}
            </div>
          </div>
        </CollapsibleSection>
      </div>

      <div className="rounded-2xl border border-border bg-card p-6">
        <CollapsibleSection title={t("sectionPrice")}>
          <div>
            <label className="mb-2 block text-sm font-medium text-foreground">{t("price")}</label>
            <Input type="number" step="0.01" {...register("price")} />
            {errors.price && <p className="mt-1 text-xs text-danger">{t("requiredError")}</p>}
          </div>
        </CollapsibleSection>
      </div>
    </>
  );
}
