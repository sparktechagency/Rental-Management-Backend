import AppError from '../../error/AppError';
import mongoose from 'mongoose';
import QueryBuilder from '../../builder/QueryBuilder';
import { User } from '../user/user.models';
import { TMaintenance } from './maintenance.interface';
import Property from '../property/property.model';
import Maintenance from './maintenance.model';
import InvitePeople from '../invitePeople/invitePeople.model';
import { sendEmail } from '../../utils/mailSender';
import Agreement from '../agreement/agreement.model';
import { notificationService } from '../notification/notification.service';
import { unlink } from 'fs/promises';

const createMaintenanceService = async (payload: TMaintenance) => {
  try {
    const tenantUser = await User.findById(payload.tenantUserId);
    if (!tenantUser) {
      throw new AppError(404, 'Tenant User Not Found!!');
    }

    const property = await Property.findById(payload.propertyId);
    if (!property) {
      throw new AppError(404, 'Property is Not Found!!');
    }
    payload.landlordUserId = property.landlordUserId;

    const landlordUser = await User.findById(payload.landlordUserId);
    if (!landlordUser) {
      throw new AppError(404, 'Landlord User Not Found!!');
    }

    const invitedPeople = await InvitePeople.findOne({
      tenantUserId: payload.tenantUserId,
      propertyId: payload.propertyId,
      status: 'invited',
      cancelStatus: { $in: ['cancel_request', 'pending'] },
    });

    // console.log('invitedPeople', invitedPeople);

    if (!invitedPeople) {
      throw new AppError(404, 'you are not valid invited to this property');
    }

    const result = await Maintenance.create(payload);

    if (!result) {
      throw new AppError(403, 'Maintenance create is faild!!');
    }
    const notificationData = {
      userId: landlordUser._id,
      message: 'You have a new maintenance request from tenant!',
      type: 'success',
    };
    const notification =
      notificationService.createNotification(notificationData);
    if (result) {
      sendEmail(
        landlordUser.email,
        'Property Maintenance Message From Tenant',
        `<html>  
  <body>
    <h2>Dear ${landlordUser.fullName},</h2>
    
    <p>We hope this message finds you well. We are reaching out to inform you that there are some maintenance concerns that need your attention regarding the property you are renting out to ${tenantUser.fullName}.</p>
    
    <p><strong>Property Name:</strong> ${property.name}</p>
    <p><strong>Tenant Name:</strong> ${tenantUser.fullName}</p>
    
    <p>The tenant has reported the following maintenance issues that need to be addressed as soon as possible:</p>
    
    <ul>
      <li>${payload.message}</li>
    </ul>
    
    <p>We kindly ask that you review these concerns and coordinate with the necessary maintenance personnel to resolve them promptly. If you require any further details, or if you'd like assistance in arranging the repairs, please feel free to reach out to us.</p>
    
    <p>Thank you for your attention to this matter. We appreciate your prompt action to ensure the property remains in good condition for your tenants.</p>
    
    <p>Best regards,</p>
    <p><strong>${tenantUser.fullName}</strong></p>
  </body>
</html>

          `,
      );
    }
    return result;
  } catch (error:any) {
    console.log('error', error);
    // unlink file path
    const filePath = payload.images.map((item: any) => unlink(`public/${item}`));
    throw new AppError(error.statusCode, error.message);

  }
};

const getAllMaintenanceByLandlordUserPropertyIdQuery = async (
  query: Record<string, unknown>,
  userId: string,
) => {
  const maintenanceQuery = new QueryBuilder(
    Maintenance.find({
      //   propertyId,
      //   isDeleted: false,
      landlordUserId: userId,
    })
      .populate('tenantUserId')
      .populate('landlordUserId')
      .populate('propertyId'),
    query,
  )
    .search([''])
    .filter()
    .sort()
    .paginate()
    .fields();

  const result = await maintenanceQuery.modelQuery;
  const meta = await maintenanceQuery.countTotal();
  return { meta, result };
};

const getAllMaintenanceByTenantUserIDByPropertyIdQuery = async (
  query: Record<string, unknown>,
  tenantUserId: string,
) => {
  const tenantUser = await User.findById(tenantUserId);
  if (!tenantUser) {
    throw new AppError(403, 'User not found!!');
  }

  if (tenantUser.role !== 'tenant') {
    throw new AppError(403, 'You are not tenant user!!');
  }

  const property = await Property.findById(query.propertyId);
  if (!property) {
    throw new AppError(403, 'Property not found!!');
  }

  const maintenanceQuery = new QueryBuilder(
    Maintenance.find({
      tenantUserId,
      propertyId: property._id,
      //   isDeleted: false,
    })
      .populate('tenantUserId')
      .populate('landlordUserId')
      .populate('propertyId'),
    query,
  )
    .search([''])
    .filter()
    .sort()
    .paginate()
    .fields();

  const result = await maintenanceQuery.modelQuery;
  const meta = await maintenanceQuery.countTotal();
  return { meta, result };
};

const getAllMaintenanceCountByTenantUserIDByPropertyIdQuery = async (
  tenantUserId: string,
) => {
  console.log('console-1', tenantUserId);
  const tenantUser = await User.findById(tenantUserId);
  if (!tenantUser) {
    throw new AppError(403, 'User not found!!');
  }
  console.log('1213-1');
  if (tenantUser.role !== 'tenant') {
    throw new AppError(403, 'You are not tenant user!!');
  }

  const runninginvitePeople = await InvitePeople.findOne({
    tenantUserId,
    status: 'invited',
    cancelStatus: { $in: ['cancel_request', 'pending'] },
  });

  if (!runninginvitePeople) {
    throw new AppError(404, 'Running property  Not Found!!');
  }

  const property = await Property.findById(runninginvitePeople.propertyId);
  if (!property) {
    throw new AppError(403, 'Property not found!!');
  }

  console.log('console-2');
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

  const agreement = await Agreement.findOne({
    invitePeopleId: runninginvitePeople._id,
  });

  if (!agreement) {
    throw new AppError(404, 'Agreement Not Found!!');
  }

  console.log('solvedMaintenance-1', solvedMaintenance);
  console.log('console-1');
  return {
    maintenance: {
      pending: pendingMaintenance,
      solved: solvedMaintenance,
      cancel: cancelMaintenance,
    },
    agreement: agreement
      ? { status: 'Provided', endDate: agreement.endDate }
      : { status: 'Not Provided', endDate: null },
  };
};

const getSingleMaintenanceQuery = async (id: string) => {
  const maintenance = await Maintenance.findById(id);
  if (!maintenance) {
    throw new AppError(404, 'Maintenance Not Found!!');
  }
  const result = await Maintenance.findById(id)
    .populate('tenantUserId')
    .populate('landlordUserId')
    .populate('propertyId');

  if (!maintenance) {
    throw new AppError(404, 'Maintenance Not Found!!');
  }

  return result;
};

const updateSingleMaintenanceApprovedCancelByLandlordQuery = async (
  id: string,
  payload: any,
) => {
  if (!id) {
    throw new AppError(400, 'Invalid input parameters');
  }

  const maintenance = await Maintenance.findById(id);
  if (!maintenance) {
    throw new AppError(400, 'Maintenance message is not found!!');
  }
  const tenantUser = await User.findById(maintenance.tenantUserId);
  if (!tenantUser) {
    throw new AppError(404, 'Tenant User Not Found!!');
  }

  const property = await Property.findById(maintenance.propertyId);
  if (!property) {
    throw new AppError(404, 'Property is Not Found!!');
  }

  if (payload.status !== 'cancel' && payload.status !== 'solved') {
    throw new AppError(400, 'Status is invalid, you send (cancel or solved)!!');
  }
  if (payload.status === 'solved' && payload.feedbackMessage) {
    throw new AppError(400, 'FeedbackMessage message is not Required!!');
  }
  if (payload.status === 'cancel') {
    if (!payload.feedbackMessage) {
      throw new AppError(400, 'FeedbackMessage message is Required!!');
    }
  }

  if (maintenance.status === 'cancel') {
    throw new AppError(400, 'Maintenance message is already canceled!!');
  }
  if (maintenance.status === 'solved') {
    throw new AppError(400, 'Maintenance message is already solved!!');
  }

  const updateData: any = {
    status: payload.status,
  };

  if (payload.feedbackMessage) {
    updateData.feedbackMessage = payload.feedbackMessage;
  }

  const result = await Maintenance.findByIdAndUpdate(id, updateData, {
    new: true,
  });

  if (!result) {
    throw new AppError(403, 'Maintenance Message requiest faild!');
  }

  const notificationData = {
    userId: tenantUser._id,
    message: `Your maintenance request has been ${payload.status} by landlord`,
    type: 'success',
  };
  const notification = notificationService.createNotification(notificationData);

  if (result.status === 'solved') {
    sendEmail(
      tenantUser.email,
      'Property Maintenance Message From Landlord',
      `<html>  
  <body>
    <h2>Dear ${tenantUser.fullName},</h2> 
    
    <p>We hope you're doing well. We are pleased to inform you that the maintenance issue you reported has been successfully addressed and resolved.</p>
    
    <p><strong>Property Name:</strong> ${property.name}</p>
    <p><strong>Tenant Name:</strong> ${tenantUser.fullName}</p>
    
    <p>The maintenance concern you raised has now been solved and the necessary repairs have been completed:</p>
    
    <ul>
      <li>${payload.message}</li>
    </ul>
    
    <p>We appreciate your patience throughout this process, and we trust that everything is now in good condition. Should you experience any further issues, please don't hesitate to let us know.</p>
    
    <p>Thank you for your cooperation!</p>
    
    <p>Best regards,</p>
    <p><strong>The Landlord Team</strong></p>
  </body>
</html>
`,
    );
  } else if (result.status === 'cancel') {
    sendEmail(
      tenantUser.email,
      'Property Maintenance Message From Landlord',
      `<html>  
  <body>
    <h2>Dear ${tenantUser.fullName},</h2> 
    
    <p>We hope you're doing well. We regret to inform you that the maintenance request you submitted has been cancelled.</p>
    
    <p><strong>Property Name:</strong> ${property.name}</p>
    <p><strong>Tenant Name:</strong> ${tenantUser.fullName}</p>
    
    <p>Unfortunately, the landlord is unable to proceed with the maintenance request at this time. Here is the feedback from the landlord regarding the cancellation:</p>
    
    <ul>
      <li><strong>Feedback:</strong> ${result.feedbackMessage}</li>
    </ul>
    
    <p>If you have any further questions or concerns, or if you would like to discuss the matter further, please feel free to reach out to us.</p>
    
    <p>We appreciate your understanding and cooperation.</p>
    
    <p>Best regards,</p>
    <p><strong>The Landlord Team</strong></p>
  </body>
</html>
`,
    );
  }

  return result;
};

const deletedMaintenanceQuery = async (id: string, userId: string) => {
  //   if (!id || !userId) {
  //     throw new AppError(400, 'Invalid input parameters');
  //   }
  //   const isExist = await Maintenance.findById(id);
  //   if (!isExist) {
  //     throw new AppError(404, 'Maintenance not found!');
  //   }
  //   const userExist = await User.findById(userId);
  //   if (!userExist) {
  //     throw new AppError(404, 'User not found!');
  //   }
  // if (userExist.role !== 'tenant' && userExist.role !== 'landlord') {
  //   throw new AppError(403, 'You are not authorized to delete this!');
  // }
  //   const varifyLandlord = await Maintenance.findOne({
  //     _id: id,
  //     cancelStatus: 'conform',
  //   });
  //   if (!varifyLandlord) {
  //     throw new AppError(404, 'You can not deleted it!!');
  //   }
  //   const result = await Maintenance.findByIdAndUpdate(
  //     id,
  //     {
  //       isDeleted: true,
  //     },
  //     { new: true },
  //   );
  //   if (!result) {
  //     throw new AppError(404, 'Maintenance Deleted Faild!!');
  //   }
  //   return result;
};

export const maintenanceService = {
  createMaintenanceService,
  getAllMaintenanceByLandlordUserPropertyIdQuery,
  getAllMaintenanceByTenantUserIDByPropertyIdQuery,
  getAllMaintenanceCountByTenantUserIDByPropertyIdQuery,
  getSingleMaintenanceQuery,
  updateSingleMaintenanceApprovedCancelByLandlordQuery,
  deletedMaintenanceQuery,
};
