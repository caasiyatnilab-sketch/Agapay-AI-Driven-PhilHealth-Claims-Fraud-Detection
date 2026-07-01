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
      throw new Error('Server configuration error: JWT_SECRET is missing');
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
    // Mask internal error details from the client to prevent information leakage
    const isValidationError = error.message.toLowerCase().includes('required');
    return NextResponse.json(
      { error: isValidationError ? error.message : 'Internal Server Error' },
      { status: isValidationError ? 400 : 500 }
    );
  }
}
