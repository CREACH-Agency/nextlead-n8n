import { IExecuteFunctions, INodeExecutionData, INodeProperties } from 'n8n-workflow';

import { ResourceType, OperationType } from '../core/types/NextLeadTypes';
import { IResourceStrategy } from '../core/interfaces/IResourceStrategy';
import { FieldDefinitionUtils } from '../utils/FieldDefinitionUtils';

export class StructureResource implements IResourceStrategy {
	getResourceType(): ResourceType {
		return 'structure';
	}

	getOperations(): INodeProperties[] {
		return [
			{
				displayName: 'Operation',
				name: 'operation',
				type: 'options',
				noDataExpression: true,
				displayOptions: {
					show: { resource: ['structure'] },
				},
				options: [
					{
						name: 'Create',
						value: 'create',
						description: 'Create a new structure',
						action: 'Create a structure',
					},
					{
						name: 'Delete',
						value: 'delete',
						description: 'Delete a structure',
						action: 'Delete a structure',
					},
					{
						name: 'Get',
						value: 'get',
						description: 'Get a structure',
						action: 'Get a structure',
					},
					{
						name: 'Get Many',
						value: 'getMany',
						description: 'Get many structures',
						action: 'Get many structures',
					},
					{
						name: 'Update',
						value: 'update',
						description: 'Update a structure',
						action: 'Update a structure',
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
				description: 'Name of the structure',
				required: true,
				operations: ['create'],
			}),
			FieldDefinitionUtils.createCollectionField({
				name: 'additionalFields',
				displayName: 'Additional Fields',
				description: 'Additional fields for the structure',
				operations: ['create'],
				fields: [
					{
						displayName: 'Description',
						name: 'description',
						description: 'Description of the structure',
						default: '',
					},
					{
						displayName: 'Type',
						name: 'type',
						description: 'Type of the structure (organization, department, team, project)',
						default: 'organization',
					},
					{
						displayName: 'Parent ID',
						name: 'parentId',
						description: 'ID of the parent structure',
						default: '',
					},
					{
						displayName: 'Active',
						name: 'active',
						description: 'Whether the structure is active (true/false)',
						default: 'true',
					},
					{
						displayName: 'Metadata',
						name: 'metadata',
						description: 'Additional metadata for the structure (JSON format)',
						default: '{}',
					},
				],
			}),

			// Update fields
			FieldDefinitionUtils.createIdField({
				name: 'structureId',
				displayName: 'Structure ID',
				description: 'ID of the structure to update',
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
						description: 'Name of the structure',
						default: '',
					},
					{
						displayName: 'Description',
						name: 'description',
						description: 'Description of the structure',
						default: '',
					},
					{
						displayName: 'Type',
						name: 'type',
						description: 'Type of the structure',
						default: '',
					},
					{
						displayName: 'Parent ID',
						name: 'parentId',
						description: 'ID of the parent structure',
						default: '',
					},
					{
						displayName: 'Active',
						name: 'active',
						description: 'Whether the structure is active',
						default: '',
					},
					{
						displayName: 'Metadata',
						name: 'metadata',
						description: 'Additional metadata for the structure',
						default: '',
					},
				],
			}),

			// Delete fields
			FieldDefinitionUtils.createIdField({
				name: 'structureId',
				displayName: 'Structure ID',
				description: 'ID of the structure to delete',
				operations: ['delete'],
			}),

			// Get fields
			FieldDefinitionUtils.createIdField({
				name: 'structureId',
				displayName: 'Structure ID',
				description: 'ID of the structure to get',
				operations: ['get'],
			}),

			// Get Many fields
			FieldDefinitionUtils.createNumberField({
				name: 'limit',
				displayName: 'Limit',
				description: 'Maximum number of structures to return',
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
				return [{ json: { message: 'Structure create operation - TODO' } }];
			case 'update':
				return [{ json: { message: 'Structure update operation - TODO' } }];
			case 'delete':
				return [{ json: { message: 'Structure delete operation - TODO' } }];
			case 'get':
				return [{ json: { message: 'Structure get operation - TODO' } }];
			case 'getMany':
				return [{ json: { message: 'Structure getMany operation - TODO' } }];
			default:
				throw new Error(`Unknown operation: ${operation}`);
		}
	}
}
