const db = require('./db'); // Asegúrate de ajustar la ruta según la ubicación de tu archivo db.js

exports.consultaEjemplo = async function () {
    try {
        const results = await db.query('SELECT * FROM usuarios');
        console.log(results);
        return results
    } catch (error) {
        console.error('Error al ejecutar la consulta:', error);
    }
}
