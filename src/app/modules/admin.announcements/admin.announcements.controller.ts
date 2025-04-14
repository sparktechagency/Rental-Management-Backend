import catchAsync from '../../utils/catchAsync';
import sendResponse from '../../utils/sendResponse';
import httpStatus from 'http-status';
import { adminannouncementService } from './admin.announcements.service';

const createAdminAnnouncement = catchAsync(async (req, res) => {
  const adminannouncementData = req.body;

  const result = await adminannouncementService.createAdminAnnouncementService(
    adminannouncementData,
  );

  // Send response
  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: 'Admin Announcement Create successfully!',
    data: result,
  });
});


const getAllAdminAnnouncement = catchAsync(async (req, res) => {
  const { meta, result } =
    await adminannouncementService.getAllAdminAnnouncementBQuery(
      req.query,
    );

  sendResponse(res, {
    success: true,
    statusCode: httpStatus.OK,
    meta: meta,
    data: result,
    message: 'All AdminAnnouncement by Landlord are requered successful!!',
  });
});


const getSingleAdminAnnouncement = catchAsync(async (req, res) => {
  const result = await adminannouncementService.getSingleAdminAnnouncementQuery(
    req.params.id,
  );

  sendResponse(res, {
    success: true,
    statusCode: httpStatus.OK,
    data: result,
    message: 'Single AdminAnnouncement successful!!',
  });
});

const activeDeactivedminAnnouncement = catchAsync(async (req, res) => {
  const result = await adminannouncementService.updateActiveDeActiveAdminAnnouncementQuery(
    req.params.id,
  );

  sendResponse(res, {
    success: true,
    statusCode: httpStatus.OK,
    data: result,
    message: 'Single Active Deactive AdminAnnouncement successful!!',
  });
});

export const adminannouncementController = {
  createAdminAnnouncement,
  getAllAdminAnnouncement,
  getSingleAdminAnnouncement,
  activeDeactivedminAnnouncement,
};
