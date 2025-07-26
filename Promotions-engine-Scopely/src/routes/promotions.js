import express from 'express';
import { ruleEngine } from '../ruleEngine.js';
import { validatePlayer } from '../middleware/validation.js';
import { 
  promotionRequestsTotal, 
  promotionSelectionDuration, 
  ruleMatches, 
  rulesReloaded 
} from '../metrics.js';

const router = express.Router();

// POST /promotion - Select promotion for player
router.post('/promotion', validatePlayer, (req, res) => {
  const startTime = Date.now();
  
  try {
    const result = ruleEngine.selectPromotion(req.body);
    
    if (!result) {
      promotionRequestsTotal.inc({ method: 'POST', status_code: '404' });
      return res.status(404).json({
        error: 'No promotion found',
        message: 'No matching rules found for the provided player data'
      });
    }

    // Record metrics
    const duration = (Date.now() - startTime) / 1000;
    promotionSelectionDuration.observe(duration);
    promotionRequestsTotal.inc({ method: 'POST', status_code: '200' });
    ruleMatches.inc({ rule_id: result.rule_id });

    res.json({
      success: true,
      player_id: req.body.player_id,
      selected_promotion: result.promotion,
      matched_rule: {
        id: result.rule_id,
        description: result.rule_description
      },
      selection_time_ms: Date.now() - startTime
    });

  } catch (error) {
    promotionRequestsTotal.inc({ method: 'POST', status_code: '500' });
    res.status(500).json({
      error: 'Internal server error',
      message: error.message
    });
  }
});

// POST /reload-rules - Hot reload rules
router.post('/reload-rules', (req, res) => {
  try {
    const result = ruleEngine.reloadRules();
    rulesReloaded.inc();
    
    res.json({
      success: true,
      ...result
    });
  } catch (error) {
    res.status(500).json({
      error: 'Failed to reload rules',
      message: error.message
    });
  }
});

// GET /rules/stats - Get rules statistics
router.get('/rules/stats', (req, res) => {
  try {
    const stats = ruleEngine.getRulesStats();
    res.json(stats);
  } catch (error) {
    res.status(500).json({
      error: 'Failed to get rules stats',
      message: error.message
    });
  }
});

export default router;
