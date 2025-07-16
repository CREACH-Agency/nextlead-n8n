import { IDataObject, NodeOperationError, INode } from 'n8n-workflow';

export class NextLeadErrorHandler {
	static handleApiError(error: any, node: INode): NodeOperationError {
		if (error.statusCode === 401) {
			return new NodeOperationError(
				node,
				'Authentication failed. Please check your NextLead API credentials.',
				{ description: 'The API key might be invalid or expired.' }
			);
		}

		if (error.statusCode === 404) {
			return new NodeOperationError(
				node,
				'Organization not found. Please check your domain configuration.',
				{ description: 'The organization associated with your API key was not found.' }
			);
		}

		if (error.statusCode === 429) {
			return new NodeOperationError(
				node,
				'Rate limit exceeded. Please try again later.',
				{ description: 'Too many requests have been made to the API.' }
			);
		}

		if (error.statusCode >= 500) {
			return new NodeOperationError(
				node,
				'NextLead API server error. Please try again later.',
				{ description: 'The NextLead API is experiencing issues.' }
			);
		}

		return new NodeOperationError(
			node,
			error.message || 'An unexpected error occurred',
			{ description: 'Please check your input data and try again.' }
		);
	}

	static formatErrorData(error: any): IDataObject {
		return {
			error: error.message || 'Unknown error',
			statusCode: error.statusCode || 500,
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
