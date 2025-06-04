import { Types } from 'mongoose';

export type TPayment = {
  tenantUserId: Types.ObjectId;
  method: string;
  rentAmount: Number;
  adminChargeAmount?: Number;
  status: string;
  transactionId: string;
  transactionDate: Date;
  session_id?: string;
  invitedPropertyId: Types.ObjectId;
  landlordUserId: Types.ObjectId;
};
