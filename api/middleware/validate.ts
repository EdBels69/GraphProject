import { Request, Response, NextFunction } from 'express';
import { ZodSchema, ZodError } from 'zod'; // Use ZodSchema instead of AnyZodObject
import { logger } from '../core/Logger';

export const validate = (schema: ZodSchema) =>
    async (req: Request, res: Response, next: NextFunction) => {
        try {
            await schema.parseAsync(req.body);
            return next();
        } catch (error) {
            if (error instanceof ZodError) {
                const zError = error as any; // Cast to access errors property which might be hidden by strict typing
                logger.warn('Validation', 'Request validation failed', {
                    path: req.path,
                    errors: zError.errors
                });
                return res.status(400).json({
                    error: 'Validation failed',
                    details: zError.errors.map((e: any) => ({ path: e.path.join('.'), message: e.message }))
                });
            }
            return res.status(500).json({ error: 'Internal validation error' });
        }
    };
