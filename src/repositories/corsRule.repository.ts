import { CorsRuleModel } from '../models/corsRule.model.js';

export async function findActiveOrigins(): Promise<string[]> {
  const rules = await CorsRuleModel.find({ isActive: true }).select('origin').lean();
  return rules.map((rule) => rule.origin);
}
