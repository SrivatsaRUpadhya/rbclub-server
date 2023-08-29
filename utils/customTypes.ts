import { z } from "zod";
import prisma from "./db";
import { accesses, inventory_catagories, paymentStatus } from "@prisma/client";

export interface eventsType {
	EventId?: string;
	EventName?: string;
	EventDate?: z.ZodDate;
	Catagory??: String;
	Desc?: String;
	Max_entries?: number;
	Users?: userType[];
}

export interface userType {
	email: string;
	dob?: string;
	usn?: string;
	name?: string;
	role?: string;
	phone: string;
	course: string;
	skills: string;
	userID?: string;
	IDCardNum?: string;
	paymentID: string;
	attendance?: string;
	isVerified?: boolean;
	profileImg?: string;
	yearOfStudy: number;
	refreshToken?: string;
	paymentStatus?: paymentStatus;
	hasAccessTo?: accesses;
	isProfileComplete: string;
	Events?: [
		{
			desc?: string;
			eventID: string;
			eventName: string;
		},
	];
}

export type InventoryItemType = {
  Name: string
  Quantity: string
  Condition: string | null
  Remarks: string | null
  Catagory: inventory_catagories
}

export type ExpenseType = {

}
