import { z } from 'zod';

export const passwordSchema = z
  .string({
    error: (issue) =>
      issue.input === undefined ? 'Password is required' : 'Password must be a string',
  })
  .min(6, 'Password must be at least 6 characters long')
  .max(20, 'Password must be at most 20 characters long');

export const emailSchema = z
  .string({
    error: (issue) => (issue.input === undefined ? 'Email is required' : 'Email must be a string'),
  })
  .email('Invalid email address');

export const usernameSchema = z
  .string({
    error: (issue) =>
      issue.input === undefined ? 'Username is required' : 'Username must be a string',
  })
  .min(3, 'Username must be at least 3 characters long')
  .max(25, 'Username must be at most 25 characters long');

export const userRegisterInitialSchema = z
  .object({
    email: emailSchema,
    username: usernameSchema,
    password: passwordSchema,
    confirmPassword: passwordSchema,
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: 'Passwords do not match',
    path: ['confirmPassword'],
  });

export const userRegisterInfoSchema = z.object({
  name: z.string().optional(),
  givenName: z.string().optional(),
  familyName: z.string().optional(),
  picture: z.string().url('Picture must be a valid URL').optional(),
});

export const userLoginSchema = z
  .object({
    email: emailSchema.optional(),
    username: usernameSchema.optional(),
    password: passwordSchema,
  })
  .refine((data) => data.email || data.username, {
    message: 'Either email or username must be provided',
    path: ['email', 'username'],
  });

export type UserRegisterInitialInput = z.infer<typeof userRegisterInitialSchema>;
export type UserRegisterInfoInput = z.infer<typeof userRegisterInfoSchema>;
export type UserLoginInput = z.infer<typeof userLoginSchema>;
