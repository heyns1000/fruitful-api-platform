-- ═══════════════════════════════════════════════════════════════════
-- HERITAGE MATRIX - PostgreSQL Schema (Neon DB Compatible)
-- ═══════════════════════════════════════════════════════════════════

CREATE TABLE IF NOT EXISTS heritage_matrix (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  
  -- Geographic & Linguistic Identity
  country_code VARCHAR(2) NOT NULL,           -- ISO 3166-1 alpha-2
  country_name VARCHAR(100) NOT NULL,
  language_code VARCHAR(3) NOT NULL,          -- ISO 639-2/3
  language_name VARCHAR(100) NOT NULL,
  
  -- Care Loop Cultural Weights (MUST sum to 1.0)
  careloop_weights JSONB NOT NULL,
  
  -- Visual/Design Constraints
  style_constraints JSONB,
  
  -- Sonic/Audio Validation
  sonic_frequencies JSONB,
  
  -- Governance & Risk Management
  cultural_risk_flags JSONB,
  
  -- System Meta
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW(),
  metadata JSONB,
  
  -- Constraints
  UNIQUE(country_code, language_code),
  CHECK (jsonb_typeof(careloop_weights) = 'object')
);

-- Indexes for performance
CREATE INDEX IF NOT EXISTS idx_heritage_country ON heritage_matrix(country_code);
CREATE INDEX IF NOT EXISTS idx_heritage_language ON heritage_matrix(language_code);
CREATE INDEX IF NOT EXISTS idx_heritage_active ON heritage_matrix(is_active);
CREATE INDEX IF NOT EXISTS idx_heritage_country_lang ON heritage_matrix(country_code, language_code);

-- JSONB indexes for fast cultural lookups
CREATE INDEX IF NOT EXISTS idx_heritage_careloop ON heritage_matrix USING GIN (careloop_weights);
CREATE INDEX IF NOT EXISTS idx_heritage_style ON heritage_matrix USING GIN (style_constraints);
CREATE INDEX IF NOT EXISTS idx_heritage_risks ON heritage_matrix USING GIN (cultural_risk_flags);

-- Seed South Africa (isiZulu) as reference implementation
INSERT INTO heritage_matrix (
  country_code, country_name, language_code, language_name,
  careloop_weights, style_constraints, sonic_frequencies, cultural_risk_flags
) VALUES (
  'ZA', 'South Africa', 'zu', 'isiZulu',
  '{"education": 0.35, "climate": 0.20, "health": 0.25, "cultural_preservation": 0.15, "infrastructure": 0.03, "economic_development": 0.02}',
  '{"traditional_patterns": ["Ndebele geometric patterns", "Beadwork color coding"], "color_theory": ["Red: strength", "White: purity", "Black: marriage"], "visual_taboos": ["No pointing gestures", "Respect cattle imagery"]}',
  '{"traditional_scales": ["Pentatonic", "Mbube harmonies"], "ceremonial_tempos": [120, 140, 180], "avoided_frequencies": ["Dissonant intervals in ceremony"]}',
  '{"sacred_symbols": ["Sangoma healing symbols", "Chief regalia"], "ritual_timing": ["Reed Dance period", "Mourning protocols"], "governance_protocols": ["Consult traditional leadership"]}'
) ON CONFLICT (country_code, language_code) DO NOTHING;
