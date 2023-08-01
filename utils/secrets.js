require('dotenv').config();

const secrets = {
    port: process.env.PORT,
    accessTokenSecret: process.env.ACCESS_TOKEN_SECRET,
    refreshTokenSecret: process.env.REFRESH_TOKEN_SECRET,
    clientURL_1: process.env.CLIENT_URL_1,
	clientURL_2: process.env.CLIENT_URL_2,
    serverURL: process.env.SERVER_URL,
	googleID: process.env.GOOGLE_CLIENT_ID,
	googleSecret: process.env.GOOGLE_CLIENT_SECRET,
	redirectURL: process.env.REDIRECT_URL,
	googleRefreshToken: process.env.GOOGLE_REFRESH_TOKEN
};

module.exports = secrets
