import catchAsync from '../../utils/catchAsync';
import sendResponse from '../../utils/sendResponse';
import httpStatus from 'http-status';
import { announcementService } from './announcements.service';

const createAnnouncement = catchAsync(async (req, res) => {
  const announcementData = req.body;
  const { userId } = req.user;
announcementData.landlordUserId = userId;
 

  const result =
    await announcementService.createAnnouncementService(announcementData);

  // Send response
  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: 'Announcement Create successfully!',
    data: result,
  });
});

const getAllAnnouncementByLandlordByall = catchAsync(async (req, res) => {
  const { userId } = req.user;
  const { meta, result } =
    await announcementService.getAllAnnouncementByLandlordUserQuery(
      req.query,
      userId,
    );

  sendResponse(res, {
    success: true,
    statusCode: httpStatus.OK,
    meta: meta,
    data: result,
    message: 'All Announcement by Landlord are requered successful!!',
  });
});

const getAllAnnouncementByLandlord = catchAsync(async (req, res) => {
  const propertyId = req.query.propertyId as string;
  const { meta, result } =
    await announcementService.getAllAnnouncementByLandlordUserByPropertyIdQuery(
      req.query,
      propertyId,
    );

  sendResponse(res, {
    success: true,
    statusCode: httpStatus.OK,
    meta: meta,
    data: result,
    message: 'All Announcement by Landlord are requered successful!!',
  });
});

const getSingleAnnouncement = catchAsync(async (req, res) => {
  const result = await announcementService.getSingleAnnouncementQuery(
    req.params.id,
  );

  sendResponse(res, {
    success: true,
    statusCode: httpStatus.OK,
    data: result,
    message: 'Single Announcement successful!!',
  });
});

const getSingleAnnouncementDeleted = catchAsync(async (req, res) => {
  const { userId } = req.user;
  const result = await announcementService.getSingleAnnouncementDeletedQuery(
    req.params.id,
    userId,
  );

  sendResponse(res, {
    success: true,
    statusCode: httpStatus.OK,
    data: result,
    message: 'Single Announcement deleted successful!!',
  });
});


export const announcementController = {
  createAnnouncement,
  getAllAnnouncementByLandlordByall,
  getAllAnnouncementByLandlord,
  getSingleAnnouncement,
  getSingleAnnouncementDeleted,
};
