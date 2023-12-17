const mongoose=require('mongoose');
const validator=require('validator');
const bcrypt=require('bcryptjs');

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
    passWord:{
        type:String,
        required:true,
        required: [true, 'Please Provide Valid Password'],
        minlength:8,
    },
    passWordConfirm:{
        type:String,
        required:true,
        required: [true, 'Please Confirm Password'],
    },

});

UserSchema.pre('save',async function(next){
    if(!this.isModified("passWord")) {
        return next();
    } 
    this.passWord=await bcrypt.hash(this.passWord,12);

    this.passWordConfirm=undefined;
    next();

})

const User=mongoose.model('User',UserSchema);

module.exports=User;