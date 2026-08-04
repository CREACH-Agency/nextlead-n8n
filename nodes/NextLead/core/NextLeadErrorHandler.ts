import { IDataObject, INode, JsonObject, NodeApiError, NodeOperationError } from 'n8n-workflow';
import { createNextLeadError } from './types/n8n/ErrorTypes';

const STATUS_DESCRIPTIONS: Record<number, { message: string; description: string }> = {
	401: {
		message: 'Authentication failed. Please check your NextLead API credentials.',
		description:
			'The API key may be invalid or expired, or it may no longer resolve to an organization.',
	},
	403: {
		message: 'NextLead refused this request.',
		description:
			'This can be a plan limit reached, a missing permission, or an invalid key. The NextLead message above states which.',
	},
	404: {
		message: 'Organization not found. Please check your domain configuration.',
		description: 'The organization associated with your API key was not found.',
	},
	429: {
		message: 'NextLead API quota exceeded.',
		description:
			'The organization monthly external automation quota is spent, or requests are coming in too fast.',
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
			const retryHint = nextLeadError.retryAfter
				? ` Retry after ${nextLeadError.retryAfter}s.`
				: '';

			return new NodeApiError(node, errorResponse, {
				// The API explains plan limits, quota exhaustion and validation
				// failures in the response body. The canned text would send the user
				// to check credentials that are perfectly valid, so it is only a
				// fallback for when the body carries no explanation.
				message: nextLeadError.fromApiBody ? nextLeadError.message : known.message,
				description: `${known.description}${retryHint}`,
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
