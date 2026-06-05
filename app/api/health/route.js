import { NextResponse } from 'next/server';
const { getDb } = require('../../../lib/db');
const { getBlockchainContract } = require('../../../lib/blockchain');

export async function GET() {
  const health = {
    status: 'ok',
    timestamp: new Date().toISOString(),
    services: {
      database: 'unknown',
      blockchain: process.env.CONTRACT_ADDRESS ? 'configured' : 'simulation',
      ml: process.env.ML_API_URL || process.env.ML_SERVICE_URL || 'http://127.0.0.1:5000',
    },
  };

  try {
    const { sequelize } = await getDb();
    await sequelize.authenticate();
    health.services.database = 'ok';
  } catch (error) {
    health.status = 'degraded';
    health.services.database = 'error';
  }

  try {
    const contract = await getBlockchainContract();
    health.services.blockchain = contract ? 'configured' : 'simulation';
  } catch (error) {
    health.status = 'degraded';
    health.services.blockchain = 'unreachable';
  }

  return NextResponse.json(health, { status: health.status === 'ok' ? 200 : 503 });
}
