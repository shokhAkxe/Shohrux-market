const { Pool } = require('pg');
require('dotenv').config();

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: { rejectUnauthorized: false }  // Render uchun muhim!
});

pool.connect((err, client, release) => {
  if (err) {
    console.error('❌ Ulanish xatosi:', err.message);
  } else {
    console.log('✅ Ulanish muvaffaqiyatli!');
    release();
  }
  process.exit();
});