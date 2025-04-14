import { Types } from "mongoose";

export type TProperty = {
  landlordUserId: Types.ObjectId;
  name: string;
  images: string[];
  propertyFiles: string[];
  maintainersName: string;
  phone?: string;
  address: string;
  unitOrSuiteNum: string;
  status: 'verify_request' | 'verified';
  isDeleted: boolean;
};