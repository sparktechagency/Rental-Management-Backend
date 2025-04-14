import { Types } from "mongoose"

export type TAgreement = {
  landlordUserId: Types.ObjectId;
  invitePeopleId: Types.ObjectId;
  images: string[];
  rentAmount: Number;
  startDate: Date;
  endDate: Date;
  extentStartDate?:Date;
  extentEndDate?:Date;
  extentStatus?:string;
};