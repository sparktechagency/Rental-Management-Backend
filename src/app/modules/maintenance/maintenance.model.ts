import { model, Schema, Types } from 'mongoose';
import { TMaintenance } from './maintenance.interface';
// Define the schema for TInvitePeople
const maintenanceSchema = new Schema<TMaintenance>(
  {
    tenantUserId: {
      type: Schema.Types.ObjectId,
      required: true,
      ref: 'User',
    },
    landlordUserId: {
      type: Schema.Types.ObjectId,
      required: true,
      ref: 'User',
    },
    propertyId: {
      type: Schema.Types.ObjectId,
      required: true,
      ref: 'Property',
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
    message: {
      type: String,
      required: true,
    },
    feedbackMessage: {
      type: String,
      required: false,
    },
    status: {
      type: String,
      required: true,
      enum: ['pending', 'solved', 'cancel'],
      default: 'pending',
    },
  },
  {
    timestamps: true,
  },
);

const Maintenance = model('Maintenance', maintenanceSchema);
export default Maintenance;
