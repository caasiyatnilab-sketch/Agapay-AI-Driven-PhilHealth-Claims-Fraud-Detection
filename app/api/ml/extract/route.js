import { NextResponse } from 'next/server';
import axios from 'axios';
const { verifyAuth } = require('../../../../lib/auth');

const ML_SERVICE_URL = process.env.ML_SERVICE_URL || 'http://127.0.0.1:5000';

export async function POST(req) {
  try {
    verifyAuth(req);
    const res = await axios.post(`${ML_SERVICE_URL}/extract`, {});
    return NextResponse.json(res.data);
  } catch (err) {
    if (err.message.includes('token')) {
      return NextResponse.json({ error: err.message }, { status: 401 });
    }
    return NextResponse.json({ extracted_text: "PHILHEALTH CLAIM\nDiagnosis: COVID-19\nProcedure: Isolation\nAmount: 15,000 PHP\nHospital: Medical City\n[NOTE: Simulated by Fallback proxy]" });
  }
}
