import { NextResponse } from 'next/server';
const { getDb } = require('../../../lib/db');
const { verifyAuth } = require('../../../lib/auth');
const { getErrorStatus } = require('../../../lib/security');

export async function GET(req) {
  try {
    const user = verifyAuth(req);
    if (user.role !== 'AUDITOR') throw new Error('Unauthorized');

    const { searchParams } = new URL(req.url);
    const limit = Math.min(Number.parseInt(searchParams.get('limit') || '50', 10), 100);
    const { AuditLog, User } = await getDb();

    const logs = await AuditLog.findAll({
      include: [{ model: User, as: 'actor', attributes: ['id', 'name', 'email', 'role'] }],
      order: [['createdAt', 'DESC']],
      limit,
    });

    return NextResponse.json({
      auditLogs: logs.map((log) => {
        const plain = log.toJSON();
        return {
          ...plain,
          metadata: plain.metadata ? JSON.parse(plain.metadata) : null,
        };
      }),
    });
  } catch (error) {
    return NextResponse.json({ error: error.message }, { status: getErrorStatus(error) });
  }
}
