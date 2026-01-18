import WebSocket from 'ws';
import pool from '../config/database.js';

class QuantumNexus {
  constructor() {
    this.wss = null;
    this.stewards = new Map();
    this.pollingInterval = 15000; // 15s heartbeat
    this.intervalId = null;
  }

  async start(port = 3002) {
    this.wss = new WebSocket.Server({ port });
    
    this.wss.on('connection', (ws, req) => {
      const url = new URL(req.url, `ws://localhost:${port}`);
      const country = url.searchParams.get('country');
      const language = url.searchParams.get('language');
      
      if (country && language) {
        this.registerSteward(ws, country, language);
      }
    });

    this.intervalId = setInterval(() => this.heartbeat(), this.pollingInterval);
    
    console.log(`🌌 Quantum Nexus activated on port ${port}`);
  }

  async registerSteward(ws, country, language) {
    try {
      const result = await pool.query(
        'SELECT id FROM heritage_matrix WHERE country_code=$1 AND language_code=$2',
        [country.toUpperCase(), language.toLowerCase()]
      );
      
      if (result.rows[0]) {
        this.stewards.set(ws, { country, language, pathway_id: result.rows[0].id });
        ws.send(JSON.stringify({ status: 'REGISTERED', pathway_id: result.rows[0].id }));
      }
    } catch (error) {
      console.error('Steward registration error:', error);
    }
  }

  async heartbeat() {
    console.log(`💓 Quantum Nexus heartbeat - ${this.stewards.size} stewards connected`);
  }

  stop() {
    if (this.intervalId) {
      clearInterval(this.intervalId);
    }
    if (this.wss) {
      this.wss.close();
    }
  }
}

export default QuantumNexus;
