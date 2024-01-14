const mysql = require('mysql2');

const pool = mysql.createPool({
    host: '127.0.0.1',
    user: 'dartsmanager',
    database: 'dartsmanager',
    password: '@AleGarcia99',
    connectionLimit: 10,
});

// Función para ejecutar consultas
function query(queryString, values) {
    return new Promise((resolve, reject) => {
        pool.getConnection((err, connection) => {
            if (err) {
                reject(err);
                return;
            }
            connection.query(queryString, values, (error, results) => {
                connection.release();
                if (error) {
                    reject(error);
                    return;
                }
                resolve(results);
            });
        });
    });
}

module.exports = { query };
