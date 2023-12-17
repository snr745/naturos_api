const express=require('express');
const tourController=require('./../controllers/tourController')

const router=express.Router();
//router.param("id");

router.route('/Tour-stats').get(tourController.GetTourStats);
router.route('/getMonthlyPlan/:year').get(tourController.getMonthlyPlan);
router.route('/top-5-cheap').get(tourController.alias,tourController.getTours);
router.route('/').get(tourController.getTours).post(tourController.creatTours)
router.route('/:id').get(tourController.getTour).patch(tourController.updateTour).delete(tourController.deleTour);

module.exports=router;