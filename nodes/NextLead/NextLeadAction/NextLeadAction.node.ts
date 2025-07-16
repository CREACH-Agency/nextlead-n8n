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

export class NextLeadAction extends BaseNextLeadNode implements INodeExecuteContext {
	description: INodeTypeDescription = this.getBaseDescription(
		'NextLead Action',
		'nextLeadAction',
		'={{$parameter["operation"]}}',
		'action'
	);

	getResourceType(): ResourceType {
		return 'action';
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
						description: 'Create a new action',
						action: 'Create an action',
					},
					{
						name: 'Update',
						value: 'update',
						description: 'Update an action',
						action: 'Update an action',
					},
					{
						name: 'Delete',
						value: 'delete',
						description: 'Delete an action',
						action: 'Delete an action',
					},
					{
						name: 'Get Columns',
						value: 'getColumns',
						description: 'Get action columns',
						action: 'Get action columns',
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
				description: 'ID of the contact associated with the action',
				required: true,
				operations: ['create'],
			}),
			FieldDefinitionUtils.createStringField({
				name: 'columnId',
				displayName: 'Column ID',
				description: 'ID of the action column/stage',
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
			// Update and Delete fields
			FieldDefinitionUtils.createIdField({
				name: 'actionId',
				displayName: 'Action ID',
				description: 'ID of the action to update or delete',
				operations: ['update', 'delete'],
			}),
			FieldDefinitionUtils.createCollectionField({
				name: 'updateFields',
				displayName: 'Update Fields',
				description: 'Fields to update',
				operations: ['update'],
				fields: [
					{
						displayName: 'Column ID',
						name: 'columnId',
						description: 'ID of the action column/stage',
						default: '',
					},
					{
						displayName: 'Contact ID',
						name: 'contactId',
						description: 'ID of the contact associated with the action',
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
						default: 'medium',
					},
					{
						displayName: 'Status',
						name: 'status',
						description: 'Status of the action',
						default: 'open',
					},
					{
						displayName: 'Title',
						name: 'title',
						description: 'Title of the action',
						default: '',
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
				return this.handleCreateAction(context, itemIndex, apiService);
			case 'update':
				return this.handleUpdateAction(context, itemIndex, apiService);
			case 'delete':
				return this.handleDeleteAction(context, itemIndex, apiService);
			case 'getColumns':
				return this.handleGetActionsColumns(context, apiService);
			default:
				throw new NodeOperationError(
					context.getNode(),
					`Operation "${operation}" is not supported`
				);
		}
	}

	private async handleCreateAction(
		context: IExecuteFunctions,
		itemIndex: number,
		apiService: IApiService
	): Promise<any> {
		const contactId = context.getNodeParameter('contactId', itemIndex) as string;
		const columnId = context.getNodeParameter('columnId', itemIndex) as string;
		const title = context.getNodeParameter('title', itemIndex) as string;
		const additionalFields = context.getNodeParameter('additionalFields', itemIndex) as IDataObject;

		const actionData: IDataObject = {
			contactId,
			columnId,
			title,
			...additionalFields,
		};

		const response = await apiService.createAction(context, actionData);
		NodeExecuteUtils.validateApiResponse(response, 'Create Action');
		return response.data;
	}

	private async handleUpdateAction(
		context: IExecuteFunctions,
		itemIndex: number,
		apiService: IApiService
	): Promise<any> {
		const config: IUpdateOperationConfig = {
			operationName: 'Update Action',
			requiredParams: [],
			idParam: 'actionId',
			updateFieldsParam: 'updateFields',
			apiMethodName: 'updateAction',
		};

		return OperationHandlerUtils.handleUpdateOperation(
			context,
			itemIndex,
			apiService,
			config
		);
	}

	private async handleDeleteAction(
		context: IExecuteFunctions,
		itemIndex: number,
		apiService: IApiService
	): Promise<any> {
		const config: IDeleteOperationConfig = {
			operationName: 'Delete Action',
			requiredParams: [],
			idParam: 'actionId',
			apiMethodName: 'deleteAction',
		};

		return OperationHandlerUtils.handleDeleteOperation(
			context,
			itemIndex,
			apiService,
			config
		);
	}

	private async handleGetActionsColumns(
		context: IExecuteFunctions,
		apiService: IApiService
	): Promise<any> {
		const config: IOperationConfig = {
			operationName: 'Get Actions Columns',
			requiredParams: [],
			apiMethodName: 'getActionsColumns',
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
