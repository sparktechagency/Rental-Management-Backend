import express from 'express';
import { paymentController } from './payment.controller';
import auth from '../../middleware/auth';
import { USER_ROLE } from '../user/user.constants';

// import { auth } from "../../middlewares/auth.js";

const paymentRouter = express.Router();

paymentRouter
  .post('/add-payment', auth(USER_ROLE.TENANT), paymentController.addPayment)
  .post(
    '/create-stripe-connected-account',
    auth(USER_ROLE.LANDLORD),
    paymentController.createStripeAccount,
  )
  .post(
    '/login-stripe-connected-account',
    auth(USER_ROLE.LANDLORD),
    paymentController.stripeConnectedAccountLogin,
  )
  //   .post(
  //     '/transfer',
  //     auth(USER_ROLE.BUSINESS),
  //     paymentController.transferBalance,
  //   )

  //   .post(
  //   '/checkout',
  //   auth(USER_ROLE.CUSTOMER),
  //   paymentController.createCheckout,
  // )
  //   .post('/refund', paymentController.paymentRefund)
  .get('/success', paymentController.successPage)
  .get('/cancel', paymentController.cancelPage)

  .get(
    '/',
    // auth(USER_ROLE.ADMIN),
    paymentController.getAllPayment,
  )
  .get(
    '/tenant-landlord',
    auth(USER_ROLE.TENANT, USER_ROLE.LANDLORD),
    paymentController.getAllPaymentByTenantByLandlord,
  )
  // .get('/payment-tracking', auth(USER_ROLE.CUSTOMER), paymentController.getAllPaymentByCustomer)
  .get('/all-income-rasio', paymentController.getAllIncomeRasio)
  .get('/all-income-rasio-by-days', paymentController.getAllIncomeRasioBydays)
  .get(
    '/all-earning-rasio',
    auth(USER_ROLE.ADMIN),
    paymentController.getAllEarningRasio,
  )

  .get('/refreshAccountConnect/:id', paymentController.refreshAccountConnect)
  .get('/:id', paymentController.getSinglePayment)
  .get('/success-account/:id', paymentController.successPageAccount)

  .delete('/:id', paymentController.deleteSinglePayment);

export default paymentRouter;











