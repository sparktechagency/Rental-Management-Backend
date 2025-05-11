import { Types } from 'mongoose';
import QueryBuilder from '../../builder/QueryBuilder';
import AppError from '../../error/AppError';
import { User } from '../user/user.models';
import Notification from './notification.model';
import { TNotification } from './notification.interface';

const createNotification = async (payload: any, session?: any) => {
  const result = await Notification.create([payload], { session });
  return result;
};

const getAllNotificationQuery = async (
  query: Record<string, unknown>,
  userId: string,
) => {
  const notificationQuery = new QueryBuilder(
    Notification.find({ userId}),
    query,
  )
    .search([''])
    .filter()
    .sort()
    .paginate()
    .fields();

  const result = await notificationQuery.modelQuery;

  console.log('result', result);

  const adminAnnouncement = await Notification.find({ type: 'announcement' });

  console.log('adminAnnouncement', adminAnnouncement);

  const meta = await notificationQuery.countTotal();
  const newResult = [
    ...result,
    ...adminAnnouncement,
  ]
  return { meta, result:newResult };
};

const getAllNotificationByAdminQuery = async (
  query: Record<string, unknown>,
) => {
  const notificationQuery = new QueryBuilder(
    Notification.find({ role: 'admin' }),
    query,
  )
    .search([''])
    .filter()
    .sort()
    .paginate()
    .fields();

  const result = await notificationQuery.modelQuery;
  const meta = await notificationQuery.countTotal();
  return { meta, result };
};
const getAllAnnouncementNotificationByAdminQuery = async (
  query: Record<string, unknown>,
) => {
  const notificationQuery = new QueryBuilder(
    Notification.find({ type: 'announcement' }),
    query,
  )
    .search([''])
    .filter()
    .sort()
    .paginate()
    .fields();

  const result = await notificationQuery.modelQuery;
  const meta = await notificationQuery.countTotal();
  return { meta, result };
};

const getSingleNotification = async (id: string) => {
  const result = await Notification.findById(id);
  return result;
};

const deleteNotification = async (id: string, userId: string) => {
 
  // Fetch the user by ID
  const user = await User.findById(userId);
  if (!user) {
    throw new AppError(404, 'User not found!');
  }

  const notification:any = await Notification.findById(id);
  if (!notification) {
    throw new AppError(404, 'Notification is not found!');
  }

  if (notification.userId.toString() !== userId) {
    throw new AppError(
      403,
      'You are not authorized to access this notification!',
    );
  }

  // Delete the SaveStory
  const result = await Notification.findByIdAndDelete(id);
  if (!result) {
    throw new AppError(500, 'Error deleting SaveStory!');
  }

  return result;
};

const deleteAdminNotification = async (id: string) => {
  const notification = await Notification.findById(id);
  if (!notification) {
    throw new AppError(404, 'Notification is not found!');
  }
  if (notification.type !== 'announcement') {
    throw new AppError(404, 'You are not authorized to access this notification!');
  }

  const result = await Notification.findOneAndDelete({
    _id: id,
    type: 'announcement',
  });
  if (!result) {
    throw new AppError(500, 'Error deleting SaveStory!');
  }

  return result;
};

export const notificationService = {
  createNotification,
  getAllNotificationQuery,
  getAllNotificationByAdminQuery,
  getAllAnnouncementNotificationByAdminQuery,
  deleteNotification,
  getSingleNotification,
  deleteAdminNotification,
};
