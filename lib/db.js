const { Sequelize, DataTypes } = require('sequelize');

const sequelize = new Sequelize({ 
  dialect: 'sqlite', 
  storage: './database.sqlite', 
  logging: false 
});

const User = sequelize.define('User', {
  name: { type: DataTypes.STRING, allowNull: false },
  email: { type: DataTypes.STRING, allowNull: false, unique: true },
  passwordHash: { type: DataTypes.STRING, allowNull: false },
  role: { type: DataTypes.ENUM('PATIENT', 'HOSPITAL', 'AUDITOR'), allowNull: false },
  philhealthId: { type: DataTypes.STRING, allowNull: true },
});

const Hospital = sequelize.define('Hospital', {
  name: { type: DataTypes.STRING, allowNull: false },
  address: { type: DataTypes.STRING, allowNull: false },
  accreditationNo: { type: DataTypes.STRING, allowNull: false, unique: true },
  region: { type: DataTypes.STRING, allowNull: false }
});

const Claim = sequelize.define('Claim', {
  claimRef: { type: DataTypes.STRING, allowNull: false, unique: true },
  diagnosis: { type: DataTypes.STRING, allowNull: false },
  icd10Code: { type: DataTypes.STRING, allowNull: false },
  caseRateType: { type: DataTypes.STRING, allowNull: false },
  amountClaimed: { type: DataTypes.FLOAT, allowNull: false, validate: { min: 1 } },
  daysAdmitted: { type: DataTypes.INTEGER, allowNull: false, validate: { min: 1 } },
  status: { type: DataTypes.ENUM('PENDING', 'APPROVED', 'REJECTED', 'PAID'), defaultValue: 'PENDING' },
  riskScore: { type: DataTypes.FLOAT, allowNull: true, validate: { min: 0, max: 1 } },
  txHash: { type: DataTypes.STRING, allowNull: true },
});

const ClaimHistory = sequelize.define('ClaimHistory', {
  status: { type: DataTypes.STRING, allowNull: false },
  notes: { type: DataTypes.TEXT, allowNull: true },
});

const Notification = sequelize.define('Notification', {
  title: { type: DataTypes.STRING, allowNull: false },
  message: { type: DataTypes.TEXT, allowNull: false },
  read: { type: DataTypes.BOOLEAN, defaultValue: false }
});

const AuditLog = sequelize.define('AuditLog', {
  actorUserId: { type: DataTypes.INTEGER, allowNull: true },
  action: { type: DataTypes.STRING, allowNull: false },
  entityType: { type: DataTypes.STRING, allowNull: false },
  entityId: { type: DataTypes.STRING, allowNull: true },
  metadata: { type: DataTypes.TEXT, allowNull: true },
  ipAddress: { type: DataTypes.STRING, allowNull: true },
});

User.belongsTo(Hospital, { foreignKey: 'hospitalId', as: 'hospital' });
Claim.belongsTo(User, { foreignKey: 'patientId', as: 'patient' });
Claim.belongsTo(Hospital, { foreignKey: 'hospitalId', as: 'hospital' });
Claim.hasMany(ClaimHistory, { foreignKey: 'claimId', as: 'history' });
ClaimHistory.belongsTo(Claim, { foreignKey: 'claimId' });
Notification.belongsTo(User, { foreignKey: 'userId' });
AuditLog.belongsTo(User, { foreignKey: 'actorUserId', as: 'actor' });

let initPromise = null;

async function syncAndSeed() {
  await sequelize.sync({ force: false });
  const seed = require('./seed');
  await seed({ User, Hospital, Claim, ClaimHistory, Notification, AuditLog });
}

async function getDb() {
  if (!initPromise) {
    initPromise = syncAndSeed().catch(err => {
      console.error('DB init failed:', err);
      initPromise = null;
      throw err;
    });
  }
  await initPromise;
  return { sequelize, User, Hospital, Claim, ClaimHistory, Notification, AuditLog };
}

module.exports = { getDb };
