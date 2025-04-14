import express from 'express';
import auth from '../../middleware/auth';
import { USER_ROLE } from '../user/user.constants';
import { adminannouncementController } from './admin.announcements.controller';

const adminAnnouncementsRouter = express.Router();

adminAnnouncementsRouter
  .post(
    '/create-announcement',
    // auth(USER_ROLE.ADMIN),
    adminannouncementController.createAdminAnnouncement,
  )
  .get('/', adminannouncementController.getAllAdminAnnouncement)
  .get('/:id', adminannouncementController.getSingleAdminAnnouncement)
  .patch('/:id', adminannouncementController.activeDeactivedminAnnouncement);

export default adminAnnouncementsRouter;
