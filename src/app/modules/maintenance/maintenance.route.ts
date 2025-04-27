import express from 'express';
import auth from '../../middleware/auth';
import { USER_ROLE } from '../user/user.constants';
import fileUpload from '../../middleware/fileUpload';
import { maintenanceController } from './maintenance.controller';

const maintenanceRouter = express.Router();

const upload = fileUpload('./public/uploads/maintenance');

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
    '/tenant',
    auth(USER_ROLE.TENANT),
    maintenanceController.getAllMaintenanceMessageByTenant,
  )
  .get(
    '/count/tenant',
    auth(USER_ROLE.TENANT),
    maintenanceController.getAllMaintenanceMessageCountByTenant,
  )
  .get('/:id', maintenanceController.getSingleMaintenance)

  .patch(
    '/status/:id',
    auth(USER_ROLE.LANDLORD),
    maintenanceController.updateSingleMaintenanceIssueSolvedOrCancel,
  )
  .delete(
    '/:id',
    auth(USER_ROLE.LANDLORD),
    maintenanceController.deleteSingleMaintenance,
  );

export default maintenanceRouter;
