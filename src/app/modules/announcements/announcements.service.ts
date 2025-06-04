import AppError from '../../error/AppError';
import mongoose from 'mongoose';
import QueryBuilder from '../../builder/QueryBuilder';
import { User } from '../user/user.models';
import { TAnnouncements } from './announcements.interface';
import Announcement from './announcements.model';
import Property from '../property/property.model';

const createAnnouncementService = async (payload: TAnnouncements) => {
  const landlordUser = await User.findById(payload.landlordUserId);
  if (!landlordUser) {
    throw new AppError(404, 'Landlord User Not Found!!');
  }
  const property:any = await Property.findById(payload.propertyId);
  if (!property) {
    throw new AppError(404, 'Property  Not Found!!');
  }
  
  if (!property.landlordUserId.equals(payload.landlordUserId)) {
    throw new AppError(404, 'This property is not yours!!');
  }

  const result = await Announcement.create(payload);

  if (!result) {
    throw new AppError(403, 'Announcement create is faild!!');
  }
  return result;
};



const getAllAnnouncementByLandlordUserByPropertyIdQuery = async (
  query: Record<string, unknown>,
  propertyId: string,
) => {
  const property = await Property.findById(propertyId);
  if (property) {
    const announcementQuery = new QueryBuilder(
      Announcement.find({
        propertyId,

        //   isDeleted: false,
      }),
      query,
    )
      .search([''])
      .filter()
      .sort()
      .paginate()
      .fields();

    const result = await announcementQuery.modelQuery;
    const meta = await announcementQuery.countTotal();
    return { meta, result };
  }else{
    return { meta: {
      page: 1,
      limit: 10,
      total: 0,
      totalPage: 0
    }, result: [] };
  }
  
};

const getAllAnnouncementByLandlordUserQuery = async (
  query: Record<string, unknown>,
  landlordUserId: string
) => {
  const announcementQuery = new QueryBuilder(
    Announcement.find({
      landlordUserId
      //   isDeleted: false,
    }),
    query,
  )
    .search([''])
    .filter()
    .sort()
    .paginate()
    .fields();

  const result = await announcementQuery.modelQuery;
  const meta = await announcementQuery.countTotal();
  return { meta, result };
};

const getSingleAnnouncementQuery = async (id: string) => {
  const announcement = await Announcement.findById(id);
  if (!announcement) {
    throw new AppError(404, 'Announcement Not Found!!');
  }
  const result = await Announcement.findById(id);

  return result;
};


const getSingleAnnouncementDeletedQuery = async (
  id: string,
  landlordUserId: string,
) => {
  const announcement = await Announcement.findOne({ _id: id, landlordUserId });
  if (!announcement) {
    throw new AppError(404, 'Announcement Not Found!!');
  }
  const result = await Announcement.findOneAndDelete({_id:id,landlordUserId});

  if (!result) {
    throw new AppError(403, 'Announcement Deleted Faild!!');
  }

  return result;
};


export const announcementService = {
  createAnnouncementService,
  getAllAnnouncementByLandlordUserByPropertyIdQuery,
  getAllAnnouncementByLandlordUserQuery,
  getSingleAnnouncementQuery,
  getSingleAnnouncementDeletedQuery,
};
