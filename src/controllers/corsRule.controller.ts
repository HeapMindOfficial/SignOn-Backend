import {
  createCorsRule,
  deleteCorsRuleById,
  findAllCorsRules,
  findCorsRuleById,
  updateCorsRuleById,
} from '../repositories/corsRule.repository.js';
import { refreshAllowedOrigins } from '../services/cors.service.js';
import { ApiError } from '../utils/ApiError.js';
import { asyncHandler } from '../utils/asyncHandler.js';
import type {
  CorsRuleIdParam,
  CreateCorsRuleInput,
  UpdateCorsRuleInput,
} from '../validators/corsRule.validator.js';

export const listCorsRules = asyncHandler(async (_req, res) => {
  const rules = await findAllCorsRules();
  res.success(rules, 'CORS rules retrieved');
});

export const getCorsRule = asyncHandler(async (req, res) => {
  const { id } = req.params as unknown as CorsRuleIdParam;
  const rule = await findCorsRuleById(id);
  if (!rule) throw ApiError.notFound('CORS rule not found');
  res.success(rule, 'CORS rule retrieved');
});

export const createCorsRuleHandler = asyncHandler(async (req, res) => {
  const { origin, isActive } = req.body as CreateCorsRuleInput;

  const rule = await createCorsRule({ origin, ...(isActive !== undefined ? { isActive } : {}) });
  await refreshAllowedOrigins();
  res.success(rule, 'CORS rule created', 201);
});

export const updateCorsRuleHandler = asyncHandler(async (req, res) => {
  const { id } = req.params as unknown as CorsRuleIdParam;
  const { origin, isActive } = req.body as UpdateCorsRuleInput;

  const rule = await updateCorsRuleById(id, {
    ...(origin !== undefined ? { origin } : {}),
    ...(isActive !== undefined ? { isActive } : {}),
  });
  if (!rule) throw ApiError.notFound('CORS rule not found');

  await refreshAllowedOrigins();
  res.success(rule, 'CORS rule updated');
});

export const deleteCorsRuleHandler = asyncHandler(async (req, res) => {
  const { id } = req.params as unknown as CorsRuleIdParam;
  const rule = await deleteCorsRuleById(id);
  if (!rule) throw ApiError.notFound('CORS rule not found');

  await refreshAllowedOrigins();
  res.success(null, 'CORS rule deleted');
});
