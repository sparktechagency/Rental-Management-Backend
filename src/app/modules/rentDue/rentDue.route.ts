import express from 'express';
import auth from '../../middleware/auth';
import { USER_ROLE } from '../user/user.constants';
import { duePaymentController } from './rentDue.controller';

const rentDueRouter = express.Router();

rentDueRouter
  .post(
    '/create-rent-due',
    auth(USER_ROLE.TENANT),
    duePaymentController.createDuePayment,
  )
  .get(
    '/',
    auth(USER_ROLE.TENANT, USER_ROLE.LANDLORD),
    duePaymentController.getAllDuePaymentByLandlordUserByPropertyId,
  )
  .get('/:id', duePaymentController.getSingleDuePayment);
 

export default rentDueRouter;
