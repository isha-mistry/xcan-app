import { NextResponse } from 'next/server';
import type { ZodIssue } from 'zod';
import { UnauthorizedError, ForbiddenError } from '@/lib/rbac';

interface ErrorResponseOptions {
    status?: number;
    details?: ZodIssue[];
}

export function apiError(message: string, options: ErrorResponseOptions = {}) {
    const { status = 500, details } = options;
    const body: Record<string, unknown> = { success: false, error: message };
    if (details?.length) body.details = details;
    return NextResponse.json(body, { status });
}

export function apiSuccess(data: Record<string, unknown>, status = 200) {
    return NextResponse.json({ success: true, ...data }, { status });
}

export function handleApiError(error: unknown, contextMessage = 'Internal Server Error') {
    if (error instanceof UnauthorizedError) {
        return apiError('Not authenticated', { status: 401 });
    }
    if (error instanceof ForbiddenError) {
        return apiError((error as Error).message, { status: 403 });
    }

    const mongoError = error as { code?: number; message?: string };
    if (mongoError.code === 11000) {
        return apiError('Duplicate entry. This record already exists.', { status: 409 });
    }

    console.error(`${contextMessage}:`, error);
    return apiError(contextMessage, { status: 500 });
}

export function validationError(zodError: { issues: ZodIssue[] }) {
    return apiError(
        zodError.issues[0]?.message || 'Validation failed',
        { status: 400, details: zodError.issues }
    );
}
