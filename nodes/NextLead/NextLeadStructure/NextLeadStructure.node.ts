import {
	IExecuteFunctions,
	INodeTypeDescription,
	IDataObject,
	INodeProperties,
	INodeExecutionData,
	NodeOperationError,
} from 'n8n-workflow';

import { BaseNextLeadNode } from '../core/BaseNextLeadNode';
import { ResourceType, OperationType } from '../core/types/NextLeadTypes';
import { NodeExecuteUtils, INodeExecuteContext } from '../utils/NodeExecuteUtils';
import { FieldDefinitionUtils } from '../utils/FieldDefinitionUtils';
import {
	OperationHandlerUtils,
	IApiService,
	IUpdateOperationConfig,
	IDeleteOperationConfig,
} from '../utils/OperationHandlerUtils';

export class NextLeadStructure extends BaseNextLeadNode implements INodeExecuteContext {
	description: INodeTypeDescription = this.getBaseDescription(
		'NextLead Structure',
		'nextLeadStructure',
		'={{$parameter["operation"]}}',
		'structure'
	);

	getResourceType(): ResourceType {
		return 'structure';
	}

	getOperations(): INodeProperties[] {
		return [
			FieldDefinitionUtils.createOptionsField({
				name: 'operation',
				displayName: 'Operation',
				description: 'Operation to perform',
				required: true,
				operations: [],
				options: [
					{
						name: 'Create',
						value: 'create',
						description: 'Create a structure',
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
						value: 'getAll',
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
			}),
		];
	}

	getFields(): INodeProperties[] {
		return [
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
			FieldDefinitionUtils.createIdField({
				name: 'structureId',
				displayName: 'Structure ID',
				description: 'ID of the structure to update or delete',
				operations: ['update', 'delete', 'get'],
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
			{
				displayName: 'Return All',
				name: 'returnAll',
				type: 'boolean',
				displayOptions: {
					show: {
						operation: ['getAll'],
					},
				},
				default: false,
				description: 'Whether to return all results or only up to a given limit',
			},
			{
				displayName: 'Limit',
				name: 'limit',
				type: 'number',
				displayOptions: {
					show: {
						operation: ['getAll'],
						returnAll: [false],
					},
				},
				typeOptions: {
					minValue: 1,
				},
				default: 50,
				description: 'Max number of results to return',
			},
		];
	}

	async execute(this: IExecuteFunctions): Promise<INodeExecutionData[][]> {
		return NodeExecuteUtils.executeStandardFlow(this, this as any);
	}

	async executeOperationWithService(
		context: IExecuteFunctions,
		operation: OperationType,
		itemIndex: number,
		apiService: IApiService
	): Promise<any> {
		switch (operation) {
			case 'create':
				return this.handleCreateStructure(context, itemIndex, apiService);
			case 'update':
				return this.handleUpdateStructure(context, itemIndex, apiService);
			case 'delete':
				return this.handleDeleteStructure(context, itemIndex, apiService);
			case 'get':
				return this.handleGetStructure(context, itemIndex, apiService);
			case 'getAll':
				return this.handleGetAllStructures(context, itemIndex, apiService);
			default:
				throw new NodeOperationError(
					context.getNode(),
					`Operation "${operation}" is not supported`
				);
		}
	}

	private async handleCreateStructure(
		context: IExecuteFunctions,
		itemIndex: number,
		apiService: IApiService
	): Promise<any> {
		const name = context.getNodeParameter('name', itemIndex) as string;
		const additionalFields = context.getNodeParameter('additionalFields', itemIndex) as IDataObject;

		const structureData: IDataObject = {
			name,
			...additionalFields,
		};

		const response = await apiService.createStructure(context, structureData);
		NodeExecuteUtils.validateApiResponse(response, 'Create Structure');
		return response.data;
	}

	private async handleUpdateStructure(
		context: IExecuteFunctions,
		itemIndex: number,
		apiService: IApiService
	): Promise<any> {
		const config: IUpdateOperationConfig = {
			operationName: 'Update Structure',
			requiredParams: [],
			idParam: 'structureId',
			updateFieldsParam: 'updateFields',
			apiMethodName: 'updateStructure',
		};

		return OperationHandlerUtils.handleUpdateOperation(
			context,
			itemIndex,
			apiService,
			config
		);
	}

	private async handleDeleteStructure(
		context: IExecuteFunctions,
		itemIndex: number,
		apiService: IApiService
	): Promise<any> {
		const config: IDeleteOperationConfig = {
			operationName: 'Delete Structure',
			requiredParams: [],
			idParam: 'structureId',
			apiMethodName: 'deleteStructure',
		};

		return OperationHandlerUtils.handleDeleteOperation(
			context,
			itemIndex,
			apiService,
			config
		);
	}

	private async handleGetStructure(
		context: IExecuteFunctions,
		itemIndex: number,
		apiService: IApiService
	): Promise<any> {
		const structureId = context.getNodeParameter('structureId', itemIndex) as string;
		const response = await apiService.getStructure(context, structureId);
		NodeExecuteUtils.validateApiResponse(response, 'Get Structure');
		return response.data;
	}

	private async handleGetAllStructures(
		context: IExecuteFunctions,
		itemIndex: number,
		apiService: IApiService
	): Promise<any> {
		const returnAll = context.getNodeParameter('returnAll', itemIndex) as boolean;
		const limit = returnAll ? undefined : (context.getNodeParameter('limit', itemIndex) as number);

		const response = await apiService.getAllStructures(context, limit);
		NodeExecuteUtils.validateApiResponse(response, 'Get All Structures');
		return response.data;
	}

	protected async executeOperation(
		context: IExecuteFunctions,
		operation: OperationType,
		itemIndex: number
	): Promise<any> {
		if (!this.apiService) {
			throw new NodeOperationError(context.getNode(), 'API service not initialized');
		}

		return this.executeOperationWithService(context, operation, itemIndex, this.apiService);
	}
}
