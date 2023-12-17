const express=require('express');
const morgan=require('morgan');
const AppError=require('./Utils/AppError');
const ErrorHandler=require('./controllers/globalErrorHandler');

const userRouter=require('./Routes/userRoutes');
const tourRoutes=require('./Routes/tourRoutes');
const app = express();

if(process.env.NODE_ENV ==='development'){
    app.use(morgan('dev'));
}

app.use(express.json());



app.use('/api/v1/tours',tourRoutes);

app.use('/api/v1/users',userRouter);

app.all('*',(req,res,next)=>{
    /* res.status(400).json({
        status:"failed",
        message:`${req.originalUrl} not found`
    }); */
    let err=new AppError(`${req.originalUrl} not found`,404);
next(err);
})

app.use(ErrorHandler);









module.exports=app;