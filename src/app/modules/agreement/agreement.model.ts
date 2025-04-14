import { model, Schema, Types } from 'mongoose';
import { TAgreement } from './agreement.interface';

// Define the schema for TInvitePeople
const agreementSchema = new Schema<TAgreement>(
  {
    landlordUserId: {
      type: Schema.Types.ObjectId,
      required: true,
      ref: 'User',
    },
    invitePeopleId: {
      type: Schema.Types.ObjectId,
      required: true,
      ref: 'InvitePeople',
    },
    images: {
      type: [String],
      required: [true, 'Images are required'],
      validate: {
        validator: function (value: string[]) {
          return value && value.length > 0;
        },
        message: 'At least one File is required',
      },
    },
    rentAmount: {
      type: Number,
      required: true,
    },
    startDate: {
      type: Date,
      required: true,
    },
    endDate: {
      type: Date,
      required: true,
    },
    extentStartDate: {
      type: Date,
      required: false,
    },
    extentEndDate: {
      type: Date,
      required: false,
    },
    extentStatus: {
      type: String,
      required: false,
      enum: ['extend_date_requiest', 'approved_requiest', 'canceled_requiest'],
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

const Agreement = model('Agreement', agreementSchema);
export default Agreement;
