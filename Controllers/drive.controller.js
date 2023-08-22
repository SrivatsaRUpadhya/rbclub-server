const { google } = require("googleapis");
const oauth2Client = require("../utils/oauth2Client");
const { googleRefreshToken } = require("../utils/secrets");
const asyncWrapper = require("../utils/asyncWrapper");

const getFilesList = async (req, res) => {
	await asyncWrapper(req, res, async (req, res) => {
		const { FileType } = req.body;
		const access_token = await oauth2Client.getAccessToken()
		oauth2Client.setCredentials({
			access_token
		});

		const driveInstance = google.drive("v3");

		const folderToAccess = FileType;
		const folderID = await driveInstance.files.list({
			auth: oauth2Client,
			q: `mimeType='application/vnd.google-apps.folder' and name contains ${folderToAccess}`,
			fields: "files(id)",
		});

		const results = await driveInstance.files.list({
			auth: oauth2Client,
			q: `parents in ${folderID}`,
			fields: "files(name,webViewLink,thumbnailLink)",
		});
		console.log({ folderID, results });
		res.status(200).json({ message: "success", data: results.data });
	});
};

module.exports = { getFilesList };
