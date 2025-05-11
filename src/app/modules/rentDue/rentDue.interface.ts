import { Types } from 'mongoose';

export type TDuePayment = {
  landlordUserId: Types.ObjectId;
  propertyId: Types.ObjectId;
  tenantUserId: Types.ObjectId;
  amount: number;
  date: Date;
};
