require('dotenv').config();

const secrets = {
    port: process.env.PORT,
    accessTokenSecret: process.env.ACCESS_TOKEN_SECRET,
    refreshTokenSecret: process.env.REFRESH_TOKEN_SECRET,
    clientURL: process.env.CLIENT_URL,
};

module.exports = secrets