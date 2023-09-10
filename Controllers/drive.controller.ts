import asyncWrapper from "../utils/asyncWrapper";
import { Request, Response } from "express";
import driveService from "../utils/driveService";

const getFilesList = async (req: Request, res: Response) => {
	await asyncWrapper(req, res, async (req: Request, res: Response) => {
		const { WorkshopName } = req.body;

		const results = await driveService.files.list({
			q: `name='${WorkshopName}'`,
			fields: "files(name,webViewLink,thumbnailLink)",
		});
		res.status(200).json({ message: "success", data: results.data });
	});
};

export { getFilesList };
