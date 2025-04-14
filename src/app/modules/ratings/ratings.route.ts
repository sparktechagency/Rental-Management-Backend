import express from 'express';
import auth from '../../middleware/auth';
import { USER_ROLE } from '../user/user.constants';
import { reviewController } from './ratings.controller';



const reviewRouter = express.Router();

reviewRouter
  .post(
    '/',
    auth(USER_ROLE.TENANT, USER_ROLE.LANDLORD),
    // validateRequest(videoValidation.VideoSchema),
    reviewController.createReview,
  )
  .get('/', reviewController.getReviewByCustomer)
  .get('/:id', reviewController.getSingleReview)
  .patch(
    '/:id',
    auth(USER_ROLE.TENANT, USER_ROLE.LANDLORD),
    reviewController.updateSingleReview,
  )
  .delete(
    '/:id',
    auth(USER_ROLE.TENANT, USER_ROLE.LANDLORD),
    reviewController.deleteSingleReview,
  );

export default reviewRouter;
