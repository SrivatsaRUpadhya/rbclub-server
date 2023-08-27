import { z } from "zod";
import prisma from "./db";

type eventsType = {
	EventId: string;
	EventName: string;
	EventDate: z.ZodDate;
	Catagory: String;
	Desc: String;
	Max_entries: number;
	Users: userType[];
	UserID: String; 
	CreatedAt: z.ZodDate?;
	UpdatedAt: z.ZodDate?;
};
type userType = {
	Name: string;
	ProfileImg: string;
	Role: string;
	Email: string;
	Usn: string;
	Permissions: string;
	Events: eventsType[];
	ID: string;
	Skills: string;
	Phone: string;
	Department: string;
	isProfileComplete: string;
	DOB: string;
	YearOfStudy: string;
	PaymentID: string;
	PaymentStatus: string;
};
