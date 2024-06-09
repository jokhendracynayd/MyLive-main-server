const CustomError = require('../utilis/customError');

const devError=(error,res)=>{
  res.status(error.statusCode).json({
    success:false,
    msg:error.message,
    stackTrace:error.stack,
    error:error
  })
}


const prodError=(error,res)=>{
  if(error.isOperational){
    res.status(error.statusCode).json({
      success:false,
      msg:error.message,
    })
  }else{
    res.status(500).json({
      success:false,
      msg:'Something went wrong! Please try again later.',
    })
  }
}



module.exports = (error,req,res,next)=>{
  error.statusCode=error.statusCode || 500;
  error.status=error.status || 'error';
  // req.logger.error(error.message,error);
  if(process.env.MODE==='development'){
    devError(error,res);
  }else if(process.env.MODE==='production'){
    if(error.name==='CastError')error=new CustomError(`Invalid value for ${error.path}: ${error.value}`,400);
    if(error.code===11000)error=new CustomError(`Duplicate field value: ${error.keyValue.name}. Please use another value!`,400);
    if(error.name==='ValidationError')error=new CustomError(`Invalid input data:${Object.values(error.errors).map(val=>val.message).join('. ')}`,400);
    prodError(error,res);
  }
}