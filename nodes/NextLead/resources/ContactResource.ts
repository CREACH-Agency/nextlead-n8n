import { IExecuteFunctions, INodeExecutionData, INodeProperties, IDataObject } from 'n8n-workflow';

import { ResourceType, OperationType, NextLeadCredentials } from '../core/types/NextLeadTypes';
import { IResourceStrategy } from '../core/interfaces/IResourceStrategy';
import { FieldDefinitionUtils } from '../utils/FieldDefinitionUtils';
import { NextLeadApiService } from '../core/NextLeadApiService';
import { ResponseUtils } from '../utils/ResponseUtils';

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
						name: 'Get Conversion',
						value: 'getConversion',
						description: 'Get conversion statuses',
						action: 'Get conversion statuses',
					},
					{
						name: 'Get Custom Fields',
						value: 'getCustomFields',
						action: 'Get custom fields',
					},
					{
						name: 'Get Many',
						value: 'getMany',
						description: 'Get many contacts',
						action: 'Get many contacts',
					},
					{
						name: 'Get Team',
						value: 'getTeam',
						description: 'Get team members',
						action: 'Get team members',
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
			FieldDefinitionUtils.createEmailField({
				name: 'email',
				displayName: 'Email',
				description: 'Email address of the contact',
				required: true,
				operations: ['create'],
			}),
			FieldDefinitionUtils.createStringField({
				name: 'firstName',
				displayName: 'First Name',
				description: 'First name of the contact',
				required: false,
				operations: ['create'],
			}),
			FieldDefinitionUtils.createStringField({
				name: 'lastName',
				displayName: 'Last Name',
				description: 'Last name of the contact',
				required: false,
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
		const credentials = (await context.getCredentials('nextLeadApi')) as NextLeadCredentials;
		const apiService = new NextLeadApiService(credentials);

		switch (operation) {
			case 'create':
				return this.handleCreateContact(context, itemIndex, apiService);
			case 'update':
				return this.handleUpdateContact(context, itemIndex, apiService);
			case 'delete':
				return this.handleDeleteContact(context, itemIndex, apiService);
			case 'get':
				return this.handleGetContact(context, itemIndex, apiService);
			case 'getMany':
				return this.handleGetManyContacts(context, itemIndex, apiService);
			case 'getTeam':
				return this.handleGetTeam(context, apiService);
			case 'getConversion':
				return this.handleGetConversion(context, apiService);
			case 'getCustomFields':
				return this.handleGetCustomFields(context, apiService);
			default:
				throw new Error(`Unknown operation: ${operation}`);
		}
	}

	private async handleCreateContact(
		context: IExecuteFunctions,
		itemIndex: number,
		apiService: NextLeadApiService,
	): Promise<INodeExecutionData[]> {
		const email = context.getNodeParameter('email', itemIndex) as string;
		const firstName = context.getNodeParameter('firstName', itemIndex, '') as string;
		const lastName = context.getNodeParameter('lastName', itemIndex, '') as string;
		const additionalFields = context.getNodeParameter(
			'additionalFields',
			itemIndex,
			{},
		) as IDataObject;

		const contactData: IDataObject = {
			email,
			...(firstName && { firstName }),
			...(lastName && { lastName }),
			...additionalFields,
		};

		const response = await apiService.createContact(context, contactData);

		return ResponseUtils.formatSingleResponse(response);
	}

	private async handleUpdateContact(
		context: IExecuteFunctions,
		itemIndex: number,
		apiService: NextLeadApiService,
	): Promise<INodeExecutionData[]> {
		const contactId = context.getNodeParameter('contactId', itemIndex) as string;
		const updateFields = context.getNodeParameter('updateFields', itemIndex) as IDataObject;

		const updateData: IDataObject = {
			id: contactId,
			...updateFields,
		};

		const response = await apiService.updateContact(context, updateData);

		return ResponseUtils.formatSingleResponse(response);
	}

	private async handleDeleteContact(
		context: IExecuteFunctions,
		itemIndex: number,
		apiService: NextLeadApiService,
	): Promise<INodeExecutionData[]> {
		const contactId = context.getNodeParameter('contactId', itemIndex) as string;

		await apiService.deleteContact(context, contactId);

		return ResponseUtils.formatSuccessResponse(`Contact deleted successfully: ${contactId}`);
	}

	private async handleGetContact(
		context: IExecuteFunctions,
		itemIndex: number,
		apiService: NextLeadApiService,
	): Promise<INodeExecutionData[]> {
		const contactId = context.getNodeParameter('contactId', itemIndex) as string;

		const response = await apiService.findContact(context, { id: contactId });

		return ResponseUtils.formatSingleResponse(response);
	}

	private async handleGetManyContacts(
		context: IExecuteFunctions,
		itemIndex: number,
		apiService: NextLeadApiService,
	): Promise<INodeExecutionData[]> {
		const limit = context.getNodeParameter('limit', itemIndex) as number;

		const response = await apiService.findContact(context, { limit });

		return ResponseUtils.formatArrayResponse(response);
	}

	private async handleGetTeam(
		context: IExecuteFunctions,
		apiService: NextLeadApiService,
	): Promise<INodeExecutionData[]> {
		const response = await apiService.getTeam(context);

		return ResponseUtils.formatArrayResponse(response);
	}

	private async handleGetConversion(
		context: IExecuteFunctions,
		apiService: NextLeadApiService,
	): Promise<INodeExecutionData[]> {
		const response = await apiService.getConversion(context);

		return ResponseUtils.formatArrayResponse(response);
	}

	private async handleGetCustomFields(
		context: IExecuteFunctions,
		apiService: NextLeadApiService,
	): Promise<INodeExecutionData[]> {
		const response = await apiService.getCustomFields(context);

		return ResponseUtils.formatArrayResponse(response);
	}
}
