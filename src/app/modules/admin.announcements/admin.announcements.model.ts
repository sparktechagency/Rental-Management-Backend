import { model, Schema } from 'mongoose';
import { TAdminAnnouncements } from './admin.announcements.interface';

const adminAnnouncementsSchema = new Schema<TAdminAnnouncements>(
  {
    title: {
      type: String,
      required: true,
    },
    description: {
      type: String,
      required: true,
    },
    status: {
      type: String,
      required: true,
      enum:['active', 'deActive'],
      default:"active"
    },
  },
  {
    timestamps: true,
  },
);

const AdminAnnouncement = model('AdminAnnouncement', adminAnnouncementsSchema);
export default AdminAnnouncement;
