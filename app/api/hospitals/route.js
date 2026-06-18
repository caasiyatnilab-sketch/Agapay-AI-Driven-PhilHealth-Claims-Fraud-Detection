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
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
