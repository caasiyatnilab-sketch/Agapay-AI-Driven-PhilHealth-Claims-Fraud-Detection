import { NextResponse } from 'next/server';
const { getDb } = require('../../../lib/db');
const { verifyAuth } = require('../../../lib/auth');

export async function GET(req) {
  try {
    const user = verifyAuth(req);
    const { Notification } = await getDb();

    const notifications = await Notification.findAll({
      where: { userId: user.id },
      order: [['createdAt', 'DESC']],
      limit: 20
    });

    return NextResponse.json({ notifications });
  } catch (error) {
    const status = error.message.includes('token') ? 401 : 500;
    const message = status === 500 ? 'Internal Server Error' : error.message;
    return NextResponse.json({ error: message }, { status });
  }
}

export async function PUT(req) {
  try {
    const user = verifyAuth(req);
    const { id } = await req.json();
    const { Notification } = await getDb();

    if (id) {
       await Notification.update({ read: true }, { where: { id, userId: user.id } });
    } else {
       await Notification.update({ read: true }, { where: { userId: user.id } });
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    const status = error.message.includes('token') ? 401 : 500;
    const message = status === 500 ? 'Internal Server Error' : error.message;
    return NextResponse.json({ error: message }, { status });
  }
}
