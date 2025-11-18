const path = require('path');

module.exports = async (req, res) => {
  // Busca la aplicación compilada en la carpeta 'dist'
    const main = require(path.join(__dirname, '../dist/main'));
    return main.handler(req, res);
};