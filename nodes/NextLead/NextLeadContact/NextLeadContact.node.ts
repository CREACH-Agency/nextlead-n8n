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

export class NextLeadContact extends BaseNextLeadNode {
	description: INodeTypeDescription = this.getBaseDescription(
		'NextLead Contact',
		'nextLeadContact',
		'={{$parameter["operation"]}}',
		'contact'
	);

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
						name: 'Find',
						value: 'find',
						description: 'Find a contact by email or LinkedIn',
						action: 'Find a contact',
					},
					{
						name: 'Get Conversion Status',
						value: 'getConversion',
						description: 'Get available conversion statuses',
						action: 'Get conversion statuses',
					},
					{
						name: 'Get Custom Fields',
						value: 'getCustomFields',
						description: 'Get custom fields configuration',
						action: 'Get custom fields',
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
			{
				displayName: 'First Name',
				name: 'firstName',
				type: 'string',
				required: true,
				displayOptions: {
					show: {
						operation: ['create'],
					},
				},
				default: '',
				description: 'First name of the contact',
			},
			{
				displayName: 'Last Name',
				name: 'lastName',
				type: 'string',
				required: true,
				displayOptions: {
					show: {
						operation: ['create'],
					},
				},
				default: '',
				description: 'Last name of the contact',
			},
			{
				displayName: 'Email',
				name: 'email',
				type: 'string',
				placeholder: 'name@email.com',
				typeOptions: {
					email: true,
				},
				required: true,
				displayOptions: {
					show: {
						operation: ['create'],
					},
				},
				default: '',
				description: 'Email address of the contact',
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
						displayName: 'City',
						name: 'city',
						type: 'string',
						default: '',
						description: 'City of the contact',
					},
					{
						displayName: 'Company',
						name: 'company',
						type: 'string',
						default: '',
						description: 'Company of the contact',
					},
					{
						displayName: 'Job Title',
						name: 'job',
						type: 'string',
						default: '',
						description: 'Job title of the contact',
					},
					{
						displayName: 'LinkedIn',
						name: 'linkedin',
						type: 'string',
						default: '',
						description: 'LinkedIn profile URL',
					},
					{
						displayName: 'List IDs',
						name: 'lists',
						type: 'string',
						default: '',
						description: 'Comma-separated list IDs to assign the contact to',
					},
					{
						displayName: 'Phone',
						name: 'phone',
						type: 'string',
						default: '',
						description: 'Phone number of the contact',
					},
					{
						displayName: 'User IDs',
						name: 'users',
						type: 'string',
						default: '',
						description: 'Comma-separated user IDs to assign the contact to',
					},
				],
			},
			// Update fields
			{
				displayName: 'Contact ID',
				name: 'contactId',
				type: 'string',
				required: true,
				displayOptions: {
					show: {
						operation: ['update', 'delete'],
					},
				},
				default: '',
				description: 'ID of the contact to update or delete',
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
						displayName: 'City',
						name: 'city',
						type: 'string',
						default: '',
						description: 'City of the contact',
					},
					{
						displayName: 'Company',
						name: 'company',
						type: 'string',
						default: '',
						description: 'Company of the contact',
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
						description: 'Email address of the contact',
					},
					{
						displayName: 'First Name',
						name: 'first_name',
						type: 'string',
						default: '',
						description: 'First name of the contact',
					},
					{
						displayName: 'Job Title',
						name: 'job',
						type: 'string',
						default: '',
						description: 'Job title of the contact',
					},
					{
						displayName: 'Last Name',
						name: 'last_name',
						type: 'string',
						default: '',
						description: 'Last name of the contact',
					},
					{
						displayName: 'LinkedIn',
						name: 'linkedin',
						type: 'string',
						default: '',
						description: 'LinkedIn profile URL',
					},
					{
						displayName: 'Phone',
						name: 'phone',
						type: 'string',
						default: '',
						description: 'Phone number of the contact',
					},
				],
			},
			// Find fields
			{
				displayName: 'Search By',
				name: 'searchBy',
				type: 'options',
				required: true,
				displayOptions: {
					show: {
						operation: ['find'],
					},
				},
				options: [
					{
						name: 'Email',
						value: 'email',
					},
					{
						name: 'LinkedIn',
						value: 'linkedin',
					},
				],
				default: 'email',
				description: 'Field to search by',
			},
			{
				displayName: 'Search Value',
				name: 'searchValue',
				type: 'string',
				required: true,
				displayOptions: {
					show: {
						operation: ['find'],
					},
				},
				default: '',
				description: 'Value to search for',
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
				return this.createContactWithService(context, itemIndex, apiService);
			case 'update':
				return this.updateContactWithService(context, itemIndex, apiService);
			case 'delete':
				return this.deleteContactWithService(context, itemIndex, apiService);
			case 'find':
				return this.findContactWithService(context, itemIndex, apiService);
			case 'getTeam':
				return this.getTeamWithService(context, apiService);
			case 'getConversion':
				return this.getConversionWithService(context, apiService);
			case 'getCustomFields':
				return this.getCustomFieldsWithService(context, apiService);
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
				return this.createContact(context, itemIndex);
			case 'update':
				return this.updateContact(context, itemIndex);
			case 'delete':
				return this.deleteContact(context, itemIndex);
			case 'find':
				return this.findContact(context, itemIndex);
			case 'getTeam':
				return this.getTeam(context);
			case 'getConversion':
				return this.getConversion(context);
			case 'getCustomFields':
				return this.getCustomFields(context);
			default:
				throw new NodeOperationError(context.getNode(), `Operation "${operation}" is not supported`);
		}
	}

	private async createContact(context: IExecuteFunctions, itemIndex: number): Promise<any> {
		const firstName = context.getNodeParameter('firstName', itemIndex) as string;
		const lastName = context.getNodeParameter('lastName', itemIndex) as string;
		const email = context.getNodeParameter('email', itemIndex) as string;
		const additionalFields = context.getNodeParameter('additionalFields', itemIndex) as IDataObject;

		const contactData: IDataObject = {
			first_name: firstName,
			last_name: lastName,
			email,
			...additionalFields,
		};

		const response = await this.apiService!.createContact(context, contactData);
		if (!response.success) {
			throw new NodeOperationError(context.getNode(), response.error || 'Create contact failed');
		}
		return response.data;
	}

	private async updateContact(context: IExecuteFunctions, itemIndex: number): Promise<any> {
		const contactId = context.getNodeParameter('contactId', itemIndex) as string;
		const updateFields = context.getNodeParameter('updateFields', itemIndex) as IDataObject;

		const contactData: IDataObject = {
			id: contactId,
			...updateFields,
		};

		const response = await this.apiService!.updateContact(context, contactData);
		if (!response.success) {
			throw new NodeOperationError(context.getNode(), response.error || 'Update failed');
		}
		return response.data;
	}

	private async deleteContact(context: IExecuteFunctions, itemIndex: number): Promise<any> {
		const contactId = context.getNodeParameter('contactId', itemIndex) as string;

		const response = await this.apiService!.deleteContact(context, contactId);
		if (!response.success) {
			throw new NodeOperationError(context.getNode(), response.error || 'Delete contact failed');
		}
		return response.data;
	}

	private async findContact(context: IExecuteFunctions, itemIndex: number): Promise<any> {
		const searchBy = context.getNodeParameter('searchBy', itemIndex) as string;
		const searchValue = context.getNodeParameter('searchValue', itemIndex) as string;

		const searchData: IDataObject = {
			[searchBy]: searchValue,
		};

		const response = await this.apiService!.findContact(context, searchData);
		if (!response.success) {
			throw new NodeOperationError(context.getNode(), response.error || 'Find contact failed');
		}
		return response.data;
	}

	private async getTeam(context: IExecuteFunctions): Promise<any> {
		const response = await this.apiService!.getTeam(context);
		if (!response.success) {
			throw new NodeOperationError(context.getNode(), response.error || 'Get team failed');
		}
		return response.data;
	}

	private async getConversion(context: IExecuteFunctions): Promise<any> {
		const response = await this.apiService!.getConversion(context);
		if (!response.success) {
			throw new NodeOperationError(context.getNode(), response.error || 'Get conversion failed');
		}
		return response.data;
	}

	private async getCustomFields(context: IExecuteFunctions): Promise<any> {
		const response = await this.apiService!.getCustomFields(context);
		if (!response.success) {
			throw new NodeOperationError(context.getNode(), response.error || 'Get custom fields failed');
		}
		return response.data;
	}

	private async createContactWithService(context: IExecuteFunctions, itemIndex: number, apiService: any): Promise<any> {
		const firstName = context.getNodeParameter('firstName', itemIndex) as string;
		const lastName = context.getNodeParameter('lastName', itemIndex) as string;
		const email = context.getNodeParameter('email', itemIndex) as string;
		const additionalFields = context.getNodeParameter('additionalFields', itemIndex) as IDataObject;

		const contactData: IDataObject = {
			first_name: firstName,
			last_name: lastName,
			email,
			...additionalFields,
		};

		const response = await apiService.createContact(context, contactData);
		if (!response.success) {
			throw new NodeOperationError(context.getNode(), response.error);
		}
		return response.data;
	}

	private async updateContactWithService(context: IExecuteFunctions, itemIndex: number, apiService: any): Promise<any> {
		const contactId = context.getNodeParameter('contactId', itemIndex) as string;
		const updateFields = context.getNodeParameter('updateFields', itemIndex) as IDataObject;

		const contactData: IDataObject = {
			id: contactId,
			...updateFields,
		};

		const response = await apiService.updateContact(context, contactData);
		if (!response.success) {
			throw new NodeOperationError(context.getNode(), response.error);
		}
		return response.data;
	}

	private async deleteContactWithService(context: IExecuteFunctions, itemIndex: number, apiService: any): Promise<any> {
		const contactId = context.getNodeParameter('contactId', itemIndex) as string;

		const response = await apiService.deleteContact(context, contactId);
		if (!response.success) {
			throw new NodeOperationError(context.getNode(), response.error);
		}
		return response.data;
	}

	private async findContactWithService(context: IExecuteFunctions, itemIndex: number, apiService: any): Promise<any> {
		const searchBy = context.getNodeParameter('searchBy', itemIndex) as string;
		const searchValue = context.getNodeParameter('searchValue', itemIndex) as string;

		const searchData: IDataObject = {
			[searchBy]: searchValue,
		};

		const response = await apiService.findContact(context, searchData);
		if (!response.success) {
			throw new NodeOperationError(context.getNode(), response.error);
		}
		return response.data;
	}

	private async getTeamWithService(context: IExecuteFunctions, apiService: any): Promise<any> {
		const response = await apiService.getTeam(context);
		if (!response.success) {
			throw new NodeOperationError(context.getNode(), response.error);
		}
		return response.data;
	}

	private async getConversionWithService(context: IExecuteFunctions, apiService: any): Promise<any> {
		const response = await apiService.getConversion(context);
		if (!response.success) {
			throw new NodeOperationError(context.getNode(), response.error);
		}
		return response.data;
	}

	private async getCustomFieldsWithService(context: IExecuteFunctions, apiService: any): Promise<any> {
		const response = await apiService.getCustomFields(context);
		if (!response.success) {
			throw new NodeOperationError(context.getNode(), response.error);
		}
		return response.data;
	}
}
