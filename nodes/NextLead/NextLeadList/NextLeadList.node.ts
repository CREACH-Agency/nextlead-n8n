import {
	IExecuteFunctions,
	INodeTypeDescription,
	IDataObject,
	INodeProperties,
	INodeExecutionData,
	NodeOperationError,
	ICredentialDataDecryptedObject,
} from 'n8n-workflow';

import { BaseNextLeadNode } from '../core/BaseNextLeadNode';
import { ResourceType, OperationType } from '../core/types/NextLeadTypes';

export class NextLeadList extends BaseNextLeadNode {
	description: INodeTypeDescription = this.getBaseDescription(
		'NextLead List',
		'nextLeadList',
		'={{$parameter["operation"]}}',
		'list'
	);

	getResourceType(): ResourceType {
		return 'list';
	}

	getOperations(): INodeProperties[] {
		return [
			{
				displayName: 'Operation',
				name: 'operation',
				type: 'options',
				noDataExpression: true,
				options: [
					{
						name: 'Get Many',
						value: 'getAll',
						description: 'Get many lists',
						action: 'Get many lists',
					},
				],
				default: 'getAll',
			},
		];
	}

	getFields(): INodeProperties[] {
		return [];
	}

	async execute(this: IExecuteFunctions): Promise<INodeExecutionData[][]> {
		const items = this.getInputData();
		const returnData: IDataObject[] = [];

		const credentials = await this.getCredentials('nextLeadApi') as ICredentialDataDecryptedObject;
		const { NextLeadApiService } = await import('../core/NextLeadApiService');
		const apiService = new NextLeadApiService(credentials as any);

		for (let i = 0; i < items.length; i++) {
			try {
				const operation = this.getNodeParameter('operation', i) as OperationType;
				const result = await (this as any).executeOperationWithService(this, operation, i, apiService);

				if (result) {
					const processedResult = Array.isArray(result) ? result : [result as IDataObject];
					returnData.push(...processedResult);
				}
			} catch (error: any) {
				if (this.continueOnFail()) {
					returnData.push({
						error: error.message || 'Unknown error',
						statusCode: error.statusCode || 500,
						timestamp: new Date().toISOString(),
					});
				} else {
					throw new NodeOperationError(this.getNode(), error.message);
				}
			}
		}

		return [this.helpers.returnJsonArray(returnData)];
	}

	protected async executeOperationWithService(
		context: IExecuteFunctions,
		operation: OperationType,
		itemIndex: number,
		apiService: any
	): Promise<any> {
		switch (operation) {
			case 'getAll':
				return this.getListsWithService(context, apiService);
			default:
				throw new NodeOperationError(context.getNode(), `Operation "${operation}" is not supported`);
		}
	}

	protected async executeOperation(
		context: IExecuteFunctions,
		operation: OperationType,
		itemIndex: number
	): Promise<any> {
		if (!this.apiService) {
			throw new NodeOperationError(context.getNode(), 'API service not initialized');
		}

		switch (operation) {
			case 'getAll':
				return this.getLists(context);
			default:
				throw new NodeOperationError(context.getNode(), `Operation "${operation}" is not supported`);
		}
	}

	private async getLists(context: IExecuteFunctions): Promise<any> {
		const response = await this.apiService!.getLists(context);
		if (!response.success) {
			throw new NodeOperationError(context.getNode(), response.error || 'Get lists failed');
		}
		return response.data;
	}

	private async getListsWithService(context: IExecuteFunctions, apiService: any): Promise<any> {
		const response = await apiService.getLists(context);
		if (!response.success) {
			throw new NodeOperationError(context.getNode(), response.error || 'Get lists failed');
		}
		return response.data;
	}
}
