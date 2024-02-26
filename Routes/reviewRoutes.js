const express=require('express');
const reviewController=require('./../controllers/reviewController');
const authController=require('./../controllers/authController');


const router=express.Router({mergeParams:true});

router.use(authController.protect);

router.route('/').get(reviewController.getAllReviews).post(authController.protect,authController.authorizeTO('user'), reviewController.setParams,reviewController.creatReview);
router.route('/:id').get(reviewController.getReview).patch(authController.protect,
    authController.authorizeTO('user', 'admin'),
    reviewController.updateReview
  ).delete(authController.authorizeTO('user', 'admin'),reviewController.deleteReview);




module.exports=router;