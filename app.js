const express=require('express');
const path=require("path");
const morgan=require('morgan');
const AppError=require('./Utils/AppError');
const ErrorHandler=require('./controllers/globalErrorHandler');
const cookieParser = require('cookie-parser');

const userRouter=require('./Routes/userRoutes');
const tourRoutes=require('./Routes/tourRoutes');
const reviewRoutes=require('./Routes/reviewRoutes');
const viewRoutes=require('./Routes/viewRoutes');
const app = express();
const rateLimit =require('express-rate-limit');
const mongoSanitize = require('express-mongo-sanitize');
const hpp = require('hpp');
const xss = require('xss-clean')

if(process.env.NODE_ENV ==='development'){
    app.use(morgan('dev'));
}

app.set("views", path.join(__dirname, "views"));
app.set('view engine', 'pug');
app.use(express.static(path.join(__dirname, "public")));

//prvent xss attacks
app.use(xss());
//prevent noSql injection
app.use(mongoSanitize());

//prevent parameter pollution
app.use(hpp({ whitelist: [ 'filter' ] }));
const limiter = rateLimit({
	windowMs: 60 * 60 * 1000, 
	limit: 100, 
    message:"too many request from same IP ,wait for one hour"
});

app.use(limiter)
app.use(cookieParser());

app.use(express.json());



app.use('/',viewRoutes);
app.use('/api/v1/tours',tourRoutes);

app.use('/api/v1/users',userRouter);
app.use('/api/v1/reviews',reviewRoutes);

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