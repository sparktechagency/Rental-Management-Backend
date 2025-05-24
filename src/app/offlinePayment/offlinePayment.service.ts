import mongoose from "mongoose";
import QueryBuilder from "../builder/QueryBuilder";
import AppError from "../error/AppError";
import InvitePeople from "../modules/invitePeople/invitePeople.model";
import { invitePeopleService } from "../modules/invitePeople/invitePeople.service";
import { Payment } from "../modules/payment/payment.model";
import Property from "../modules/property/property.model";
import { duePaymentService } from "../modules/rentDue/rentDue.service";
import { User } from "../modules/user/user.models";
import { TOfflinePayment } from "./offlinePayment.interface";
import OfflinePayment from "./offlinePayment.model";


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
    transactionId: payload.transactionId
  })

  if (isExistSameTransactionId) {
    throw new AppError(404, 'Transaction Id already exist!!');
  }

  const result = await OfflinePayment.create(payload);

  if (!result) {
    throw new AppError(403, 'Offline Payment create is faild!!');
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

    const userField =
      user.role === 'tenant' ? 'tenantUserId' : 'landlordUserId';

// console.log('user id ', userField);

  const OfflinePaymentQuery = new QueryBuilder(
    OfflinePayment.find({
      [userField]: userId,
    }).populate('tenantUserId').populate('landlordUserId'),
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


const getAllOfflinePaymentReceptByTenTenantQuery = async (
  userId: string,
) => {
  const user = await User.findById(userId);
  if (!user) {
    throw new AppError(404, 'User Not Found!!');
  }

const result = await OfflinePayment.findOne({
  tenantUserId: userId
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

    const result = await OfflinePayment.findOneAndUpdate(
      { _id: id, landlordUserId },
      { status: 'accepted' },
      { new: true, session },
    );

    const paymentData = {
      tenantUserId: offlinePayment.tenantUserId,
      landlordUserId: offlinePayment.landlordUserId,
      rentAmount: offlinePayment.amount,
      transactionDate: offlinePayment.submittedDate,
      method: offlinePayment.paymentMethod,
      transactionId: offlinePayment.transactionId,
      invitedPropertyId: runninginvitePeople._id,
      status: 'paid',
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
       session ,
    );
    console.log('dueAmountCreate', dueAmountCreate);

    if (!dueAmountCreate) {
      throw new AppError(403, 'Due Payment Failed!!');
    }

    await session.commitTransaction();

    return result;
  } catch (error) {
    await session.abortTransaction();
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
