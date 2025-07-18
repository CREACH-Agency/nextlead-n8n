import { IExecuteFunctions, INodeExecutionData, INodeProperties } from 'n8n-workflow';

import { ResourceType, OperationType } from '../core/types/NextLeadTypes';
import { IResourceStrategy } from '../core/interfaces/IResourceStrategy';
import { FieldDefinitionUtils } from '../utils/FieldDefinitionUtils';

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
			FieldDefinitionUtils.createIdField({
				name: 'saleId',
				displayName: 'Sale ID',
				description: 'ID of the sale to delete',
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
		switch (operation) {
			case 'create':
				return [{ json: { message: 'Sale create operation - TODO' } }];
			case 'update':
				return [{ json: { message: 'Sale update operation - TODO' } }];
			case 'delete':
				return [{ json: { message: 'Sale delete operation - TODO' } }];
			case 'get':
				return [{ json: { message: 'Sale get operation - TODO' } }];
			case 'getMany':
				return [{ json: { message: 'Sale getMany operation - TODO' } }];
			default:
				throw new Error(`Unknown operation: ${operation}`);
		}
	}
}
