import { z } from 'zod';

export const usernameValidation = z
  .string()
  .min(2, 'Username must be at least 2 characters')
  .max(20, 'Username must be no more than 20 characters')
  .regex(/^[a-zA-Z0-9_]+$/, 'Username must not contain special characters');

export const signUpSchema = z.object({
  username: usernameValidation,

  mobile: z.string().regex(/^[0-9]+$/,"must be number"),
  password: z
    .string()
    .min(6, { message: 'Password must be at least 6 characters' }),
});