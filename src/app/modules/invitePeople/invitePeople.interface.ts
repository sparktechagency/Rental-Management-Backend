import { Types } from "mongoose"

export type TInvitePeople = {
  landlordUserId: Types.ObjectId;
  tenantUserId: Types.ObjectId;
  propertyId: Types.ObjectId;
  status: string;
  cancelStatus:string;
  // isDeleted:boolean;
};