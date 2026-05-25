import { NextResponse } from 'next/server';
const bcrypt = require('bcryptjs');
const { getDb } = require('../../../../lib/db');

export async function POST(req) {
  try {
    const { name, email, password, role, philhealthId, hospitalId } = await req.json();
    const { User } = await getDb();

    const existing = await User.findOne({ where: { email } });
    if (existing) {
      return NextResponse.json({ error: 'Email already exists' }, { status: 400 });
    }

    const passwordHash = bcrypt.hashSync(password, 10);

    const user = await User.create({
      name, email, passwordHash, role,
      philhealthId: role === 'PATIENT' ? philhealthId : null,
      hospitalId: role === 'HOSPITAL' ? hospitalId : null
    });

    return NextResponse.json({ message: 'User registered successfully', userId: user.id });
  } catch (error) {
    console.error('Register API Error:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
