const mongoose=require('mongoose');

const UserSchema=new mongoose.Schema({
    name:{
        type:String,
        required: [true, 'A user must have a name'],
        unique: true,
    },
    email:{
        type:String,
        required: [true, 'A user must have a email'],
        unique: true,
    },
    passWord:{
        type:String,
        required:true
    },
    passWordConfirm:{
        type:String,
        required:true
    },

});

const User=mongoose.model('User',tourSchema);

module.exports=User;