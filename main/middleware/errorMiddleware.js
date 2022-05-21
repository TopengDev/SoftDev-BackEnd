const errorHandler = (err, req, res, next) => {
  const statusCode = res.statusCode ? res.statusCode : 5000;

  res.status(statusCode);

  res.json({
    message: err.message,
    stack: err.stack,
  });
};

module.exports = { errorHandler };
