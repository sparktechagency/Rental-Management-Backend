import { model, Schema } from "mongoose";
import { TProperty } from "./property.interface";


const propertySchema = new Schema<TProperty>(
  {
    landlordUserId: {
      type: Schema.Types.ObjectId,
      ref: 'Property',
      required: true,
    },
    name: {
      type: String,
      required: true,
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
    propertyFiles: {
      type: [String],
      required: [true, 'Files are required'],
      validate: {
        validator: function (value: string[]) {
          return value && value.length > 0;
        },
        message: 'At least one File is required',
      },
    },
    maintainersName: {
      type: String,
      required: true,
    },
    phone: {
      type: String,
      required: false,
    },
    address: {
      type: String,
      required: true,
    },
    unitOrSuiteNum: {
      type: String,
      required: true,
    },
    status: {
      type: String,
      enum: ['verify_request', 'verified'],
      default: 'verify_request',
    },
    isDeleted: {
      type: Boolean,
      required: true,
      default: false,
    },
  },
  {
    timestamps: true,
  },
);


const Property = model('Property', propertySchema);
export default Property;
