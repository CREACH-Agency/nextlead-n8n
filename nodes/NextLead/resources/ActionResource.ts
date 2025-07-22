import { IExecuteFunctions, INodeExecutionData, INodeProperties, IDataObject } from 'n8n-workflow';

import { ResourceType, OperationType, NextLeadCredentials } from '../core/types/NextLeadTypes';
import { IResourceStrategy } from '../core/interfaces/IResourceStrategy';
import { FieldDefinitionUtils } from '../utils/FieldDefinitionUtils';
import { NextLeadApiService } from '../core/NextLeadApiService';
import { ResponseUtils } from '../utils/ResponseUtils';

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
						name: 'Get Columns',
						value: 'getColumns',
						description: 'Get action columns',
						action: 'Get action columns',
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
				name: 'column',
				displayName: 'Column ID',
				description: 'ID of the column/stage',
				required: true,
				operations: ['create'],
			}),
			FieldDefinitionUtils.createStringField({
				name: 'title',
				displayName: 'Title',
				description: 'Title of the action',
				required: false,
				operations: ['create'],
			}),
			FieldDefinitionUtils.createStringField({
				name: 'assign_contact',
				displayName: 'Assign Contact',
				description: 'Email or LinkedIn URL of contact to assign',
				required: false,
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
			FieldDefinitionUtils.createEmailField({
				name: 'contactEmail',
				displayName: 'Contact Email',
				description: 'Email of the contact whose action to delete',
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
		const credentials = (await context.getCredentials('nextLeadApi')) as NextLeadCredentials;
		const apiService = new NextLeadApiService(credentials);

		switch (operation) {
			case 'create':
				return this.handleCreateAction(context, itemIndex, apiService);
			case 'update':
				return this.handleUpdateAction(context, itemIndex, apiService);
			case 'delete':
				return this.handleDeleteAction(context, itemIndex, apiService);
			case 'get':
				return this.handleGetAction(context, itemIndex, apiService);
			case 'getMany':
				return this.handleGetManyActions(context, itemIndex, apiService);
			case 'getColumns':
				return this.handleGetColumns(context, apiService);
			default:
				throw new Error(`Unknown operation: ${operation}`);
		}
	}

	private async handleCreateAction(
		context: IExecuteFunctions,
		itemIndex: number,
		apiService: NextLeadApiService,
	): Promise<INodeExecutionData[]> {
		const column = context.getNodeParameter('column', itemIndex) as string;
		const title = context.getNodeParameter('title', itemIndex, '') as string;
		const assign_contact = context.getNodeParameter('assign_contact', itemIndex, '') as string;
		const additionalFields = context.getNodeParameter(
			'additionalFields',
			itemIndex,
			{},
		) as IDataObject;

		const actionData: IDataObject = {
			column,
			...(title && { title }),
			...(assign_contact && { assign_contact }),
			...additionalFields,
		};

		const response = await apiService.createAction(context, actionData);

		return ResponseUtils.formatSingleResponse(response);
	}

	private async handleUpdateAction(
		context: IExecuteFunctions,
		itemIndex: number,
		apiService: NextLeadApiService,
	): Promise<INodeExecutionData[]> {
		const updateFields = context.getNodeParameter('updateFields', itemIndex, {}) as IDataObject;

		const updateData: IDataObject = {
			...updateFields,
		};

		const response = await apiService.updateAction(context, updateData);

		return ResponseUtils.formatSingleResponse(response);
	}

	private async handleDeleteAction(
		context: IExecuteFunctions,
		itemIndex: number,
		apiService: NextLeadApiService,
	): Promise<INodeExecutionData[]> {
		const contactEmail = context.getNodeParameter('contactEmail', itemIndex) as string;

		await apiService.deleteAction(context, contactEmail);

		return ResponseUtils.formatSuccessResponse(
			`Action deleted successfully for contact: ${contactEmail}`,
		);
	}

	private async handleGetAction(
		context: IExecuteFunctions,
		itemIndex: number,
		apiService: NextLeadApiService,
	): Promise<INodeExecutionData[]> {
		const actionId = context.getNodeParameter('actionId', itemIndex) as string;
		return [{ json: { message: 'Get single action not available in API', actionId } }];
	}

	private async handleGetManyActions(
		context: IExecuteFunctions,
		itemIndex: number,
		apiService: NextLeadApiService,
	): Promise<INodeExecutionData[]> {
		const limit = context.getNodeParameter('limit', itemIndex, 100) as number;
		return [{ json: { message: 'Get many actions not available in API', limit } }];
	}

	private async handleGetColumns(
		context: IExecuteFunctions,
		apiService: NextLeadApiService,
	): Promise<INodeExecutionData[]> {
		const response = await apiService.getActionsColumns(context);

		return ResponseUtils.formatArrayResponse(response);
	}
}
