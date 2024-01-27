
// Not Found error handler
const notFound = (req, res, next) => {
  const error = new Error('Not Found');
  error.status = 404;
  next(error);
};

// Error handler
const errorHandler = (err, req, res, next) => {
  const statusCode = err.status || 500;
  res.status(statusCode);
  res.json({
    message: err.message,
    stack: process.env.NODE_ENV === 'production' ? '🥞' : err.stack,
  });
};

module.exports = {
  notFound,
  errorHandler,
};
