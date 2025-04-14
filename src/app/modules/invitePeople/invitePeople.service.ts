import AppError from '../../error/AppError';
import mongoose from 'mongoose';
import QueryBuilder from '../../builder/QueryBuilder';
import { User } from '../user/user.models';
import { TInvitePeople } from './invitePeople.interface';
import Property from '../property/property.model';
import InvitePeople from './invitePeople.model';

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
    landlordUserId: payload.landlordUserId,
  });
  if (tenantAllReadyInvited) {
    console.log('tenantAllReadyInvited=', tenantAllReadyInvited);

    if (
      (tenantAllReadyInvited.status === 'invited' ||
        tenantAllReadyInvited.status === 'invite_request' ||
        tenantAllReadyInvited.status === 'request_accept_verify') &&
      tenantAllReadyInvited.cancelStatus !== 'conform'
    ) {
      throw new AppError(404, 'Tenant is already invited!!');
    }
  }
  const result = await InvitePeople.create(payload);

  if (!result) {
    throw new AppError(403, 'InvitePeople create is faild!!');
  }
  return result;
};

const getAllInvitePeopleByLandlordUserQuery = async (
  query: Record<string, unknown>,
  landlordUserId: string,
) => {
  const invitePeopleQuery = new QueryBuilder(
    InvitePeople.find({
      landlordUserId,
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

const getAllInvitePeopleByTenantUserQuery = async (
  query: Record<string, unknown>,
  tenantUserId: string,
) => {
  const InvitePeopleQuery = new QueryBuilder(
    InvitePeople.find({
      tenantUserId,
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

  const result = await InvitePeopleQuery.modelQuery;
  const meta = await InvitePeopleQuery.countTotal();
  return { meta, result };
};

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

const getSingleInvitePeopleAcceptQuery = async (id: string) => {
  if (!id) {
    throw new AppError(400, 'Invalid input parameters');
  }

  const isExist = await InvitePeople.findById(id);
  if (!isExist) {
    throw new AppError(404, 'InvitePeople not found!');
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

  return result;
};

const updateSingleInvitePeopleVerifyQuery = async (id: string) => {
  if (!id) {
    throw new AppError(400, 'Invalid input parameters');
  }

  const isExist = await InvitePeople.findById(id);
  if (!isExist) {
    throw new AppError(404, 'InvitePeople not found!');
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
  getAllInvitePeopleByLandlordUserQuery,
  getAllInvitePeopleByTenantUserQuery,
  getSingleInvitePeopleQuery,
  updateSingleInvitePeopleVerifyQuery,
  getSingleInvitePeopleAcceptQuery,
  deletedInvitePeopleQuery,
};
