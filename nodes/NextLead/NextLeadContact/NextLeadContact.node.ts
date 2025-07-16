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
	IFindOperationConfig,
	IOperationConfig,
} from '../utils/OperationHandlerUtils';

export class NextLeadContact extends BaseNextLeadNode implements INodeExecuteContext {
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
			FieldDefinitionUtils.createOptionsField({
				name: 'operation',
				displayName: 'Operation',
				description: 'Operation to perform',
				required: true,
				operations: [], // Not applicable for operation field itself
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
			}),
		];
	}

	getFields(): INodeProperties[] {
		return [
			// Create fields
			FieldDefinitionUtils.createStringField({
				name: 'firstName',
				displayName: 'First Name',
				description: 'First name of the contact',
				required: true,
				operations: ['create'],
			}),
			FieldDefinitionUtils.createStringField({
				name: 'lastName',
				displayName: 'Last Name',
				description: 'Last name of the contact',
				required: true,
				operations: ['create'],
			}),
			FieldDefinitionUtils.createEmailField({
				name: 'email',
				displayName: 'Email',
				description: 'Email address of the contact',
				required: true,
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
			// Update and Delete fields
			FieldDefinitionUtils.createIdField({
				name: 'contactId',
				displayName: 'Contact ID',
				description: 'ID of the contact to update or delete',
				operations: ['update', 'delete'],
			}),
			FieldDefinitionUtils.createCollectionField({
				name: 'updateFields',
				displayName: 'Update Fields',
				description: 'Fields to update',
				operations: ['update'],
				fields: [
					{
						name: 'first_name',
						displayName: 'First Name',
						description: 'First name of the contact',
					},
					{
						name: 'last_name',
						displayName: 'Last Name',
						description: 'Last name of the contact',
					},
					{
						name: 'email',
						displayName: 'Email',
						description: 'Email address of the contact',
						placeholder: 'name@email.com',
						typeOptions: { email: true },
					},
					...FieldDefinitionUtils.getCommonContactFields(),
				],
			}),
			// Find fields
			FieldDefinitionUtils.createOptionsField({
				name: 'searchBy',
				displayName: 'Search By',
				description: 'Field to search by',
				required: true,
				operations: ['get'],
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
			}),
			FieldDefinitionUtils.createStringField({
				name: 'searchValue',
				displayName: 'Search Value',
				description: 'Value to search for',
				required: true,
				operations: ['get'],
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
				return this.handleCreateContact(context, itemIndex, apiService);
			case 'update':
				return this.handleUpdateContact(context, itemIndex, apiService);
			case 'delete':
				return this.handleDeleteContact(context, itemIndex, apiService);
			case 'get':
				return this.handleFindContact(context, itemIndex, apiService);
			case 'getTeam':
				return this.handleGetTeam(context, apiService);
			case 'getConversion':
				return this.handleGetConversion(context, apiService);
			case 'getCustomFields':
				return this.handleGetCustomFields(context, apiService);
			default:
				throw new NodeOperationError(
					context.getNode(),
					`Operation "${operation}" is not supported`
				);
		}
	}

	private async handleCreateContact(
		context: IExecuteFunctions,
		itemIndex: number,
		apiService: IApiService
	): Promise<any> {
		// Custom logic for contact creation due to field name transformation
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
		NodeExecuteUtils.validateApiResponse(response, 'Create Contact');
		return response.data;
	}

	private async handleUpdateContact(
		context: IExecuteFunctions,
		itemIndex: number,
		apiService: IApiService
	): Promise<any> {
		const config: IUpdateOperationConfig = {
			operationName: 'Update Contact',
			requiredParams: [],
			idParam: 'contactId',
			updateFieldsParam: 'updateFields',
			apiMethodName: 'updateContact',
		};

		return OperationHandlerUtils.handleUpdateOperation(
			context,
			itemIndex,
			apiService,
			config
		);
	}

	private async handleDeleteContact(
		context: IExecuteFunctions,
		itemIndex: number,
		apiService: IApiService
	): Promise<any> {
		const config: IDeleteOperationConfig = {
			operationName: 'Delete Contact',
			requiredParams: [],
			idParam: 'contactId',
			apiMethodName: 'deleteContact',
		};

		return OperationHandlerUtils.handleDeleteOperation(
			context,
			itemIndex,
			apiService,
			config
		);
	}

	private async handleFindContact(
		context: IExecuteFunctions,
		itemIndex: number,
		apiService: IApiService
	): Promise<any> {
		const config: IFindOperationConfig = {
			operationName: 'Find Contact',
			requiredParams: [],
			searchByParam: 'searchBy',
			searchValueParam: 'searchValue',
			apiMethodName: 'findContact',
		};

		return OperationHandlerUtils.handleFindOperation(
			context,
			itemIndex,
			apiService,
			config
		);
	}

	private async handleGetTeam(
		context: IExecuteFunctions,
		apiService: IApiService
	): Promise<any> {
		const config: IOperationConfig = {
			operationName: 'Get Team',
			requiredParams: [],
			apiMethodName: 'getTeam',
		};

		return OperationHandlerUtils.handleGetOperation(context, apiService, config);
	}

	private async handleGetConversion(
		context: IExecuteFunctions,
		apiService: IApiService
	): Promise<any> {
		const config: IOperationConfig = {
			operationName: 'Get Conversion',
			requiredParams: [],
			apiMethodName: 'getConversion',
		};

		return OperationHandlerUtils.handleGetOperation(context, apiService, config);
	}

	private async handleGetCustomFields(
		context: IExecuteFunctions,
		apiService: IApiService
	): Promise<any> {
		const config: IOperationConfig = {
			operationName: 'Get Custom Fields',
			requiredParams: [],
			apiMethodName: 'getCustomFields',
		};

		return OperationHandlerUtils.handleGetOperation(context, apiService, config);
	}

	// Keep legacy methods for backward compatibility
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
			case 'get':
				return this.findContact(context, itemIndex);
			case 'getTeam':
				return this.getTeam(context);
			case 'getConversion':
				return this.getConversion(context);
			case 'getCustomFields':
				return this.getCustomFields(context);
			default:
				throw new NodeOperationError(
					context.getNode(),
					`Operation "${operation}" is not supported`
				);
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
}
