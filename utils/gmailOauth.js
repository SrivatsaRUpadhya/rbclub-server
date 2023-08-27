const {
	redirectURL,
	googleRefreshToken,
	googleID,
	googleSecret,
} = require("./secrets");
const { google } = require("googleapis");

const oauth2Client = new google.auth.OAuth2(
	googleID,
	googleSecret,
	redirectURL
);
module.exports = oauth2Client;
