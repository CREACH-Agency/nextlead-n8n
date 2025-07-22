import { IExecuteFunctions, INodeExecutionData, INodeProperties, IDataObject } from 'n8n-workflow';

import { ResourceType, OperationType, NextLeadCredentials } from '../core/types/NextLeadTypes';
import { IResourceStrategy } from '../core/interfaces/IResourceStrategy';
import { FieldDefinitionUtils } from '../utils/FieldDefinitionUtils';
import { NextLeadApiService } from '../core/NextLeadApiService';

export class SaleResource implements IResourceStrategy {
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
				displayOptions: {
					show: { resource: ['sale'] },
				},
				options: [
					{
						name: 'Create',
						value: 'create',
						description: 'Create a new sale',
						action: 'Create a sale',
					},
					{
						name: 'Delete',
						value: 'delete',
						description: 'Delete a sale',
						action: 'Delete a sale',
					},
					{
						name: 'Get',
						value: 'get',
						description: 'Get a sale',
						action: 'Get a sale',
					},
					{
						name: 'Get Columns',
						value: 'getColumns',
						description: 'Get sale columns',
						action: 'Get sale columns',
					},
					{
						name: 'Get Many',
						value: 'getMany',
						description: 'Get many sales',
						action: 'Get many sales',
					},
					{
						name: 'Update',
						value: 'update',
						description: 'Update a sale',
						action: 'Update a sale',
					},
				],
				default: 'create',
			},
		];
	}

	getFields(): INodeProperties[] {
		return [
			// Create fields
			FieldDefinitionUtils.createStringField({
				name: 'contactId',
				displayName: 'Contact ID',
				description: 'ID of the contact',
				required: true,
				operations: ['create'],
			}),
			FieldDefinitionUtils.createStringField({
				name: 'columnId',
				displayName: 'Column ID',
				description: 'ID of the column',
				required: true,
				operations: ['create'],
			}),
			FieldDefinitionUtils.createStringField({
				name: 'name',
				displayName: 'Name',
				description: 'Name of the sale',
				required: true,
				operations: ['create'],
			}),
			FieldDefinitionUtils.createCollectionField({
				name: 'additionalFields',
				displayName: 'Additional Fields',
				description: 'Additional fields for the sale',
				operations: ['create'],
				fields: [
					{
						displayName: 'Amount',
						name: 'amount',
						description: 'Sale amount',
						default: 0,
					},
					{
						displayName: 'Probability',
						name: 'probability',
						description: 'Probability of closing the sale (0-100)',
						default: 0,
					},
					{
						displayName: 'Close Date',
						name: 'closeDate',
						description: 'Expected close date',
						default: '',
					},
					{
						displayName: 'Description',
						name: 'description',
						description: 'Sale description',
						default: '',
					},
				],
			}),

			// Update fields
			FieldDefinitionUtils.createIdField({
				name: 'saleId',
				displayName: 'Sale ID',
				description: 'ID of the sale to update',
				operations: ['update'],
			}),
			FieldDefinitionUtils.createCollectionField({
				name: 'updateFields',
				displayName: 'Update Fields',
				description: 'Fields to update',
				operations: ['update'],
				fields: [
					{
						displayName: 'Name',
						name: 'name',
						description: 'Name of the sale',
						default: '',
					},
					{
						displayName: 'Amount',
						name: 'amount',
						description: 'Sale amount',
						default: 0,
					},
					{
						displayName: 'Probability',
						name: 'probability',
						description: 'Probability of closing the sale',
						default: 0,
					},
					{
						displayName: 'Close Date',
						name: 'closeDate',
						description: 'Expected close date',
						default: '',
					},
					{
						displayName: 'Description',
						name: 'description',
						description: 'Sale description',
						default: '',
					},
				],
			}),

			// Delete fields
			FieldDefinitionUtils.createEmailField({
				name: 'contactEmail',
				displayName: 'Contact Email',
				description: 'Email of the contact whose sale to delete',
				operations: ['delete'],
			}),

			// Get fields
			FieldDefinitionUtils.createIdField({
				name: 'saleId',
				displayName: 'Sale ID',
				description: 'ID of the sale to get',
				operations: ['get'],
			}),

			// Get Many fields
			FieldDefinitionUtils.createNumberField({
				name: 'limit',
				displayName: 'Limit',
				description: 'Maximum number of sales to return',
				required: false,
				operations: ['getMany'],
				default: 100,
			}),
		];
	}

	async execute(
		operation: OperationType,
		context: IExecuteFunctions,
		itemIndex: number,
	): Promise<INodeExecutionData[]> {
		const credentials = (await context.getCredentials('nextLeadApi')) as NextLeadCredentials;
		const apiService = new NextLeadApiService(credentials);

		switch (operation) {
			case 'create':
				return this.handleCreateSale(context, itemIndex, apiService);
			case 'update':
				return this.handleUpdateSale(context, itemIndex, apiService);
			case 'delete':
				return this.handleDeleteSale(context, itemIndex, apiService);
			case 'get':
				return [{ json: { message: 'Get single sale not available in API' } }];
			case 'getMany':
				return [{ json: { message: 'Get many sales not available in API' } }];
			case 'getColumns':
				return this.handleGetColumns(context, apiService);
			default:
				throw new Error(`Unknown operation: ${operation}`);
		}
	}

	private async handleCreateSale(
		context: IExecuteFunctions,
		itemIndex: number,
		apiService: NextLeadApiService,
	): Promise<INodeExecutionData[]> {
		const contactId = context.getNodeParameter('contactId', itemIndex) as string;
		const columnId = context.getNodeParameter('columnId', itemIndex) as string;
		const name = context.getNodeParameter('name', itemIndex) as string;
		const additionalFields = context.getNodeParameter(
			'additionalFields',
			itemIndex,
			{},
		) as IDataObject;

		const saleData: IDataObject = {
			contactId,
			columnId,
			name,
			...additionalFields,
		};

		const response = await apiService.createSale(context, saleData);

		if (!response.success) {
			throw new Error(`Failed to create sale: ${response.error}`);
		}

		return [{ json: response.data }];
	}

	private async handleUpdateSale(
		context: IExecuteFunctions,
		itemIndex: number,
		apiService: NextLeadApiService,
	): Promise<INodeExecutionData[]> {
		const saleId = context.getNodeParameter('saleId', itemIndex) as string;
		const updateFields = context.getNodeParameter('updateFields', itemIndex, {}) as IDataObject;

		const updateData: IDataObject = {
			id: saleId,
			...updateFields,
		};

		const response = await apiService.updateSale(context, updateData);

		if (!response.success) {
			throw new Error(`Failed to update sale: ${response.error}`);
		}

		return [{ json: response.data }];
	}

	private async handleDeleteSale(
		context: IExecuteFunctions,
		itemIndex: number,
		apiService: NextLeadApiService,
	): Promise<INodeExecutionData[]> {
		const contactEmail = context.getNodeParameter('contactEmail', itemIndex) as string;

		const response = await apiService.deleteSale(context, contactEmail);

		if (!response.success) {
			throw new Error(`Failed to delete sale: ${response.error}`);
		}

		return [{ json: { success: true, message: 'Sale deleted successfully', contactEmail } }];
	}

	private async handleGetColumns(
		context: IExecuteFunctions,
		apiService: NextLeadApiService,
	): Promise<INodeExecutionData[]> {
		const response = await apiService.getSalesColumns(context);

		if (!response.success) {
			throw new Error(`Failed to get sale columns: ${response.error}`);
		}

		if (Array.isArray(response.data)) {
			return response.data.map((column) => ({ json: column }));
		}

		return [{ json: response.data }];
	}
}
