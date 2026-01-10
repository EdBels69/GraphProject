/**
 * JWT Authentication Middleware
 * Provides optional authentication for API endpoints
 */

import { Request, Response, NextFunction } from 'express'
import jwt from 'jsonwebtoken'
import { logger } from '../core/Logger'

export interface AuthUser {
    id: string
    email: string
    role: 'admin' | 'analyst' | 'viewer'
}

export interface AuthRequest extends Request {
    user?: AuthUser
}

const JWT_SECRET = process.env.JWT_SECRET || 'development-secret-change-in-production'
const JWT_EXPIRES_IN = process.env.JWT_EXPIRES_IN || '7d'

/**
 * Verify JWT token and attach user to request
 * Used for protected routes
 */
export function requireAuth(req: AuthRequest, res: Response, next: NextFunction) {
    const authHeader = req.headers.authorization

    if (!authHeader || !authHeader.startsWith('Bearer ')) {
        return res.status(401).json({
            success: false,
            error: {
                code: 'UNAUTHORIZED',
                message: 'Missing or invalid authorization header'
            }
        })
    }

    const token = authHeader.substring(7)

    try {
        const decoded = jwt.verify(token, JWT_SECRET) as AuthUser
        req.user = decoded
        next()
    } catch (error) {
        logger.warn('Auth', 'Invalid token', { error })
        return res.status(401).json({
            success: false,
            error: {
                code: 'INVALID_TOKEN',
                message: 'Token is invalid or expired'
            }
        })
    }
}

/**
 * Optional authentication - attach user if token is present, continue otherwise
 */
export function optionalAuth(req: AuthRequest, res: Response, next: NextFunction) {
    const authHeader = req.headers.authorization

    if (!authHeader || !authHeader.startsWith('Bearer ')) {
        return next()
    }

    const token = authHeader.substring(7)

    try {
        const decoded = jwt.verify(token, JWT_SECRET) as AuthUser
        req.user = decoded
    } catch (error) {
        // Token invalid, but continue without user
        logger.info('Auth', 'Invalid token in optional auth, continuing without user')
    }

    next()
}

/**
 * Require specific role for access
 */
export function requireRole(...roles: AuthUser['role'][]) {
    return (req: AuthRequest, res: Response, next: NextFunction) => {
        if (!req.user) {
            return res.status(401).json({
                success: false,
                error: {
                    code: 'UNAUTHORIZED',
                    message: 'Authentication required'
                }
            })
        }

        if (!roles.includes(req.user.role)) {
            return res.status(403).json({
                success: false,
                error: {
                    code: 'FORBIDDEN',
                    message: 'Insufficient permissions'
                }
            })
        }

        next()
    }
}

/**
 * Generate JWT token for user
 */
export function generateToken(user: AuthUser): string {
    return jwt.sign(
        { id: user.id, email: user.email, role: user.role },
        JWT_SECRET,
        { expiresIn: JWT_EXPIRES_IN as jwt.SignOptions['expiresIn'] }
    )
}

/**
 * Verify and decode token without throwing
 */
export function verifyToken(token: string): AuthUser | null {
    try {
        return jwt.verify(token, JWT_SECRET) as AuthUser
    } catch {
        return null
    }
}
