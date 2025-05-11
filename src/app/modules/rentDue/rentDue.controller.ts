import httpStatus from 'http-status';
import catchAsync from '../../utils/catchAsync';
import sendResponse from '../../utils/sendResponse';
import { duePaymentService } from './rentDue.service';

const createDuePayment = catchAsync(async (req, res) => {
  const duePaymentData = req.body;
  const { userId } = req.user;
  duePaymentData.tenantUserId = userId;
  duePaymentData.amount = Number(duePaymentData.amount);


  const result =
    await duePaymentService.createDuePaymentService(duePaymentData);

  // Send response
  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: 'DuePayment Create successfully!',
    data: result,
  });
});

const getAllDuePaymentByLandlordUserByPropertyId = catchAsync(
  async (req, res) => {
    const { userId } = req.user;
    const { meta, result } =
      await duePaymentService.getAllDuePaymentByLandlordUserByPropertyIdQuery(
        req.query,
        userId,
      );

    sendResponse(res, {
      success: true,
      statusCode: httpStatus.OK,
      meta: meta,
      data: result,
      message: 'All DuePayment are requered successful!!',
    });
  },
);

const getSingleDuePayment = catchAsync(async (req, res) => {
  const result = await duePaymentService.getSingleDuePaymentQuery(
    req.params.id,
  );
  console.log('result', result);

  sendResponse(res, {
    success: true,
    statusCode: httpStatus.OK,
    data: result,
    message: 'Single DuePayment successful!!',
  });
});



export const duePaymentController = {
  createDuePayment,
  getAllDuePaymentByLandlordUserByPropertyId,
  getSingleDuePayment,
};
