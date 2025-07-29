import { IExecuteFunctions, INodeExecutionData, INodeProperties, IDataObject } from 'n8n-workflow';

import { ResourceType, OperationType, NextLeadCredentials } from '../core/types/NextLeadTypes';
import { IResourceStrategy } from '../core/interfaces/IResourceStrategy';
import { FieldDefinitionUtils } from '../utils/FieldDefinitionUtils';
import { NextLeadApiService } from '../core/NextLeadApiService';
import { ResponseUtils } from '../utils/ResponseUtils';

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
						name: 'Get Columns',
						value: 'getColumns',
						description: 'Get sale columns',
						action: 'Get sale columns',
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
				name: 'name',
				displayName: 'Name',
				description: 'Name of the sale',
				required: true,
				operations: ['create'],
			}),
			// Column field with dynamic loading
			{
				displayName: 'Stage Name or ID',
				name: 'column',
				type: 'options',
				required: true,
				displayOptions: {
					show: {
						resource: ['sale'],
						operation: ['create'],
					},
				},
				typeOptions: {
					loadOptionsMethod: 'getSaleColumns',
				},
				default: '',
				description:
					'Choose from the list, or specify an ID using an <a href="https://docs.n8n.io/code/expressions/">expression</a>',
			},
			FieldDefinitionUtils.createCollectionField({
				name: 'additionalFields',
				displayName: 'Additional Fields',
				description: 'Additional fields for the sale',
				operations: ['create'],
				fields: [
					{
						displayName: 'Description',
						name: 'description',
						description: 'Sale description',
					},
					{
						displayName: 'Value',
						name: 'value',
						description: 'Sale value/amount',
					},
					{
						displayName: 'Success Rate',
						name: 'success_rate',
						description: 'Success rate percentage (0-100)',
					},
					{
						displayName: 'Priority',
						name: 'priority',
						description: 'Sale priority (LOW, NORMAL, HIGH)',
					},
					{
						displayName: 'Close Date',
						name: 'closeDate',
						description: 'Expected close date for the sale (YYYY-MM-DD)',
					},
					{
						displayName: 'Assigned To ID',
						name: 'assignedToId',
						description: 'ID of the user assigned to this sale',
					},
					{
						displayName: 'Contact Email',
						name: 'contact',
						description: 'Email of the contact (will be resolved to contactId)',
					},
					{
						displayName: 'Contact ID',
						name: 'contactId',
						description: 'Direct contact ID (use this or Contact Email)',
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
				],
			}),

			// Delete fields
			FieldDefinitionUtils.createEmailField({
				name: 'contactEmail',
				displayName: 'Contact Email',
				description: 'Email of the contact whose sale to delete',
				operations: ['delete'],
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
		const name = context.getNodeParameter('name', itemIndex) as string;
		const column = context.getNodeParameter('column', itemIndex) as string;
		const additionalFields = context.getNodeParameter(
			'additionalFields',
			itemIndex,
			{},
		) as IDataObject;

		const saleData: IDataObject = {
			name,
			column,
			...additionalFields,
		};

		const response = await apiService.createSale(context, saleData);

		return ResponseUtils.formatSingleResponse(response);
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

		return ResponseUtils.formatSingleResponse(response);
	}

	private async handleDeleteSale(
		context: IExecuteFunctions,
		itemIndex: number,
		apiService: NextLeadApiService,
	): Promise<INodeExecutionData[]> {
		const contactEmail = context.getNodeParameter('contactEmail', itemIndex) as string;

		await apiService.deleteSale(context, contactEmail);

		return ResponseUtils.formatSuccessResponse(
			`Sale deleted successfully for contact: ${contactEmail}`,
		);
	}

	private async handleGetColumns(
		context: IExecuteFunctions,
		apiService: NextLeadApiService,
	): Promise<INodeExecutionData[]> {
		const response = await apiService.getSalesColumns(context);

		return ResponseUtils.formatArrayResponse(response);
	}
}
