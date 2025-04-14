import express from 'express';
import auth from '../../middleware/auth';
import { USER_ROLE } from '../user/user.constants';
import fileUpload from '../../middleware/fileUpload';
import { maintenanceController } from './maintenance.controller';

const maintenanceRouter = express.Router();

const upload = fileUpload('./public/uploads/agreement');

maintenanceRouter
  .post(
    '/create-maintenance',
    auth(USER_ROLE.TENANT),
    upload.fields([{ name: 'images', maxCount: 5 }]),
    // validateRequest(videoValidation.VideoSchema),
    maintenanceController.createMaintenance,
  )
  .get(
    '/landlord',
    auth(USER_ROLE.LANDLORD),
    maintenanceController.getAllMaintenanceByProperty,
  )
  .get(
    '/landlord',
    auth(USER_ROLE.LANDLORD),
    maintenanceController.getAllMaintenanceByProperty,
  )
  .get('/:id', maintenanceController.getSingleMaintenance)

  .patch(
    '/extent-request/:id',
    auth(USER_ROLE.TENANT),
    maintenanceController.updateSingleMaintenanceIssueSolvedOrCancel,
  )
  .delete(
    '/:id',
    auth(USER_ROLE.LANDLORD),
    maintenanceController.deleteSingleMaintenance,
  );

export default maintenanceRouter;
