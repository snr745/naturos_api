const mongoose=require('mongoose');
const fs=require('fs');
const dotenv=require('dotenv');
dotenv.config({path:"./../../config.env"});
const Tour =require('./../../models/TourModel');
const User =require('./../../models/UserModel');
const Review =require('./../../models/reviewModel');

const db=process.env.DATA_BASE_STRING.replace('<PASSWORD>',process.env.DATA_BASE_PASSWORD);

const tours=JSON.parse(fs.readFileSync(`${__dirname}/tours.json`,'utf8')) 
const users=JSON.parse(fs.readFileSync(`${__dirname}/users.json`,'utf8')) 
const reviews=JSON.parse(fs.readFileSync(`${__dirname}/reviews.json`,'utf8')) 


mongoose.connect(db).then(con=>{
    //console.log(con);
    console.log("DB Connection Sucessfull");
});

const importData=async ()=>{
    try{
        await Tour.create(tours);
        await User.create(users,{validateBeforeSave: false});
        await Review.create(reviews);
        console.log("Tour Data Created Successfully");
        process.exit();
    }
    catch(err){
console.log(err);
process.exit();
    }   

}

const deleteData=async ()=>{
    try{
        await Tour.deleteMany();
        await User.deleteMany();
        await Review.deleteMany();
        console.log("Tour Data Deleted Successfully");
        process.exit();
    }
    catch(err){
console.log(err);
process.exit();
    }   

}

if (process.argv[2] === "--import") {
    console.log("entearing")
  importData();
} else if (process.argv[2] === "--delete") {
    deleteData();
}