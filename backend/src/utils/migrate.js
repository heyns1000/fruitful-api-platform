import pg from 'pg'
import config from '../config/index.js'

const { Client } = pg

const migrations = [
  // Users table
  `
  CREATE TABLE IF NOT EXISTS users (
    id SERIAL PRIMARY KEY,
    email VARCHAR(255) UNIQUE NOT NULL,
    password VARCHAR(255) NOT NULL,
    name VARCHAR(255),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
  );
  `,
  // API Keys table
  `
  CREATE TABLE IF NOT EXISTS api_keys (
    id SERIAL PRIMARY KEY,
    user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
    name VARCHAR(255) NOT NULL,
    key VARCHAR(255) UNIQUE NOT NULL,
    scopes JSONB DEFAULT '[]',
    status VARCHAR(50) DEFAULT 'active',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    last_used TIMESTAMP
  );
  `,
  // Webhooks table
  `
  CREATE TABLE IF NOT EXISTS webhooks (
    id SERIAL PRIMARY KEY,
    user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
    url TEXT NOT NULL,
    events JSONB DEFAULT '[]',
    active BOOLEAN DEFAULT true,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    last_triggered TIMESTAMP
  );
  `,
  // API Requests table (for analytics)
  `
  CREATE TABLE IF NOT EXISTS api_requests (
    id SERIAL PRIMARY KEY,
    user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
    api_key_id INTEGER REFERENCES api_keys(id) ON DELETE SET NULL,
    endpoint VARCHAR(255) NOT NULL,
    method VARCHAR(10) NOT NULL,
    status_code INTEGER,
    response_time INTEGER,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
  );
  `,
  // Audit logs for FAA-X13 compliance
  `
  CREATE TABLE IF NOT EXISTS audit_logs (
    id SERIAL PRIMARY KEY,
    user_id INTEGER REFERENCES users(id) ON DELETE SET NULL,
    action VARCHAR(255) NOT NULL,
    resource_type VARCHAR(100),
    resource_id VARCHAR(255),
    details JSONB,
    ip_address INET,
    user_agent TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
  );
  `,
  // Indexes for performance
  `
  CREATE INDEX IF NOT EXISTS idx_api_keys_user_id ON api_keys(user_id);
  CREATE INDEX IF NOT EXISTS idx_api_keys_key ON api_keys(key);
  CREATE INDEX IF NOT EXISTS idx_webhooks_user_id ON webhooks(user_id);
  CREATE INDEX IF NOT EXISTS idx_api_requests_user_id ON api_requests(user_id);
  CREATE INDEX IF NOT EXISTS idx_api_requests_created_at ON api_requests(created_at);
  CREATE INDEX IF NOT EXISTS idx_audit_logs_user_id ON audit_logs(user_id);
  CREATE INDEX IF NOT EXISTS idx_audit_logs_created_at ON audit_logs(created_at);
  `,
  // Heritage Matrix table
  `
  CREATE TABLE IF NOT EXISTS heritage_matrix (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    
    -- Geographic & Linguistic Identity
    country_code VARCHAR(2) NOT NULL,
    country_name VARCHAR(100) NOT NULL,
    language_code VARCHAR(3) NOT NULL,
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
  `,
  // Heritage Matrix indexes
  `
  CREATE INDEX IF NOT EXISTS idx_heritage_country ON heritage_matrix(country_code);
  CREATE INDEX IF NOT EXISTS idx_heritage_language ON heritage_matrix(language_code);
  CREATE INDEX IF NOT EXISTS idx_heritage_active ON heritage_matrix(is_active);
  CREATE INDEX IF NOT EXISTS idx_heritage_country_lang ON heritage_matrix(country_code, language_code);
  CREATE INDEX IF NOT EXISTS idx_heritage_careloop ON heritage_matrix USING GIN (careloop_weights);
  CREATE INDEX IF NOT EXISTS idx_heritage_style ON heritage_matrix USING GIN (style_constraints);
  CREATE INDEX IF NOT EXISTS idx_heritage_risks ON heritage_matrix USING GIN (cultural_risk_flags);
  `,
  // Heritage Matrix seed data
  `
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
  `,
]

async function runMigrations() {
  const client = new Client({
    connectionString: config.database.url,
  })

  try {
    await client.connect()
    console.log('Connected to database')

    for (let i = 0; i < migrations.length; i++) {
      console.log(`Running migration ${i + 1}/${migrations.length}...`)
      await client.query(migrations[i])
    }

    console.log('All migrations completed successfully!')
  } catch (error) {
    console.error('Migration failed:', error)
    process.exit(1)
  } finally {
    await client.end()
  }
}

// Run migrations if this file is executed directly
if (import.meta.url === `file://${process.argv[1]}`) {
  runMigrations()
}

export default runMigrations
