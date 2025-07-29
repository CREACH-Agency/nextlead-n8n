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
						name: 'Get Columns',
						value: 'getColumns',
						description: 'Get action columns',
						action: 'Get action columns',
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
			{
				displayName: 'Stage Name or ID',
				name: 'column',
				type: 'options',
				required: true,
				displayOptions: {
					show: {
						resource: ['action'],
						operation: ['create'],
					},
				},
				typeOptions: {
					loadOptionsMethod: 'getActionColumns',
				},
				default: '',
				description:
					'Choose from the list, or specify an ID using an <a href="https://docs.n8n.io/code/expressions/">expression</a>',
			},
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
						displayName: 'Note',
						name: 'note',
						description: 'Action description note',
						default: '',
					},
					{
						displayName: 'Date',
						name: 'date',
						description: 'Date for the action',
						default: '',
					},
					{
						displayName: 'Assigned To',
						name: 'assigned_to',
						description: 'User ID to assign the action to',
						default: '',
					},
				],
			}),

			// Update fields
			FieldDefinitionUtils.createEmailField({
				name: 'contactEmail',
				displayName: 'Contact Email',
				description: 'Email of the contact whose action to update',
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
						displayName: 'Title',
						name: 'title',
						description: 'Title of the action',
						default: '',
					},
					{
						displayName: 'Column',
						name: 'column',
						description: 'New stage ID for the action',
						default: '',
					},
					{
						displayName: 'Note',
						name: 'note',
						description: 'Action description note',
						default: '',
					},
					{
						displayName: 'Date',
						name: 'date',
						description: 'Date for the action',
						default: '',
					},
					{
						displayName: 'Assigned To',
						name: 'assigned_to',
						description: 'User ID to assign the action to',
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
		const contactEmail = context.getNodeParameter('contactEmail', itemIndex) as string;
		const updateFields = context.getNodeParameter('updateFields', itemIndex, {}) as IDataObject;

		const updateData: IDataObject = {
			contact_email: contactEmail,
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

	private async handleGetColumns(
		context: IExecuteFunctions,
		apiService: NextLeadApiService,
	): Promise<INodeExecutionData[]> {
		const response = await apiService.getActionsColumns(context);

		return ResponseUtils.formatArrayResponse(response);
	}
}
