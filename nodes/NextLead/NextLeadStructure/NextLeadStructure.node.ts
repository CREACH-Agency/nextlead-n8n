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

export class NextLeadStructure extends BaseNextLeadNode {
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
			{
				displayName: 'Operation',
				name: 'operation',
				type: 'options',
				noDataExpression: true,
				options: [
					{
						name: 'Create',
						value: 'create',
						description: 'Create a new structure',
						action: 'Create a structure',
					},
					{
						name: 'Update',
						value: 'update',
						description: 'Update a structure',
						action: 'Update a structure',
					},
					{
						name: 'Delete',
						value: 'delete',
						description: 'Delete a structure',
						action: 'Delete a structure',
					},
					{
						name: 'Get Many',
						value: 'getAll',
						description: 'Get many structures',
						action: 'Get many structures',
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
				description: 'Name of the structure',
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
						displayName: 'Address',
						name: 'address',
						type: 'string',
						default: '',
						description: 'Address of the structure',
					},
					{
						displayName: 'City',
						name: 'city',
						type: 'string',
						default: '',
						description: 'City of the structure',
					},
					{
						displayName: 'Country',
						name: 'country',
						type: 'string',
						default: '',
						description: 'Country of the structure',
					},
					{
						displayName: 'Email',
						name: 'email',
						type: 'string',
						placeholder: 'name@email.com',
						typeOptions: {
							email: true,
						},
						default: '',
						description: 'Email address of the structure',
					},
					{
						displayName: 'Phone',
						name: 'phone',
						type: 'string',
						default: '',
						description: 'Phone number of the structure',
					},
					{
						displayName: 'Postal Code',
						name: 'postalCode',
						type: 'string',
						default: '',
						description: 'Postal code of the structure',
					},
					{
						displayName: 'SIRET',
						name: 'siret',
						type: 'string',
						default: '',
						description: 'SIRET number of the structure',
					},
					{
						displayName: 'Website',
						name: 'website',
						type: 'string',
						default: '',
						description: 'Website URL of the structure',
					},
				],
			},
			// Update fields
			{
				displayName: 'Structure ID',
				name: 'structureId',
				type: 'string',
				required: true,
				displayOptions: {
					show: {
						operation: ['update', 'delete'],
					},
				},
				default: '',
				description: 'ID of the structure to update or delete',
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
						displayName: 'Address',
						name: 'address',
						type: 'string',
						default: '',
						description: 'Address of the structure',
					},
					{
						displayName: 'City',
						name: 'city',
						type: 'string',
						default: '',
						description: 'City of the structure',
					},
					{
						displayName: 'Country',
						name: 'country',
						type: 'string',
						default: '',
						description: 'Country of the structure',
					},
					{
						displayName: 'Email',
						name: 'email',
						type: 'string',
						placeholder: 'name@email.com',
						typeOptions: {
							email: true,
						},
						default: '',
						description: 'Email address of the structure',
					},
					{
						displayName: 'Name',
						name: 'name',
						type: 'string',
						default: '',
						description: 'Name of the structure',
					},
					{
						displayName: 'Phone',
						name: 'phone',
						type: 'string',
						default: '',
						description: 'Phone number of the structure',
					},
					{
						displayName: 'Postal Code',
						name: 'postalCode',
						type: 'string',
						default: '',
						description: 'Postal code of the structure',
					},
					{
						displayName: 'SIRET',
						name: 'siret',
						type: 'string',
						default: '',
						description: 'SIRET number of the structure',
					},
					{
						displayName: 'Website',
						name: 'website',
						type: 'string',
						default: '',
						description: 'Website URL of the structure',
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
				return this.createStructureWithService(context, itemIndex, apiService);
			case 'update':
				return this.updateStructureWithService(context, itemIndex, apiService);
			case 'delete':
				return this.deleteStructureWithService(context, itemIndex, apiService);
			case 'getAll':
				return this.getStructuresWithService(context, apiService);
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
				return this.createStructure(context, itemIndex);
			case 'update':
				return this.updateStructure(context, itemIndex);
			case 'delete':
				return this.deleteStructure(context, itemIndex);
			case 'getAll':
				return this.getStructures(context);
			default:
				throw new NodeOperationError(context.getNode(), `Operation "${operation}" is not supported`);
		}
	}

	private async createStructure(context: IExecuteFunctions, itemIndex: number): Promise<any> {
		const name = context.getNodeParameter('name', itemIndex) as string;
		const additionalFields = context.getNodeParameter('additionalFields', itemIndex) as IDataObject;

		const structureData: IDataObject = {
			name,
			...additionalFields,
		};

		const response = await this.apiService!.createStructure(context, structureData);
		if (!response.success) {
			throw new NodeOperationError(context.getNode(), response.error || 'Create structure failed');
		}
		return response.data;
	}

	private async updateStructure(context: IExecuteFunctions, itemIndex: number): Promise<any> {
		const structureId = context.getNodeParameter('structureId', itemIndex) as string;
		const updateFields = context.getNodeParameter('updateFields', itemIndex) as IDataObject;

		const structureData: IDataObject = {
			id: structureId,
			...updateFields,
		};

		const response = await this.apiService!.updateStructure(context, structureData);
		if (!response.success) {
			throw new NodeOperationError(context.getNode(), response.error || 'Update structure failed');
		}
		return response.data;
	}

	private async deleteStructure(context: IExecuteFunctions, itemIndex: number): Promise<any> {
		const structureId = context.getNodeParameter('structureId', itemIndex) as string;

		const response = await this.apiService!.deleteStructure(context, structureId);
		if (!response.success) {
			throw new NodeOperationError(context.getNode(), response.error || 'Delete structure failed');
		}
		return response.data;
	}

	private async getStructures(context: IExecuteFunctions): Promise<any> {
		const response = await this.apiService!.getStructures(context);
		if (!response.success) {
			throw new NodeOperationError(context.getNode(), response.error || 'Get structures failed');
		}
		return response.data;
	}

	private async createStructureWithService(context: IExecuteFunctions, itemIndex: number, apiService: any): Promise<any> {
		const name = context.getNodeParameter('name', itemIndex) as string;
		const additionalFields = context.getNodeParameter('additionalFields', itemIndex) as IDataObject;

		const structureData: IDataObject = {
			name,
			...additionalFields,
		};

		const response = await apiService.createStructure(context, structureData);
		if (!response.success) {
			throw new NodeOperationError(context.getNode(), response.error || 'Create structure failed');
		}
		return response.data;
	}

	private async updateStructureWithService(context: IExecuteFunctions, itemIndex: number, apiService: any): Promise<any> {
		const structureId = context.getNodeParameter('structureId', itemIndex) as string;
		const updateFields = context.getNodeParameter('updateFields', itemIndex) as IDataObject;

		const structureData: IDataObject = {
			id: structureId,
			...updateFields,
		};

		const response = await apiService.updateStructure(context, structureData);
		if (!response.success) {
			throw new NodeOperationError(context.getNode(), response.error || 'Update structure failed');
		}
		return response.data;
	}

	private async deleteStructureWithService(context: IExecuteFunctions, itemIndex: number, apiService: any): Promise<any> {
		const structureId = context.getNodeParameter('structureId', itemIndex) as string;

		const response = await apiService.deleteStructure(context, structureId);
		if (!response.success) {
			throw new NodeOperationError(context.getNode(), response.error || 'Delete structure failed');
		}
		return response.data;
	}

	private async getStructuresWithService(context: IExecuteFunctions, apiService: any): Promise<any> {
		const response = await apiService.getStructures(context);
		if (!response.success) {
			throw new NodeOperationError(context.getNode(), response.error || 'Get structures failed');
		}
		return response.data;
	}
}
