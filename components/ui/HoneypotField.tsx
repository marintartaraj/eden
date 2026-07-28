import type { FieldValues, Path, UseFormRegister } from "react-hook-form";

// Off-screen (not display:none — some bots skip hidden inputs) decoy field.
// Real users never see or fill it; the corresponding Zod schema field
// (`honeypot: z.string().max(0)`) rejects the submission if it's non-empty.
export function HoneypotField<T extends FieldValues>({
  register,
  name,
}: {
  register: UseFormRegister<T>;
  name: Path<T>;
}) {
  return (
    <input
      type="text"
      tabIndex={-1}
      autoComplete="off"
      aria-hidden="true"
      className="absolute left-[-9999px] top-auto h-px w-px overflow-hidden"
      {...register(name)}
    />
  );
}
