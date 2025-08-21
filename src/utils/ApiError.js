class ApiError extends Error {
  constructor(
    message = "Somethig went wrong", 
    statusCode,
    erorrs = [],
    stack = ""
    ){
    super(message);
    this.statusCode = statusCode || 500;
    this.data = null;
    this.success = false;
    this.message = message;
    this.errors = erorrs;
    if(stack){
        this.stack = stack;
    }
    else{
        Error.captureStackTrace(this, this.constructor);
    }
  }
}
export default ApiError;