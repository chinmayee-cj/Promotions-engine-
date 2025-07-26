import fs from 'fs';
import yaml from 'js-yaml';
import { config } from './config.js';

class RuleEngine {
  constructor() {
    this.rules = [];
    this.loadRules();
  }

  loadRules() {
    try {
      const fileContents = fs.readFileSync(config.rulesFile, 'utf8');
      const data = yaml.load(fileContents);
      
      if (!data.rules || !Array.isArray(data.rules)) {
        throw new Error('Invalid rules format');
      }

      // Sort by priority 
      this.rules = data.rules
        .filter(rule => rule.active)
        .sort((a, b) => b.priority - a.priority);

      console.log(`Loaded ${this.rules.length} active rules`);
    } catch (error) {
      console.error('Error loading rules:', error);
      throw error;
    }
  }

  reloadRules() {
    this.loadRules();
    return {
      message: 'Rules reloaded successfully',
      count: this.rules.length,
      timestamp: new Date().toISOString()
    };
  }

  selectPromotion(player) {
    for (const rule of this.rules) {
      if (this.evaluateRule(rule, player)) {
        return {
          rule_id: rule.id,
          rule_description: rule.description,
          promotion: rule.promotion
        };
      }
    }

    // If no rules match, return null or a default promotion
    return null;
  }

  evaluateRule(rule, player) {
    const conditions = rule.conditions;

    // If no conditions, rule matches (like default rule)
    if (!conditions || Object.keys(conditions).length === 0) {
      return true;
    }

    for (const [field, condition] of Object.entries(conditions)) {
      const playerValue = player[field];

      if (!this.evaluateCondition(playerValue, condition)) {
        return false;
      }
    }

    return true;
  }

  evaluateCondition(playerValue, condition) {
    
    if (Array.isArray(condition)) {
      return condition.includes(playerValue);
    }

    
    if (typeof condition === 'object' && condition !== null) {
      if (condition.min !== undefined && playerValue < condition.min) {
        return false;
      }
      if (condition.max !== undefined && playerValue > condition.max) {
        return false;
      }
      return true;
    }

    
    return playerValue === condition;
  }

  getRulesStats() {
    return {
      total_rules: this.rules.length,
      active_rules: this.rules.filter(r => r.active).length,
      rules_by_priority: this.rules.map(r => ({
        id: r.id,
        priority: r.priority,
        active: r.active
      }))
    };
  }
}

export const ruleEngine = new RuleEngine();
