import rateLimit from "express-rate-limit";

const authorizeRoles = (roles = []) => {
  // roles can be an array like ['admin', 'user']
  if (typeof roles === "string") {
    roles = [roles];
  }

  return (req, res, next) => {
    // req.user is set by authenticateJWT middleware
    if (!req.user || !req.user.role) {
      // Should not happen if authenticateJWT runs first, but a safeguard
      return res
        .status(401)
        .json({ message: "Unauthorized: No user role found." });
    }

    if (roles.length > 0 && !roles.includes(req.user.role)) {
      // User's role is not in the allowed roles list
      return res.status(403).json({
        message: "Forbidden: You do not have the required permissions.",
      });
    }

    next(); // User has the required role
  };
};

 export const loginLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 10, // Limit each IP to 10 login attempts per window
  message: {
    message: "Too many login attempts. Please try again after 15 minutes.",
  },
  standardHeaders: true,
  legacyHeaders: false,
});

export default authorizeRoles;
