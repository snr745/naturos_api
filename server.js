const mongoose=require('mongoose');
const dotenv=require('dotenv');
process.on('uncaughtException',err=>{
    console.log(err.name,err.message);
    process.exit(1);

})
dotenv.config({path:"./config.env"});
const app=require('./app');

const db=process.env.DATA_BASE_STRING.replace('<PASSWORD>',process.env.DATA_BASE_PASSWORD);
const port=process.env.PORT || 3000;


mongoose.connect(db).then(con=>{
    //console.log(con);
    console.log("DB Connection Sucessfull");
});

const server = app.listen(port,(req,res)=>{
    console.log(`App is running on the port ${port}.......`);
    });

process.on('unhandledRejection',err=>{
    console.log(err.name,err.message);
    server.close(()=>{
        process.exit(1);
    })

});