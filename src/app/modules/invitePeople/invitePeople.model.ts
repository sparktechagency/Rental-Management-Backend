import { model, Schema, Types } from 'mongoose';
import { TInvitePeople } from './invitePeople.interface';

// Define the schema for TInvitePeople
const invitePeopleSchema = new Schema<TInvitePeople>(
  {
    landlordUserId: {
      type: Schema.Types.ObjectId,
      required: true,
      ref: 'User',
    },
    tenantUserId: {
      type: Schema.Types.ObjectId,
      required: true,
      ref: 'User',
    },
    propertyId: {
      type: Schema.Types.ObjectId,
      required: true,
      ref: 'Property',
    },
    status: {
      type: String,
      required: true,
      enum: ['invite_request', 'request_accept_verify', 'invited', 'rejected'],
      default: 'invite_request',
    },
    cancelStatus: {
      type: String,
      required: true,
      enum: ['pending', 'cancel_request', 'conform'],
      default: 'pending',
    },
    // isDeleted: {
    //   type: Boolean,
    //   required: true,
    //   default: false,
    // },
  },
  {
    timestamps: true,
  },
);

const InvitePeople = model('InvitePeople', invitePeopleSchema);
export default InvitePeople;
