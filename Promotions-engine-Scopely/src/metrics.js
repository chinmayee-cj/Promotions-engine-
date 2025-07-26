import promClient from 'prom-client';

// Create a Registry
const register = new promClient.Registry();

promClient.collectDefaultMetrics({ register });

// Define custom metrics
const promotionRequestsTotal = new promClient.Counter({
  name: 'promotion_requests_total',
  help: 'Total number of promotion requests',
  labelNames: ['method', 'status_code']
});

const promotionSelectionDuration = new promClient.Histogram({
  name: 'promotion_selection_duration_seconds',
  help: 'Duration of promotion selection in seconds',
  buckets: [0.001, 0.005, 0.01, 0.05, 0.1, 0.5, 1]
});

const ruleMatches = new promClient.Counter({
  name: 'rule_matches_total',
  help: 'Total number of rule matches',
  labelNames: ['rule_id']
});

const rulesReloaded = new promClient.Counter({
  name: 'rules_reloaded_total',
  help: 'Total number of times rules were reloaded'
});

// Register metrics
register.registerMetric(promotionRequestsTotal);
register.registerMetric(promotionSelectionDuration);
register.registerMetric(ruleMatches);
register.registerMetric(rulesReloaded);

export {
  register,
  promotionRequestsTotal,
  promotionSelectionDuration,
  ruleMatches,
  rulesReloaded
};
