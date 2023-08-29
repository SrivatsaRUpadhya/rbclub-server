import { Prisma } from "@prisma/client";
import prisma from "./db";
import { z } from "zod";

//Format- RCNYYYYVCNN
function generateUID(prevUser: Prisma.UsersCreateInput): string {
	const prevUID = z.string().parse(prevUser.IDCardNum);
	const year = new Date().getFullYear();
	let UID = "RCN" + year;

	const prevVerNum = parseInt(prevUID.slice(7, 8));
	const prevVerCharASCII = `${prevUID.slice(8, 9)}`.charCodeAt(0);
	const prevIDNum = parseInt(prevUID.slice(9, 11));

	let newVerNum = prevVerNum;
	let newVerChar = String.fromCharCode(prevVerCharASCII);
	let newIDNum = "";

	if (prevIDNum === 99) {
		newIDNum = "01";
		newVerChar = String.fromCharCode(prevVerCharASCII + 1);
	} else {
		newIDNum =
			prevIDNum + 1 < 10
				? "0".concat(prevIDNum.toString() + 1)
				: String(prevIDNum + 1);
	}

	return UID.concat(newVerNum.toString(), newVerChar, newIDNum);
}

export default generateUID;
