import { NextResponse } from 'next/server';
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { getDb } = require('../../../../lib/db');
const { normalizeEmail } = require('../../../../lib/claimRules');

export async function POST(req) {
  try {
    const body = await req.json();
    const email = normalizeEmail(body.email);
    const password = String(body.password || '');
    if (!email || !password) throw new Error('Email and password are required.');

    const { User, Hospital } = await getDb();
    const user = await User.findOne({
      where: { email },
      include: [{ model: Hospital, as: 'hospital' }]
    });

    if (!user || !bcrypt.compareSync(password, user.passwordHash)) {
      return NextResponse.json({ error: 'Invalid credentials' }, { status: 401 });
    }

    const secret = process.env.JWT_SECRET;
    if (!secret) {
      console.error('CRITICAL: JWT_SECRET environment variable is not set');
      return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
    }

    const token = jwt.sign(
      { id: user.id, role: user.role, hospitalId: user.hospitalId },
      secret,
      { expiresIn: '1d', issuer: 'agapay' }
    );

    return NextResponse.json({
      message: 'Login successful',
      token,
      user: {
        id: user.id,
        name: user.name,
        role: user.role,
        email: user.email,
        philhealthId: user.philhealthId,
        hospitalId: user.hospitalId,
        hospital: user.hospital
      }
    });
  } catch (error) {
    console.error('Login API Error:', error);
    // Mask internal error details to prevent information leakage
    const errorMessage = error.message === 'Email and password are required.'
      ? error.message
      : 'Internal Server Error';
    return NextResponse.json({ error: errorMessage }, { status: error.message === 'Email and password are required.' ? 400 : 500 });
  }
}
