import { z } from "zod";

export const signUpSchema = z
  .object({
    fullName: z.string().trim().min(2).max(120),
    email: z.string().trim().min(1).email(),
    password: z.string().min(8).max(72),
    confirmPassword: z.string().min(8).max(72),
    honeypot: z.string().max(0).optional(),
  })
  .superRefine((data, ctx) => {
    if (data.password !== data.confirmPassword) {
      ctx.addIssue({ code: "custom", path: ["confirmPassword"], message: "mismatch" });
    }
  });
export type SignUpValues = z.infer<typeof signUpSchema>;

export const signInSchema = z.object({
  email: z.string().trim().min(1).email(),
  password: z.string().min(1),
});
export type SignInValues = z.infer<typeof signInSchema>;

export const forgotPasswordSchema = z.object({
  email: z.string().trim().min(1).email(),
});
export type ForgotPasswordValues = z.infer<typeof forgotPasswordSchema>;

export const resetPasswordSchema = z
  .object({
    password: z.string().min(8).max(72),
    confirmPassword: z.string().min(8).max(72),
  })
  .superRefine((data, ctx) => {
    if (data.password !== data.confirmPassword) {
      ctx.addIssue({ code: "custom", path: ["confirmPassword"], message: "mismatch" });
    }
  });
export type ResetPasswordValues = z.infer<typeof resetPasswordSchema>;
