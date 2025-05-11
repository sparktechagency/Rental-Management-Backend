import AppError from '../../error/AppError';
import httpStatus from 'http-status';
import mongoose from 'mongoose';
import QueryBuilder from '../../builder/QueryBuilder';
import { User } from '../user/user.models';
import { StripeAccount } from '../stripeAccount/stripeAccount.model';
import { TProperty } from './property.interface';
import Property from './property.model';
import { access } from 'fs/promises';
import { unlink } from 'fs/promises';
import { stripe } from '../payment/payment.service';
import { sendEmail } from '../../utils/mailSender';

const createPropertyService = async (payload: TProperty) => {
  const landlordUser = await User.findById(payload.landlordUserId);
  if (!landlordUser) {
    throw new AppError(404, 'Landlord User Not Found!!');
  }

  const isStripeConnectedAccount = await StripeAccount.findOne({
    userId: payload.landlordUserId,
  });

  if (!isStripeConnectedAccount) {
    throw new AppError(404, 'Stripe Connected Account Not Found!!');
  }

  if (isStripeConnectedAccount.isCompleted === false) {
    throw new AppError(
      404,
      'Stripe Connected Account Not Valid or incompleted. Please again create account!!',
    );
  }

  const account = await stripe.accounts.retrieve(
    isStripeConnectedAccount.accountId,
  );
  if (!account.payouts_enabled) {
    throw new AppError(
      httpStatus.BAD_REQUEST,
      'Payouts are not enabled for this account',
    );
  }


//  try {
//    // Fetch the list of external accounts (specifically cards) for the connected account
//    const externalAccounts = await stripe.accounts.listExternalAccounts(
//      isStripeConnectedAccount.accountId,
//     //  { object: 'card' }, // Filter for 'card' only
//    );
//    console.log('externalAccounts==', externalAccounts);

//    if (externalAccounts.data.length === 0) {
//      // Throw an error immediately if no cards are linked
//      throw new AppError(
//        httpStatus.BAD_REQUEST,
//        'No cards linked to this connected account!!',
//      );
//    } 
//  } catch (error) {
//    console.error('Error retrieving external accounts (cards):', error);
//    throw new AppError(
//      httpStatus.INTERNAL_SERVER_ERROR,
//      'Error retrieving cards linked to the connected account',
//    );
//  }


console.log('property peyload==', payload)

  const result = await Property.create(payload);

  if (!result) {
    const imagePaths = payload.images.map((image: string) => `public/${image}`);
    const filesPaths = payload.propertyFiles.map(
      (file: string) => `public/${file}`,
    );

    console.log('imagePaths', imagePaths);
    console.log('filesPaths', filesPaths);

    try {
      await Promise.all(
        imagePaths.map(async (imagePath) => {
          try {
            await access(imagePath);
            await unlink(imagePath);
          } catch (error: any) {
            console.error(
              `Error handling image at ${imagePath}:`,
              error.message,
            );
          }
        }),
      );

      await Promise.all(
        filesPaths.map(async (filePath) => {
          try {
            await access(filePath);
            await unlink(filePath);
          } catch (error: any) {
            console.error(`Error handling file at ${filePath}:`, error.message);
          }
        }),
      );
    } catch (error: any) {
      console.error('Error deleting files or images:', error.message);
    }
  }

  

  return result;
};

const getAllPropertyByLandlordUserQuery = async (
  query: Record<string, unknown>,
  landlordUserId: string,
) => {
  const PropertyQuery = new QueryBuilder(
    Property.find({
      landlordUserId,
      isDeleted: false,
    }).populate('landlordUserId'),
    query,
  )
    .search([''])
    .filter()
    .sort()
    .paginate()
    .fields();

  const result = await PropertyQuery.modelQuery;
  const meta = await PropertyQuery.countTotal();
  return { meta, result };
};


// const getAllPropertyByTenantUserQuery = async (
//   query: Record<string, unknown>,
//   tenantUserId: string,
// ) => {
//   const PropertyQuery = new QueryBuilder(
//     Property.find({
//       tenantUserId,
//       isDeleted: false,
//     }).populate('tenantUserId'),
//     query,
//   )
//     .search([''])
//     .filter()
//     .sort()
//     .paginate()
//     .fields();

//   const result = await PropertyQuery.modelQuery;
//   const meta = await PropertyQuery.countTotal();
//   return { meta, result };
// };

const getAllPropertyByAdminQuery = async (query: Record<string, unknown>) => {
  const PropertyQuery = new QueryBuilder(
    Property.find({ isDeleted: false }).populate('landlordUserId'),
    query,
  )
    .search([''])
    .filter()
    .sort()
    .paginate()
    .fields();

  const result = await PropertyQuery.modelQuery;
  const meta = await PropertyQuery.countTotal();
  return { meta, result };
};



const getSinglePropertyQuery = async (id: string) => {
  const property = await Property.findById(id).populate('landlordUserId');
  if (!property) {
    throw new AppError(404, 'Property Not Found!!');
  }
  // const result = await Property.aggregate([
  //   { $match: { _id: new mongoose.Types.ObjectId(id) } },
  // ]);

  // if (result.length === 0) {
  //   throw new AppError(404, 'Property not found!');
  // }

  return property;
};

const updatePropertyQuery = async (id: string, payload: Partial<TProperty>) => {
  if (!id) {
    throw new AppError(400, 'Invalid input parameters');
  }
  const property: any = await Property.findById(id);
  if (!property) {
    throw new AppError(404, 'Property Not Found!!');
  }

  const oldImages = property.images || [];
  const oldPropertyFiles = property.propertyFiles || [];
  const { remainingImageUrl, remainingFilesUrl, ...rest }: any = payload;
  console.log('rest==', rest);

  const result = await Property.findByIdAndUpdate(
    id,
    { ...rest },
    { new: true },
  );

  if (!result) {
    throw new AppError(403, 'Product updated faield !!');
  }

  const newImages = result.images || [];
  const newFiles = result.propertyFiles || [];
  const imagesToDelete = oldImages.filter(
    (oldImage: string) => !newImages.includes(oldImage),
  );
  const filesToDelete = oldPropertyFiles.filter(
    (oldFile: string) => !newFiles.includes(oldFile),
  );
  console.log('imagesToDelete==', imagesToDelete);

  if (imagesToDelete.length > 0) {
    for (const image of imagesToDelete) {
      const imagePath = `public/${image}`;
      try {
        await access(imagePath);
        await unlink(imagePath);
        console.log(`Deleted image: ${imagePath}`);
      } catch (error: any) {
        console.error(`Error handling file at ${imagePath}:`, error.message);
      }
    }
  }

  if (filesToDelete.length > 0) {
    for (const file of filesToDelete) {
      const filePath = `public/${file}`;
      try {
        await access(filePath);
        await unlink(filePath);
        console.log(`Deleted image: ${filePath}`);
      } catch (error: any) {
        console.error(`Error handling file at ${filePath}:`, error.message);
      }
    }
  }

  if (!result) {
    throw new AppError(404, 'Property Not Found or Unauthorized Access!');
  }
  return result;
};

const updateSinglePropertyVerifyQuery = async (id: string) => {
  if (!id) {
    throw new AppError(400, 'Invalid input parameters');
  }

  const isExist = await Property.findById(id);
  if (!isExist) {
    throw new AppError(404, 'Property not found!');
  }

  const result = await Property.findByIdAndUpdate(
    id,
    {
      status: 'verified',
    },
    { new: true },
  );
  if (!result) {
    throw new AppError(404, 'Property Deleted Faild!!');
  }

  const LandlordUserExist:any = await User.findById(result.landlordUserId);


  if (result.status === 'verified') {
    // Send verification email to the landlord
    sendEmail(
      LandlordUserExist.email,
      'Property Verified Successfully From Admin',
      `
        <html>  
          <body>
            <h2>Dear Landlord,</h2>
            
            <p>We are pleased to inform you that your property has been successfully verified by our administration team. We appreciate your patience throughout this process and are excited to have your property featured on our platform.</p>
            
            <p><strong>Property Name:</strong> ${result.name}</p>
            <p><strong>Property Status:</strong> Verified</p>
            
            <p>If you have any further questions or need assistance, please don't hesitate to reach out to our support team.</p>
            
            <p>Thank you for trusting us with your property. We look forward to continuing our partnership with you.</p>
            
            <p>Best regards,</p>
            <p><strong>The Admin Team</strong></p>
            <p><em>Your Company Name</em></p>
          </body>
        </html>
      `,
    );
  }

  return result;
};

const deletedPropertyQuery = async (id: string, landlordUserId: string) => {
  if (!id || !landlordUserId) {
    throw new AppError(400, 'Invalid input parameters');
  }

  const isExist = await Property.findById(id);
  if (!isExist) {
    throw new AppError(404, 'Property not found!');
  }

  const LandlordUserExist = await User.findById(landlordUserId);
  if (!LandlordUserExist) {
    throw new AppError(404, 'Landlord user not found!');
  }

  const varifyLandlord = await Property.findOne({
    _id: id,
    landlordUserId: landlordUserId,
  });
  if (!varifyLandlord) {
    throw new AppError(404, 'You are not valid property creator!!');
  }

  const result = await Property.findByIdAndUpdate(
    id,
    {
      isDeleted: true,
    },
    { new: true },
  );
  if (!result) {
    throw new AppError(404, 'Property Deleted Faild!!');
  }

  return result;
};

export const propertyService = {
  createPropertyService,
  getAllPropertyByAdminQuery,
  getAllPropertyByLandlordUserQuery,
  // getAllPropertyByTenantUserQuery,
  getSinglePropertyQuery,
  updatePropertyQuery,
  updateSinglePropertyVerifyQuery,
  deletedPropertyQuery,
};
