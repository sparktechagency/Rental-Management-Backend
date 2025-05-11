import AppError from '../../error/AppError';
import mongoose from 'mongoose';
import QueryBuilder from '../../builder/QueryBuilder';
import { User } from '../user/user.models';
import { TInvitePeople } from './invitePeople.interface';
import Property from '../property/property.model';
import InvitePeople from './invitePeople.model';
import Agreement from '../agreement/agreement.model';
import { Payment } from '../payment/payment.model';
import { sendEmail } from '../../utils/mailSender';
import Maintenance from '../maintenance/maintenance.model';
import Announcement from '../announcements/announcements.model';
import OfflinePayment from '../../offlinePayment/offlinePayment.model';
import DuePayment from '../rentDue/rentDue.model';
import Chat from '../chat/chat.model';

const createInvitePeopleService = async (payload: TInvitePeople) => {
  const landlordUser = await User.findById(payload.landlordUserId);
  if (!landlordUser) {
    throw new AppError(404, 'Landlord User Not Found!!');
  }
  const tenantUser = await User.findById(payload.tenantUserId);
  if (!tenantUser) {
    throw new AppError(404, 'Tenant User Not Found!!');
  }

  const property = await Property.findById(payload.propertyId);
  if (!property) {
    throw new AppError(404, 'Property Not Found!!');
  }

  if (property.status !== 'verified') {
    throw new AppError(404, 'Property not varified!!');
  }

  console.log('payload==', payload);
  const tenantAllReadyInvited = await InvitePeople.findOne({
    tenantUserId: payload.tenantUserId,
    status: { $in: ['invited', 'invite_request', 'request_accept_verify'] },
    cancelStatus: { $in: ['cancel_request', 'pending'] },
  });

  const propertyAllReadyInvited = await InvitePeople.findOne({
    propertyId: payload.propertyId,
    status: { $in: ['invited', 'invite_request', 'request_accept_verify'] },
    cancelStatus: { $in: ['cancel_request', 'pending'] },
  });

  if (tenantAllReadyInvited) {
    throw new AppError(404, 'Tenant is already invited!!');
  }
  if (propertyAllReadyInvited) {
    throw new AppError(404, 'Property is already invited!!');
  }

  const result = await InvitePeople.create(payload);

  if (!result) {
    throw new AppError(403, 'InvitePeople create is faild!!');
  }
  if (result) {
      await Chat.create({
       participants: [result.landlordUserId, result.tenantUserId],
     });
  }
  return result;
};

const getAllInvitePeopleByLandlordByTenantAndTenantByLandlord = async (
  query: Record<string, unknown>,
  userId: string,
) => {
  const user = await User.findById(userId);
  if (!user) {
    throw new AppError(404, 'User Not Found!!');
  }

  const userField = user.role === 'tenant' ? 'tenantUserId' : 'landlordUserId';

  const invitePeopleQuery = new QueryBuilder(
    InvitePeople.find({
      [userField]: userId,
      //   isDeleted: false,
    })
      .populate('landlordUserId')
      .populate('tenantUserId')
      .populate('propertyId'),
    query,
  )
    .search([''])
    .filter()
    .sort()
    .paginate()
    .fields();

  const result = await invitePeopleQuery.modelQuery;
  const meta = await invitePeopleQuery.countTotal();
  return { meta, result };
};

// const getAllInvitePeopleByTenantUserQuery = async (
//   query: Record<string, unknown>,
//   tenantUserId: string,
// ) => {
//   const InvitePeopleQuery = new QueryBuilder(
//     InvitePeople.find({
//       tenantUserId,
//       //   isDeleted: false,
//     })
//       .populate('tenantUserId')
//       .populate('landlordUserId')
//       .populate('propertyId'),
//     query,
//   )
//     .search([''])
//     .filter()
//     .sort()
//     .paginate()
//     .fields();

//   const result = await InvitePeopleQuery.modelQuery;
//   const meta = await InvitePeopleQuery.countTotal();
//   return { meta, result };
// };

const getSingleInvitePeopleQuery = async (id: string) => {
  const invitePeople = await InvitePeople.findById(id);
  if (!invitePeople) {
    throw new AppError(404, 'InvitePeople Not Found!!');
  }
  const result = await InvitePeople.findById(id)
    .populate('tenantUserId')
    .populate('landlordUserId')
    .populate('propertyId');

  if (!invitePeople) {
    throw new AppError(404, 'InvitePeople Not Found!!');
  }

  return result;
};


const getSingleInvitePeopleByPropertyIdQuery = async (id: string) => {
  const property = await Property.findById(id);
  if (!property) {
    throw new AppError(404, 'Property is Not Found!!');
  }
  const result = await InvitePeople.findOne({ propertyId: id , status: 'invited', cancelStatus: { $in: ['cancel_request', 'pending'] } }).populate('tenantUserId').populate('landlordUserId').populate('propertyId');

    console.log('result', result);

  if (!result) {
    throw new AppError(404, 'Faild to get invitePeople!!');
  }

  return result;
};


const getCurrentInvitedTenant = async (tenantUserId: string) => {
  const user = await User.findById(tenantUserId);
  if (!user) {
    throw new AppError(404, 'User is Not Found!!');
  }
  const result = await InvitePeople.findOne({
    tenantUserId,
    cancelStatus: { $in: ['cancel_request', 'pending'] },
  })
    .populate('tenantUserId')
    .populate('landlordUserId')
    .populate('propertyId');

  // console.log('result', result);

   if (!result) {
    throw new AppError(404, 'Faild to get current invitePeople!!');
  }


  const agreement = await Agreement.findOne({ invitePeopleId: result._id });

    const newResult = {
      ...result.toObject(),
      agreement,
    };

    console.log('bala', newResult);

 

  return newResult;
};

// const getRuningInviteTenantPropertyDeuQuery = async (tenantUserId: string, session?: any) => {


//   const invitePeople = await InvitePeople.findOne({ tenantUserId });
//   if (!invitePeople) {
//     throw new AppError(404, 'InvitePeople Not Found!!');
//   }
//   const runninginvitePeople = await InvitePeople.findOne({
//     tenantUserId,
//     status: 'invited',
//     cancelStatus: { $in: ['cancel_request', 'pending'] },
//   });

//   if (!runninginvitePeople) {
//     throw new AppError(404, 'Running InvitePeople Not Found!!');
//   }

//   const agreement: any = await Agreement.findOne({
//     invitePeopleId: invitePeople._id,
//   });

//   if (!agreement) {
//     throw new AppError(404, 'Agreement is Not Found!!');
//   }

//   const currentDate = new Date();
//   const startDate = new Date(agreement.startDate);

//   const monthDifference =
//     (currentDate.getFullYear() - startDate.getFullYear()) * 12 +
//     currentDate.getMonth() -
//     startDate.getMonth();

//   console.log('monthDifference=', monthDifference);

//   let dueAmount = 0;
//   if (monthDifference > 0) {
//     dueAmount = agreement.rentAmount * monthDifference;
//   }

//   console.log('dueAmount=', dueAmount);

//   const alreadyPaidAmount = await Payment.find({
//     tenantUserId,
//     invitedPropertyId: runninginvitePeople?._id,
//     status: 'paid',
//   });
//   console.log('alreadyPaidAmount=', alreadyPaidAmount);

//   let paidAmount: any;

//   if (alreadyPaidAmount?.length > 0) {
//     paidAmount = alreadyPaidAmount.reduce(
//       (acc, item) => acc + Number(item.rentAmount),
//       0,
//     );
//   }

//   console.log('paidAmount', paidAmount);

//   const remainingDueAmount = Math.abs(dueAmount - paidAmount);

//   let remainingAmount;

//   if (dueAmount) {
//     remainingAmount = dueAmount;
//   }

//   if (dueAmount && paidAmount) {
//     remainingAmount = remainingDueAmount;
//   }

//   return remainingAmount ? remainingAmount : 0;
// };


const getRuningInviteTenantPropertyDeuQuery = async (
  tenantUserId: string,
  session?: any,
) => {
  const mongoSession = session || (await mongoose.startSession());

  let remainingAmount = 0;

  try {
    if (!session) await mongoSession.startTransaction();

    const invitePeople = await InvitePeople.findOne({ tenantUserId }).session(
      mongoSession,
    );
    if (!invitePeople) {
      throw new AppError(404, 'InvitePeople Not Found!!');
    }

    const runninginvitePeople = await InvitePeople.findOne({
      tenantUserId,
      status: 'invited',
      cancelStatus: { $in: ['cancel_request', 'pending'] },
    }).session(mongoSession);

    if (!runninginvitePeople) {
      throw new AppError(404, 'Running InvitePeople Not Found!!');
    }

    const agreement: any = await Agreement.findOne({
      invitePeopleId: invitePeople._id,
    }).session(mongoSession);

    if (!agreement) {
      throw new AppError(404, 'Agreement is Not Found!!');
    }

    const currentDate = new Date();
    const startDate = new Date(agreement.startDate);

    const monthDifference =
      (currentDate.getFullYear() - startDate.getFullYear()) * 12 +
      currentDate.getMonth() -
      startDate.getMonth();

    console.log('monthDifference =', monthDifference);

    let dueAmount = 0;
    if (monthDifference > 0) {
      dueAmount = agreement.rentAmount * monthDifference;
    }

    console.log('dueAmount =', dueAmount);

    const alreadyPaidAmount = await Payment.find({
      tenantUserId,
      invitedPropertyId: runninginvitePeople._id,
      status: 'paid',
    }).session(mongoSession);

    console.log('alreadyPaidAmount =', alreadyPaidAmount);

    let paidAmount = 0;

    if (alreadyPaidAmount?.length > 0) {
      paidAmount = alreadyPaidAmount.reduce(
        (acc, item) => acc + Number(item.rentAmount),
        0,
      );
    }
      const currentMonthRent = agreement.rentAmount; 
      let currentMonthDue = currentMonthRent - paidAmount; 

     if (currentMonthDue > 0) {
       remainingAmount = currentMonthDue; 
     } else {
       remainingAmount = 0; 
     }

     if (dueAmount > paidAmount) {
       const remainingDueAmount = Math.abs(dueAmount - paidAmount);

       remainingAmount = remainingDueAmount;
     }


     const pendingMaintenance = await Maintenance.countDocuments({
       tenantUserId,
       propertyId: runninginvitePeople.propertyId,
       status: 'pending',
     });
     const solvedMaintenance = await Maintenance.countDocuments({
       tenantUserId,
       propertyId: runninginvitePeople.propertyId,
       status: 'solved',
     });
     const cancelMaintenance = await Maintenance.countDocuments({
       tenantUserId,
       propertyId: runninginvitePeople.propertyId,
       status: 'cancel',
     });

    const newResult = {
      deu: remainingAmount ? remainingAmount : 0,
      maintenance: {
        pending: pendingMaintenance,
        solved: solvedMaintenance,
        cancel: cancelMaintenance,
      },
      agreement: agreement
        ? { status: 'Provided', endDate: agreement.endDate }
        : { status: 'Not Provided', endDate: null },
    };



    

    

    if (!session) await mongoSession.commitTransaction();

    return newResult;
  } catch (error) {
    if (!session) await mongoSession.abortTransaction();
    throw error;
  } finally {
    if (!session) mongoSession.endSession();
  }

 
// console.log('remainingAmount', remainingAmount);
//   return remainingAmount ? remainingAmount : 0;

};



const getRuningOverviewLandlordQuery = async (landlordUserId: string) => {
  const property = await Property.countDocuments({ landlordUserId });
  if (!property) {
    throw new AppError(404, 'Property Not Found!!');
  }
  const runninginvitePeople = await InvitePeople.countDocuments({
    landlordUserId,
    status: 'invited',
    cancelStatus: { $in: ['cancel_request', 'pending'] },
  });

  if (!runninginvitePeople) {
    throw new AppError(404, 'Running InvitePeople Not Found!!');
  }

  const maintenanceRequest = await Property.aggregate([
    {
      $match: {
        landlordUserId: new mongoose.Types.ObjectId(landlordUserId),
      },
    },
    {
      $lookup: {
        from: 'maintenances',
        localField: '_id',
        foreignField: 'propertyId',
        as: 'maintenanceDetails',
      },
    },
    {
      $project: {
        propertyName: 1,
        totalMaintenanceRequests: { $size: '$maintenanceDetails' },
        pendingCount: {
          $size: {
            $filter: {
              input: '$maintenanceDetails',
              as: 'request',
              cond: { $eq: ['$$request.status', 'pending'] },
            },
          },
        },
        solvedCount: {
          $size: {
            $filter: {
              input: '$maintenanceDetails',
              as: 'request',
              cond: { $eq: ['$$request.status', 'solved'] },
            },
          },
        },
        cancelledCount: {
          $size: {
            $filter: {
              input: '$maintenanceDetails',
              as: 'request',
              cond: { $eq: ['$$request.status', 'cancel'] },
            },
          },
        },
      },
    },
    {
      $group: {
        _id: null,
        totalPending: { $sum: '$pendingCount' },
        totalSolved: { $sum: '$solvedCount' },
        totalCancelled: { $sum: '$cancelledCount' },
      },
    },
  ]);

  // console.log('maintenanceRequest', maintenanceRequest);

  const allPayment = await InvitePeople.aggregate([
    {
      $match: {
        landlordUserId: new mongoose.Types.ObjectId(landlordUserId),
        status: 'invited',
      },
    },
    {
      $lookup: {
        from: 'payments',
        localField: '_id',
        foreignField: 'invitedPropertyId',
        as: 'paymentDetails',
      },
    },
    {
      $unwind: '$paymentDetails',
    },
    ///// sum of payment
    {
      $group: {
        _id: null,
        totalPayment: { $sum: '$paymentDetails.rentAmount' },
        totalAdminPayment: { $sum: '$paymentDetails.adminChargeAmount' },
      },
    },
    {
      $project: {
        totalLandlordPayment: {
          $subtract: ['$totalPayment', '$totalAdminPayment'],
        },
      },
    },
  ]);



  

  return {
    property,
    tenant:runninginvitePeople,
    maintenance:maintenanceRequest[0],
    totalEarning:allPayment[0]?.totalLandlordPayment ? allPayment[0]?.totalLandlordPayment : 0,
  };
};


const getRuningCalendarInfoByTenantQuery = async (tenantUserId: string) => {

  const payment = await Payment.find({
    tenantUserId,
    status: 'paid',
  });
  
   const formattedPayment = payment.map((item: any) => ({
     title: 'Rent Payment Received!',
     subTitle: "Your property's rent payment has been received successfully.",
     status: 'payment',
     date: item.createdAt,
   }));

    const duePayment = await DuePayment.find({
      tenantUserId,
    });

    const formattedDuePayment = duePayment.map((item: any) => ({
      title: 'Rent Due Received!',
      subTitle: "Your property's due payment has been received successfully.",
      status: 'duePayment',
      date: item.createdAt,
    }));

    
  const offlineReceipts = await OfflinePayment.find({
    tenantUserId,
  });

  const formattedOfflineReceipt = offlineReceipts.map((item: any) => ({
    title: 'Offline Receipt Submitted!',
    subTitle:
      "Your property's offline receipt has been submitted successfully.",
    status: 'offlineReceipt',
    date: item.createdAt,
  }));
  console.log('formattedOfflineReceipt', formattedOfflineReceipt);

  const user = await User.findById(tenantUserId);
let formattedAnnouncement;
  if(user){
    
    const runninginvitePeople = await InvitePeople.findOne({
      tenantUserId,
      status: 'invited',
      cancelStatus: { $in: ['cancel_request', 'pending'] },
    });

    const annauncement = await Announcement.find({
      propertyId: runninginvitePeople?.propertyId,
    });

    // console.log('annauncement==', annauncement);

     formattedAnnouncement = annauncement.map((item: any) => ({
      title: 'Announcement by Landlord',
      subTitle: item.description,
      status: 'announcement',
      date: item.createdAt,
    }));
    console.log('formattedAnnouncement', formattedAnnouncement);

    
  }

  const output = [
    ...formattedPayment,
    ...formattedDuePayment,
    ...formattedOfflineReceipt,
    ...formattedAnnouncement ? formattedAnnouncement : [],
  ];
  //  console.log('output', output);

   // return { payment, agreement, annauncement };
   return output;


};


const getRuningCalendarInfoByLandlordQuery = async (landlordUserId: string) => {

  const landlord = await User.findById(landlordUserId);
  if (!landlord) {
    throw new AppError(404, 'Landlord Not Found!!');
  }
  
  


  const payment = await Payment.find({
    landlordUserId,
    status: 'paid',

  });

  const formattedPayment = payment.map((item: any) => ({
    title: 'Rent Payment Received!',
    subTitle: "Your property's rent payment has been received successfully.",
    status: 'payment',
    date: item.createdAt,
  }));

  const duePayment = await DuePayment.find({
    landlordUserId,

  });

  const formattedDuePayment = duePayment.map((item: any) => ({
    title: 'Rent Due Received!',
    subTitle: "Your property's due payment has been received successfully.",
    status: 'duePayment',
    date: item.createdAt,
  }));


  const offlineReceipts = await OfflinePayment.find({
    landlordUserId,
  });

   const formattedOfflineReceipt = offlineReceipts.map((item: any) => ({
     title: 'Offline Receipt Submitted!',
     subTitle: "Your property's offline receipt has been submitted successfully.",
     status: 'offlineReceipt',
     date: item.createdAt,
   }));
   console.log('formattedOfflineReceipt', formattedOfflineReceipt);


  const annauncement = await Announcement.find({
    landlordUserId,
  }).select('title description createdAt');

  // console.log('annauncement==', annauncement);

   const formattedAnnouncement = annauncement.map((item: any) => ({
     title: 'Announcement by Landlord',
     subTitle: item.description,
     status: 'announcement',
     date: item.createdAt,
   }));
   console.log('formattedAnnouncement', formattedAnnouncement);

    
  const output = [
    ...formattedPayment,
    ...formattedDuePayment,
    ...formattedOfflineReceipt,
    ...formattedAnnouncement,
  ];

  // console.log('output', output);

  // return { payment, agreement, annauncement };
  return output;
};

      

const getSingleInvitePeopleAcceptQuery = async (id: string, userId: string) => {
  if (!id) {
    throw new AppError(400, 'Invalid input parameters');
  }

  const isExist = await InvitePeople.findById(id);
  if (!isExist) {
    throw new AppError(404, 'InvitePeople not found!');
  }
  if (isExist.tenantUserId.toString() !== userId.toString()) {
    throw new AppError(404, 'You are not valid tenant User!');
  }

  const result = await InvitePeople.findByIdAndUpdate(
    id,
    {
      status: 'request_accept_verify',
    },
    { new: true },
  );
  if (!result) {
    throw new AppError(404, 'InvitePeople Deleted Faild!!');
  }

  const LandlordUserExist = await User.findById(result.landlordUserId);
  if (!LandlordUserExist) {
    throw new AppError(404, 'Landlord User Not Found!!');
  }
  const tenantUserExist = await User.findById(result.tenantUserId);
  if (!tenantUserExist) {
    throw new AppError(404, 'Tenant User Not Found!!');
  }
  const property = await Property.findById(result.propertyId);
  if (!property) {
    throw new AppError(404, 'Property is Not Found!!');
  }
  if (result.status === 'request_accept_verify') {
    // Send verification email to the landlord
    sendEmail(
      LandlordUserExist.email,
      'Property Invited Accept Successfully From Tenant',
      `
          <html>  
  <body>
    <h2>Dear ${LandlordUserExist.fullName},</h2>
    
    <p>We are pleased to inform you that the tenant has successfully accepted your property invitation and it has been verified by our team. This marks an important step in the process of listing your property on our platform.</p>
    
    <p><strong>Property Name:</strong> ${property.name}</p>
    <p><strong>Property Status:</strong> ${property.status}</p>
    
    <p>Your property is now officially verified and ready to be featured on our platform, where potential tenants can explore and engage with it. We appreciate your patience and cooperation during this process.</p>
    
    <p>If you have any questions or need further assistance, please do not hesitate to reach out to our support team. We are always here to help.</p>
    
    <p>Thank you for trusting us with your property, and we look forward to continuing our partnership with you.</p>
    
    <p>Best regards,</p>
    <p><strong>${tenantUserExist.fullName}</strong></p>
  </body>
</html>
        `,
    );
  }

  return result;
};


const updateSingleInvitePeopleVerifyQuery = async (id: string, userId: string) => {
  if (!id) {
    throw new AppError(400, 'Invalid input parameters');
  }

  const isExist = await InvitePeople.findById(id);
  if (!isExist) {
    throw new AppError(404, 'InvitePeople not found!');
  }
  if (isExist.landlordUserId.toString() !== userId.toString()) {
    throw new AppError(404, 'You are not valid landlord User!');
  }

   if (isExist.status === 'invited') {
     throw new AppError(404, 'Tenant is already Verified!!');
   }

  if (isExist.status !== 'request_accept_verify') {
    throw new AppError(404, 'This is not valid action!!');
  }

 

  const result = await InvitePeople.findByIdAndUpdate(
    id,
    {
      status: 'invited',
    },
    { new: true },
  );
  if (!result) {
    throw new AppError(404, 'InvitePeople Deleted Faild!!');
  }

  const tenantUserExist = await User.findById(result.tenantUserId);
  if (!tenantUserExist) {
    throw new AppError(404, 'Tenant User Not Found!!');
  }
  const landlordUserExist = await User.findById(result.landlordUserId);
  if (!landlordUserExist) {
    throw new AppError(404, 'Landlord User Not Found!!');
  }

  const property = await Property.findById(result.propertyId);
  if (!property) {
    throw new AppError(404, 'Property is Not Found!!');
  }

  if (result.status === 'invited') {
    // Send verification email to the landlord
    sendEmail(
      tenantUserExist.email,
      'Property Invited Successfully From Landlord',
      `<html>  
  <body>
    <h2>Dear ${tenantUserExist.fullName},</h2>
    
    <p>We are pleased to inform you that your request to accept the property invitation has been successfully reviewed and the property has been verified. We are excited to move forward with you as our tenant.</p>
    
    <p><strong>Property Name:</strong>${property.name}</p>
    <p><strong>Status:</strong> Verified</p>
    
    <p>As the property has now been verified, we are ready to proceed with the next steps for your stay. Our team will reach out to you shortly with additional details on the move-in process, and we will be available to assist you with any further questions you may have.</p>
    
    <p>We want to ensure that your experience with us is smooth and enjoyable. Should you require any support, feel free to contact us anytime.</p>
    
    <p>Thank you for your trust and cooperation. We look forward to having you as a tenant and wish you all the best in your new home.</p>
    
    <p>Best regards,</p>
    <p><strong>${landlordUserExist.fullName}</strong></p>
  </body>
</html>
`,
    );
  }

  return result;
};

const deletedInvitePeopleQuery = async (id: string, userId: string) => {
  //   if (!id || !userId) {
  //     throw new AppError(400, 'Invalid input parameters');
  //   }
  //   const isExist = await InvitePeople.findById(id);
  //   if (!isExist) {
  //     throw new AppError(404, 'InvitePeople not found!');
  //   }
  //   const userExist = await User.findById(userId);
  //   if (!userExist) {
  //     throw new AppError(404, 'User not found!');
  //   }
  // if (userExist.role !== 'tenant' && userExist.role !== 'landlord') {
  //   throw new AppError(403, 'You are not authorized to delete this!');
  // }
  //   const varifyLandlord = await InvitePeople.findOne({
  //     _id: id,
  //     cancelStatus: 'conform',
  //   });
  //   if (!varifyLandlord) {
  //     throw new AppError(404, 'You can not deleted it!!');
  //   }
  //   const result = await InvitePeople.findByIdAndUpdate(
  //     id,
  //     {
  //       isDeleted: true,
  //     },
  //     { new: true },
  //   );
  //   if (!result) {
  //     throw new AppError(404, 'InvitePeople Deleted Faild!!');
  //   }
  //   return result;
};

export const invitePeopleService = {
  createInvitePeopleService,
  getAllInvitePeopleByLandlordByTenantAndTenantByLandlord,
  // getAllInvitePeopleByTenantUserQuery,
  getSingleInvitePeopleQuery,
  getSingleInvitePeopleByPropertyIdQuery,
  getCurrentInvitedTenant,
  getRuningInviteTenantPropertyDeuQuery,
  getRuningOverviewLandlordQuery,
  getRuningCalendarInfoByTenantQuery,
  getRuningCalendarInfoByLandlordQuery,
  updateSingleInvitePeopleVerifyQuery,
  getSingleInvitePeopleAcceptQuery,
  deletedInvitePeopleQuery,
};
