const bcrypt = require('bcrypt');

async function hashPassword(password) {
    return await bcrypt.hash(password, await bcrypt.genSalt())
}

async function checkPassword(password, hash) {
    return await bcrypt.compare(password, hash);
}

module.exports = {hashPassword, checkPassword};