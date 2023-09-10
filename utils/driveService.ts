import { google } from "googleapis";
import path from "path";

const getDriveService = () => {
	const KEYFILEPATH = "./service.json";
	const SCOPES = [
		"https://www.googleapis.com/auth/drive.file",
		"https://www.googleapis.com/auth/drive.appdata",
		"https://www.googleapis.com/auth/drive.metadata",
		"https://www.googleapis.com/auth/drive.metadata.readonly",
		"https://www.googleapis.com/auth/drive.readonly",
	];

	const auth = new google.auth.GoogleAuth({
		keyFile: KEYFILEPATH,
		scopes: SCOPES,
	});
	const driveService = google.drive({ version: "v3", auth });
	return driveService;
};

export default getDriveService();
