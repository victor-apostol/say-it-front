import { z } from "zod";

export const registerSchema = z.object({
  name: z.string().min(2, { message: "Name must be at least 2 characters" }).trim(),
  username: z.string().min(1, { message: "username must be at least 1 character" }).trim(),
  email: z.string().email().trim(),
  password: z.string().min(8, { message: "Password must be at least 8 characters" }),
  confirm_password: z.string()
}).refine((data) => data.password === data.confirm_password, {
  path: ['confirm_password'],
  message: 'Both password and confirmation must match'
});

export const loginSchema = z.object({
  email: z.string().email().trim(),
  password: z.string().min(8, { message: "Password must be at least 8 characters" }),
})

export type registerFormType = Partial<z.infer<typeof registerSchema>>;
export type loginFormType = Partial<z.infer<typeof loginSchema>>;