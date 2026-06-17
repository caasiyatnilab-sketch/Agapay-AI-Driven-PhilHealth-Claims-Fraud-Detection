import { NextResponse } from 'next/server';
const { getDb } = require('../../../lib/db');
const { verifyAuth } = require('../../../lib/auth');

export async function GET(req) {
  try {
    verifyAuth(req);
    const { Hospital } = await getDb();
    const hospitals = await Hospital.findAll();
    return NextResponse.json({ hospitals });
  } catch (error) {
    console.error('Hospitals API Error:', error);
    const status = error.message.includes('token') || error.message.includes('misconfigured') ? 401 : 500;
    const message = status === 500 ? 'An internal server error occurred.' : error.message;
    return NextResponse.json({ error: message }, { status });
  }
}
