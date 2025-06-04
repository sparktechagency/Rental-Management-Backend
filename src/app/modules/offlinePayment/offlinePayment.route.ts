import express from 'express';
import auth from '../../middleware/auth';
import { USER_ROLE } from '../user/user.constants';
import { OfflinePaymentController } from './offlinePayment.controller';
import fileUpload from '../../middleware/fileUpload';

const offlinePaymentRouter = express.Router();
const upload = fileUpload('./public/uploads/offlinePayment');

offlinePaymentRouter
  .post(
    '/create-offline-payment',
    auth(USER_ROLE.TENANT),
    upload.fields([{ name: 'images', maxCount: 5 }]),
    OfflinePaymentController.createOfflinePayment,
  )
  .get(
    '/',
    auth(USER_ROLE.TENANT, USER_ROLE.LANDLORD),
    OfflinePaymentController.getAllOfflinePaymentByLandlordUserByPropertyId,
  )
  .get(
    '/current-receipt',
    auth(USER_ROLE.TENANT),
    OfflinePaymentController.getAllOfflinePaymentCurrentReceptBytenTenant,
  )
  .get('/:id', OfflinePaymentController.getSingleOfflinePayment)
  .patch(
    '/accept/:id',
    auth(USER_ROLE.LANDLORD),
    OfflinePaymentController.getSingleOfflinePaymentRequestAccept,
  );

export default offlinePaymentRouter;
