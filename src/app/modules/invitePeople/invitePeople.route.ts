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
    '/landlord-tenant',
    auth(USER_ROLE.LANDLORD, USER_ROLE.TENANT),
    invitePeopleController.getAllInvitePeopleByLandlordByTenant,
  )
  // .get(
  //   '/tenant',
  //   auth(USER_ROLE.TENANT),
  //   invitePeopleController.getAllInvitePeopleByTenant,
  // )
  .get(
    '/current-invited-tenant',
    auth(USER_ROLE.TENANT),
    invitePeopleController.getCurrentInvitedTenant,
  )
  .get(
    '/running-property',
    auth(USER_ROLE.TENANT),
    invitePeopleController.getRuningInviteTenantDue,
  )
  .get(
    '/running-overview-landlord',
    auth(USER_ROLE.LANDLORD),
    invitePeopleController.getRuningOverviewLandlord,
  )
  .get(
    '/running-calendar-info',
    auth(USER_ROLE.TENANT),
    invitePeopleController.getRuningCalendarInfoByTenant,
  )
  .get(
    '/running-calendar-info-by-landlord',
    auth(USER_ROLE.LANDLORD),
    invitePeopleController.getRuningCalendarInfoByLandlordQuery,
  )
  .get(
    '/property/:id',
    invitePeopleController.getSingleInvitePeopleByPropertyId,
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
