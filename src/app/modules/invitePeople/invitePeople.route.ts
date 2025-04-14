import express from 'express';
import auth from '../../middleware/auth';
import { USER_ROLE } from '../user/user.constants';
import { invitePeopleController } from './invitePeople.controller';

const invitePeopleRouter = express.Router();


invitePeopleRouter
  .post(
    '/invite-request',
    auth(USER_ROLE.LANDLORD),

    // validateRequest(videoValidation.VideoSchema),
    invitePeopleController.createInvitePeople,
  )
  .get(
    '/landlord',
    auth(USER_ROLE.LANDLORD),
    invitePeopleController.getAllInvitePeopleByLandlord,
  )
  .get(
    '/tenant',
    auth(USER_ROLE.TENANT),
    invitePeopleController.getAllInvitePeopleByTenant,
  )
  .get('/:id', invitePeopleController.getSingleInvitePeople)
  .patch(
    '/accept/:id',
    auth(USER_ROLE.TENANT),
    invitePeopleController.updateSingleInvitePeopleAccept,
  )
  .patch(
    '/invite-verify/:id',
    auth(USER_ROLE.LANDLORD),
    invitePeopleController.inviteRequestVerifyByLandlord,
  )
  
  .delete(
    '/:id',
    auth(USER_ROLE.LANDLORD),
    invitePeopleController.deleteSingleInvitePeople,
  );

export default invitePeopleRouter;
