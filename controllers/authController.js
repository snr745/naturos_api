const user=require('./../models/UserModel');
const catchAsync = require("./../Utils/catchAsync");


exports.signUp=catchAsync(async(req,res,next)=>{
    const newUser=await user.create(req.body);

    res.status(200).json({
        status: "success",
        user: newUser,
      });

});