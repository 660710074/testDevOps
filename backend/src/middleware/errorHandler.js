const errorHandler = (err, req, res, next) => {
  console.error(`[ERROR] ${err.message}`, {
    stack: process.env.NODE_ENV === 'development' ? err.stack : undefined,
    path: req.path,
    method: req.method,
  });

  // Prisma errors
  if (err.code === 'P2002') {
    return res.status(409).json({ error: 'Duplicate entry — value already exists' });
  }
  if (err.code === 'P2025') {
    return res.status(404).json({ error: 'Record not found' });
  }

  // Validation errors
  if (err.name === 'ValidationError') {
    return res.status(400).json({ error: err.message });
  }

  // Default
  const status = err.statusCode || err.status || 500;
  const message =
    process.env.NODE_ENV === 'production' && status === 500
      ? 'Internal server error'
      : err.message || 'Internal server error';

  res.status(status).json({ error: message });
};

module.exports = errorHandler;
