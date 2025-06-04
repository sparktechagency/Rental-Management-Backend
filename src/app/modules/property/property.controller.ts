import catchAsync from '../../utils/catchAsync';
import sendResponse from '../../utils/sendResponse';
import httpStatus from 'http-status';
import Property from './property.model';
import AppError from '../../error/AppError';
import { propertyService } from './property.service';

const createProperty = catchAsync(async (req, res) => {
  const propertyData = req.body;
  const { userId } = req.user;
  // console.log({ userId });
  propertyData.landlordUserId = userId;
  const imageFiles = req.files as {
    [fieldname: string]: Express.Multer.File[];
  };

  if (imageFiles?.images && imageFiles.images.length > 0) {
    propertyData.images = imageFiles.images.map((file) =>
      file.path.replace(/^public[\\/]/, ''),
    );
  }

  if (imageFiles?.propertyFiles && imageFiles.propertyFiles.length > 0) {
    propertyData.propertyFiles = imageFiles.propertyFiles.map((file) =>
      file.path.replace(/^public[\\/]/, ''),
    );
  }

  const result = await propertyService.createPropertyService(propertyData);

  // Send response
  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: 'Property added successfully!',
    data: result,
  });
});

const getAllPropertyByLandlord = catchAsync(async (req, res) => {
  const landlordUserId = req.user.userId;
  const { meta, result } = await propertyService.getAllPropertyByLandlordUserQuery(
    req.query,
   landlordUserId
  );

  sendResponse(res, {
    success: true,
    statusCode: httpStatus.OK,
    meta: meta,
    data: result,
    message: ' All Property by Landlord are requered successful!!',
  });
});

// const getAllPropertyByTenant = catchAsync(async (req, res) => {
//   const tenantUserId= req.user.userId;
//   const { meta, result } =
//     await propertyService.getAllPropertyByTenantUserQuery(
//       req.query,
//       tenantUserId,
//     );

//   sendResponse(res, {
//     success: true,
//     statusCode: httpStatus.OK,
//     meta: meta,
//     data: result,
//     message: ' All Property by Landlord are requered successful!!',
//   });
// });


const getAllPropertyByAdmin = catchAsync(async (req, res) => {
  const { meta, result } = await propertyService.getAllPropertyByAdminQuery(
    req.query,
  );

  sendResponse(res, {
    success: true,
    statusCode: httpStatus.OK,
    meta: meta,
    data: result,
    message: ' All Property by Landlord are requered successful!!',
  });
});

const getSingleProperty = catchAsync(async (req, res) => {
  const result = await propertyService.getSinglePropertyQuery(req.params.id);

  sendResponse(res, {
    success: true,
    statusCode: httpStatus.OK,
    data: result,
    message: 'Single Property are requered successful!!',
  });
});

const updateSingleProperty = catchAsync(async (req, res) => {
      const { id } = req.params;
      const updateData = req.body;
      let remainingImageUrl = updateData?.remainingImageUrl || null;
      let remainingFilesUrl = updateData?.remainingFilesUrl || null;
  if (remainingImageUrl && typeof remainingImageUrl === 'string') {
    remainingImageUrl = [remainingImageUrl]; 
  }
  if (remainingFilesUrl && typeof remainingFilesUrl === 'string') {
    remainingFilesUrl = [remainingFilesUrl]; 
  }


      const imageFiles = req.files as {
        [fieldname: string]: Express.Multer.File[];
      };
      if (imageFiles?.images && imageFiles.images.length > 0) {
        updateData.images = imageFiles.images.map((file) =>
          file.path.replace(/^public[\\/]/, ''),
        );
      }
      console.log('file property', imageFiles);
      console.log('file property', imageFiles.propertyFiles);
     if (imageFiles?.propertyFiles && imageFiles.propertyFiles.length > 0) {
       updateData.propertyFiles = imageFiles.propertyFiles.map((file) =>
         file.path.replace(/^public[\\/]/, ''),
       );
     }

     console.log('updateData', updateData);

      if (remainingImageUrl) {
        if (!updateData.images) {
          updateData.images = [];
        }
        updateData.images = [...updateData.images, ...remainingImageUrl];
      }

      if (updateData.images && !remainingImageUrl) {
        updateData.images = [...updateData.images];
      }

      if (remainingFilesUrl) {
        if (!updateData.propertyFiles) {
          updateData.propertyFiles = [];
        }
        updateData.propertyFiles = [
          ...updateData.propertyFiles,
          ...remainingFilesUrl,
        ];
      }

      if (updateData.propertyFiles && !remainingFilesUrl) {
        updateData.propertyFiles = [...updateData.propertyFiles];
      }


console.log('updateData==', updateData);

  const result = await propertyService.updatePropertyQuery(
    id,
    updateData,
  );

  // Send response
  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: 'Property updated successfully!',
    data: result,
  });
});

const updateSinglePropertyVerify = catchAsync(async (req, res) => {
  const result = await propertyService.updateSinglePropertyVerifyQuery(
    req.params.id,
  );

  sendResponse(res, {
    success: true,
    statusCode: httpStatus.OK,
    data: result,
    message: 'Single Property are verified successful!!',
  });
});


const deleteSingleProperty = catchAsync(async (req, res) => {
  const { userId } = req.user;
  const result = await propertyService.deletedPropertyQuery(
    req.params.id,
    userId,
  );

  sendResponse(res, {
    success: true,
    statusCode: httpStatus.OK,
    data: result,
    message: 'Deleted Single Property are successful!!',
  });
});

export const propertyController = {
  createProperty,
  getAllPropertyByAdmin,
  getAllPropertyByLandlord,
  // getAllPropertyByTenant,
  getSingleProperty,
  updateSingleProperty,
  updateSinglePropertyVerify,
  deleteSingleProperty,
};
