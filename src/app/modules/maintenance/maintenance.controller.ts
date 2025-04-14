import catchAsync from '../../utils/catchAsync';
import sendResponse from '../../utils/sendResponse';
import httpStatus from 'http-status';
import { maintenanceService } from './maintenance.service';

const createMaintenance = catchAsync(async (req, res) => {
  const maintenanceData = req.body;
  const { userId } = req.user;
  // console.log({ userId });
  maintenanceData.tenantUserId = userId;

  const imageFiles = req.files as {
    [fieldname: string]: Express.Multer.File[];
  };

  if (imageFiles?.images && imageFiles.images.length > 0) {
    maintenanceData.images = imageFiles.images.map((file) =>
      file.path.replace(/^public[\\/]/, ''),
    );
  }

  const result =
    await maintenanceService.createMaintenanceService(maintenanceData);

  // Send response
  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: 'Maintenance Create successfully!',
    data: result,
  });
});

const getAllMaintenanceByProperty = catchAsync(async (req, res) => {
     const propertyId: any = req.query.id;
  const { meta, result } =
    await maintenanceService.getAllMaintenanceByLandlordUserPropertyIdQuery(
      req.query,
      propertyId,
    );

  sendResponse(res, {
    success: true,
    statusCode: httpStatus.OK,
    meta: meta,
    data: result,
    message: 'All Maintenance by Landlord are requered successful!!',
  });
});


const getAllMaintenanceMessageByTenant = catchAsync(async (req, res) => {
    const {userId} = req.user;
    const propertyId:any = req.query.id;

  const { meta, result } =
    await maintenanceService.getAllMaintenanceByTenantUserIDByPropertyIdQuery(
      req.query,
      propertyId,
      userId
    );

  sendResponse(res, {
    success: true,
    statusCode: httpStatus.OK,
    meta: meta,
    data: result,
    message: 'All Maintenance by tenant are requered successful!!',
  });
});

const getSingleMaintenance = catchAsync(async (req, res) => {
  const result = await maintenanceService.getSingleMaintenanceQuery(
    req.params.id,
  );

  sendResponse(res, {
    success: true,
    statusCode: httpStatus.OK,
    data: result,
    message: 'Single Maintenance successful!!',
  });
});



const updateSingleMaintenanceIssueSolvedOrCancel = catchAsync(async (req, res) => {
  const updateData = req.body;
  const result =
    await maintenanceService.updateSingleMaintenanceApprovedCancelByLandlordQuery(
      req.params.id,
      updateData,
    );

  sendResponse(res, {
    success: true,
    statusCode: httpStatus.OK,
    data: result,
    message: 'Single Maintenance Action successful!!',
  });
});



const deleteSingleMaintenance = catchAsync(async (req, res) => {
  //   const { userId } = req.user;
  //   const result = await MaintenanceService.deletedMaintenanceQuery(
  //     req.params.id,
  //     userId,
  //   );
  //   sendResponse(res, {
  //     success: true,
  //     statusCode: httpStatus.OK,
  //     data: result,
  //     message: 'Deleted Single Maintenance are successful!!',
  //   });
});

export const maintenanceController = {
  createMaintenance,
  getAllMaintenanceByProperty,
  getAllMaintenanceMessageByTenant,
  getSingleMaintenance,
  updateSingleMaintenanceIssueSolvedOrCancel,
  deleteSingleMaintenance,
};
