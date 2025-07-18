import { IExecuteFunctions, INodeExecutionData, INodeProperties } from 'n8n-workflow';

import { ResourceType, OperationType } from '../core/types/NextLeadTypes';
import { IResourceStrategy } from '../core/interfaces/IResourceStrategy';
import { FieldDefinitionUtils } from '../utils/FieldDefinitionUtils';

export class ActionResource implements IResourceStrategy {
	getResourceType(): ResourceType {
		return 'action';
	}

	getOperations(): INodeProperties[] {
		return [
			{
				displayName: 'Operation',
				name: 'operation',
				type: 'options',
				noDataExpression: true,
				displayOptions: {
					show: { resource: ['action'] },
				},
				options: [
					{
						name: 'Create',
						value: 'create',
						description: 'Create a new action',
						action: 'Create an action',
					},
					{
						name: 'Delete',
						value: 'delete',
						description: 'Delete an action',
						action: 'Delete an action',
					},
					{
						name: 'Get',
						value: 'get',
						description: 'Get an action',
						action: 'Get an action',
					},
					{
						name: 'Get Many',
						value: 'getMany',
						description: 'Get many actions',
						action: 'Get many actions',
					},
					{
						name: 'Update',
						value: 'update',
						description: 'Update an action',
						action: 'Update an action',
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
				name: 'title',
				displayName: 'Title',
				description: 'Title of the action',
				required: true,
				operations: ['create'],
			}),
			FieldDefinitionUtils.createCollectionField({
				name: 'additionalFields',
				displayName: 'Additional Fields',
				description: 'Additional fields for the action',
				operations: ['create'],
				fields: [
					{
						displayName: 'Description',
						name: 'description',
						description: 'Action description',
						default: '',
					},
					{
						displayName: 'Due Date',
						name: 'dueDate',
						description: 'Due date for the action',
						default: '',
					},
					{
						displayName: 'Priority',
						name: 'priority',
						description: 'Priority level of the action',
						default: 'medium',
					},
					{
						displayName: 'Status',
						name: 'status',
						description: 'Status of the action',
						default: 'open',
					},
				],
			}),

			// Update fields
			FieldDefinitionUtils.createIdField({
				name: 'actionId',
				displayName: 'Action ID',
				description: 'ID of the action to update',
				operations: ['update'],
			}),
			FieldDefinitionUtils.createCollectionField({
				name: 'updateFields',
				displayName: 'Update Fields',
				description: 'Fields to update',
				operations: ['update'],
				fields: [
					{
						displayName: 'Title',
						name: 'title',
						description: 'Title of the action',
						default: '',
					},
					{
						displayName: 'Description',
						name: 'description',
						description: 'Action description',
						default: '',
					},
					{
						displayName: 'Due Date',
						name: 'dueDate',
						description: 'Due date for the action',
						default: '',
					},
					{
						displayName: 'Priority',
						name: 'priority',
						description: 'Priority level of the action',
						default: '',
					},
					{
						displayName: 'Status',
						name: 'status',
						description: 'Status of the action',
						default: '',
					},
				],
			}),

			// Delete fields
			FieldDefinitionUtils.createIdField({
				name: 'actionId',
				displayName: 'Action ID',
				description: 'ID of the action to delete',
				operations: ['delete'],
			}),

			// Get fields
			FieldDefinitionUtils.createIdField({
				name: 'actionId',
				displayName: 'Action ID',
				description: 'ID of the action to get',
				operations: ['get'],
			}),

			// Get Many fields
			FieldDefinitionUtils.createNumberField({
				name: 'limit',
				displayName: 'Limit',
				description: 'Maximum number of actions to return',
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
				return [{ json: { message: 'Action create operation - TODO' } }];
			case 'update':
				return [{ json: { message: 'Action update operation - TODO' } }];
			case 'delete':
				return [{ json: { message: 'Action delete operation - TODO' } }];
			case 'get':
				return [{ json: { message: 'Action get operation - TODO' } }];
			case 'getMany':
				return [{ json: { message: 'Action getMany operation - TODO' } }];
			default:
				throw new Error(`Unknown operation: ${operation}`);
		}
	}
}
