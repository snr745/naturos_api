const user = require("./../models/UserModel");
const catchAsync = require("./../Utils/catchAsync");
const AppError = require("./../utils/appError");
const factory=require("./handleFactory");

const filterObj = (obj, ...allowedFields) => {
    const newObj = {};
    Object.keys(obj).forEach(el => {
      if (allowedFields.includes(el)) newObj[el] = obj[el];
    });
    return newObj;
  };
exports.getUsers=(req,res)=>{
    res.status(500).send({
        status:"failed",
        message:"Route Not implemented"
    })
}

exports.createUser=(req,res)=>{
    res.status(500).send({
        status:"failed",
        message:"Route Not implemented"
    })
}

exports.getUser=factory.getOne(user);

exports.getMe=(req,res,next)=>{
  req.params.id=req.user.id;
  next();
}

exports.updateUser=catchAsync(async(req,res,next)=>{
    if (req.body.passWordConnfirm || req.body.passWord) {
        return next(new AppError("Cannot update password, please user /updatePassword", 401));
      }
      const filteredOj=filterObj(req.body,"name","email");

      const updatedUser=await user.findByIdAndUpdate(req.user.id,filteredOj,{new: true,
        runValidators: true});
        res.status(200).json({
            status: 'success',
            data: {
              user: updatedUser
            }
          });
});

exports.deleteMe=catchAsync(async(req,res,next)=>{
   await user.findByIdAndUpdate(req.user.id,{active:false});

   res.status(204).json({
    status: 'success',
    data: null
  });
})

exports.deleteUser = factory.deleteOne(user);

exports.getAllUsers = factory.getAll(user);