const mongoose=require('mongoose');
const fs=require('fs');
const dotenv=require('dotenv');
dotenv.config({path:"./../../config.env"});
const Tour =require('./../../models/TourModel');

const db=process.env.DATA_BASE_STRING.replace('<PASSWORD>',process.env.DATA_BASE_PASSWORD);

const tours=JSON.parse(fs.readFileSync(`${__dirname}/tours-simple.json`,'utf8')) 


mongoose.connect(db).then(con=>{
    //console.log(con);
    console.log("DB Connection Sucessfull");
});

const importData=async ()=>{
    try{
        await Tour.create(tours);
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
        console.log("Tour Data Deleted Successfully");
        process.exit();
    }
    catch(err){
console.log(err);
process.exit();
    }   

}

if (process.argv[2] === "--import") {
  importData();
} else if (process.argv[2] === "--delete") {
    deleteData();
}