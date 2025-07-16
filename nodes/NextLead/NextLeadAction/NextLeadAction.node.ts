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

export class NextLeadAction extends BaseNextLeadNode {
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
			{
				displayName: 'Operation',
				name: 'operation',
				type: 'options',
				noDataExpression: true,
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
			},
		];
	}

	getFields(): INodeProperties[] {
		return [
			// Create fields
			{
				displayName: 'Contact ID',
				name: 'contactId',
				type: 'string',
				required: true,
				displayOptions: {
					show: {
						operation: ['create'],
					},
				},
				default: '',
				description: 'ID of the contact associated with the action',
			},
			{
				displayName: 'Column ID',
				name: 'columnId',
				type: 'string',
				required: true,
				displayOptions: {
					show: {
						operation: ['create'],
					},
				},
				default: '',
				description: 'ID of the action column/stage',
			},
			{
				displayName: 'Title',
				name: 'title',
				type: 'string',
				required: true,
				displayOptions: {
					show: {
						operation: ['create'],
					},
				},
				default: '',
				description: 'Title of the action',
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
						displayName: 'Description',
						name: 'description',
						type: 'string',
						typeOptions: {
							rows: 3,
						},
						default: '',
						description: 'Action description',
					},
					{
						displayName: 'Due Date',
						name: 'dueDate',
						type: 'dateTime',
						default: '',
						description: 'Due date for the action',
					},
					{
						displayName: 'Priority',
						name: 'priority',
						type: 'options',
						options: [
							{
								name: 'Low',
								value: 'low',
							},
							{
								name: 'Medium',
								value: 'medium',
							},
							{
								name: 'High',
								value: 'high',
							},
							{
								name: 'Urgent',
								value: 'urgent',
							},
						],
						default: 'medium',
						description: 'Priority level of the action',
					},
					{
						displayName: 'Status',
						name: 'status',
						type: 'options',
						options: [
							{
								name: 'Open',
								value: 'open',
							},
							{
								name: 'In Progress',
								value: 'in_progress',
							},
							{
								name: 'Completed',
								value: 'completed',
							},
							{
								name: 'Cancelled',
								value: 'cancelled',
							},
						],
						default: 'open',
						description: 'Status of the action',
					},
				],
			},
			// Update fields
			{
				displayName: 'Action ID',
				name: 'actionId',
				type: 'string',
				required: true,
				displayOptions: {
					show: {
						operation: ['update', 'delete'],
					},
				},
				default: '',
				description: 'ID of the action to update or delete',
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
						displayName: 'Column ID',
						name: 'columnId',
						type: 'string',
						default: '',
						description: 'ID of the action column/stage',
					},
					{
						displayName: 'Contact ID',
						name: 'contactId',
						type: 'string',
						default: '',
						description: 'ID of the contact associated with the action',
					},
					{
						displayName: 'Description',
						name: 'description',
						type: 'string',
						typeOptions: {
							rows: 3,
						},
						default: '',
						description: 'Action description',
					},
					{
						displayName: 'Due Date',
						name: 'dueDate',
						type: 'dateTime',
						default: '',
						description: 'Due date for the action',
					},
					{
						displayName: 'Priority',
						name: 'priority',
						type: 'options',
						options: [
							{
								name: 'Low',
								value: 'low',
							},
							{
								name: 'Medium',
								value: 'medium',
							},
							{
								name: 'High',
								value: 'high',
							},
							{
								name: 'Urgent',
								value: 'urgent',
							},
						],
						default: 'medium',
						description: 'Priority level of the action',
					},
					{
						displayName: 'Status',
						name: 'status',
						type: 'options',
						options: [
							{
								name: 'Open',
								value: 'open',
							},
							{
								name: 'In Progress',
								value: 'in_progress',
							},
							{
								name: 'Completed',
								value: 'completed',
							},
							{
								name: 'Cancelled',
								value: 'cancelled',
							},
						],
						default: 'open',
						description: 'Status of the action',
					},
					{
						displayName: 'Title',
						name: 'title',
						type: 'string',
						default: '',
						description: 'Title of the action',
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
				return this.createActionWithService(context, itemIndex, apiService);
			case 'update':
				return this.updateActionWithService(context, itemIndex, apiService);
			case 'delete':
				return this.deleteActionWithService(context, itemIndex, apiService);
			case 'getColumns':
				return this.getActionsColumnsWithService(context, apiService);
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
				return this.createAction(context, itemIndex);
			case 'update':
				return this.updateAction(context, itemIndex);
			case 'delete':
				return this.deleteAction(context, itemIndex);
			case 'getColumns':
				return this.getActionsColumns(context);
			default:
				throw new NodeOperationError(context.getNode(), `Operation "${operation}" is not supported`);
		}
	}

	private async createAction(context: IExecuteFunctions, itemIndex: number): Promise<any> {
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

		const response = await this.apiService!.createAction(context, actionData);
		if (!response.success) {
			throw new NodeOperationError(context.getNode(), response.error || 'Create action failed');
		}
		return response.data;
	}

	private async updateAction(context: IExecuteFunctions, itemIndex: number): Promise<any> {
		const actionId = context.getNodeParameter('actionId', itemIndex) as string;
		const updateFields = context.getNodeParameter('updateFields', itemIndex) as IDataObject;

		const actionData: IDataObject = {
			id: actionId,
			...updateFields,
		};

		const response = await this.apiService!.updateAction(context, actionData);
		if (!response.success) {
			throw new NodeOperationError(context.getNode(), response.error || 'Update action failed');
		}
		return response.data;
	}

	private async deleteAction(context: IExecuteFunctions, itemIndex: number): Promise<any> {
		const actionId = context.getNodeParameter('actionId', itemIndex) as string;

		const response = await this.apiService!.deleteAction(context, actionId);
		if (!response.success) {
			throw new NodeOperationError(context.getNode(), response.error || 'Delete action failed');
		}
		return response.data;
	}

	private async getActionsColumns(context: IExecuteFunctions): Promise<any> {
		const response = await this.apiService!.getActionsColumns(context);
		if (!response.success) {
			throw new NodeOperationError(context.getNode(), response.error || 'Get actions columns failed');
		}
		return response.data;
	}

	private async createActionWithService(context: IExecuteFunctions, itemIndex: number, apiService: any): Promise<any> {
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
		if (!response.success) {
			throw new NodeOperationError(context.getNode(), response.error || 'Create action failed');
		}
		return response.data;
	}

	private async updateActionWithService(context: IExecuteFunctions, itemIndex: number, apiService: any): Promise<any> {
		const actionId = context.getNodeParameter('actionId', itemIndex) as string;
		const updateFields = context.getNodeParameter('updateFields', itemIndex) as IDataObject;

		const actionData: IDataObject = {
			id: actionId,
			...updateFields,
		};

		const response = await apiService.updateAction(context, actionData);
		if (!response.success) {
			throw new NodeOperationError(context.getNode(), response.error || 'Update action failed');
		}
		return response.data;
	}

	private async deleteActionWithService(context: IExecuteFunctions, itemIndex: number, apiService: any): Promise<any> {
		const actionId = context.getNodeParameter('actionId', itemIndex) as string;

		const response = await apiService.deleteAction(context, actionId);
		if (!response.success) {
			throw new NodeOperationError(context.getNode(), response.error || 'Delete action failed');
		}
		return response.data;
	}

	private async getActionsColumnsWithService(context: IExecuteFunctions, apiService: any): Promise<any> {
		const response = await apiService.getActionsColumns(context);
		if (!response.success) {
			throw new NodeOperationError(context.getNode(), response.error || 'Get actions columns failed');
		}
		return response.data;
	}
}
