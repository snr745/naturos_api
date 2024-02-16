const mongoose=require('mongoose');
const validator=require('validator');
const bcrypt=require('bcryptjs');
const crypt=require('crypto');

const UserSchema=new mongoose.Schema({
    name:{
        type:String,
        required: [true, 'A user must have a name'],
    },
    email:{
        type:String,
        required: [true, 'Please Provide Email'],
        unique: true,
        lowercase:true,
        validator:[validator.email,'Please Provide Valid Email']
    },
    role:{
        type:String,
        enum:['user','guide','lead-guide','admin'],
        default:'user'
    },

    password:{
        type:String,
        required:true,
        required: [true, 'Please Provide Valid Password'],
        minlength:8,
        select:false,
    },
    passWordConfirm:{
        type:String,
        required:true,
        required: [true, 'Please Confirm Password'],
    },
    passwordChangedAt:Date,
    passWordresetToken:String,
    passWordresetTokenExpiresIn:Date,
    active:{
        type:Boolean,
        default:true,
        select:false
    }

});

UserSchema.pre('save',async function(next){
    if(!this.isModified("passWord")) {
        return next();
    } 
    this.passWord=await bcrypt.hash(this.passWord,12);

    this.passWordConfirm=undefined;
    next();

});

UserSchema.pre('save',function(next){
    if(!this.isModified("passWord") && this.isNew) {
        return next();
    } 
    this.passwordChangedAt=Date.now() -1000;
    next();
  })

  UserSchema.pre(/^find/,function(next){
    this.find({active:{$ne:false}});
    next();
  })

UserSchema.methods.correctPassword=async function(candidatePassword,userPassword){
    return await bcrypt.compare(candidatePassword,userPassword);
}
UserSchema.methods.changedPassword= function(JwtTokentime){
    if(this.passwordChangedAt){
        const changedTimestamp = parseInt(
            this.passwordChangedAt.getTime() / 1000,
            10
          );
      
          return JwtTokentime < changedTimestamp;
    }
    
  // False means NOT changed
  return false;
}

UserSchema.methods.generateResetToken=function(){
    let resetToken=crypt.randomBytes(32).toString('hex');

    this.passWordresetToken=crypt.createHash('sha256').update(resetToken).digest('hex');
    this.passWordresetTokenExpiresIn=Date.now()+10*60*1000;
return resetToken;
}

const User=mongoose.model('User',UserSchema);

module.exports=User;