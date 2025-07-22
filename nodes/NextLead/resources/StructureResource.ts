import { IExecuteFunctions, INodeExecutionData, INodeProperties, IDataObject } from 'n8n-workflow';

import { ResourceType, OperationType, NextLeadCredentials } from '../core/types/NextLeadTypes';
import { IResourceStrategy } from '../core/interfaces/IResourceStrategy';
import { FieldDefinitionUtils } from '../utils/FieldDefinitionUtils';
import { NextLeadApiService } from '../core/NextLeadApiService';

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
		const credentials = (await context.getCredentials('nextLeadApi')) as NextLeadCredentials;
		const apiService = new NextLeadApiService(credentials);

		switch (operation) {
			case 'create':
				return this.handleCreateStructure(context, itemIndex, apiService);
			case 'update':
				return this.handleUpdateStructure(context, itemIndex, apiService);
			case 'delete':
				return this.handleDeleteStructure(context, itemIndex, apiService);
			case 'getMany':
				return this.handleGetManyStructures(context, apiService);
			default:
				throw new Error(`Unknown operation: ${operation}`);
		}
	}

	private async handleCreateStructure(
		context: IExecuteFunctions,
		itemIndex: number,
		apiService: NextLeadApiService,
	): Promise<INodeExecutionData[]> {
		const name = context.getNodeParameter('name', itemIndex) as string;
		const additionalFields = context.getNodeParameter(
			'additionalFields',
			itemIndex,
			{},
		) as IDataObject;

		const structureData: IDataObject = {
			name,
			...additionalFields,
		};

		const response = await apiService.createStructure(context, structureData);

		if (!response.success) {
			throw new Error(`Failed to create structure: ${response.error}`);
		}

		return [{ json: response.data }];
	}

	private async handleUpdateStructure(
		context: IExecuteFunctions,
		itemIndex: number,
		apiService: NextLeadApiService,
	): Promise<INodeExecutionData[]> {
		const structureId = context.getNodeParameter('structureId', itemIndex) as string;
		const updateFields = context.getNodeParameter('updateFields', itemIndex, {}) as IDataObject;

		const updateData: IDataObject = {
			id: structureId,
			...updateFields,
		};

		const response = await apiService.updateStructure(context, updateData);

		if (!response.success) {
			throw new Error(`Failed to update structure: ${response.error}`);
		}

		return [{ json: response.data }];
	}

	private async handleDeleteStructure(
		context: IExecuteFunctions,
		itemIndex: number,
		apiService: NextLeadApiService,
	): Promise<INodeExecutionData[]> {
		const structureId = context.getNodeParameter('structureId', itemIndex) as string;

		const response = await apiService.deleteStructure(context, structureId);

		if (!response.success) {
			throw new Error(`Failed to delete structure: ${response.error}`);
		}

		return [{ json: { success: true, message: 'Structure deleted successfully', structureId } }];
	}

	private async handleGetManyStructures(
		context: IExecuteFunctions,
		apiService: NextLeadApiService,
	): Promise<INodeExecutionData[]> {
		const response = await apiService.getStructures(context);

		if (!response.success) {
			throw new Error(`Failed to get structures: ${response.error}`);
		}

		if (Array.isArray(response.data)) {
			return response.data.map((structure) => ({ json: structure }));
		}

		return [{ json: response.data }];
	}
}
