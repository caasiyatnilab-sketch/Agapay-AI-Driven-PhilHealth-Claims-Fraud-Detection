import { NextResponse } from 'next/server';
const bcrypt = require('bcryptjs');
const { getDb } = require('../../../../lib/db');
const { VALID_ROLES, normalizeEmail, toPositiveInteger } = require('../../../../lib/claimRules');
const { assertRateLimit, getErrorStatus } = require('../../../../lib/security');
const { writeAuditLog } = require('../../../../lib/audit');

export async function POST(req) {
  try {
    assertRateLimit(req, { key: 'auth:register', limit: 6, windowMs: 60_000 });
    const body = await req.json();
    const name = String(body.name || '').trim();
    const email = normalizeEmail(body.email);
    const password = String(body.password || '');
    const role = String(body.role || '').toUpperCase();

    if (name.length < 2) throw new Error('Name is required.');
    if (!/^\S+@\S+\.\S+$/.test(email)) throw new Error('A valid email address is required.');
    if (password.length < 8) throw new Error('Password must be at least 8 characters long.');
    if (!VALID_ROLES.has(role)) throw new Error('Invalid role.');
    if (role === 'AUDITOR' && process.env.ALLOW_AUDITOR_SELF_REGISTER !== 'true') {
      throw new Error('Auditor accounts must be provisioned by an administrator.');
    }
    if (role === 'PATIENT' && !/^\d{2}-\d{7}-\d$/.test(String(body.philhealthId || ''))) {
      throw new Error('PhilHealth ID must match xx-xxxxxxx-x.');
    }

    const db = await getDb();
    const { User, Hospital } = db;
    let normalizedHospitalId = null;
    if (role === 'HOSPITAL') {
      normalizedHospitalId = toPositiveInteger(body.hospitalId, 'Hospital');
      const hospital = await Hospital.findByPk(normalizedHospitalId);
      if (!hospital) throw new Error('Selected hospital does not exist.');
    }

    const existing = await User.findOne({ where: { email } });
    if (existing) {
      return NextResponse.json({ error: 'Email already exists' }, { status: 409 });
    }

    const passwordHash = bcrypt.hashSync(password, 12);
    const user = await User.create({
      name,
      email,
      passwordHash,
      role,
      philhealthId: role === 'PATIENT' ? body.philhealthId : null,
      hospitalId: normalizedHospitalId
    });

    await writeAuditLog(db, { actorUserId: user.id, action: 'AUTH_REGISTER', entityType: 'User', entityId: user.id, metadata: { role }, req });

    return NextResponse.json({ message: 'User registered successfully', userId: user.id }, { status: 201 });
  } catch (error) {
    console.error('Register API Error:', error);
    return NextResponse.json({ error: error.message }, { status: getErrorStatus(error, 400) });
  }
}
