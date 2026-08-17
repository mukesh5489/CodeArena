// Global error handling middleware
// Catches any errors thrown inside route handlers and returns a clean JSON response
// This means we never accidentally leak stack traces or DB errors to users

const errorHandler = (err, req, res, next) => {
  // Log the full error on the server (so we can debug it)
  console.error('❌ Error:', err.message);
  if (process.env.NODE_ENV === 'development') {
    console.error(err.stack);
  }

  // Determine the HTTP status code to send back
  const statusCode = err.statusCode || err.status || 500;

  res.status(statusCode).json({
    success: false,
    message: err.message || 'Internal Server Error',
    // Only include the stack trace in development so it never leaks in production
    ...(process.env.NODE_ENV === 'development' && { stack: err.stack }),
  });
};

// Helper to create custom API errors with a specific status code
const createError = (message, statusCode = 400) => {
  const err = new Error(message);
  err.statusCode = statusCode;
  return err;
};

module.exports = { errorHandler, createError };
