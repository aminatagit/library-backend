// config/db.js
const mysql = require('mysql2/promise');
require('dotenv').config();

// Validate environment variables
const requiredEnvVars = ['DB_HOST', 'DB_USER', 'DB_PASS', 'DB_NAME', 'DB_PORT'];
for (const envVar of requiredEnvVars) {
  if (!process.env[envVar]) {
    console.error(`Erreur : La variable d'environnement ${envVar} est manquante dans le fichier .env`);
    process.exit(1);
  }
}

// Create a connection pool
const pool = mysql.createPool({
  host: process.env.DB_HOST,
  user: process.env.DB_USER,
  password: process.env.DB_PASS, // Matches .env
  database: process.env.DB_NAME,
  port: Number(process.env.DB_PORT),
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0
});

// Test initial connection
async function initializeConnection() {
  try {
    const connection = await pool.getConnection();
    console.log('Connecté à la base de données MySQL ✅');
    connection.release();
  } catch (err) {
    console.error('Erreur de connexion à la base de données :', err.message);
    setTimeout(initializeConnection, 5000);
  }
}

initializeConnection();
module.exports = pool;