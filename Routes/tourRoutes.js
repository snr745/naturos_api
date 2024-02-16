const express=require('express');
const tourController=require('./../controllers/tourController');
const authController=require('./../controllers/authController');
const reviewController=require('./../controllers/reviewController');
const reviewRouter=require('../Routes/reviewRoutes');

const router=express.Router();
//router.param("id");
router.use('/:tourId/Reviews',reviewRouter);
router.route('/Tour-stats').get(tourController.GetTourStats);
router.route('/getMonthlyPlan/:year').get(tourController.getMonthlyPlan);
router.route('/top-5-cheap').get(tourController.alias,tourController.getTours);
router.route('/').get(tourController.getTours).post(authController.protect,authController.authorizeTO('admin','lead-guide'),tourController.creatTours)
router.route('/:id').get(tourController.getTour).patch(tourController.updateTour).delete(authController.protect,authController.authorizeTO('admin','lead-guide'),
    tourController.deleTour);

router.route("/tours-within/:distance/center/:latlang/unit/:unit").get(tourController.getToursWithin);
router.route("/getDistances/distances/:latlang/unit/:unit").get(tourController.getTourdistances);

//router.route('/:tourId/createReview').post(authController.protect,authController.authorizeTO('user'),reviewController.creatReview);

module.exports=router;