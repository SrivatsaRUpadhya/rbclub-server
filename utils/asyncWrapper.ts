import { Request, Response } from "express";

const asyncWraper = async (req: Request, res: Response, func: Function) => {
	try {
		return await func(req, res);
	} catch (error) {
		console.log(error);
		return res.status(500).json({ message: "An error occurred!" });
	}
};
export default  asyncWraper;
