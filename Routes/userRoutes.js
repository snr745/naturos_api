const express=require('express');
const userController=require('./../controllers/userController');
const authController=require('./../controllers/authController');




const router=express.Router();


router.route('/signup').post(authController.signUp);
router.route('/logIn').post(authController.logIn);

router.route('/forgotPassword').post(authController.forgotPassword);
router.route('/updateMyPassword').patch(authController.protect,authController.updatePassword);
router.route('/resetPassword/:token').patch(authController.resetPassword);

router.use(authController.protect);

router.route('/deleteMe').delete(authController.protect,userController.deleteMe);

router.route('/updateMe').patch(authController.protect,userController.updateUser);
router.route('/getMe').get(authController.protect,userController.getMe,userController.getUser);

router.use(authController.authorizeTO("admin"));
router.route('/').get(userController.getAllUsers).post(userController.createUser);
router.route('/:id').get(userController.getUser).patch(userController.updateUser).delete(userController.deleteUser);


module.exports=router;