import catchAsync from '../../utils/catchAsync';
import sendResponse from '../../utils/sendResponse';
import httpStatus from 'http-status';
import { agreementService } from './agreement.service';

const createAgreement = catchAsync(async (req, res) => {
  const agreementData = req.body;
  const { userId } = req.user;
  // console.log({ userId });
  agreementData.landlordUserId = userId;
  agreementData.rentAmount = Number(agreementData.rentAmount);

   const imageFiles = req.files as {
     [fieldname: string]: Express.Multer.File[];
   };

   if (imageFiles?.images && imageFiles.images.length > 0) {
     agreementData.images = imageFiles.images.map((file) =>
       file.path.replace(/^public[\\/]/, ''),
     );
   }

  const result = await agreementService.createAgreementService(agreementData);

  // Send response
  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: 'Agreement Create successfully!',
    data: result,
  });
});


const getAllAgreementByLandlord = catchAsync(async (req, res) => {
  const landlordUserId = req.user.userId;
  const { meta, result } =
    await agreementService.getAllAgreementByLandlordUserQuery(
      req.query,
      landlordUserId,
    );

  sendResponse(res, {
    success: true,
    statusCode: httpStatus.OK,
    meta: meta,
    data: result,
    message: 'All Agreement by Landlord are requered successful!!',
  });
});


const getSingleAgreement = catchAsync(async (req, res) => {
  const result = await agreementService.getSingleAgreementQuery(req.params.id);

  sendResponse(res, {
    success: true,
    statusCode: httpStatus.OK,
    data: result,
    message: 'Single Agreement successful!!',
  });
});

const getSingleAgreementByInvitedPeople = catchAsync(async (req, res) => {

  const result = await agreementService.getSingleAgreementByInvitedPeopleQuery(req.params.id);

  sendResponse(res, {
    success: true,
    statusCode: httpStatus.OK,
    data: result,
    message: 'Single get Agreement by invited People successful!!',
  });
});


const getSingleAgreementStatusByInvitedPeople = catchAsync(async (req, res) => {
  const result =
    await agreementService.getSingleAgreementStatusByInvitedPeopleQuery(
      req.params.id,
    );

  sendResponse(res, {
    success: true,
    statusCode: httpStatus.OK,
    data: result,
    message: 'Single get Agreement status successful!!',
  });
});

const updateSingleAgreementExtentRequest = catchAsync(async (req, res) => {
    const updateData = req.body;
  const result = await agreementService.updateSingleAgreementExtentRequestQuery(
    req.params.id,
    updateData,
  );

  sendResponse(res, {
    success: true,
    statusCode: httpStatus.OK,
    data: result,
    message: 'Single Agreement Extent Request successful!!',
  });
});


const updateSingleAgreementExtentRequestApproved = catchAsync(async (req, res) => {
    const status:any = req.query.status;
  const result =
    await agreementService.updateSingleAgreementExtentRequestApprovedQuery(
      req.params.id,
      status,
    );

  sendResponse(res, {
    success: true,
    statusCode: httpStatus.OK,
    data: result,
    message: `Single Agreement Extent ${result && result.extentStatus === 'approved_requiest' ? 'Request Approved' : 'Request Canceled'} successful!!`,
  });
});



const deleteSingleAgreement = catchAsync(async (req, res) => {
  //   const { userId } = req.user;
  //   const result = await agreementService.deletedAgreementQuery(
  //     req.params.id,
  //     userId,
  //   );
  //   sendResponse(res, {
  //     success: true,
  //     statusCode: httpStatus.OK,
  //     data: result,
  //     message: 'Deleted Single Agreement are successful!!',
  //   });
});

export const agreementController = {
  createAgreement,
  getAllAgreementByLandlord,
  getSingleAgreement,
  getSingleAgreementByInvitedPeople,
  getSingleAgreementStatusByInvitedPeople,
  updateSingleAgreementExtentRequest,
  updateSingleAgreementExtentRequestApproved,
  deleteSingleAgreement,
};
