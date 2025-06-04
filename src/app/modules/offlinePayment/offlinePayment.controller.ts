import httpStatus from 'http-status';
import catchAsync from '../../utils/catchAsync';
import sendResponse from '../../utils/sendResponse';
import { offlinePaymentService } from './offlinePayment.service';

const createOfflinePayment = catchAsync(async (req, res) => {
  const offlinePaymentData = req.body;
  const { userId } = req.user;
  offlinePaymentData.tenantUserId = userId;
  offlinePaymentData.amount = Number(offlinePaymentData.amount);

  const imageFiles = req.files as {
    [fieldname: string]: Express.Multer.File[];
  };

  if (imageFiles?.images && imageFiles.images.length > 0) {
    offlinePaymentData.images = imageFiles.images.map((file) =>
      file.path.replace(/^public[\\/]/, ''),
    );
  }

  const result =
    await offlinePaymentService.createOfflinePaymentService(offlinePaymentData);

  // Send response
  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: 'OfflinePayment Create successfully!',
    data: result,
  });
});

const getAllOfflinePaymentByLandlordUserByPropertyId = catchAsync(
  async (req, res) => {
    const { userId } = req.user;
    const { meta, result } =
      await offlinePaymentService.getAllOfflinePaymentByLandlordUserByPropertyIdQuery(
        req.query,
        userId,
      );

    sendResponse(res, {
      success: true,
      statusCode: httpStatus.OK,
      meta: meta,
      data: result,
      message: 'All OfflinePayment are requered successful!!',
    });
  },
);

const getAllOfflinePaymentCurrentReceptBytenTenant = catchAsync(
  async (req, res) => {
    const { userId } = req.user;
    const result =
      await offlinePaymentService.getAllOfflinePaymentReceptByTenTenantQuery(
        userId,
      );

    sendResponse(res, {
      success: true,
      statusCode: httpStatus.OK,
      data: result,
      message: 'All OfflinePayment Recept are requered successful!!',
    });
  },
);

const getSingleOfflinePayment = catchAsync(async (req, res) => {
  const result = await offlinePaymentService.getSingleOfflinePaymentQuery(
    req.params.id,
  );
  console.log('result', result);

  sendResponse(res, {
    success: true,
    statusCode: httpStatus.OK,
    data: result,
    message: 'Single OfflinePayment successful!!',
  });
});

const getSingleOfflinePaymentRequestAccept = catchAsync(async (req, res) => {
  const { userId } = req.user;
  const result = await offlinePaymentService.singleOfflinePaymentAcceptQuery(
    req.params.id,
    userId,
  );

  sendResponse(res, {
    success: true,
    statusCode: httpStatus.OK,
    data: result,
    message: 'Single OfflinePayment Request Accept successful!!',
  });
});

export const OfflinePaymentController = {
  createOfflinePayment,
  getAllOfflinePaymentByLandlordUserByPropertyId,
  getAllOfflinePaymentCurrentReceptBytenTenant,
  getSingleOfflinePayment,
  getSingleOfflinePaymentRequestAccept,
};
