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

export class NextLeadSale extends BaseNextLeadNode {
	description: INodeTypeDescription = this.getBaseDescription(
		'NextLead Sale',
		'nextLeadSale',
		'={{$parameter["operation"]}}',
		'sale'
	);

	getResourceType(): ResourceType {
		return 'sale';
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
						name: 'Create',
						value: 'create',
						description: 'Create a new sale',
						action: 'Create a sale',
					},
					{
						name: 'Update',
						value: 'update',
						description: 'Update a sale',
						action: 'Update a sale',
					},
					{
						name: 'Delete',
						value: 'delete',
						description: 'Delete a sale',
						action: 'Delete a sale',
					},
					{
						name: 'Get Columns',
						value: 'getColumns',
						description: 'Get sales columns',
						action: 'Get sales columns',
					},
				],
				default: 'create',
			},
		];
	}

	getFields(): INodeProperties[] {
		return [
			// Create fields
			{
				displayName: 'Contact ID',
				name: 'contactId',
				type: 'string',
				required: true,
				displayOptions: {
					show: {
						operation: ['create'],
					},
				},
				default: '',
				description: 'ID of the contact associated with the sale',
			},
			{
				displayName: 'Column ID',
				name: 'columnId',
				type: 'string',
				required: true,
				displayOptions: {
					show: {
						operation: ['create'],
					},
				},
				default: '',
				description: 'ID of the sales column/stage',
			},
			{
				displayName: 'Name',
				name: 'name',
				type: 'string',
				required: true,
				displayOptions: {
					show: {
						operation: ['create'],
					},
				},
				default: '',
				description: 'Name of the sale',
			},
			{
				displayName: 'Additional Fields',
				name: 'additionalFields',
				type: 'collection',
				placeholder: 'Add Field',
				default: {},
				displayOptions: {
					show: {
						operation: ['create'],
					},
				},
				options: [
					{
						displayName: 'Amount',
						name: 'amount',
						type: 'number',
						default: 0,
						description: 'Sale amount',
					},
					{
						displayName: 'Probability',
						name: 'probability',
						type: 'number',
						typeOptions: {
							numberPrecision: 2,
							minValue: 0,
							maxValue: 100,
						},
						default: 0,
						description: 'Probability of closing the sale (0-100)',
					},
					{
						displayName: 'Close Date',
						name: 'closeDate',
						type: 'dateTime',
						default: '',
						description: 'Expected close date',
					},
					{
						displayName: 'Description',
						name: 'description',
						type: 'string',
						typeOptions: {
							rows: 3,
						},
						default: '',
						description: 'Sale description',
					},
				],
			},
			// Update fields
			{
				displayName: 'Sale ID',
				name: 'saleId',
				type: 'string',
				required: true,
				displayOptions: {
					show: {
						operation: ['update', 'delete'],
					},
				},
				default: '',
				description: 'ID of the sale to update or delete',
			},
			{
				displayName: 'Update Fields',
				name: 'updateFields',
				type: 'collection',
				placeholder: 'Add Field',
				default: {},
				displayOptions: {
					show: {
						operation: ['update'],
					},
				},
				options: [
					{
						displayName: 'Amount',
						name: 'amount',
						type: 'number',
						default: 0,
						description: 'Sale amount',
					},
					{
						displayName: 'Close Date',
						name: 'closeDate',
						type: 'dateTime',
						default: '',
						description: 'Expected close date',
					},
					{
						displayName: 'Column ID',
						name: 'columnId',
						type: 'string',
						default: '',
						description: 'ID of the sales column/stage',
					},
					{
						displayName: 'Contact ID',
						name: 'contactId',
						type: 'string',
						default: '',
						description: 'ID of the contact associated with the sale',
					},
					{
						displayName: 'Description',
						name: 'description',
						type: 'string',
						typeOptions: {
							rows: 3,
						},
						default: '',
						description: 'Sale description',
					},
					{
						displayName: 'Name',
						name: 'name',
						type: 'string',
						default: '',
						description: 'Name of the sale',
					},
					{
						displayName: 'Probability',
						name: 'probability',
						type: 'number',
						typeOptions: {
							numberPrecision: 2,
							minValue: 0,
							maxValue: 100,
						},
						default: 0,
						description: 'Probability of closing the sale (0-100)',
					},
				],
			},
		];
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
			case 'create':
				return this.createSaleWithService(context, itemIndex, apiService);
			case 'update':
				return this.updateSaleWithService(context, itemIndex, apiService);
			case 'delete':
				return this.deleteSaleWithService(context, itemIndex, apiService);
			case 'getColumns':
				return this.getSalesColumnsWithService(context, apiService);
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
			case 'create':
				return this.createSale(context, itemIndex);
			case 'update':
				return this.updateSale(context, itemIndex);
			case 'delete':
				return this.deleteSale(context, itemIndex);
			case 'getColumns':
				return this.getSalesColumns(context);
			default:
				throw new NodeOperationError(context.getNode(), `Operation "${operation}" is not supported`);
		}
	}

	private async createSale(context: IExecuteFunctions, itemIndex: number): Promise<any> {
		const contactId = context.getNodeParameter('contactId', itemIndex) as string;
		const columnId = context.getNodeParameter('columnId', itemIndex) as string;
		const name = context.getNodeParameter('name', itemIndex) as string;
		const additionalFields = context.getNodeParameter('additionalFields', itemIndex) as IDataObject;

		const saleData: IDataObject = {
			contactId,
			columnId,
			name,
			...additionalFields,
		};

		const response = await this.apiService!.createSale(context, saleData);
		if (!response.success) {
			throw new NodeOperationError(context.getNode(), response.error || 'Create sale failed');
		}
		return response.data;
	}

	private async updateSale(context: IExecuteFunctions, itemIndex: number): Promise<any> {
		const saleId = context.getNodeParameter('saleId', itemIndex) as string;
		const updateFields = context.getNodeParameter('updateFields', itemIndex) as IDataObject;

		const saleData: IDataObject = {
			id: saleId,
			...updateFields,
		};

		const response = await this.apiService!.updateSale(context, saleData);
		if (!response.success) {
			throw new NodeOperationError(context.getNode(), response.error || 'Update sale failed');
		}
		return response.data;
	}

	private async deleteSale(context: IExecuteFunctions, itemIndex: number): Promise<any> {
		const saleId = context.getNodeParameter('saleId', itemIndex) as string;

		const response = await this.apiService!.deleteSale(context, saleId);
		if (!response.success) {
			throw new NodeOperationError(context.getNode(), response.error || 'Delete sale failed');
		}
		return response.data;
	}

	private async getSalesColumns(context: IExecuteFunctions): Promise<any> {
		const response = await this.apiService!.getSalesColumns(context);
		if (!response.success) {
			throw new NodeOperationError(context.getNode(), response.error || 'Get sales columns failed');
		}
		return response.data;
	}

	private async createSaleWithService(context: IExecuteFunctions, itemIndex: number, apiService: any): Promise<any> {
		const contactId = context.getNodeParameter('contactId', itemIndex) as string;
		const columnId = context.getNodeParameter('columnId', itemIndex) as string;
		const name = context.getNodeParameter('name', itemIndex) as string;
		const additionalFields = context.getNodeParameter('additionalFields', itemIndex) as IDataObject;

		const saleData: IDataObject = {
			contactId,
			columnId,
			name,
			...additionalFields,
		};

		const response = await apiService.createSale(context, saleData);
		if (!response.success) {
			throw new NodeOperationError(context.getNode(), response.error || 'Create sale failed');
		}
		return response.data;
	}

	private async updateSaleWithService(context: IExecuteFunctions, itemIndex: number, apiService: any): Promise<any> {
		const saleId = context.getNodeParameter('saleId', itemIndex) as string;
		const updateFields = context.getNodeParameter('updateFields', itemIndex) as IDataObject;

		const saleData: IDataObject = {
			id: saleId,
			...updateFields,
		};

		const response = await apiService.updateSale(context, saleData);
		if (!response.success) {
			throw new NodeOperationError(context.getNode(), response.error || 'Update sale failed');
		}
		return response.data;
	}

	private async deleteSaleWithService(context: IExecuteFunctions, itemIndex: number, apiService: any): Promise<any> {
		const saleId = context.getNodeParameter('saleId', itemIndex) as string;

		const response = await apiService.deleteSale(context, saleId);
		if (!response.success) {
			throw new NodeOperationError(context.getNode(), response.error || 'Delete sale failed');
		}
		return response.data;
	}

	private async getSalesColumnsWithService(context: IExecuteFunctions, apiService: any): Promise<any> {
		const response = await apiService.getSalesColumns(context);
		if (!response.success) {
			throw new NodeOperationError(context.getNode(), response.error || 'Get sales columns failed');
		}
		return response.data;
	}
}
