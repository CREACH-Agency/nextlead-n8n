import { IDataObject, INode, JsonObject, NodeApiError, NodeOperationError } from 'n8n-workflow';
import { createNextLeadError } from './types/n8n/ErrorTypes';

const STATUS_DESCRIPTIONS: Record<number, { message: string; description: string }> = {
	401: {
		message: 'Authentication failed. Please check your NextLead API credentials.',
		description: 'The API key might be invalid or expired.',
	},
	403: {
		message: 'API Error: Forbidden - perhaps check your credentials?',
		description: 'Please check your input data and try again.',
	},
	404: {
		message: 'Organization not found. Please check your domain configuration.',
		description: 'The organization associated with your API key was not found.',
	},
	429: {
		message: 'Rate limit exceeded. Please try again later.',
		description: 'Too many requests have been made to the API.',
	},
};

export class NextLeadErrorHandler {
	/**
	 * Wrap an HTTP error in a NodeApiError so n8n surfaces the original HTTP
	 * response (status code, body, headers) in the UI. The original error is
	 * forwarded as `errorResponse` and we only override the human-friendly
	 * `message`/`description` for known status codes.
	 */
	static handleApiError(error: unknown, node: INode): NodeApiError | NodeOperationError {
		// If the error has already been wrapped as a NodeApiError or
		// NodeOperationError (e.g. by ResponseUtils), forward it untouched —
		// re-wrapping would strip the HTTP response details.
		if (error instanceof NodeApiError || error instanceof NodeOperationError) {
			return error;
		}

		const nextLeadError = createNextLeadError(error);
		const statusCode = nextLeadError.statusCode;

		// If the error is not an HTTP error (no status code, plain Error, etc.)
		// fall back to NodeOperationError so we don't fabricate HTTP context.
		if (!statusCode) {
			return new NodeOperationError(node, nextLeadError.message || 'An unexpected error occurred', {
				description: 'Please check your input data and try again.',
			});
		}

		const errorResponse: JsonObject =
			error && typeof error === 'object'
				? (error as JsonObject)
				: ({ message: nextLeadError.message } as JsonObject);

		const known = STATUS_DESCRIPTIONS[statusCode];
		if (known) {
			return new NodeApiError(node, errorResponse, {
				message: known.message,
				description: known.description,
				httpCode: String(statusCode),
			});
		}

		if (statusCode >= 500) {
			return new NodeApiError(node, errorResponse, {
				message: 'NextLead API server error. Please try again later.',
				description: 'The NextLead API is experiencing issues.',
				httpCode: String(statusCode),
			});
		}

		return new NodeApiError(node, errorResponse, {
			message: nextLeadError.message || 'An unexpected error occurred',
			description: 'Please check your input data and try again.',
			httpCode: String(statusCode),
		});
	}

	static formatErrorData(error: unknown): IDataObject {
		const nextLeadError = createNextLeadError(error);
		return {
			error: nextLeadError.message,
			statusCode: nextLeadError.statusCode || 500,
			timestamp: new Date().toISOString(),
		};
	}

	static validateRequiredFields(data: IDataObject, requiredFields: string[]): string[] {
		const missingFields: string[] = [];

		for (const field of requiredFields) {
			if (!data[field] || data[field] === '') {
				missingFields.push(field);
			}
		}

		return missingFields;
	}
}
