import {
	IExecuteFunctions,
	INodeExecutionData,
	IDataObject,
	NodeOperationError,
} from 'n8n-workflow';

import { OperationType, NextLeadCredentials } from '../core/types/NextLeadTypes';
import { NextLeadApiService } from '../core/NextLeadApiService';
import { NextLeadApiResponse } from '../core/types/shared/ApiTypes';
import { createNextLeadError } from '../core/types/n8n/ErrorTypes';

export interface INodeExecuteContext {
	executeOperationWithService(
		context: IExecuteFunctions,
		operation: OperationType,
		itemIndex: number,
		apiService: NextLeadApiService,
	): Promise<INodeExecutionData[]>;
}

export interface IExecuteOptions {
	continueOnFail?: boolean;
}

export class NodeExecuteUtils {
	static async executeStandardFlow(
		context: IExecuteFunctions,
		nodeInstance: INodeExecuteContext,
		_options?: IExecuteOptions,
	): Promise<INodeExecutionData[][]> {
		const items = context.getInputData();
		const returnData: IDataObject[] = [];

		const credentials = (await context.getCredentials('nextLeadApi')) as NextLeadCredentials;
		const apiService = new NextLeadApiService(credentials);

		for (let i = 0; i < items.length; i++) {
			try {
				const operation = context.getNodeParameter('operation', i) as OperationType;
				const result = await nodeInstance.executeOperationWithService(
					context,
					operation,
					i,
					apiService,
				);

				if (result) {
					const processedResult = Array.isArray(result) ? result : [result as IDataObject];
					returnData.push(...processedResult);
				}
			} catch (error: unknown) {
				const nextLeadError = createNextLeadError(error);
				if (context.continueOnFail()) {
					returnData.push({
						error: nextLeadError.message,
						statusCode: nextLeadError.statusCode || 500,
						timestamp: new Date().toISOString(),
					});
				} else {
					throw new NodeOperationError(context.getNode(), nextLeadError.message);
				}
			}
		}

		return [context.helpers.returnJsonArray(returnData)];
	}

	static async executeOperationSafely<T>(
		context: IExecuteFunctions,
		operation: () => Promise<T>,
		operationName: string,
	): Promise<T> {
		try {
			return await operation();
		} catch (error: unknown) {
			const nextLeadError = createNextLeadError(error);
			throw new NodeOperationError(
				context.getNode(),
				`${operationName} failed: ${nextLeadError.message}`,
			);
		}
	}

	static processApiResponse<T = unknown>(response: NextLeadApiResponse<T>): IDataObject[] {
		if (!response || !response.success || !response.data) {
			return [];
		}

		if (Array.isArray(response.data)) {
			return response.data.map((item) => item as IDataObject);
		}

		return [response.data as IDataObject];
	}

	static validateApiResponse<T = unknown>(
		response: NextLeadApiResponse<T>,
		operationName: string,
	): void {
		if (!response) {
			throw new Error(`${operationName} returned empty response`);
		}

		if (!response.success) {
			throw new Error(response.error || `${operationName} failed`);
		}
	}
}
