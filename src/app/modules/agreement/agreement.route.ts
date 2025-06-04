import express from 'express';
import auth from '../../middleware/auth';
import { USER_ROLE } from '../user/user.constants';
import fileUpload from '../../middleware/fileUpload';
import { agreementController } from './agreement.controller';

const agreementRouter = express.Router();

const upload = fileUpload('./public/uploads/agreement');

agreementRouter
  .post(
    '/create-agrement',
    auth(USER_ROLE.LANDLORD),
    upload.fields([{ name: 'images', maxCount: 5 }]),
    // validateRequest(videoValidation.VideoSchema),
    agreementController.createAgreement,
  )
  .get(
    '/landlord',
    auth(USER_ROLE.LANDLORD),
    agreementController.getAllAgreementByLandlord,
  )
  .get('/:id', agreementController.getSingleAgreement)
  .get(
    '/invitedPeople/:id',
    agreementController.getSingleAgreementByInvitedPeople,
  )
  .get(
    '/running-agreement/:id',
    agreementController.getSingleRunningAgreementByPropertyId,
  )
  .get(
    '/invitedPeople/status/:id',
    agreementController.getSingleAgreementStatusByInvitedPeople,
  )
  .patch(
    '/extent-request/:id',
    auth(USER_ROLE.TENANT),
    agreementController.updateSingleAgreementExtentRequest,
  )
  .patch(
    '/extent-request-approved-cancel/:id',
    auth(USER_ROLE.LANDLORD),
    agreementController.updateSingleAgreementExtentRequestApproved,
  )
  .delete(
    '/:id',
    auth(USER_ROLE.LANDLORD),
    agreementController.deleteSingleAgreement,
  );

export default agreementRouter;
