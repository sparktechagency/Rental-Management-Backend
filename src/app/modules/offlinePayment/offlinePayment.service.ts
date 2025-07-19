import mongoose from 'mongoose';
import QueryBuilder from '../../builder/QueryBuilder';
import AppError from '../../error/AppError';
import InvitePeople from '../invitePeople/invitePeople.model';
import { invitePeopleService } from '../invitePeople/invitePeople.service';
import { Payment } from '../payment/payment.model';
import Property from '../property/property.model';
import { duePaymentService } from '../rentDue/rentDue.service';
import { User } from '../user/user.models';
import { TOfflinePayment } from './offlinePayment.interface';
import OfflinePayment from './offlinePayment.model';
import { notificationService } from '../notification/notification.service';
import { sendEmail } from '../../utils/mailSender';

const createOfflinePaymentService = async (payload: TOfflinePayment) => {
  const landlordUser = await User.findById(payload.landlordUserId);
  if (!landlordUser) {
    throw new AppError(404, 'Landlord User Not Found!!');
  }
  const property: any = await Property.findById(payload.propertyId);
  if (!property) {
    throw new AppError(404, 'Property  Not Found!!');
  }

  if (!property.landlordUserId.equals(payload.landlordUserId)) {
    throw new AppError(404, 'This property is not yours!!');
  }

  const tenantUser = await User.findById(payload.tenantUserId);
  if (!tenantUser) {
    throw new AppError(404, 'Tenant User Not Found!!');
  }

  const isExistSameTransactionId = await OfflinePayment.findOne({
    transactionId: payload.transactionId,
  });

  if (isExistSameTransactionId) {
    throw new AppError(404, 'Transaction Id already exist!!');
  }

  const result = await OfflinePayment.create(payload);

  if (!result) {
    throw new AppError(403, 'Offline Payment create is faild!!');
  }

  const notificationData = {
    userId: landlordUser._id,
    message: `You have a new offline payment request from tenant!`,
    type: 'success',
  };
  const notification = notificationService.createNotification(notificationData);

  if (result) {
    sendEmail(
      landlordUser.email,
      'Offline Payment Request from Tenant!',
      `<html>  
        <body>
          <h2>Dear ${landlordUser.fullName},</h2>
          
          <p>We hope this message finds you well. We are reaching out to inform you that you have received a new offline payment request from your tenant, <strong>${tenantUser.fullName}</strong>, for the property located at <strong>${property.name}</strong>.</p>
          
          <p><strong>Payment Details:</strong></p>
          <ul>
            <li><strong>Tenant Name:</strong> ${tenantUser.fullName}</li>
            <li><strong>Property Name:</strong> ${property.name}</li>
            <li><strong>Transaction ID:</strong> ${payload.transactionId}</li>
            <li><strong>Amount Requested:</strong> ${payload.amount}</li>
          </ul>
          
          <p>Please review this request and confirm or follow up accordingly. If you have any questions or concerns, feel free to reach out to us or directly coordinate with your tenant.</p>
          
          <p>We appreciate your prompt attention to this request and thank you for your continued cooperation in maintaining a positive rental experience.</p>
          
          <p>Best regards,</p>
          <p><strong>${tenantUser.fullName}</strong></p>
        </body>
      </html>`,
    );
  }

  return result;
};

const getAllOfflinePaymentByLandlordUserByPropertyIdQuery = async (
  query: Record<string, unknown>,
  userId: string,
) => {
  const user = await User.findById(userId);
  if (!user) {
    throw new AppError(404, 'User Not Found!!');
  }

  const userField = user.role === 'tenant' ? 'tenantUserId' : 'landlordUserId';

  // console.log('user id ', userField);

  const OfflinePaymentQuery = new QueryBuilder(
    OfflinePayment.find({
      [userField]: userId,
    })
      .populate('tenantUserId')
      .populate('landlordUserId'),
    query,
  )
    .search([''])
    .filter()
    .sort()
    .paginate()
    .fields();

  const result = await OfflinePaymentQuery.modelQuery;
  const meta = await OfflinePaymentQuery.countTotal();
  return { meta, result };
};

const getAllOfflinePaymentReceptByTenTenantQuery = async (userId: string) => {
  const user = await User.findById(userId);
  if (!user) {
    throw new AppError(404, 'User Not Found!!');
  }

  const result = await OfflinePayment.findOne({
    tenantUserId: userId,
  })
    .sort({ createdAt: -1 })
    .populate('tenantUserId')
    .populate('landlordUserId');
  if (!result) {
    throw new AppError(404, 'OfflinePayment Not Found!!');
  }
  return result;
};

const getSingleOfflinePaymentQuery = async (id: string) => {
  const offlinePayment = await OfflinePayment.findById(id);
  if (!offlinePayment) {
    throw new AppError(404, 'OfflinePayment Not Found!!');
  }

  return offlinePayment;
};

// const singleOfflinePaymentAcceptQuery = async (
//   id: string,
//   landlordUserId: string,
// ) => {

//   const offlinePayment:any = await OfflinePayment.findOne({
//     _id: id,
//     landlordUserId,
//   });
//   if (!offlinePayment) {
//     throw new AppError(404, 'OfflinePayment Not Found!!');
//   }

//    const runninginvitePeople = await InvitePeople.findOne({
//       tenantUserId: offlinePayment.tenantUserId,
//       propertyId: offlinePayment.propertyId,
//       status: { $in: ['invited', 'invite_request', 'request_accept_verify'] },
//       cancelStatus: { $in: ['cancel_request', 'pending'] },
//     });

//     if (!runninginvitePeople) {
//       throw new AppError(404, 'Running property  Not Found!!');
//     }

//   const result = await OfflinePayment.findOneAndUpdate( {_id:id, landlordUserId},{
//     status: 'accepted'
//   });

//   const paymentData = {
//     tenantUserId: offlinePayment.tenantUserId,
//     rentAmount: offlinePayment.amount,
//     transactionDate: offlinePayment.submittedDate,
//     method: offlinePayment.paymentMethod,
//     transactionId: offlinePayment.transactionId,
//     invitedPropertyId: runninginvitePeople._id,
//     status: 'paid',
//   };

//   const payment = await Payment.create(paymentData);

//   if(!payment){
//     throw new AppError(403, 'OfflinePayment is Faild!!');

//   }

//  const deuAmount =
//    await invitePeopleService.getRuningInviteTenantPropertyDeuQuery(
//      offlinePayment.tenantUserId
//    );

//    const dueAmuntCreateData:any = {
//      tenantUserId: offlinePayment.tenantUserId,
//      landlordUserId: offlinePayment.landlordUserId,
//      propertyId: offlinePayment.propertyId,
//      amount: deuAmount,
//    };

//    const dueAmountCreate =
//      duePaymentService.createDuePaymentService(dueAmuntCreateData);

//      if (!dueAmountCreate) {
//        throw new AppError(403, 'Due Payment is Faild!!');
//      }

//   if (!result) {
//     throw new AppError(403, 'OfflinePayment Deleted Faild!!');
//   }

//   return result;
// };

const singleOfflinePaymentAcceptQuery = async (
  id: string,
  landlordUserId: string,
) => {
  const session = await mongoose.startSession();

  try {
    session.startTransaction();

    const offlinePayment: any = await OfflinePayment.findOne(
      { _id: id, landlordUserId },
      null,
      { session },
    );
    if (!offlinePayment) {
      throw new AppError(404, 'OfflinePayment Not Found!!');
    }

    const runninginvitePeople = await InvitePeople.findOne(
      {
        tenantUserId: offlinePayment.tenantUserId,
        propertyId: offlinePayment.propertyId,
        status: { $in: ['invited', 'invite_request', 'request_accept_verify'] },
        cancelStatus: { $in: ['cancel_request', 'pending'] },
      },
      null,
      { session },
    );
    if (!runninginvitePeople) {
      throw new AppError(404, 'Running property Not Found!!');
    }

    const tenant = await User.findById(offlinePayment.tenantUserId).session(
      session,
    );
    const landlord:any = await User.findById(landlordUserId).session(session);
    if (!tenant) {
      throw new AppError(404, 'Tenant User Not Found!!');
    }

    const result = await OfflinePayment.findOneAndUpdate(
      { _id: id, landlordUserId },
      { status: 'accepted' },
      { new: true, session },
    );

    if (!result) {
      throw new AppError(403, 'OfflinePayment Deleted Faild!!');
    }

    const paymentData = {
      tenantUserId: offlinePayment.tenantUserId,
      landlordUserId: offlinePayment.landlordUserId,
      rentAmount: offlinePayment.amount,
      transactionDate: offlinePayment.submittedDate,
      method: offlinePayment.paymentMethod,
      transactionId: offlinePayment.transactionId,
      invitedPropertyId: runninginvitePeople._id,
      status: 'paid',
      adminChargeAmount:0
    };
    console.log('paymentData', paymentData);

    const payment = await Payment.create([paymentData], { session });

    if (!payment) {
      throw new AppError(403, 'OfflinePayment Failed!!');
    }

    const dueAmount =
      await invitePeopleService.getRuningInviteTenantPropertyDeuQuery(
        offlinePayment.tenantUserId,
      );

    console.log('dueAmount==', dueAmount);

    const dueAmountCreateData: any = {
      tenantUserId: offlinePayment.tenantUserId,
      landlordUserId: offlinePayment.landlordUserId,
      propertyId: offlinePayment.propertyId,
      amount: dueAmount.deu,
    };
    console.log('dueAmountCreateData', dueAmountCreateData);
    const dueAmountCreate = await duePaymentService.createDuePaymentService(
      dueAmountCreateData,
      session,
    );
    console.log('dueAmountCreate', dueAmountCreate);

    if (!dueAmountCreate) {
      throw new AppError(403, 'Due Payment Failed!!');
    }

    const property = await Property.findById(offlinePayment.propertyId).session(
      session,
    );
    if (!property) {
      throw new AppError(404, 'Property Not Found!!');
    }

   await session.commitTransaction();

    const notificationData = {
      userId: offlinePayment.tenantUserId,
      message: `Offline Payment Accepted by Landlord`,
      type: 'success',
    };
    const notification = notificationService.createNotification(
      notificationData,
      session,
    );

    


      sendEmail(
        tenant.email,
        'Offline Payment Accepted by Landlord',
        `<html>
  <body>
    <h2>Dear ${tenant.fullName},</h2>
    
    <p>We hope this message finds you well. We are reaching out to inform you that your offline payment request has been accepted by the landlord for the property located at <strong>${property.name}</strong>.</p>
    
    <p><strong>Payment Details:</strong></p>
    <ul>
      <li><strong>Tenant Name:</strong> ${tenant.fullName}</li>
      <li><strong>Property Name:</strong> ${property.name}</li>
      <li><strong>Amount Paid:</strong> ${result.amount}</li>
    </ul>
    
    <p>The payment has been successfully processed and marked as "Paid". You may now coordinate with your landlord for further actions as necessary. If you have any questions or concerns, feel free to reach out to us or directly coordinate with your landlord.</p>
    
    <p>We appreciate your prompt attention to this matter and thank you for your continued cooperation in maintaining a positive rental experience.</p>
    
    <p>Best regards,</p>
    <p><strong>${landlord.fullName}</strong></p>
  </body>
</html>
`,
      );

     
    return result;
  } catch (error) {
    if (session.inTransaction()) {
      await session.abortTransaction();
    }
    // await session.abortTransaction();
    throw error;
  } finally {
    session.endSession();
  }
};

export const offlinePaymentService = {
  createOfflinePaymentService,
  getAllOfflinePaymentByLandlordUserByPropertyIdQuery,
  getAllOfflinePaymentReceptByTenTenantQuery,
  getSingleOfflinePaymentQuery,
  singleOfflinePaymentAcceptQuery,
};
