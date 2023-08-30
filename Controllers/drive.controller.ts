import { google } from "googleapis";
import oauth2Client from "../utils/oauth2Client";
import asyncWrapper from "../utils/asyncWrapper";
import { Request, Response } from "express";
const getFilesList = async (req: Request, res: Response) => {
	await asyncWrapper(req, res, async (req: Request, res: Response) => {
		const { FileType } = req.body;
		const access_token = await oauth2Client.getAccessToken();
		console.log(access_token);
		oauth2Client.setCredentials({
			access_token: access_token.token,
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

export { getFilesList };
