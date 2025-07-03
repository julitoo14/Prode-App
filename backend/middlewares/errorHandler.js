const errorHandler = (err, req, res, next) => {
    const statusCode = err.statusCode || 400;
    const payload = {
      status:  statusCode < 500 ? 'error' : 'fail',
      message: err.message || 'Internal Server Error',
    };
    if (err.errors) payload.errors = err.errors;
  
    res.status(statusCode).json(payload);
  };
  
  module.exports = errorHandler;
  