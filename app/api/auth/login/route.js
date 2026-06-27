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

    if (!process.env.JWT_SECRET) {
      throw new Error('JWT_SECRET is not configured on the server');
    }

    const token = jwt.sign(
      { id: user.id, role: user.role, hospitalId: user.hospitalId },
      process.env.JWT_SECRET,
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
    const message = error.message.includes('required') ? error.message : 'Internal Server Error';
    return NextResponse.json({ error: message }, { status: message === 'Internal Server Error' ? 500 : 400 });
  }
}
