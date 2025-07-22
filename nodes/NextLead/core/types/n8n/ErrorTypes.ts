export interface NextLeadError {
	message: string;
	code?: string;
	statusCode?: number;
	details?: Record<string, unknown>;
}

export class TypedError extends Error {
	public readonly code?: string;
	public readonly statusCode?: number;
	public readonly details?: Record<string, unknown>;

	constructor(error: NextLeadError) {
		super(error.message);
		this.name = 'NextLeadError';
		this.code = error.code;
		this.statusCode = error.statusCode;
		this.details = error.details;
	}
}

export function isNextLeadError(error: unknown): error is NextLeadError {
	return (
		typeof error === 'object' &&
		error !== null &&
		'message' in error &&
		typeof (error as NextLeadError).message === 'string'
	);
}

export function createNextLeadError(error: unknown): NextLeadError {
	if (isNextLeadError(error)) {
		return error;
	}

	if (error instanceof Error) {
		return {
			message: error.message,
			code: 'UNKNOWN_ERROR',
		};
	}

	return {
		message: 'An unknown error occurred',
		code: 'UNKNOWN_ERROR',
		details: { originalError: error },
	};
}
