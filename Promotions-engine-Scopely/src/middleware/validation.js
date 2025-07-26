import Joi from 'joi';

const playerSchema = Joi.object({
  player_id: Joi.string().required(),
  player_level: Joi.number().integer().min(1).required(),
  spend_tier: Joi.string().valid('BRONZE', 'SILVER', 'GOLD', 'PLATINUM').required(),
  country: Joi.string().length(2).uppercase().required(),
  days_since_last_purchase: Joi.number().integer().min(0).required(),
  days_since_registration: Joi.number().integer().min(0).optional(),
  total_spend_30d: Joi.number().min(0).optional().default(0)
});

export const validatePlayer = (req, res, next) => {
  const { error, value } = playerSchema.validate(req.body);
  
  if (error) {
    return res.status(400).json({
      error: 'Validation failed',
      details: error.details.map(detail => ({
        field: detail.path.join('.'),
        message: detail.message
      }))
    });
  }
  
  req.body = value;
  next();
};
