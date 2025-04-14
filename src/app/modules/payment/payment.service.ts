import AppError from '../../error/AppError';
import { User } from '../user/user.models';
import { TPayment } from './payment.interface';
import { Payment } from './payment.model';
import QueryBuilder from '../../builder/QueryBuilder';
import moment from 'moment';
import Stripe from 'stripe';
import httpStatus from 'http-status';
import config from '../../config';
import mongoose from 'mongoose';
import { StripeAccount } from '../stripeAccount/stripeAccount.model';
import { withdrawService } from '../withdraw/withdraw.service';
import { Withdraw } from '../withdraw/withdraw.model';
import cron from 'node-cron';
import { notificationService } from '../notification/notification.service';

type SessionData = Stripe.Checkout.Session;

// console.log({ first: config.stripe.stripe_api_secret });

export const stripe = new Stripe(
  config.stripe.stripe_api_secret as string,
  //      {
  //   apiVersion: '2024-09-30.acacia',
  // }
);

// console.log('stripe==', stripe);

const addPaymentService = async (payload: any) => {
  const session = await mongoose.startSession();
  session.startTransaction();

  // console.log('payment data', payload);

  try {
    // console.log('console.log-1');
    const newPayload: any = {};
    console.log('payload==', payload);

    const user = await User.findById(payload.userId).session(session);
    if (!user) {
      throw new AppError(400, 'User is not found!');
    }

    if (user.role !== 'tenant') {
      throw new AppError(400, 'User is not authorized as a User!!');
    }

    newPayload.orderDate = new Date();

   

    // const order = await Order.create([newPayload], { session });

    // if (!order[0]) {
    //   throw new AppError(400, 'Failed to create order!');
    // }

    const paymentInfo = {
      // orderId: order[0]._id,
      // amount: order[0].totalAmount,
    };

    // console.log('======stripe payment');
    const checkoutResult: any = await createCheckout(
      payload.userId,
      paymentInfo,
    );

    if (!checkoutResult) {
      throw new AppError(400, 'Failed to create checkout session!');
    }

    // Commit transaction
    await session.commitTransaction();
    session.endSession();
    return checkoutResult;
  } catch (error) {
    console.error('Transaction Error:', error);
    await session.abortTransaction();
    session.endSession();
    throw error;
  }
};

const getAllPaymentService = async (query: Record<string, unknown>) => {
  const PaymentQuery = new QueryBuilder(Payment.find(), query)
    .search(['name'])
    .filter()
    .sort()
    .paginate()
    .fields();

  const result = await PaymentQuery.modelQuery;
  const meta = await PaymentQuery.countTotal();
  return { meta, result };
};
const getAllPaymentByCustomerService = async (
  query: Record<string, unknown>,
  customerId: string,
) => {
  const PaymentQuery = new QueryBuilder(
    Payment.find({ customerId, status: 'paid' }).populate({
      path: 'serviceId',
      select: 'serviceName servicePrice',
      populate: { path: 'businessId', select: 'businessName' },
    }),
    // .populate('businessId'),
    query,
  )
    .search(['name'])
    .filter()
    .sort()
    .paginate()
    .fields();

  const result = await PaymentQuery.modelQuery;
  const meta = await PaymentQuery.countTotal();
  return { meta, result };
};

const singlePaymentService = async (id: string) => {
  const task = await Payment.findById(id);
  return task;
};

const deleteSinglePaymentService = async (id: string) => {
  const result = await Payment.deleteOne({ _id: id });
  return result;
};

const getAllIncomeRatio = async (year: number) => {
  const startOfYear = new Date(year, 0, 1);
  const endOfYear = new Date(year + 1, 0, 1);

  const months = Array.from({ length: 12 }, (_, i) => ({
    month: i + 1,
    totalIncome: 0,
  }));

  // console.log({ months });

  const incomeData = await Payment.aggregate([
    {
      $match: {
        transactionDate: { $gte: startOfYear, $lt: endOfYear },
      },
    },
    {
      $group: {
        _id: { month: { $month: '$transactionDate' } },
        totalIncome: { $sum: '$amount' },
      },
    },
    {
      $project: {
        month: '$_id.month',
        totalIncome: 1,
        _id: 0,
      },
    },
    {
      $sort: { month: 1 },
    },
  ]);

  incomeData.forEach((data) => {
    const monthData = months.find((m) => m.month === data.month);
    if (monthData) {
      monthData.totalIncome = data.totalIncome;
    }
  });

  // console.log({ months });

  return months;
};

// const getAllIncomeRatiobyDays = async (days: string) => {
//   const currentDay = new Date();
//   let startDate: Date;

//   if (days === '7day') {
//     startDate = new Date(currentDay.getTime() - 7 * 24 * 60 * 60 * 1000);
//   } else if (days === '24hour') {
//     startDate = new Date(currentDay.getTime() - 24 * 60 * 60 * 1000);
//   } else {
//     throw new Error("Invalid value for 'days'. Use '7day' or '24hour'.");
//   }


//   const timeSlots =
//     days === '7day'
//       ? Array.from({ length: 7 }, (_, i) => {
//           const day = new Date(currentDay.getTime() - i * 24 * 60 * 60 * 1000);
//           return {
//             date: day.toISOString().split('T')[0],
//             totalIncome: 0,
//           };
//         }).reverse()
//       : Array.from({ length: 24 }, (_, i) => {
//           const hour = new Date(currentDay.getTime() - i * 60 * 60 * 1000);
//           return {
//             hour: hour.toISOString(),
//             totalIncome: 0,
//           };
//         }).reverse();

//   const incomeData = await Payment.aggregate([
//     {
//       $match: {
//         transactionDate: { $gte: startDate, $lte: currentDay },
//       },
//     },
//     {
//       $group: {
//         _id:
//           days === '7day'
//             ? {
//                 date: {
//                   $dateToString: {
//                     format: '%Y-%m-%d',
//                     date: '$transactionDate',
//                   },
//                 },
//               }
//             : {
//                 hour: {
//                   $dateToString: {
//                     format: '%Y-%m-%dT%H:00:00',
//                     date: '$transactionDate',
//                   },
//                 },
//               },
//         totalIncome: { $sum: '$amount' },
//       },
//     },
//     // {
//     //   $project: {
//     //     dateHour: days === '7day' ? '$_id.date' : null,
//     //     dateHour: days === '24hour' ? '$_id.hour' : null,
//     //     totalIncome: 1,
//     //     _id: 0,
//     //   },
//     // },
//     {
//   $project: {
//     dateHour: {
//       $cond: {
//         if: { $eq: [days, '7day'] },
//         then: '$_id.date', // For 7day, use the date field
//         else: '$_id.hour', // For 24hour, use the hour field
//       },
//     },
//     totalIncome: 1,
//     _id: 0,
//   },
// },
//     {
//       $sort: { [days === '7day' ? 'date' : 'hour']: 1 },
//     },
//   ]);

//   incomeData.forEach((data) => {
//     if (days === '7day') {
//       const dayData = timeSlots.find((d: any) => d.date === data.date);
//       if (dayData) {
//         dayData.totalIncome = data.totalIncome;
//       }
//     } else if (days === '24hour') {
//       const hourData = timeSlots.find((h: any) => h.hour === data.hour);
//       if (hourData) {
//         hourData.totalIncome = data.totalIncome;
//       }
//     }
//   });

//   return timeSlots;
// };

const getAllIncomeRatiobyDays = async (days: string) => {
  const currentDay = new Date();
  let startDate: Date;

  if (days === '7day') {
    startDate = new Date(currentDay.getTime() - 7 * 24 * 60 * 60 * 1000);
  } else if (days === '24hour') {
    startDate = new Date(currentDay.getTime() - 24 * 60 * 60 * 1000);
  } else {
    throw new Error("Invalid value for 'days'. Use '7day' or '24hour'.");
  }

  const timeSlots =
    days === '7day'
      ? Array.from({ length: 7 }, (_, i) => {
          const day = new Date(currentDay.getTime() - i * 24 * 60 * 60 * 1000);
          return {
            dateHour: day.toISOString().split('T')[0],
            totalIncome: 0,
          };
        }).reverse()
      : Array.from({ length: 24 }, (_, i) => {
          const hour = new Date(currentDay.getTime() - i * 60 * 60 * 1000);
          return {
            dateHour: hour.toISOString(),
            totalIncome: 0,
          };
        }).reverse();

  const incomeData = await Payment.aggregate([
    {
      $match: {
        transactionDate: { $gte: startDate, $lte: currentDay },
      },
    },
    {
      $group: {
        _id:
          days === '7day'
            ? {
                date: {
                  $dateToString: {
                    format: '%Y-%m-%d',
                    date: '$transactionDate',
                  },
                },
              }
            : {
                hour: {
                  $dateToString: {
                    format: '%Y-%m-%dT%H:00:00',
                    date: '$transactionDate',
                  },
                },
              },
        totalIncome: { $sum: '$amount' },
      },
    },
    {
      $project: {
        dateHour: days === '7day' ? '$_id.date' : '$_id.hour', // Rename to 'dateHour'
        totalIncome: 1,
        _id: 0,
      },
    },
    {
      $sort: { [days === '7day' ? 'date' : 'hour']: 1 },
    },
  ]);

  incomeData.forEach((data) => {
    if (days === '7day') {
      const dayData = timeSlots.find((d: any) => d.dateHour === data.dateHour);
      if (dayData) {
        dayData.totalIncome = data.totalIncome;
      }
    } else if (days === '24hour') {
      const hourData = timeSlots.find((h: any) => h.dateHour === data.dateHour);
      if (hourData) {
        hourData.totalIncome = data.totalIncome;
      }
    }
  });

  return timeSlots;
};



const createCheckout = async (userId: any, payload: any) => {
  console.log('stripe payment', payload);
  let session = {} as { id: string };

  // const lineItems = products.map((product) => ({
  //   price_data: {
  //     currency: 'usd',
  //     product_data: {
  //       name: 'Order Payment',
  //       description: 'Payment for user order',
  //     },
  //     unit_amount: Math.round(product.price * 100),
  //   },
  //   quantity: product.quantity,
  // }));

  const lineItems = [
    {
      price_data: {
        currency: 'usd',
        product_data: {
          name: 'Amount',
        },
        unit_amount: payload.amount * 100,
      },
      quantity: 1,
    },
  ];

  console.log('lineItems=', lineItems);

  const sessionData: any = {
    payment_method_types: ['card'],
    mode: 'payment',
    success_url: `http://10.0.70.35:8082/api/v1/payment/success`,
    cancel_url: `http://10.0.70.35:8082/api/v1/payment/cancel`,
    line_items: lineItems,
    metadata: {
      userId: String(userId), // Convert userId to string
      orderId: String(payload.orderId),
      // cartIds: payload.cartIds,
      // cartIds: JSON.stringify(payload.cartIds),
      // products: payload,
    },
  };

  console.log('sessionData=', sessionData);

  try {
    console.log('try session');
    session = await stripe.checkout.sessions.create(sessionData);
    console.log('session==', session);

    // console.log('session', session.id);
  } catch (error) {
    console.log('Error', error);
  }

  console.log('try session 22');
  // // console.log({ session });
  const { id: session_id, url }: any = session || {};

  console.log({ url });
  // console.log({ url });

  return { url };
};

const automaticCompletePayment = async (event: Stripe.Event): Promise<void> => {
  console.log('hit hise webhook controller servie');

  const session = await mongoose.startSession();
  session.startTransaction();

  try {
    switch (event.type) {
      case 'checkout.session.completed': {
        console.log(
          'hit hise webhook controller servie checkout.session.completed',
        );
        const sessionData = event.data.object as Stripe.Checkout.Session;
        const {
          id: sessionId,
          payment_intent: paymentIntentId,
          metadata,
        }: SessionData = sessionData;
        const orderId = metadata?.orderId as string;
        const userId = metadata?.userId as string;
        // const cartIds = JSON.parse(metadata?.cartIds as any);
        // console.log('cartIds==', cartIds);

        // session.metadata && (session.metadata.serviceBookingId as string);
        if (!paymentIntentId) {
          throw new AppError(
            httpStatus.BAD_REQUEST,
            'Payment Intent ID not found in session',
          );
        }

        const paymentIntent = await stripe.paymentIntents.retrieve(
          paymentIntentId as string,
        );

        if (!paymentIntent || paymentIntent.amount_received === 0) {
          throw new AppError(httpStatus.BAD_REQUEST, 'Payment Not Successful');
        }

      
        // const order = await Order.findByIdAndUpdate(
        //   orderId,
        //   { paymentStatus: 'paid', status: 'completed'},
        //   { new: true, session },
        // );

        // if (!order) {
        //   throw new AppError(httpStatus.BAD_REQUEST, 'Order not found');
        // }

  

        const paymentData: any = {
          // userId: userId,
          // amount: order?.totalAmount,
          // method: 'stripe',
          // transactionId: paymentIntentId,
          // orderId: order?._id,
          // status: 'paid',
          // session_id: sessionId,
          // transactionDate: order?.orderDate,
        };

        const payment = await Payment.create([paymentData], { session });
        console.log('===payment', payment);

        if (!payment) {
          throw new AppError(
            httpStatus.BAD_REQUEST,
            'Payment record creation failed',
          );
        }

        

        const notificationData = {
          userId: userId,
          message: 'Order create successfull!!',
          type: 'success',
        };

        const notificationData1 = {
          role: 'admin',
          message: 'New Order create successfull!!',
          type: 'success',
        };

        const [notification, notification1] = await Promise.all([
          notificationService.createNotification(notificationData),
          notificationService.createNotification(notificationData1),
        ]);

        if (!notification || !notification1) {
          throw new AppError(404, 'Notification create faild!!');
        }

        // const deletedServiceBookings = await Order.deleteMany(
        //   {
        //     userId,
        //     status: 'pending',
        //   },
        //   { session },
        // );
        // console.log('deletedServiceBookings', deletedServiceBookings);

        await session.commitTransaction();
        session.endSession();
        console.log('Payment completed successfully:', {
          sessionId,
          paymentIntentId,
        });

        break;
      }

      case 'checkout.session.async_payment_failed': {
        const session = event.data.object as Stripe.Checkout.Session;
        const clientSecret = session.client_secret;
        const sessionId = session.id;

        if (!clientSecret) {
          console.warn('Client Secret not found in session.');
          throw new AppError(httpStatus.BAD_REQUEST, 'Client Secret not found');
        }

        // const payment = await Payment.findOne({ session_id: sessionId });

        // if (payment) {
        //   payment.status = 'Failed';
        //   await payment.save();
        //   // console.log('Payment marked as failed:', { clientSecret });
        // } else {
        //   console.warn(
        //     'No Payment record found for Client Secret:',
        //     clientSecret,
        //   );
        // }

        break;
      }

      default:
        // // console.log(`Unhandled event type: ${event.type}`);
        // res.status(400).send();
        return;
    }
  } catch (err) {
    console.error('Error processing webhook event:', err);
    await session.abortTransaction();
    session.endSession();
  }
};

// const paymentRefundService = async (
//   amount: number | null,
//   payment_intent: string,
// ) => {
//   const refundOptions: Stripe.RefundCreateParams = {
//     payment_intent,
//   };

//   // Conditionally add the `amount` property if provided
//   if (amount) {
//     refundOptions.amount = Number(amount);
//   }

//   // console.log('refaund options', refundOptions);

//   const result = await stripe.refunds.create(refundOptions);
//   // console.log('refund result ', result);
//   return result;
// };

const getAllEarningRatio = async (year: number, businessId: string) => {
  const startOfYear = new Date(year, 0, 1);
  const endOfYear = new Date(year + 1, 0, 1);

  const months = Array.from({ length: 12 }, (_, i) => ({
    month: i + 1,
    totalIncome: 0,
  }));

  // console.log({ months });

  const incomeData = await Payment.aggregate([
    {
      $match: {
        status: 'complete',
        transactionDate: { $gte: startOfYear, $lt: endOfYear },
      },
    },
    {
      $group: {
        _id: { month: { $month: '$transactionDate' } },
        totalIncome: { $sum: '$amount' },
      },
    },
    {
      $project: {
        month: '$_id.month',
        totalIncome: 1,
        _id: 0,
      },
    },
    {
      $sort: { month: 1 },
    },
  ]);

  incomeData.forEach((data) => {
    const monthData = months.find((m) => m.month === data.month);
    if (monthData) {
      monthData.totalIncome = data.totalIncome;
    }
  });

  return months;
};

// const refreshAccountConnect = async (
//   id: string,
//   host: string,
//   protocol: string,
// ): Promise<string> => {
//   const onboardingLink = await stripe.accountLinks.create({
//     account: id,
//     refresh_url: `${protocol}://${host}/api/v1/payment/refreshAccountConnect/${id}`,
//     return_url: `${protocol}://${host}/api/v1/payment/success-account/${id}`,
//     type: 'account_onboarding',
//   });
//   return onboardingLink.url;
// };

// const createStripeAccount = async (
//   user: any,
//   host: string,
//   protocol: string,
// ): Promise<any> => {
//   // console.log('user',user);
//   const existingAccount = await StripeAccount.findOne({
//     userId: user.userId,
//   }).select('user accountId isCompleted');
//   // console.log('existingAccount', existingAccount);

//   if (existingAccount) {
//     if (existingAccount.isCompleted) {
//       return {
//         success: false,
//         message: 'Account already exists',
//         data: existingAccount,
//       };
//     }

//     const onboardingLink = await stripe.accountLinks.create({
//       account: existingAccount.accountId,
//       refresh_url: `${protocol}://${host}/api/v1/payment/refreshAccountConnect/${existingAccount.accountId}`,
//       return_url: `${protocol}://${host}/api/v1/payment/success-account/${existingAccount.accountId}`,
//       type: 'account_onboarding',
//     });
//     // console.log('onboardingLink-1', onboardingLink);

//     return {
//       success: true,
//       message: 'Please complete your account',
//       url: onboardingLink.url,
//     };
//   }

//   const account = await stripe.accounts.create({
//     type: 'express',
//     email: user.email,
//     country: 'US',
//     capabilities: {
//       card_payments: { requested: true },
//       transfers: { requested: true },
//     },
//   });
//   // console.log('stripe account', account);

//   await StripeAccount.create({ accountId: account.id, userId: user.userId });

//   const onboardingLink = await stripe.accountLinks.create({
//     account: account.id,
//     refresh_url: `${protocol}://${host}/api/v1/payment/refreshAccountConnect/${account.id}`,
//     return_url: `${protocol}://${host}/api/v1/payment/success-account/${account.id}`,
//     type: 'account_onboarding',
//   });
//   // console.log('onboardingLink-2', onboardingLink);

//   return {
//     success: true,
//     message: 'Please complete your account',
//     url: onboardingLink.url,
//   };
// };

// const transferBalanceService = async (
//   accountId: string,
//   amt: number,
//   userId: string,
// ) => {
//   const withdreawAmount = await availablewithdrawAmount('stripe', userId);
//   // console.log('withdreawAmount===', withdreawAmount[0].totalAmount);

//   if (withdreawAmount[0].totalAmount < 0) {
//     throw new AppError(httpStatus.BAD_REQUEST, 'Amount must be positive');
//   }
//   const amount = withdreawAmount[0].totalAmount * 100;
//   const transfer = await stripe.transfers.create({
//     amount,
//     currency: 'usd',
//     destination: accountId,
//   });
//   // console.log('transfer', transfer);
//   if (!transfer) {
//     throw new AppError(httpStatus.BAD_REQUEST, 'Transfer failed');
//   }
//   let withdraw;
//   if (transfer) {
//     const withdrawData: any = {
//       transactionId: transfer.id,
//       amount: withdreawAmount[0].totalAmount,
//       method: 'stripe',
//       status: 'completed',
//       businessId: userId,
//       destination: transfer.destination,
//     };

//     withdraw = withdrawService.addWithdrawService(withdrawData);
//     if (!withdraw) {
//       throw new AppError(httpStatus.BAD_REQUEST, 'Withdrawal failed');
//     }
//   }
//   return withdraw;
// };
// 0 0 */7 * *

// cron.schedule('* * * * *', async () => {
//   // console.log('Executing transferBalanceService every 7 days...');
//   const businessUser = await User.find({
//     role: 'business',
//     isDeleted: false,
//   });
//   // console.log('businessUser==', businessUser);

//   for (const user of businessUser) {
//     // console.log('usr=====');
//     const isExiststripeAccount:any = await StripeAccount.findOne({
//       userId: user._id,
//       isCompleted: true,
//     });
//     // console.log('isExiststripeAccount', isExiststripeAccount);

//     if (!isExiststripeAccount) {
//       throw new AppError(httpStatus.BAD_REQUEST, 'Account not found');
//     }

//      // console.log('=====1')
//     await transferBalanceService(
//       isExiststripeAccount.accountId,
//       0,
//       isExiststripeAccount.userId,
//     );
//     // console.log('=====2');
//   }

//   // await transferBalanceService();
// });

export const paymentService = {
  addPaymentService,
  getAllPaymentService,
  singlePaymentService,
  deleteSinglePaymentService,
  getAllPaymentByCustomerService,
  getAllIncomeRatio,
  getAllIncomeRatiobyDays,
  createCheckout,
  automaticCompletePayment,
  getAllEarningRatio,
  //   paymentRefundService,
  //   filterBalanceByPaymentMethod,
  //   filterWithdrawBalanceByPaymentMethod,
  //   createStripeAccount,
  //   refreshAccountConnect,
  //   transferBalanceService,
};
