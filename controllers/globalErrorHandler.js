const AppError = require('./../utils/AppError');

const handleCastErrorDB= err=>{
    const message=`Invalid ${err.path}:${err.value}.`;
    return new AppError(message,400);
}

const handleValidationErrorDB= err=>{
    console.log(err.errors);
    const errors=Object.values(err.errors).map(el=>el.message);
    const message=`Invalid input data. ${errors.join('. ')}.`;
    return new AppError(message,400);
}

const handleDuplicateErrorFieldDB= err=>{
    const message = `Duplicate field value: ${err.keyValue.name}. Please use another value!`;
    return new AppError(message,400);
}

const handleJsonWeTokenError =  err =>new AppError('Invalid token. Please log in Again',401);

const handleJsonWeTokenTimoutError =  err =>new AppError('Your Token Expired. Please log in Again',401);

const sendErrorDev=(err,res)=>{
    console.log(err.name);
    res.status(err.statusCode).json({
        status:err.status,
        error:err,
        message:err.message,
        stack:err.stack
    });
}

const sendErrorProd=(err,res)=>{
    if(err.operationalError){
        res.status(err.statusCode).json({
            status:err.status,
            message:err.message,
        });
    }else{
        res.status(500).json({
            status:"failed",
            message:"something went wrong",
        });
    }
    
}

module.exports=(err,req,res,next)=>{
    err.statusCode=err.statusCode || 500;
    err.status=err.status ||"failed";
    console.log(process.env.NODE_ENV)
    if(process.env.NODE_ENV ==="development") {
        sendErrorDev(err,res);
    }
    else if(process.env.NODE_ENV ==="production"){
        console.log("entering")
        let error={...err};
        console.log(err.name);
        if(err.name ==="CastError"){
            error=handleCastErrorDB(error);
        } 
        if(err.name ==="ValidationError"){
            error=handleValidationErrorDB(error);
        }
        else if(err.code ==11000){
            error=handleDuplicateErrorFieldDB(error)
        }
        else if(err.name ==="JsonWebTokenError"){
            error=handleJsonWeTokenError(error);
        }
        else if(err.name ==="TokenExpiredError"){
            error=handleJsonWeTokenTimoutError(error);
        }
        sendErrorProd(error,res);
    }
}