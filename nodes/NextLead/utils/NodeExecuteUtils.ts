import {
	IExecuteFunctions,
	INodeExecutionData,
	IDataObject,
	ICredentialDataDecryptedObject,
	NodeOperationError,
} from 'n8n-workflow';

import { OperationType } from '../core/types/NextLeadTypes';

export interface INodeExecuteContext {
	executeOperationWithService(
		context: IExecuteFunctions,
		operation: OperationType,
		itemIndex: number,
		apiService: any
	): Promise<any>;
}

export interface IExecuteOptions {
	continueOnFail?: boolean;
}

export class NodeExecuteUtils {
	static async executeStandardFlow(
		context: IExecuteFunctions,
		nodeInstance: INodeExecuteContext,
		options?: IExecuteOptions
	): Promise<INodeExecutionData[][]> {
		const items = context.getInputData();
		const returnData: IDataObject[] = [];

		const credentials = await context.getCredentials('nextLeadApi') as ICredentialDataDecryptedObject;
		const { NextLeadApiService } = await import('../core/NextLeadApiService');
		const apiService = new NextLeadApiService(credentials as any);

		for (let i = 0; i < items.length; i++) {
			try {
				const operation = context.getNodeParameter('operation', i) as OperationType;
				const result = await nodeInstance.executeOperationWithService(
					context,
					operation,
					i,
					apiService
				);

				if (result) {
					const processedResult = Array.isArray(result) 
						? result 
						: [result as IDataObject];
					returnData.push(...processedResult);
				}
			} catch (error: any) {
				if (context.continueOnFail()) {
					returnData.push({
						error: error.message || 'Unknown error',
						statusCode: error.statusCode || 500,
						timestamp: new Date().toISOString(),
					});
				} else {
					throw new NodeOperationError(context.getNode(), error.message);
				}
			}
		}

		return [context.helpers.returnJsonArray(returnData)];
	}

	static async executeOperationSafely<T>(
		context: IExecuteFunctions,
		operation: () => Promise<T>,
		operationName: string
	): Promise<T> {
		try {
			return await operation();
		} catch (error: any) {
			throw new NodeOperationError(
				context.getNode(),
				`${operationName} failed: ${error.message}`
			);
		}
	}

	static processApiResponse(response: any): IDataObject[] {
		if (!response) {
			return [];
		}

		if (Array.isArray(response)) {
			return response.map(item => item as IDataObject);
		}

		return [response as IDataObject];
	}

	static validateApiResponse(response: any, operationName: string): void {
		if (!response) {
			throw new Error(`${operationName} returned empty response`);
		}

		if (!response.success) {
			throw new Error(response.error || `${operationName} failed`);
		}
	}
}