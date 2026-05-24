const jwt = require("jsonwebtoken");
const User = require("../models/User.model");
const ApiError = require("../utils/ApiError");
const asyncHandler = require("../utils/asyncHandler");

/**
 * verifyToken
 * Reads JWT from Authorization header (Bearer) OR from the 'token' cookie.
 * Attaches decoded user to req.user.
 */
const verifyToken = asyncHandler(async (req, _res, next) => {
  let token;

  // 1. Try Authorization header
  const authHeader = req.headers.authorization;
  if (authHeader && authHeader.startsWith("Bearer ")) {
    token = authHeader.split(" ")[1];
  }

  // 2. Fallback to cookie
  if (!token && req.cookies?.token) {
    token = req.cookies.token;
  }

  if (!token) {
    throw new ApiError(401, "Authentication required. Please login.");
  }

  // Verify token
  let decoded;
  try {
    decoded = jwt.verify(token, process.env.JWT_SECRET);
  } catch (err) {
    if (err.name === "TokenExpiredError") {
      throw new ApiError(401, "Token has expired. Please login again.");
    }
    throw new ApiError(401, "Invalid token. Please login again.");
  }

  // Fetch user (exclude password)
  const user = await User.findById(decoded.userId).select("-password");
  if (!user) {
    throw new ApiError(401, "User no longer exists.");
  }
  if (!user.isActive) {
    throw new ApiError(403, "Your account has been deactivated.");
  }

  req.user = user;
  next();
});

/**
 * checkRole
 * Role-based access control middleware factory.
 * Usage: checkRole(["admin"]) or checkRole(["seller", "admin"])
 *
 * @param {string[]} roles - Allowed roles
 */
const checkRole = (roles) =>
  asyncHandler(async (req, _res, next) => {
    if (!req.user) {
      throw new ApiError(401, "Authentication required.");
    }
    if (!roles.includes(req.user.role)) {
      throw new ApiError(
        403,
        `Access denied. Required role: ${roles.join(" or ")}.`
      );
    }
    // Extra check: seller must be approved by admin
    if (
      req.user.role === "seller" &&
      !req.user.isVendorApproved &&
      roles.includes("seller")
    ) {
      throw new ApiError(
        403,
        "Your seller account is pending admin approval."
      );
    }
    next();
  });

/**
 * optionalVerifyToken
 * Reads JWT from Authorization header or cookie.
 * If found and valid, attaches user to req.user.
 * If not found or invalid, sets req.user to null and proceeds (no 401 throw).
 */
const optionalVerifyToken = asyncHandler(async (req, _res, next) => {
  let token;

  const authHeader = req.headers.authorization;
  if (authHeader && authHeader.startsWith("Bearer ")) {
    token = authHeader.split(" ")[1];
  }

  if (!token && req.cookies?.token) {
    token = req.cookies.token;
  }

  if (!token) {
    req.user = null;
    return next();
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const user = await User.findById(decoded.userId).select("-password");
    if (user && user.isActive) {
      req.user = user;
    } else {
      req.user = null;
    }
  } catch (err) {
    req.user = null;
  }
  
  next();
});

module.exports = { verifyToken, checkRole, optionalVerifyToken };
