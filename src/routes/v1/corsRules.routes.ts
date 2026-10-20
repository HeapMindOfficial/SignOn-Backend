import { Router } from 'express';

import {
  createCorsRuleHandler,
  deleteCorsRuleHandler,
  getCorsRule,
  listCorsRules,
  updateCorsRuleHandler,
} from '../../controllers/corsRule.controller.js';
import { validate } from '../../middlewares/validate.js';
import {
  corsRuleIdParamSchema,
  createCorsRuleSchema,
  updateCorsRuleSchema,
} from '../../validators/corsRule.validator.js';

export const corsRulesRouter = Router();

corsRulesRouter.get('/', listCorsRules);
corsRulesRouter.post('/', validate({ body: createCorsRuleSchema }), createCorsRuleHandler);
corsRulesRouter.get('/:id', validate({ params: corsRuleIdParamSchema }), getCorsRule);
corsRulesRouter.patch(
  '/:id',
  validate({ params: corsRuleIdParamSchema, body: updateCorsRuleSchema }),
  updateCorsRuleHandler,
);
corsRulesRouter.delete('/:id', validate({ params: corsRuleIdParamSchema }), deleteCorsRuleHandler);
