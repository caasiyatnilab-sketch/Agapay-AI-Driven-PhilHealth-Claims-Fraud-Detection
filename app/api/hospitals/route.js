import { NextResponse } from 'next/server';
const { getDb } = require('../../../lib/db');

export async function GET() {
  try {
    const { Hospital } = await getDb();
    const hospitals = await Hospital.findAll();
    return NextResponse.json({ hospitals });
  } catch (error) {
    console.error('Hospitals API Error:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
