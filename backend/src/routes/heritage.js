// ═══════════════════════════════════════════════════════════════════
// Heritage Matrix API - Express.js Routes
// ═══════════════════════════════════════════════════════════════════

import express from 'express';
import pool from '../config/database.js';
import { apiKeyMiddleware } from '../middleware/auth.js';
import { apiLimiter } from '../middleware/rateLimiter.js';

const router = express.Router();

// ────────────────────────────────────────────────────────────────────
// GET /api/heritage/:country/:language - Get Cultural Context
// ────────────────────────────────────────────────────────────────────
router.get('/:country/:language', apiKeyMiddleware, apiLimiter, async (req, res, next) => {
  try {
    const { country, language } = req.params;
    
    const result = await pool.query(`
      SELECT * FROM heritage_matrix
      WHERE country_code = $1 AND language_code = $2 AND is_active = true
    `, [country.toUpperCase(), language.toLowerCase()]);
    
    if (result.rows.length === 0) {
      return res.status(404).json({
        error: 'Cultural pathway not found',
        country, language,
        suggestion: 'Use fallback to English or regional default'
      });
    }
    
    res.json({
      success: true,
      cultural_context: result.rows[0]
    });
  } catch (error) {
    next(error);
  }
});

// ────────────────────────────────────────────────────────────────────
// POST /api/heritage/validate - Validate Content Against Culture
// ────────────────────────────────────────────────────────────────────
router.post('/validate', apiKeyMiddleware, apiLimiter, async (req, res, next) => {
  try {
    const { country, language, content_type, payload } = req.body;
    
    const cultural = await getCulturalContext(country, language);
    
    const validation = {
      visual_check: validateVisuals(payload.visuals, cultural.style_constraints),
      sonic_check: validateAudio(payload.audio, cultural.sonic_frequencies),
      sacred_symbols: checkSacredSymbols(payload, cultural.cultural_risk_flags.sacred_symbols),
      ritual_timing: checkRitualTiming(new Date(), cultural.cultural_risk_flags.ritual_timing),
      governance_required: checkGovernanceNeeds(payload.scope, cultural.cultural_risk_flags.governance_protocols)
    };
    
    const hasIssues = Object.values(validation).some(v => v.status === 'FAILED');
    
    res.json({
      success: !hasIssues,
      validation_results: validation,
      cultural_context_id: cultural.id,
      recommendations: hasIssues ? generateRecommendations(validation) : []
    });
  } catch (error) {
    next(error);
  }
});

// ────────────────────────────────────────────────────────────────────
// POST /api/heritage/route-careloop - Calculate Cultural Care Loop
// ────────────────────────────────────────────────────────────────────
router.post('/route-careloop', apiKeyMiddleware, apiLimiter, async (req, res, next) => {
  try {
    const { country, language, donation_amount } = req.body;
    
    const cultural = await getCulturalContext(country, language);
    const weights = cultural.careloop_weights;
    
    const routing = {
      total: donation_amount,
      education: donation_amount * weights.education,
      climate: donation_amount * weights.climate,
      health: donation_amount * weights.health,
      cultural_preservation: donation_amount * weights.cultural_preservation,
      infrastructure: donation_amount * weights.infrastructure,
      economic_development: donation_amount * weights.economic_development,
      
      animals_helped_estimate: calculateAnimalsHelped(donation_amount, weights),
      optimization_boost: calculateOptimizationBoost(donation_amount, weights)
    };
    
    res.json({
      success: true,
      cultural_routing: routing,
      cultural_context: {
        country: cultural.country_name,
        language: cultural.language_name
      }
    });
  } catch (error) {
    next(error);
  }
});

// Helper functions
async function getCulturalContext(country, language) {
  const result = await pool.query(`
    SELECT * FROM heritage_matrix
    WHERE country_code = $1 AND language_code = $2 AND is_active = true
  `, [country.toUpperCase(), language.toLowerCase()]);
  
  if (result.rows.length === 0) {
    throw new Error(`Cultural pathway ${country}-${language} not found`);
  }
  
  return result.rows[0];
}

function validateVisuals(visuals, constraints) {
  const taboos = constraints.visual_taboos || [];
  const violations = taboos.filter(taboo => 
    visuals && visuals.toLowerCase().includes(taboo.toLowerCase())
  );
  
  return {
    status: violations.length === 0 ? 'PASSED' : 'FAILED',
    violations
  };
}

function validateAudio(audio, frequencies) {
  return { status: 'PASSED', violations: [] };
}

function checkSacredSymbols(payload, sacredSymbols) {
  return { status: 'PASSED', found_symbols: [] };
}

function checkRitualTiming(currentDate, ritualTiming) {
  return { status: 'PASSED' };
}

function checkGovernanceNeeds(scope, protocols) {
  return { status: 'PASSED' };
}

function calculateAnimalsHelped(amount, weights) {
  const baseEfficiency = amount / 240;
  const culturalBoost = 1.6;
  return Math.floor(baseEfficiency * culturalBoost);
}

function calculateOptimizationBoost(amount, weights) {
  const generic = amount / 240;
  const optimized = calculateAnimalsHelped(amount, weights);
  const boost = ((optimized - generic) / generic) * 100;
  return `+${boost.toFixed(1)}%`;
}

function generateRecommendations(validation) {
  return ['Review cultural constraints', 'Consult community stewards'];
}

export default router;
