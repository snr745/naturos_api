const {promisify} =require('util');
const user = require("./../models/UserModel");
const catchAsync = require("./../Utils/catchAsync");
const jwt = require("jsonwebtoken");
const AppError = require("./../utils/appError");
const sendEmail = require("./../utils/SendEmail");
const crypt=require('crypto');


signIn = (id) => {
  return jwt.sign({ id }, process.env.jwt_Secret, {
    expiresIn: process.env.jwt_ExpiresIn,
  });
};

const sendToken=(createduser,statusCode,res)=>{

  const token = signIn(createduser._id);
  const cookieOptions={
    expires: new Date(Date.now()+process.env.jwt_Cookie_ExpiresIn *24 *60 *60 *1000),
    httpOnly:true
  }

  if(process.env.NODE_ENV ==="production") cookieOptions.secure=true;
  res.cookie('jwt',token,cookieOptions);

  res.status(statusCode).json({
    status: "success",
    token: token,
    data: {createduser},
  });

}

exports.signUp = catchAsync(async (req, res, next) => {
  const newUser = await user.create(req.body);
  sendToken(newUser,200,res);
});

exports.logIn = catchAsync(async (req, res, next) => {
  const { email, password } = req.body;
  if (!email || !password) {
    return next(new AppError("Please enter correct password or email", 400));
  }

  const User = await user.findOne({ email }).select("+password");

  if (!User || !(await User.correctPassword(password, User.password))) {
    return next(new AppError("Incorrect email or password", 401));
  }

  sendToken(User,200,res);
});

exports.forgotPassword =catchAsync(async (req,res,next)=>{
  //get user based on provided email
  const { email } = req.body;
  const User = await user.findOne({ email });
  if(!User){
    return next(new AppError("please provide correct email id ", 401));
  }

  //generate random reset token
  let token=User.generateResetToken();
  User.save({validateBeforeSave: false});
  console.log(token);

  //send it to user's email
  const resetUrl=`${req.protocol}://${req.get('host')}//api/v1/user/resetPassword/${token}`;
  const message =`forgot your password submit request to:${resetUrl}`;
  await sendEmail({
    email:User.email,
    message:message,
    subject:"you password reset token"
  });
  res.status(200).json({
    status: "success",
    message:"email sent",
  });
});

exports.resetPassword=catchAsync(async (req,res,next)=>{

  //get user based on the token
  const hashedToken=crypt.createHash('sha256').update(req.params.token).digest('hex');
  const User=await user.findOne({passWordresetToken:hashedToken,
                                 passWordresetTokenExpiresIn:{$gt:Date.now()}});

  //if token not expired and there is user, set the new password
  if(!User){
    return next(new AppError("invalid token  ", 400));
  }
  User.passWord =req.body.passWord;
  User.passWordConfirm=req.body.passWordConfirm;
  User.passWordresetToken=undefined;
  User.passWordresetTokenExpiresIn=undefined;
  await User.save();

  //update the changedpassword property

  //log the user in and send JWT
  sendToken(newUser,200,res);

})

exports.updatePassword=catchAsync(async (req,res,next)=>{

  //get the user from collection
  const User = await user.findById(req.user.id).select("+passWord");;

  //check if current password is correct
  if (!User || !(await User.correctPassword(req.body.passWordCurrent, User.passWord))) {
    return next(new AppError("Incorrect  password", 401));
  }

  //if so update password
  User.passWord =req.body.passWord;
  User.passWordConfirm=req.body.passWordConfirm;
  await User.save();

  //log user in update 
  sendToken(newUser,200,res);
  

})

exports.protect = catchAsync(async (req, res, next) => {
  let token;
  //check  if headers present in the request
  console.log(req.headers);
  if (
    req.headers.authorization &&
    req.headers.authorization.startsWith("Bearer")
  ) {
    token = req.headers.authorization.split(' ')[1];
  }else if (req.cookies.jwt) {
    token = req.cookies.jwt;
  }
  if(!token){
    next(new AppError(" Please Log in To get Acces",401));
  }

  const decoded = await promisify(jwt.verify)(token,process.env.jwt_Secret);
  console.log(decoded);

  const currentUser= await user.findById(decoded.id);
  if(!currentUser){
    return next(new AppError("the user belonging to current token does not exist",401));
  }


  let value =currentUser.changedPassword(decoded.iat);
  console.log(value);
  if(currentUser.changedPassword(decoded.iat)){
    return next(new AppError("User recently changed Password",401));
  }
   // THERE IS A LOGGED IN USER
   res.locals.user = currentUser;
req.user=currentUser;
  next();
});

// Only for rendered pages, no errors!
exports.isLoggedIn = async (req, res, next) => {
  console.log("currentUser");
  if (req.cookies.jwt) {
    try {
      // 1) verify token
      const decoded = await promisify(jwt.verify)(
        req.cookies.jwt,
        process.env.JWT_SECRET
      );

      console.log(decoded);
      // 2) Check if user still exists
      const currentUser = await user.findById(decoded.id);
      if (!currentUser) {
        return next();
      }
      console.log("currentUser");
      // 3) Check if user changed password after the token was issued
      if (currentUser.changedPassword(decoded.iat)) {
        return next();
      }
      console.log("currentUser1");
      // THERE IS A LOGGED IN USER
      res.locals.user = currentUser;
      console.log(currentUser);
      return next();
    } catch (err) {
      return next();
    }
  }
  next();
};

exports.logout = (req, res) => {
  res.cookie('jwt', 'loggedout', {
    expires: new Date(Date.now() + 10 * 1000),
    httpOnly: true
  });
  res.status(200).json({ status: 'success' });
};

exports.authorizeTO= (...roles)=>{
  return (req,res,next)=>{
    if(!roles.includes(req.user.role)){
      return next(new AppError("User deos not have permission !!",403));
    }
    next();
  }
}
