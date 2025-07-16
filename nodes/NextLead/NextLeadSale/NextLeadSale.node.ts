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
	IOperationConfig,
} from '../utils/OperationHandlerUtils';

export class NextLeadSale extends BaseNextLeadNode implements INodeExecuteContext {
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
			}),
		];
	}

	getFields(): INodeProperties[] {
		return [
			// Create fields
			FieldDefinitionUtils.createStringField({
				name: 'contactId',
				displayName: 'Contact ID',
				description: 'ID of the contact associated with the sale',
				required: true,
				operations: ['create'],
			}),
			FieldDefinitionUtils.createStringField({
				name: 'columnId',
				displayName: 'Column ID',
				description: 'ID of the sales column/stage',
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
			// Update and Delete fields
			FieldDefinitionUtils.createIdField({
				name: 'saleId',
				displayName: 'Sale ID',
				description: 'ID of the sale to update or delete',
				operations: ['update', 'delete'],
			}),
			FieldDefinitionUtils.createCollectionField({
				name: 'updateFields',
				displayName: 'Update Fields',
				description: 'Fields to update',
				operations: ['update'],
				fields: [
					{
						displayName: 'Amount',
						name: 'amount',
						description: 'Sale amount',
						default: 0,
					},
					{
						displayName: 'Close Date',
						name: 'closeDate',
						description: 'Expected close date',
						default: '',
					},
					{
						displayName: 'Column ID',
						name: 'columnId',
						description: 'ID of the sales column/stage',
						default: '',
					},
					{
						displayName: 'Contact ID',
						name: 'contactId',
						description: 'ID of the contact associated with the sale',
						default: '',
					},
					{
						displayName: 'Description',
						name: 'description',
						description: 'Sale description',
						default: '',
					},
					{
						displayName: 'Name',
						name: 'name',
						description: 'Name of the sale',
						default: '',
					},
					{
						displayName: 'Probability',
						name: 'probability',
						description: 'Probability of closing the sale (0-100)',
						default: 0,
					},
				],
			}),
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
				return this.handleCreateSale(context, itemIndex, apiService);
			case 'update':
				return this.handleUpdateSale(context, itemIndex, apiService);
			case 'delete':
				return this.handleDeleteSale(context, itemIndex, apiService);
			case 'getColumns':
				return this.handleGetSalesColumns(context, apiService);
			default:
				throw new NodeOperationError(
					context.getNode(),
					`Operation "${operation}" is not supported`
				);
		}
	}

	private async handleCreateSale(
		context: IExecuteFunctions,
		itemIndex: number,
		apiService: IApiService
	): Promise<any> {
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
		NodeExecuteUtils.validateApiResponse(response, 'Create Sale');
		return response.data;
	}

	private async handleUpdateSale(
		context: IExecuteFunctions,
		itemIndex: number,
		apiService: IApiService
	): Promise<any> {
		const config: IUpdateOperationConfig = {
			operationName: 'Update Sale',
			requiredParams: [],
			idParam: 'saleId',
			updateFieldsParam: 'updateFields',
			apiMethodName: 'updateSale',
		};

		return OperationHandlerUtils.handleUpdateOperation(
			context,
			itemIndex,
			apiService,
			config
		);
	}

	private async handleDeleteSale(
		context: IExecuteFunctions,
		itemIndex: number,
		apiService: IApiService
	): Promise<any> {
		const config: IDeleteOperationConfig = {
			operationName: 'Delete Sale',
			requiredParams: [],
			idParam: 'saleId',
			apiMethodName: 'deleteSale',
		};

		return OperationHandlerUtils.handleDeleteOperation(
			context,
			itemIndex,
			apiService,
			config
		);
	}

	private async handleGetSalesColumns(
		context: IExecuteFunctions,
		apiService: IApiService
	): Promise<any> {
		const config: IOperationConfig = {
			operationName: 'Get Sales Columns',
			requiredParams: [],
			apiMethodName: 'getSalesColumns',
		};

		return OperationHandlerUtils.handleGetOperation(context, apiService, config);
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
