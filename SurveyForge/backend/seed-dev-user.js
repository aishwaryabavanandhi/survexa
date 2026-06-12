const bcrypt = require('bcryptjs');
const { initDatabase, run } = require('./database');

async function runSeed() {
  await initDatabase();
  const hash = await bcrypt.hash('Password123!', 10);
  await run(
    "INSERT OR REPLACE INTO users (email, password, role, verified, name) VALUES ('admin@survexa.com', ?, 'admin', 1, 'Admin Tester')",
    [hash]
  );
  console.log('Seeded admin@survexa.com with Password123!');
}

runSeed().catch(console.error);
