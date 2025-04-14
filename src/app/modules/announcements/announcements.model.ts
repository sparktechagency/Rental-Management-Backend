import { model, Schema } from 'mongoose';
import { TAnnouncements } from './announcements.interface';

const announcementsSchema = new Schema<TAnnouncements>(
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
    title: {
      type: String,
      required: true,
    },
    description: {
      type: String,
      required: true,
    },
  },
  {
    timestamps: true,
  },
);

const Announcement = model('Announcement', announcementsSchema);
export default Announcement;
