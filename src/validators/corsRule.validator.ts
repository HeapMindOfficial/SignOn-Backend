import { z } from 'zod';

import { isValidOrigin } from '../utils/isValidOrigin.js';

const originSchema = z
  .string()
  .trim()
  .min(1, 'Origin is required')
  .refine(isValidOrigin, 'Origin must be a scheme + host only, e.g. https://example.com');

export const corsRuleIdParamSchema = z.object({
  id: z.string().regex(/^[0-9a-fA-F]{24}$/, 'Invalid CORS rule id'),
});

export const createCorsRuleSchema = z.object({
  origin: originSchema,
  isActive: z.boolean().optional(),
});

export const updateCorsRuleSchema = z
  .object({
    origin: originSchema.optional(),
    isActive: z.boolean().optional(),
  })
  .refine((data) => data.origin !== undefined || data.isActive !== undefined, {
    message: 'Provide at least one of "origin" or "isActive"',
  });

export type CorsRuleIdParam = z.infer<typeof corsRuleIdParamSchema>;
export type CreateCorsRuleInput = z.infer<typeof createCorsRuleSchema>;
export type UpdateCorsRuleInput = z.infer<typeof updateCorsRuleSchema>;
