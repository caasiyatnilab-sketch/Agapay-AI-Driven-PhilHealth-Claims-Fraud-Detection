const bcrypt = require('bcryptjs');

module.exports = async function seed({ User, Hospital }) {
  const hospitalCount = await Hospital.count();
  if (hospitalCount === 0) {
    await Hospital.bulkCreate([
      { name: "Philippine General Hospital", address: "Taft Ave, Ermita, Manila", accreditationNo: "H-13-1282", region: "NCR" },
      { name: "St. Luke's Medical Center", address: "E. Rodriguez Sr. Ave, Quezon City", accreditationNo: "H-13-1466", region: "NCR" },
      { name: "Makati Medical Center", address: "Amorsolo St, Makati", accreditationNo: "H-13-1389", region: "NCR" },
      { name: "The Medical City", address: "Ortigas Ave, Pasig", accreditationNo: "H-13-1002", region: "NCR" },
      { name: "Asian Hospital", address: "Civic Drive, Muntinlupa", accreditationNo: "H-13-1498", region: "NCR" },
      { name: "Davao Doctors Hospital", address: "E. Quirino Ave, Davao City", accreditationNo: "H-11-2001", region: "Region XI" },
      { name: "Chong Hua Hospital", address: "Don Mariano Cui St, Cebu City", accreditationNo: "H-07-2300", region: "Region VII" },
      { name: "Baguio General Hospital", address: "Gov. Pack Rd, Baguio", accreditationNo: "H-CAR-3010", region: "CAR" },
      { name: "Iloilo Doctors' Hospital", address: "West Ave, Molo, Iloilo City", accreditationNo: "H-06-1928", region: "Region VI" },
      { name: "Zamboanga City Medical Center", address: "Dr. Evangelista St, Zamboanga", accreditationNo: "H-09-5099", region: "Region IX" }
    ]);
  }

  const userCount = await User.count();
  if (userCount === 0) {
    const defaultPassword = bcrypt.hashSync('password123', 10);
    await User.bulkCreate([
      { name: "Juan Dela Cruz", email: "patient@test.com", passwordHash: defaultPassword, role: "PATIENT", philhealthId: "02-1234567-8" },
      { name: "Maria Clara", email: "patient2@test.com", passwordHash: defaultPassword, role: "PATIENT", philhealthId: "03-8765432-1" },
      { name: "Dr. Jose Rizal", email: "hospital@test.com", passwordHash: defaultPassword, role: "HOSPITAL", hospitalId: 1 },
      { name: "Dr. Ana Santos", email: "hospital2@test.com", passwordHash: defaultPassword, role: "HOSPITAL", hospitalId: 2 },
      { name: "Pedro Penduko", email: "auditor@test.com", passwordHash: defaultPassword, role: "AUDITOR" }
    ]);
  }
};
