const mysql = require("mysql2/promise");

const pool = mysql.createPool({
    host: process.env.DB_HOST || "135.181.249.37",
    user: process.env.DB_USER || "root",
    password: process.env.DB_PASSWORD || "Maputo2023@#",
    database: process.env.DB_NAME || "sge_conducao",
    waitForConnections: true,
    connectionLimit: 10,
    queueLimit: 0
});

module.exports = pool;


