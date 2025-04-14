import { Types } from "mongoose";

export type TAnnouncements = {
  landlordUserId: Types.ObjectId;
  propertyId: Types.ObjectId;
  title: string;
  description: string;
};