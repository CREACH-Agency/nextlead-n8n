import { IDataObject, NodeOperationError, INode } from 'n8n-workflow';
import { createNextLeadError } from './types/n8n/ErrorTypes';

export class NextLeadErrorHandler {
	static handleApiError(error: unknown, node: INode): NodeOperationError {
		const nextLeadError = createNextLeadError(error);
		if (nextLeadError.statusCode === 401) {
			return new NodeOperationError(
				node,
				'Authentication failed. Please check your NextLead API credentials.',
				{ description: 'The API key might be invalid or expired.' },
			);
		}

		if (nextLeadError.statusCode === 404) {
			return new NodeOperationError(
				node,
				'Organization not found. Please check your domain configuration.',
				{ description: 'The organization associated with your API key was not found.' },
			);
		}

		if (nextLeadError.statusCode === 429) {
			return new NodeOperationError(node, 'Rate limit exceeded. Please try again later.', {
				description: 'Too many requests have been made to the API.',
			});
		}

		if (nextLeadError.statusCode && nextLeadError.statusCode >= 500) {
			return new NodeOperationError(node, 'NextLead API server error. Please try again later.', {
				description: 'The NextLead API is experiencing issues.',
			});
		}

		return new NodeOperationError(node, nextLeadError.message || 'An unexpected error occurred', {
			description: 'Please check your input data and try again.',
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
