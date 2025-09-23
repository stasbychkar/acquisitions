import { jwttoken } from '#utils/jwt.js'
import logger from '#config/logger.js'

export const authenticateToken = (req, res, next) => {
    try {
        const token = req.cookies?.token

        if (!token) {
            return res.status(401).json({
                error: 'Authentication required',
                message: 'No token provided',
            })
        }

        const decoded = jwttoken.verify(token)
        req.user = {
            id: decoded.id,
            email: decoded.email,
            role: decoded.role,
        }

        next()
    } catch (e) {
        logger.error('Authentication error:', e)
        return res.status(403).json({
            error: 'Invalid token',
            message: 'Token verification failed',
        })
    }
}

export const requireAdmin = (req, res, next) => {
    if (req.user?.role !== 'admin') {
        return res.status(403).json({
            error: 'Admin access required',
            message: 'Insufficient permissions',
        })
    }
    next()
}
