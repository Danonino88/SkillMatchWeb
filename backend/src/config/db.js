<<<<<<< HEAD
// Importar el cliente de PostgreSQL
const { Pool } = require('pg');

// Crear el pool de conexiones
const pool = new Pool({
  host: process.env.DB_HOST,
  port: process.env.DB_PORT || 5432, // Puerto por defecto de PostgreSQL
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME,
  max: 10, // número máximo de conexiones
  idleTimeoutMillis: 30000, // tiempo de espera antes de cerrar conexión inactiva
});

// Probar la conexión (opcional)
pool.connect()
  .then(client => {
    console.log(' Conectado a PostgreSQL');
    client.release();
  })
  .catch(err => console.error(' Error de conexión a PostgreSQL', err.stack));

module.exports = pool;
=======
const mysql = require('mysql2/promise');

const pool = mysql.createPool({
  host: process.env.DB_HOST,
  port: process.env.DB_PORT || 3306,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME,
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0
});

module.exports = pool;
>>>>>>> e4b228ad91757114a36316b6fe63ae7a861db173
