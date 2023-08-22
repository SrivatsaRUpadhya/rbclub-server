const { google } = require("googleapis");
const {
	googleSecret,
	googleID,
	googleRefreshToken,
	redirectURL,
} = require("./secrets");

const CLIENT_ID = googleID;
const CLIENT_SECRET = googleSecret;
const REDIRECT_URL = redirectURL;
const REFRESH_TOKEN = googleRefreshToken;
const oAuth2Client = new google.auth.OAuth2(
	CLIENT_ID,
	CLIENT_SECRET,
	REDIRECT_URL,
	REFRESH_TOKEN
);
oAuth2Client.setCredentials({ refresh_token: REFRESH_TOKEN });

module.exports = oAuth2Client;
