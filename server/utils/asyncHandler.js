/**
 * Wraps async route handlers to automatically catch errors
 * and forward them to Express error middleware — eliminates try/catch boilerplate.
 *
 * @param {Function} fn - Async controller function
 * @returns {Function} Express middleware
 */
const asyncHandler = (fn) => (req, res, next) => {
  Promise.resolve(fn(req, res, next)).catch(next);
};

module.exports = asyncHandler;
