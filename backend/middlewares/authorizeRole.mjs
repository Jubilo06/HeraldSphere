const authorizeRoles = (roles = []) => {
  // roles can be an array like ['admin', 'user']
  if (typeof roles === 'string') {
    roles = [roles];
  }

  return (req, res, next) => {
    // req.user is set by authenticateJWT middleware
    if (!req.user || !req.user.role) {
      // Should not happen if authenticateJWT runs first, but a safeguard
      return res.status(401).json({ message: 'Unauthorized: No user role found.' });
    }

    if (roles.length > 0 && !roles.includes(req.user.role)) {
      // User's role is not in the allowed roles list
      return res.status(403).json({ message: 'Forbidden: You do not have the required permissions.' });
    }

    next(); // User has the required role
  };
};

export default authorizeRoles;