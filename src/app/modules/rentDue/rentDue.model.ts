import { model, Schema } from 'mongoose';
import { TDuePayment } from './rentDue.interface';

const duePaymentSchema = new Schema<TDuePayment>(
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
    amount: {
      type: Number,
      required: true,
    },
    date:{
      type:Date,
      required:true,
      default:Date.now()
    }
  },
  {
    timestamps: true,
  },
);

const DuePayment = model('DuePayment', duePaymentSchema);
export default DuePayment;
