const {
	oauthClientID,
	oauthClientSecret,
	oauthRedirectURL,
	googleRefreshToken,
	googleID,
	googleSecret,
} = require("./secrets");
const { google } = require("googleapis");

const oauth2Client = new google.auth.OAuth2(
	googleID,
	googleSecret,
	oauthRedirectURL
);

oauth2Client.setCredentials({ refresh_token: googleRefreshToken });
module.exports = oauth2Client;
