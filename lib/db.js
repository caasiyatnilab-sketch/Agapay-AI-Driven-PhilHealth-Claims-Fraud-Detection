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
  amountClaimed: { type: DataTypes.FLOAT, allowNull: false },
  daysAdmitted: { type: DataTypes.INTEGER, allowNull: false },
  status: { type: DataTypes.ENUM('PENDING', 'APPROVED', 'REJECTED', 'PAID'), defaultValue: 'PENDING' },
  riskScore: { type: DataTypes.FLOAT, allowNull: true },
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

User.belongsTo(Hospital, { foreignKey: 'hospitalId', as: 'hospital' });
Claim.belongsTo(User, { foreignKey: 'patientId', as: 'patient' });
Claim.belongsTo(Hospital, { foreignKey: 'hospitalId', as: 'hospital' });
Claim.hasMany(ClaimHistory, { foreignKey: 'claimId', as: 'history' });
ClaimHistory.belongsTo(Claim, { foreignKey: 'claimId' });
Notification.belongsTo(User, { foreignKey: 'userId' });

let initPromise = null;

async function syncAndSeed() {
  await sequelize.sync({ force: false });
  const seed = require('./seed');
  await seed({ User, Hospital, Claim, ClaimHistory, Notification });
}

async function getDb() {
  if (!initPromise) {
    initPromise = syncAndSeed().catch(err => {
      console.error('DB init failed:', err);
    });
  }
  await initPromise;
  return { sequelize, User, Hospital, Claim, ClaimHistory, Notification };
}

module.exports = { getDb };
