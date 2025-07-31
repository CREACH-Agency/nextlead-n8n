import { INodeExecutionData, IDataObject } from 'n8n-workflow';
import { NextLeadApiResponse } from '../core/types/shared/ApiTypes';

export class ResponseUtils {
	/**
	 * Convert a NextLead API response to a n8n format
	 * Handle cases where data can be undefined
	 */
	static formatSingleResponse(response: NextLeadApiResponse): INodeExecutionData[] {
		if (!response.success) {
			throw new Error(`API Error: ${response.error || 'Unknown error'}`);
		}

		// If no data, return an empty but valid object
		const data = response.data || {};
		return [{ json: data as IDataObject }];
	}

	/**
	 * Convert a NextLead API response with array to a n8n format
	 */
	static formatArrayResponse(response: NextLeadApiResponse): INodeExecutionData[] {
		if (!response.success) {
			throw new Error(`API Error: ${response.error || 'Unknown error'}`);
		}

		let items = response.data;

		if (items && typeof items === 'object' && !Array.isArray(items)) {
			if ('data' in items && Array.isArray(items.data)) {
				items = items.data;
			} else {
				return [{ json: { items: [] } as IDataObject }];
			}
		}

		if (!Array.isArray(items)) {
			return [{ json: { items: [] } as IDataObject }];
		}

		return items.map((item) => ({ json: item as IDataObject }));
	}

	/**
	 * Return a generic success response
	 */
	static formatSuccessResponse(message = 'Operation successful'): INodeExecutionData[] {
		return [{ json: { success: true, message } as IDataObject }];
	}
}
