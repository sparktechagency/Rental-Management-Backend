import { Types } from 'mongoose';

export type TOfflinePayment = {
  landlordUserId: Types.ObjectId;
  propertyId: Types.ObjectId;
  tenantUserId: Types.ObjectId;
  images: string[];
  amount: number;
  submittedDate: string;
  paymentMethod: string;
  transactionId: string;
  status: string;
};