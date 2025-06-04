import { model, Schema } from 'mongoose';
import { TOfflinePayment } from './offlinePayment.interface';

const offlinePaymentSchema = new Schema<TOfflinePayment>(
  {
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
    tenantUserId: {
      type: Schema.Types.ObjectId,
      required: true,
      ref: 'User',
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
    amount: {
      type: Number,
      required: true,
    },
    submittedDate: {
      type: String,
      required: true,
    },
    paymentMethod: {
      type: String,
      required: true,
    },
    transactionId: {
      type: String,
      required: true,
    },
    status: {
      type: String,
      required: true,
      enum: ['pending', 'accepted'],
      default: 'pending',
    },
  },
  {
    timestamps: true,
  },
);

const OfflinePayment = model('OfflinePayment', offlinePaymentSchema);
export default OfflinePayment;
