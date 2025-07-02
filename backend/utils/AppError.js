class AppError extends Error {
    constructor(statusCode, message, errors = null) {
      super(message);
      this.statusCode = statusCode;
      this.errors     = errors;
      Error.captureStackTrace(this, this.constructor);
    }
  }
  
module.exports = AppError;
  