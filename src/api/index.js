const path = require('path');

// Cargamos el 'main' compilado de la carpeta dist
// Vercel ejecuta 'npm run build' antes, así que el archivo JS estará ahí.
module.exports = async (req, res) => {
    const main = require(path.join(__dirname, '../dist/main'));
    // Llamamos a la función exportada handler
    const handler = main.handler;
    return handler(req, res);
};