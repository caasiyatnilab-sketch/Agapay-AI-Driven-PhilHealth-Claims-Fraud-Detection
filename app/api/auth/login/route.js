import { NextResponse } from 'next/server';
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { getDb } = require('../../../../lib/db');

export async function POST(req) {
  try {
    const { email, password } = await req.json();
    const { User, Hospital } = await getDb();

    const user = await User.findOne({ 
      where: { email },
      include: [{ model: Hospital, as: 'hospital' }]
    });

    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    const isValid = bcrypt.compareSync(password, user.passwordHash);
    if (!isValid) {
      return NextResponse.json({ error: 'Invalid credentials' }, { status: 401 });
    }

    const token = jwt.sign(
      { id: user.id, role: user.role, hospitalId: user.hospitalId },
      process.env.JWT_SECRET || 'fallback-secret',
      { expiresIn: '1d' }
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
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
