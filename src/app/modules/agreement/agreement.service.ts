import AppError from '../../error/AppError';
import mongoose from 'mongoose';
import QueryBuilder from '../../builder/QueryBuilder';
import { User } from '../user/user.models';
import { TAgreement } from './agreement.interface';
import InvitePeople from '../invitePeople/invitePeople.model';
import Agreement from './agreement.model';
import { appendFile } from 'fs';

const createAgreementService = async (payload: TAgreement) => {
  const landlordUser = await User.findById(payload.landlordUserId);
  if (!landlordUser) {
    throw new AppError(404, 'Landlord User Not Found!!');
  }
  const invitePeople = await InvitePeople.findById(payload.invitePeopleId);
  if (!invitePeople) {
    throw new AppError(404, 'Invite People Not Found!!');
  }

  if (invitePeople.status !== "invited") {
    throw new AppError(404, 'Invite People is Not Valid!!');
  }

  const agreement = await Agreement.findOne({ invitePeopleId : payload.invitePeopleId});

  if (agreement) {
    throw new AppError(403, 'Lease Agreement is already Exist!!');
  }


  const result = await Agreement.create(payload);

  if (!result) {
    throw new AppError(403, 'Agreement create is faild!!');
  }
  return result;
};

const getAllAgreementByLandlordUserQuery = async (
  query: Record<string, unknown>,
  landlordUserId: string,
) => {
  const AgreementQuery = new QueryBuilder(
    Agreement.find({
      landlordUserId,
      //   isDeleted: false,
    })
      .populate('invitePeopleId'),
    query,
  )
    .search([''])
    .filter()
    .sort()
    .paginate()
    .fields();

  const result = await AgreementQuery.modelQuery;
  const meta = await AgreementQuery.countTotal();
  return { meta, result };
};



const getSingleAgreementQuery = async (id: string) => {
  const agreement = await Agreement.findById(id);
  if (!agreement) {
    throw new AppError(404, 'Agreement Not Found!!');
  }
  const result = await Agreement.findById(id)
    .populate('invitePeopleId')

  if (!Agreement) {
    throw new AppError(404, 'Agreement Not Found!!');
  }

  return result;
};


const getSingleAgreementByInvitedPeopleQuery = async (id: string) => {
  const invited = await InvitePeople.findById(id);
  if (!invited) {
    throw new AppError(404, 'Invited people is Not Found!!');
  }

  const agreement = await Agreement.findOne({ invitePeopleId :id});
   if (!agreement) {
     throw new AppError(404, 'Agreement Not Found!!');
   }

  return agreement;
};


const getSingleAgreementStatusByInvitedPeopleQuery = async (id: string) => {
  const invited = await InvitePeople.findById(id);
  if (!invited) {
    throw new AppError(404, 'Invited people is Not Found!!');
  }

  const agreement = await Agreement.findOne({ invitePeopleId: id });


  return agreement
    ? { status: 'Provided', endDate: agreement.endDate }
    : { status: 'Not Provided', endDate: null };
};



const updateSingleAgreementExtentRequestQuery = async (id: string, payload:any) => {
  if (!id) {
    throw new AppError(400, 'Invalid input parameters');
  }

  const isExist = await Agreement.findById(id);
  if (!isExist) {
    throw new AppError(404, 'Agreement not found!');
  }

  payload.extentStartDate = isExist.endDate;
  console.log('payload', payload);

  const result = await Agreement.findByIdAndUpdate(
    id,
    { ...payload, extentStatus: 'extend_date_requiest' },
    { new: true, runValidators: true },
  );
  if (!result) {
    throw new AppError(404, 'Agreement Deleted Faild!!');
  }

  return result;
};


const updateSingleAgreementExtentRequestApprovedQuery = async (id: string, status:string) => {
  if (!id) {
    throw new AppError(400, 'Invalid input parameters');
  }

  const isExist = await Agreement.findById(id);
  if (!isExist) {
    throw new AppError(404, 'Agreement not found!');
  }

  if (isExist.extentStatus !== 'extend_date_requiest') {
    throw new AppError(
      403,
      'Agreement is not in the "extend_time_request" state. Please update the agreement status before sending to the tenant.',
    );
  }
console.log('status===', status);

 if (status !== 'approved_requiest' && status !== 'canceled_requiest') {
   throw new AppError(403, 'Your sending status is not valid!!');
 }


  let result;

  if (status === 'approved_requiest') {

    const updateData = {
      endDate:isExist.extentEndDate,
      extentStartDate: null,
      extentEndDate: null,
      extentStatus:"approved_requiest"
    };

     result = await Agreement.findByIdAndUpdate(
      id,
      updateData,
      { new: true, runValidators: true },
    );

     if (!result) {
       throw new AppError(404, 'Agreement Deleted Faild!!');
     }


  }else if (status === 'canceled_requiest') {
    const updateData = {
      extentStartDate: null,
      extentEndDate: null,
      extentStatus: 'canceled_requiest',
    };

     result = await Agreement.findByIdAndUpdate(
      id,
      updateData,
      { new: true, runValidators: true },
    );

    if (!result) {
      throw new AppError(404, 'Agreement Deleted Faild!!');
    }
  }


  return result;
};

const deletedAgreementQuery = async (id: string, userId: string) => {
  //   if (!id || !userId) {
  //     throw new AppError(400, 'Invalid input parameters');
  //   }
  //   const isExist = await Agreement.findById(id);
  //   if (!isExist) {
  //     throw new AppError(404, 'Agreement not found!');
  //   }
  //   const userExist = await User.findById(userId);
  //   if (!userExist) {
  //     throw new AppError(404, 'User not found!');
  //   }
  // if (userExist.role !== 'tenant' && userExist.role !== 'landlord') {
  //   throw new AppError(403, 'You are not authorized to delete this!');
  // }
  //   const varifyLandlord = await Agreement.findOne({
  //     _id: id,
  //     cancelStatus: 'conform',
  //   });
  //   if (!varifyLandlord) {
  //     throw new AppError(404, 'You can not deleted it!!');
  //   }
  //   const result = await Agreement.findByIdAndUpdate(
  //     id,
  //     {
  //       isDeleted: true,
  //     },
  //     { new: true },
  //   );
  //   if (!result) {
  //     throw new AppError(404, 'Agreement Deleted Faild!!');
  //   }
  //   return result;
};

export const agreementService = {
  createAgreementService,
  getAllAgreementByLandlordUserQuery,
  getSingleAgreementQuery,
  getSingleAgreementByInvitedPeopleQuery,
  getSingleAgreementStatusByInvitedPeopleQuery,
  updateSingleAgreementExtentRequestQuery,
  updateSingleAgreementExtentRequestApprovedQuery,
  deletedAgreementQuery,
};
