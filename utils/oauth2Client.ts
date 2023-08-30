import secrets from "./secrets";
import { google } from "googleapis";

const oauth2Client = new google.auth.OAuth2(
	secrets.googleID,
	secrets.googleSecret,
	secrets.oauthRedirectURL
);

oauth2Client.setCredentials({ refresh_token: secrets.googleRefreshToken });
export default oauth2Client;
