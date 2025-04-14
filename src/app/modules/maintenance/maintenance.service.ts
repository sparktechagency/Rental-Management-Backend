import AppError from '../../error/AppError';
import mongoose from 'mongoose';
import QueryBuilder from '../../builder/QueryBuilder';
import { User } from '../user/user.models';
import { TMaintenance } from './maintenance.interface';
import Property from '../property/property.model';
import Maintenance from './maintenance.model';

const createMaintenanceService = async (payload: TMaintenance) => {
  const landlordUser = await User.findById(payload.tenantUserId);
  if (!landlordUser) {
    throw new AppError(404, 'Tenant User Not Found!!');
  }
  const property = await Property.findById(payload.propertyId);
  if (!property) {
    throw new AppError(404, 'Property is Not Found!!');
  }

  const result = await Maintenance.create(payload);

  if (!result) {
    throw new AppError(403, 'Maintenance create is faild!!');
  }
  return result;
};

const getAllMaintenanceByLandlordUserPropertyIdQuery = async (
  query: Record<string, unknown>,
  propertyId: string,
) => {
    const property = await Property.findById(propertyId);
    if (!property) {
      throw new AppError(403, 'Property not found!!');
    }
  const maintenanceQuery = new QueryBuilder(
    Maintenance.find({
      propertyId,
      //   isDeleted: false,
    }),
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
  propertyId: string,
  tenantUserId: string,
) => {
  const tenantUser = await User.findById(tenantUserId);
  if (!tenantUser) {
    throw new AppError(403, 'User not found!!');
  }

  if (tenantUser.role === 'tenant') {
    throw new AppError(403, 'You are not tenant user!!');
  }

  const property = await Property.findById(propertyId);
  if (!property) {
    throw new AppError(403, 'Property not found!!');
  }

  const maintenanceQuery = new QueryBuilder(
    Maintenance.find({
      propertyId,
      tenantUserId,
      //   isDeleted: false,
    }),
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

const getSingleMaintenanceQuery = async (id: string) => {
  const maintenance = await Maintenance.findById(id);
  if (!maintenance) {
    throw new AppError(404, 'Maintenance Not Found!!');
  }
  const result = await Maintenance.findById(id);

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

  if (payload.status !== 'cancel' && payload.status !== 'solved') {
    throw new AppError(400, 'Status is invalid, you send (cancel or solved)!!');
  }
  if (payload.status === 'cancel') {
    if (!payload.feedbackMessage) {
      throw new AppError(400, 'FeedbackMessage message is Required!!');
    }
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
  getSingleMaintenanceQuery,
  updateSingleMaintenanceApprovedCancelByLandlordQuery,
  deletedMaintenanceQuery,
};
