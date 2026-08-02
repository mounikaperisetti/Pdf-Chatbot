const errorMiddleware = (err, req, res, next) => {
  console.error('Unhandled Server Error:', err.message || err);
  
  const statusCode = err.statusCode || 500;
  const message = err.message || 'Internal Server Error';
  
  res.status(statusCode).json({
    status: 'error',
    statusCode,
    message,
    // Only return stack in local development environments if required
    stack: process.env.NODE_ENV === 'development' ? err.stack : undefined
  });
};

module.exports = errorMiddleware;
