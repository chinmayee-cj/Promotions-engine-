import { jest } from '@jest/globals';
import { ruleEngine } from '../src/ruleEngine.js';

describe('Rule Engine', () => {
  const mockPlayer = {
    player_id: 'test123',
    player_level: 55,
    spend_tier: 'GOLD',
    country: 'US',
    days_since_last_purchase: 20,
    days_since_registration: 100,
    total_spend_30d: 1500
  };

  test('should select high spender VIP promotion', () => {
    const result = ruleEngine.selectPromotion(mockPlayer);
    
    expect(result).toBeDefined();
    expect(result.rule_id).toBe('high_spender_vip');
    expect(result.promotion.id).toBe('vip_mega_bonus');
  });

  test('should select comeback special for inactive player', () => {
    const inactivePlayer = {
      ...mockPlayer,
      total_spend_30d: 500, // Lower spend to avoid VIP rule
      days_since_last_purchase: 20
    };

    const result = ruleEngine.selectPromotion(inactivePlayer);
    expect(result.rule_id).toBe('comeback_special');
  });

  test('should select new-player boost for eligible new players', () => {
    const newPlayer = {
      player_id: 'new123',
      player_level: 1,
      spend_tier: 'BRONZE',
      country: 'XX',
      days_since_last_purchase: 0,
      days_since_registration: 1,
      total_spend_30d: 0
    };

    const result = ruleEngine.selectPromotion(newPlayer);
    expect(result.rule_id).toBe('new_player_boost'); // Update to match actual rule
  });

  test('should reload rules successfully', () => {
    const result = ruleEngine.reloadRules();
    
    expect(result.message).toBe('Rules reloaded successfully');
    expect(result.count).toBeGreaterThan(0);
    expect(result.timestamp).toBeDefined();
  });
  test('should select default promotion when absolutely no rules match', () => {
  const unmatched = {
    player_id: 'none999',
    player_level: 30,
    spend_tier: 'BRONZE',
    country: 'ZZ',                // unsupported country
    days_since_last_purchase: 5,  // not enough for comeback
    days_since_registration: 100,
    total_spend_30d: 0
  };

  const result = ruleEngine.selectPromotion(unmatched);
  expect(result.rule_id).toBe('default_promotion');
});

});
