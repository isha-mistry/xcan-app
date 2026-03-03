import { NextRequest, NextResponse } from 'next/server';
import { ZodError } from 'zod';
import { UnauthorizedError, ForbiddenError } from './rbac';
import { dbConnect } from './dbConnect';
import mongoose from 'mongoose';

/**
 * Wraps API route handlers with consistent error handling and db connection.
 * Catches RBAC, Zod, Mongoose, and MongoDB duplicate key errors.
 */
export function apiHandler(
    fn: (req: NextRequest, ctx: any) => Promise<NextResponse>
) {
    return async (req: NextRequest, ctx: any): Promise<NextResponse> => {
        try {
            await dbConnect();
            return await fn(req, ctx);
        } catch (err) {
            if (err instanceof UnauthorizedError)
                return NextResponse.json(
                    { error: { code: 'UNAUTHORIZED', message: err.message } },
                    { status: 401 }
                );

            if (err instanceof ForbiddenError)
                return NextResponse.json(
                    { error: { code: 'FORBIDDEN', message: err.message } },
                    { status: 403 }
                );

            if (err instanceof ZodError)
                return NextResponse.json(
                    { error: { code: 'VALIDATION_ERROR', message: 'Invalid input', details: err.issues } },
                    { status: 400 }
                );

            if (err instanceof mongoose.Error.ValidationError)
                return NextResponse.json(
                    { error: { code: 'VALIDATION_ERROR', message: err.message } },
                    { status: 400 }
                );

            if ((err as any)?.code === 11000)
                return NextResponse.json(
                    { error: { code: 'DUPLICATE', message: 'Resource already exists' } },
                    { status: 409 }
                );

            console.error('[API Error]', err);
            return NextResponse.json(
                { error: { code: 'INTERNAL_ERROR', message: 'Something went wrong' } },
                { status: 500 }
            );
        }
    };
}
