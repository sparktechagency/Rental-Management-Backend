import mongoose from "mongoose";
import QueryBuilder from "../../builder/QueryBuilder";
import AppError from "../../error/AppError";
import Property from "../property/property.model";
import { User } from "../user/user.models";
import { TDuePayment } from "./rentDue.interface";
import DuePayment from "./rentDue.model";


const createDuePaymentService = async (payload: TDuePayment, session?: any) => {
  // Ensure session is created using mongoose.startSession
  const mongoSession = session || (await mongoose.startSession());

  try {
    if (!session) {
      console.log('Starting transaction...');
      await mongoSession.startTransaction();
    }

    const landlordUser = await User.findById(payload.landlordUserId).session(
      mongoSession,
    );
    if (!landlordUser) {
      throw new AppError(404, 'Landlord User Not Found!!');
    }

    const property: any = await Property.findById(payload.propertyId).session(
      mongoSession,
    );
    if (!property) {
      throw new AppError(404, 'Property Not Found!!');
    }

    if (!property.landlordUserId.equals(payload.landlordUserId)) {
      throw new AppError(404, 'This property is not yours!!');
    }

    const tenantUser = await User.findById(payload.tenantUserId).session(
      mongoSession,
    );
    if (!tenantUser) {
      throw new AppError(404, 'Tenant User Not Found!!');
    }

    const result = await DuePayment.create([payload], {
      session: mongoSession,
    });

    if (!result) {
      throw new AppError(403, 'Due Payment creation failed!!');
    }

    if (!session) {
      console.log('Committing transaction...');
      await mongoSession.commitTransaction();
    }

    return result;
  } catch (error) {
    if (!session) {
      console.log('Aborting transaction...');
      await mongoSession.abortTransaction();
    }
    throw error;
  } finally {
    if (!session) {
      console.log('Ending session...');
      mongoSession.endSession();
    }
  }
};



const getAllDuePaymentByLandlordUserByPropertyIdQuery = async (
  query: Record<string, unknown>,
  userId: string,
) => {
  const user = await User.findById(userId);
  if (!user) {
    throw new AppError(404, 'User Not Found!!');
  }

  const userField = user.role === 'tenant' ? 'tenantUserId' : 'landlordUserId';

  const duePaymentQuery = new QueryBuilder(
    DuePayment.find({
      [userField]: userId,
    }),
    query,
  )
    .search([''])
    .filter()
    .sort()
    .paginate()
    .fields();

  const result = await duePaymentQuery.modelQuery;
  const meta = await duePaymentQuery.countTotal();
  return { meta, result };
};

const getSingleDuePaymentQuery = async (id: string) => {
  const duePayment = await DuePayment.findById(id);
  if (!duePayment) {
    throw new AppError(404, 'DuePayment Not Found!!');
  }

  return duePayment;
};



export const duePaymentService = {
  createDuePaymentService,
  getAllDuePaymentByLandlordUserByPropertyIdQuery,
  getSingleDuePaymentQuery,
};
