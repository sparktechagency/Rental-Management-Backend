import express from 'express';
import auth from '../../middleware/auth';
import { USER_ROLE } from '../user/user.constants';
import { announcementController } from './announcements.controller';

const announcementsRouter = express.Router();

announcementsRouter
  .post(
    '/create-announcement',
    auth(USER_ROLE.LANDLORD),
    announcementController.createAnnouncement,
  )
  .get(
    '/',
    auth(USER_ROLE.LANDLORD),
    announcementController.getAllAnnouncementByLandlordByall,
  )
  .get(
    '/:id',
    announcementController.getAllAnnouncementByLandlord,
  )
  .get('/:id', announcementController.getSingleAnnouncement);

export default announcementsRouter;
