import catchAsync from '../../utils/catchAsync';
import sendResponse from '../../utils/sendResponse';
import httpStatus from 'http-status';
import AppError from '../../error/AppError';
import { invitePeopleService } from './invitePeople.service';
import { query } from 'express';

const createInvitePeople = catchAsync(async (req, res) => {
  const invitePeopleData = req.body;
  const { userId } = req.user;
  // console.log({ userId });
  invitePeopleData.landlordUserId = userId;
 



  const result =
    await invitePeopleService.createInvitePeopleService(invitePeopleData);

  // Send response
  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: 'Invited People successfully!',
    data: result,
  });
});

const leaveRequestTenant = catchAsync(async (req, res) => {
  const { userId } = req.user;

  const result =
    await invitePeopleService.leaveRequestTenant(userId);

  // Send response
  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: 'Leave Request successfully!',
    data: result,
  });
});

const acceptleaveRequestTenant = catchAsync(async (req, res) => {
  const {id} = req.params;
  const { userId } = req.user;

  const result =
    await invitePeopleService.accpetleaveRequestByLandloard(userId, id);

  // Send response
  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: 'Accept Leave Request successfully!',
    data: result,
  });
});
const deleteTenantByLandlord = catchAsync(async (req, res) => {
  const { id } = req.params;

  const result = await invitePeopleService.deletedInvitePeopleQuery(
    id
  );

  // Send response
  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: ' Delete InvitePeople successfully!',
    data: result,
  });
});

const getAllInvitePeopleByLandlordByTenant = catchAsync(async (req, res) => {
  const userId = req.user.userId;
  const { meta, result } =
    await invitePeopleService.getAllInvitePeopleByLandlordByTenantAndTenantByLandlord(
      req.query,
      userId,
    );

  sendResponse(res, {
    success: true,
    statusCode: httpStatus.OK,
    meta: meta,
    data: result,
    message: 'All InvitePeople by Landlord are requered successful!!',
  });
});

// const getAllInvitePeopleByTenant = catchAsync(async (req, res) => {
//   const tenantUserId = req.user.userId;
//   const { meta, result } =
//     await invitePeopleService.getAllInvitePeopleByTenantUserQuery(
//       req.query,
//       tenantUserId,
//     );

//   sendResponse(res, {
//     success: true,
//     statusCode: httpStatus.OK,
//     meta: meta,
//     data: result,
//     message: ' All InvitePeople by Landlord are requered successful!!',
//   });
// });



const getSingleInvitePeople = catchAsync(async (req, res) => {
  const result = await invitePeopleService.getSingleInvitePeopleQuery(
    req.params.id,
  );

  sendResponse(res, {
    success: true,
    statusCode: httpStatus.OK,
    data: result,
    message: 'Single InvitePeople successful!!',
  });
});

const getSingleInvitePeopleByPropertyId = catchAsync(async (req, res) => {
  const result = await invitePeopleService.getSingleInvitePeopleByPropertyIdQuery(
    req.params.id,
  );

  sendResponse(res, {
    success: true,
    statusCode: httpStatus.OK,
    data: result,
    message: 'Single property InvitePeople successful!!',
  });
});


const getAllInvitePeopleByPropertyId = catchAsync(async (req, res) => {
  const result = await invitePeopleService.getAllInvitePeopleByPropertyIdQuery(
    req.params.id,
    req.query
  );

  sendResponse(res, {
    success: true,
    statusCode: httpStatus.OK,
    data: result,
    message: 'All InvitePeople by property  are requered successful!!',
  });
});


const getRuningInviteTenantDue = catchAsync(async (req, res) => {
  const { userId } = req.user;
  const result =
    await invitePeopleService.getRuningInviteTenantPropertyDeuQuery(userId);

    // console.log('result', result);

  sendResponse(res, {
    success: true,
    statusCode: httpStatus.OK,
    data:result,
    message: 'Single InvitePeople Due successful!!',
  });

  //  res.status(200).json({
  //    success: true,
  //    message: 'Single InvitePeople Due successful!!',
  //    data: result === 0 ? 0 : result,
  //  });
});
const getCurrentInvitedTenant = catchAsync(async (req, res) => {
  const { userId } = req.user;
  const result =
    await invitePeopleService.getCurrentInvitedTenant(userId);

  // console.log('result', result);

  sendResponse(res, {
    success: true,
    statusCode: httpStatus.OK,
    data:result,
    message: 'Single current InvitePeople successful!!',
  });

  
});

const getRuningOverviewLandlord = catchAsync(async (req, res) => {
  const { userId } = req.user;
  const result =
    await invitePeopleService.getRuningOverviewLandlordQuery(userId);

  sendResponse(res, {
    success: true,
    statusCode: httpStatus.OK,
    data: result,
    message: 'Landlord overview successful!!',
  });
});

const getRuningCalendarInfoByTenant = catchAsync(async (req, res) => {
  const { userId } = req.user;
  const result = await invitePeopleService.getRuningCalendarInfoByTenantQuery(userId);

  sendResponse(res, {
    success: true,
    statusCode: httpStatus.OK,
    data: result,
    message: 'Runing Calendar info by tenant successful!!',
  });
});


const getRuningCalendarInfoByLandlordQuery = catchAsync(async (req, res) => {
  const { userId } = req.user;
  const result =
    await invitePeopleService.getRuningCalendarInfoByLandlordQuery(userId);

  sendResponse(res, {
    success: true,
    statusCode: httpStatus.OK,
    data: result,
    message: 'Runing Calendar info by tenant successful!!',
  });
});


const updateSingleInvitePeopleAccept = catchAsync(async (req, res) => {
  const { userId } = req.user;
  const result = await invitePeopleService.singleInvitePeopleAcceptQuery(
    req.params.id,
    userId,
  );

  sendResponse(res, {
    success: true,
    statusCode: httpStatus.OK,
    data: result,
    message: 'Single InvitePeople accept successful!!',
  });
});

const updateSingleInvitePeopleCancel = catchAsync(async (req, res) => {
  const { userId } = req.user;
  const result = await invitePeopleService.singleInvitePeopleCancelQuery(
    req.params.id,
    userId,
  );

  sendResponse(res, {
    success: true,
    statusCode: httpStatus.OK,
    data: result,
    message: 'Single InvitePeople accept successful!!',
  });
});


const inviteRequestVerifyByLandlord = catchAsync(async (req, res) => {
  const { userId } = req.user;
  const result = await invitePeopleService.updateSingleInvitePeopleVerifyQuery(
    req.params.id,
    userId
  );

  sendResponse(res, {
    success: true,
    statusCode: httpStatus.OK,
    data: result,
    message: 'InvitePeople verify successful!!',
  });
});



const deleteSingleInvitePeople = catchAsync(async (req, res) => {
//   const { userId } = req.user;
//   const result = await InvitePeopleService.deletedInvitePeopleQuery(
//     req.params.id,
//     userId,
//   );

//   sendResponse(res, {
//     success: true,
//     statusCode: httpStatus.OK,
//     data: result,
//     message: 'Deleted Single InvitePeople are successful!!',
//   });
});

export const invitePeopleController = {
  createInvitePeople,
  leaveRequestTenant,
  acceptleaveRequestTenant,
  deleteTenantByLandlord,
  getAllInvitePeopleByLandlordByTenant,
  // getAllInvitePeopleByTenant,
  getCurrentInvitedTenant,
  getRuningInviteTenantDue,
  getRuningOverviewLandlord,
  getRuningCalendarInfoByTenant,
  getRuningCalendarInfoByLandlordQuery,
  getSingleInvitePeople,
  getSingleInvitePeopleByPropertyId,
  getAllInvitePeopleByPropertyId,
  updateSingleInvitePeopleAccept,
  updateSingleInvitePeopleCancel,
  inviteRequestVerifyByLandlord,
  deleteSingleInvitePeople,
};
