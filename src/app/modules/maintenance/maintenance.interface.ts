import { Types } from 'mongoose';

export type TMaintenance = {
  tenantUserId: Types.ObjectId;
  landlordUserId: Types.ObjectId;
  propertyId: Types.ObjectId;
  images: string[];
  message: string;
  feedbackMessage?: string;
  status: string;
};
