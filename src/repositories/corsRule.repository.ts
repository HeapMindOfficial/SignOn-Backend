import { CorsRuleModel, type CorsRuleDocument } from '../models/corsRule.model.js';

export async function findActiveOrigins(): Promise<string[]> {
  const rules = await CorsRuleModel.find({ isActive: true }).select('origin').lean();
  return rules.map((rule) => rule.origin);
}

export async function findAllCorsRules() {
  return CorsRuleModel.find().sort({ createdAt: -1 });
}

export async function findCorsRuleById(id: string) {
  return CorsRuleModel.findById(id);
}

export async function createCorsRule(
  data: Pick<CorsRuleDocument, 'origin'> & Partial<CorsRuleDocument>,
) {
  return CorsRuleModel.create(data);
}

export async function updateCorsRuleById(id: string, data: Partial<CorsRuleDocument>) {
  return CorsRuleModel.findByIdAndUpdate(id, data, { new: true, runValidators: true });
}

export async function deleteCorsRuleById(id: string) {
  return CorsRuleModel.findByIdAndDelete(id);
}
