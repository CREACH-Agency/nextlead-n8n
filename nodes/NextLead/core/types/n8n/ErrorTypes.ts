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

	if (error && typeof error === 'object' && 'statusCode' in error) {
		const httpError = error as {
			statusCode: number;
			message?: string;
			body?: string | Record<string, unknown>;
			response?: { body?: string | Record<string, unknown> };
			error?: string | Record<string, unknown>;
		};

		let errorMessage = httpError.message || 'HTTP Error';

		if (typeof httpError.body === 'string' && httpError.body) {
			errorMessage = httpError.body;
		} else if (typeof httpError.error === 'string' && httpError.error) {
			errorMessage = httpError.error;
		} else if (httpError.response?.body && typeof httpError.response.body === 'string') {
			errorMessage = httpError.response.body;
		}

		return {
			message: errorMessage,
			code: `HTTP_${httpError.statusCode}`,
			statusCode: httpError.statusCode,
			details: {
				body: httpError.body,
				response: httpError.response,
				error: httpError.error,
				originalError: error,
			},
		};
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
