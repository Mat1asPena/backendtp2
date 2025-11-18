const path = require('path');
module.exports = async (req, res) => {
    const main = require(path.join(__dirname, '../dist/main'));
    return main.handler(req, res);
};