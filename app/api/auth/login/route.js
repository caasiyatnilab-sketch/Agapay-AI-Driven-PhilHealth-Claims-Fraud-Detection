import { NextResponse } from 'next/server';
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { getDb } = require('../../../../lib/db');
const { normalizeEmail } = require('../../../../lib/claimRules');
const { assertRateLimit, getErrorStatus, getJwtSecret } = require('../../../../lib/security');
const { writeAuditLog } = require('../../../../lib/audit');

export async function POST(req) {
  try {
    assertRateLimit(req, { key: 'auth:login', limit: 10, windowMs: 60_000 });
    const body = await req.json();
    const email = normalizeEmail(body.email);
    const password = String(body.password || '');
    if (!email || !password) throw new Error('Email and password are required.');

    const db = await getDb();
    const { User, Hospital } = db;
    const user = await User.findOne({
      where: { email },
      include: [{ model: Hospital, as: 'hospital' }]
    });

    if (!user || !bcrypt.compareSync(password, user.passwordHash)) {
      return NextResponse.json({ error: 'Invalid credentials' }, { status: 401 });
    }

    const token = jwt.sign(
      { id: user.id, role: user.role, hospitalId: user.hospitalId },
      getJwtSecret(),
      { expiresIn: '1d', issuer: 'agapay' }
    );

    await writeAuditLog(db, { actorUserId: user.id, action: 'AUTH_LOGIN', entityType: 'User', entityId: user.id, req });

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
    return NextResponse.json({ error: error.message }, { status: getErrorStatus(error, 400) });
  }
}
