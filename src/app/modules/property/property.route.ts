import express from 'express';
import auth from '../../middleware/auth';
import { USER_ROLE } from '../user/user.constants';
import { propertyController } from './property.controller';
import fileUpload from '../../middleware/fileUpload';

const propertyRouter = express.Router();

const upload = fileUpload('./public/uploads/property');

propertyRouter
  .post(
    '/create-property',
    auth(USER_ROLE.LANDLORD),
    upload.fields([
      { name: 'images', maxCount: 5 },
      { name: 'propertyFiles', maxCount: 5 },
    ]),

    // validateRequest(videoValidation.VideoSchema),
    propertyController.createProperty,
  )
  .get('/all', propertyController.getAllPropertyByAdmin)
  .get(
    '/landlord',
    auth(USER_ROLE.LANDLORD),
    propertyController.getAllPropertyByLandlord,
  )
  .get(
    '/tenant',
    auth(USER_ROLE.TENANT),
    propertyController.getAllPropertyByTenant,
  )
  .get('/:id', propertyController.getSingleProperty)
  .patch(
    '/verify/:id',
    // auth(USER_ROLE.ADMIN),
    propertyController.updateSinglePropertyVerify,
  )
  .patch(
    '/:id',
    auth(USER_ROLE.LANDLORD),
    upload.fields([
      { name: 'images', maxCount: 5 },
      { name: 'propertyFiles', maxCount: 5 },
    ]),
    propertyController.updateSingleProperty,
  )
  .delete(
    '/:id',
    auth(USER_ROLE.LANDLORD),
    propertyController.deleteSingleProperty,
  );

export default propertyRouter;
