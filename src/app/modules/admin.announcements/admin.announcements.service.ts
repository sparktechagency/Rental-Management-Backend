import AppError from '../../error/AppError';
import mongoose from 'mongoose';
import QueryBuilder from '../../builder/QueryBuilder';
import { User } from '../user/user.models';
import { TAdminAnnouncements } from './admin.announcements.interface';
import AdminAnnouncement from './admin.announcements.model';

const createAdminAnnouncementService = async (payload: TAdminAnnouncements) => {
  const result = await AdminAnnouncement.create(payload);

  if (!result) {
    throw new AppError(403, 'Admin  Announcement create is faild!!');
  }
  return result;
};

const getAllAdminAnnouncementBQuery = async (
  query: Record<string, unknown>,
) => {
  const adminannouncementQuery = new QueryBuilder(
    AdminAnnouncement.find({

    }),
    query,
  )
    .search([''])
    .filter()
    .sort()
    .paginate()
    .fields();

  const result = await adminannouncementQuery.modelQuery;
  const meta = await adminannouncementQuery.countTotal();
  return { meta, result };
};



const getSingleAdminAnnouncementQuery = async (id: string) => {
  const Adminannouncement = await AdminAnnouncement.findById(id);
  if (!Adminannouncement) {
    throw new AppError(404, 'Admin Announcement Not Found!!');
  }
  const result = await AdminAnnouncement.findById(id);

  if (!AdminAnnouncement) {
    throw new AppError(404, 'Admin Announcement Not Found!!');
  }

  return result;
};


const updateActiveDeActiveAdminAnnouncementQuery = async (id: string) => {
  const adminannouncement = await AdminAnnouncement.findById(id);
  if (!adminannouncement) {
    throw new AppError(404, 'Admin Announcement Not Found!!');
  }

  const result = await AdminAnnouncement.findByIdAndUpdate(id, {
    status: adminannouncement.status === 'active' ? 'deActive' : 'active',
  },{new:true});

  if (!result) {
    throw new AppError(404, 'Admin Announcement updated faild!!');
  }

  return result;
};

export const adminannouncementService = {
  createAdminAnnouncementService,
  getAllAdminAnnouncementBQuery,
  getSingleAdminAnnouncementQuery,
  updateActiveDeActiveAdminAnnouncementQuery,
};
