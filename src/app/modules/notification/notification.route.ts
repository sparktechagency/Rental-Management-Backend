import { Router } from 'express';
import auth from '../../middleware/auth';
import { USER_ROLE } from '../user/user.constants';
import validateRequest from '../../middleware/validateRequest';
import { NotificationController } from './notification.controller';

const notificationRoutes = Router();

notificationRoutes.post(
  '/create-notification',
  //   auth(USER_ROLE.USER),
  //   validateRequest(paymnetValidation),
  NotificationController.createNotification,
);
notificationRoutes.post(
  '/all-read',
  auth(USER_ROLE.TENANT, USER_ROLE.LANDLORD),
  //   validateRequest(paymnetValidation),
  NotificationController.getAllReadNotification,
);

notificationRoutes.get(
  '',
  auth(USER_ROLE.TENANT, USER_ROLE.LANDLORD),
  NotificationController.getAllNotificationByUser,
);
notificationRoutes.get(
  '/admin-all',
  auth(USER_ROLE.ADMIN),
  NotificationController.getAllNotificationByAdmin,
);
notificationRoutes.get(
  '/admin-all-announcement',
  // auth(USER_ROLE.ADMIN),
  NotificationController.getAllAnnouncementNotificationByAdmin,
);
notificationRoutes.get('/:id', NotificationController.getSingleNotification);
notificationRoutes.patch(
  '/read/:id',
  auth(USER_ROLE.TENANT, USER_ROLE.LANDLORD),
  NotificationController.getSingleReadNotification,
);
notificationRoutes.delete(
  '/:id',
  auth(USER_ROLE.TENANT, USER_ROLE.LANDLORD),
  NotificationController.deletedNotification,
);
notificationRoutes.delete(
  '/admin-announcement/:id',
  auth(USER_ROLE.ADMIN),
  NotificationController.deletedAdminNotification,
);

export default notificationRoutes;