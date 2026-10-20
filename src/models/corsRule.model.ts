import { Schema, model } from 'mongoose';

export interface CorsRuleDocument {
  origin: string;
  isActive: boolean;
}

const corsRuleSchema = new Schema<CorsRuleDocument>(
  {
    origin: { type: String, required: true, unique: true, trim: true },
    isActive: { type: Boolean, required: true, default: true },
  },
  { timestamps: true },
);

export const CorsRuleModel = model<CorsRuleDocument>('CorsRule', corsRuleSchema);
