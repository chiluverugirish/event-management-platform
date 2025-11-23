"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.isAdminOrOrganizer = exports.isAdmin = exports.checkRole = void 0;
/**
 * Middleware to check if user has required role(s)
 * Usage: checkRole(['admin', 'organizer'])
 */
const checkRole = (allowedRoles) => {
    return (req, res, next) => {
        try {
            const userRole = req.userRole;
            if (!userRole) {
                return res.status(401).json({
                    message: "Unauthorized - No role information"
                });
            }
            if (!allowedRoles.includes(userRole)) {
                return res.status(403).json({
                    message: `Forbidden - Requires one of these roles: ${allowedRoles.join(', ')}`,
                    yourRole: userRole
                });
            }
            next();
        }
        catch (error) {
            res.status(500).json({
                message: "Error checking role",
                error: error.message
            });
        }
    };
};
exports.checkRole = checkRole;
/**
 * Middleware to check if user is admin
 */
exports.isAdmin = (0, exports.checkRole)(['admin']);
/**
 * Middleware to check if user is admin or organizer
 */
exports.isAdminOrOrganizer = (0, exports.checkRole)(['admin', 'organizer']);
