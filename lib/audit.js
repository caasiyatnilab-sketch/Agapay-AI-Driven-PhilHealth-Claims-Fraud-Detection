async function writeAuditLog(models, { actorUserId = null, action, entityType, entityId = null, metadata = {}, req = null }) {
  if (!models?.AuditLog || !action || !entityType) return;

  await models.AuditLog.create({
    actorUserId,
    action,
    entityType,
    entityId: entityId ? String(entityId) : null,
    metadata: JSON.stringify(metadata),
    ipAddress: req?.headers?.get('x-forwarded-for')?.split(',')[0]?.trim() || req?.headers?.get('x-real-ip') || null,
  });
}

module.exports = { writeAuditLog };
