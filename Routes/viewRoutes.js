const express=require('express');
const viewsController=require('./../controllers/viewController');
const authController=require('./../controllers/authController');


const router =express.Router();

router.get('/', authController.isLoggedIn, viewsController.getOverview);
router.get('/tour/:slug', authController.isLoggedIn, viewsController.getTour);
router.get('/login', authController.isLoggedIn, viewsController.getLoginForm);
router.get('/me', authController.protect, viewsController.getAccount);
//router.get("/",viewController.getOverview)
//router.get("/tour",viewController.getTour)



module.exports=router;