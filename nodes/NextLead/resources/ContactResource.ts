import { IExecuteFunctions, INodeExecutionData, INodeProperties } from 'n8n-workflow';

import { ResourceType, OperationType } from '../core/types/NextLeadTypes';
import { IResourceStrategy } from '../core/interfaces/IResourceStrategy';
import { FieldDefinitionUtils } from '../utils/FieldDefinitionUtils';
// import { OperationHandlerUtils } from '../utils/OperationHandlerUtils';

export class ContactResource implements IResourceStrategy {
	getResourceType(): ResourceType {
		return 'contact';
	}

	getOperations(): INodeProperties[] {
		return [
			{
				displayName: 'Operation',
				name: 'operation',
				type: 'options',
				noDataExpression: true,
				displayOptions: {
					show: { resource: ['contact'] },
				},
				options: [
					{
						name: 'Create',
						value: 'create',
						description: 'Create a new contact',
						action: 'Create a contact',
					},
					{
						name: 'Delete',
						value: 'delete',
						description: 'Delete a contact',
						action: 'Delete a contact',
					},
					{
						name: 'Get',
						value: 'get',
						description: 'Get a contact',
						action: 'Get a contact',
					},
					{
						name: 'Get Many',
						value: 'getMany',
						description: 'Get many contacts',
						action: 'Get many contacts',
					},
					{
						name: 'Update',
						value: 'update',
						description: 'Update a contact',
						action: 'Update a contact',
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
				name: 'firstName',
				displayName: 'First Name',
				description: 'First name of the contact',
				required: true,
				operations: ['create'],
			}),
			FieldDefinitionUtils.createStringField({
				name: 'lastName',
				displayName: 'Last Name',
				description: 'Last name of the contact',
				required: true,
				operations: ['create'],
			}),
			FieldDefinitionUtils.createEmailField({
				name: 'email',
				displayName: 'Email',
				description: 'Email address of the contact',
				required: true,
				operations: ['create'],
			}),
			FieldDefinitionUtils.createCollectionField({
				name: 'additionalFields',
				displayName: 'Additional Fields',
				description: 'Additional fields for the contact',
				operations: ['create'],
				fields: [
					...FieldDefinitionUtils.getCommonContactFields(),
					{
						name: 'lists',
						displayName: 'List IDs',
						description: 'Comma-separated list IDs to assign the contact to',
					},
					{
						name: 'users',
						displayName: 'User IDs',
						description: 'Comma-separated user IDs to assign the contact to',
					},
				],
			}),

			// Update fields
			FieldDefinitionUtils.createStringField({
				name: 'contactId',
				displayName: 'Contact ID',
				description: 'ID of the contact to update',
				required: true,
				operations: ['update'],
			}),
			FieldDefinitionUtils.createCollectionField({
				name: 'updateFields',
				displayName: 'Update Fields',
				description: 'Fields to update',
				operations: ['update'],
				fields: [
					{
						name: 'firstName',
						displayName: 'First Name',
						description: 'First name of the contact',
					},
					{
						name: 'lastName',
						displayName: 'Last Name',
						description: 'Last name of the contact',
					},
					{
						name: 'email',
						displayName: 'Email',
						description: 'Email address of the contact',
					},
					...FieldDefinitionUtils.getCommonContactFields(),
				],
			}),

			// Delete fields
			FieldDefinitionUtils.createStringField({
				name: 'contactId',
				displayName: 'Contact ID',
				description: 'ID of the contact to delete',
				required: true,
				operations: ['delete'],
			}),

			// Get fields
			FieldDefinitionUtils.createStringField({
				name: 'contactId',
				displayName: 'Contact ID',
				description: 'ID of the contact to get',
				required: true,
				operations: ['get'],
			}),

			// Get Many fields
			FieldDefinitionUtils.createNumberField({
				name: 'limit',
				displayName: 'Limit',
				description: 'Maximum number of contacts to return',
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
		// TODO: Implement proper operation handlers
		// For now, return empty array to test architecture
		switch (operation) {
			case 'create':
				return [{ json: { message: 'Contact create operation - TODO' } }];
			case 'update':
				return [{ json: { message: 'Contact update operation - TODO' } }];
			case 'delete':
				return [{ json: { message: 'Contact delete operation - TODO' } }];
			case 'get':
				return [{ json: { message: 'Contact get operation - TODO' } }];
			case 'getMany':
				return [{ json: { message: 'Contact getMany operation - TODO' } }];
			default:
				throw new Error(`Unknown operation: ${operation}`);
		}
	}
}
