import {
	IExecuteFunctions,
	IPollFunctions,
	INodeExecutionData,
	IDataObject,
	JsonObject,
	NodeApiError,
	NodeOperationError,
} from 'n8n-workflow';
import { NextLeadApiResponse } from '../core/types/shared/ApiTypes';

type NodeContext = IExecuteFunctions | IPollFunctions;

export class ResponseUtils {
	/**
	 * Throw a NodeApiError when the response carries an original HTTP error
	 * (preserves status code, body and headers in the n8n UI). Falls back to
	 * NodeOperationError when the failure was synthesized without HTTP context.
	 */
	private static throwApiError(context: NodeContext, response: NextLeadApiResponse): never {
		const node = context.getNode();
		const message = response.error || response.message || 'Unknown error';

		if (response.httpError !== undefined && response.httpError !== null) {
			const errorResponse: JsonObject =
				typeof response.httpError === 'object'
					? (response.httpError as JsonObject)
					: ({ message } as JsonObject);

			throw new NodeApiError(node, errorResponse, { message });
		}

		throw new NodeOperationError(node, `API Error: ${message}`);
	}

	/**
	 * Convert a NextLead API response to a n8n format
	 * Handle cases where data can be undefined
	 */
	static formatSingleResponse(
		context: NodeContext,
		response: NextLeadApiResponse,
	): INodeExecutionData[] {
		if (!response.success) {
			ResponseUtils.throwApiError(context, response);
		}

		// If no data, return an empty but valid object
		const data = response.data || {};
		return [{ json: data as IDataObject }];
	}

	/**
	 * Convert a NextLead API response with array to a n8n format
	 */
	static formatArrayResponse(
		context: NodeContext,
		response: NextLeadApiResponse,
	): INodeExecutionData[] {
		if (!response.success) {
			ResponseUtils.throwApiError(context, response);
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
