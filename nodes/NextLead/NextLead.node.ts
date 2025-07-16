import {
	IExecuteFunctions,
	INodeType,
	INodeTypeDescription,
	IDataObject,
	INodeExecutionData,
	NodeOperationError,
	NodeConnectionType,
} from 'n8n-workflow';

import {
	contactFields,
	contactOperations,
} from './descriptions/ContactDescription';

import {
	structureFields,
	structureOperations,
} from './descriptions/StructureDescription';

import {
	salesFields,
	salesOperations,
} from './descriptions/SalesDescription';

import {
	actionFields,
	actionOperations,
} from './descriptions/ActionDescription';

import {
	listFields,
	listOperations,
} from './descriptions/ListDescription';

export class NextLead implements INodeType {
	description: INodeTypeDescription = {
		displayName: 'NextLead',
		name: 'nextLead',
		icon: 'file:nextlead.svg',
		group: ['transform'],
		version: 1,
		subtitle: '={{$parameter["operation"] + ": " + $parameter["resource"]}}',
		description: 'Interact with NextLead CRM API',
		defaults: {
			name: 'NextLead',
		},
		inputs: [NodeConnectionType.Main],
		outputs: [NodeConnectionType.Main],
		credentials: [
			{
				name: 'nextLeadApi',
				required: true,
			},
		],
		properties: [
			{
				displayName: 'Resource',
				name: 'resource',
				type: 'options',
				noDataExpression: true,
				options: [
					{
						name: 'Action',
						value: 'action',
					},
					{
						name: 'Contact',
						value: 'contact',
					},
					{
						name: 'List',
						value: 'list',
					},
					{
						name: 'Sale',
						value: 'sale',
					},
					{
						name: 'Structure',
						value: 'structure',
					},
				],
				default: 'contact',
			},
			...contactOperations,
			...contactFields,
			...structureOperations,
			...structureFields,
			...salesOperations,
			...salesFields,
			...actionOperations,
			...actionFields,
			...listOperations,
			...listFields,
		],
	};

	async execute(this: IExecuteFunctions): Promise<INodeExecutionData[][]> {
		const items = this.getInputData();
		const returnData: IDataObject[] = [];
		const resource = this.getNodeParameter('resource', 0);
		const operation = this.getNodeParameter('operation', 0);
		const credentials = await this.getCredentials('nextLeadApi');
		const domain = credentials.domain as string;

		for (let i = 0; i < items.length; i++) {
			try {
				let responseData;
				const body: IDataObject = {};

				if (resource === 'contact') {
					if (operation === 'create') {
						const firstName = this.getNodeParameter('firstName', i) as string;
						const lastName = this.getNodeParameter('lastName', i) as string;
						const email = this.getNodeParameter('email', i) as string;
						const additionalFields = this.getNodeParameter('additionalFields', i);

						body.first_name = firstName;
						body.last_name = lastName;
						body.email = email;

						if (additionalFields.phone) {
							body.phone = additionalFields.phone;
						}
						if (additionalFields.linkedin) {
							body.linkedin = additionalFields.linkedin;
						}
						if (additionalFields.job) {
							body.job = additionalFields.job;
						}
						if (additionalFields.company) {
							body.company = additionalFields.company;
						}
						if (additionalFields.city) {
							body.city = additionalFields.city;
						}
						if (additionalFields.lists) {
							body.lists = additionalFields.lists;
						}
						if (additionalFields.users) {
							body.users = additionalFields.users;
						}
						if (additionalFields.customFieldValues) {
							body.customFieldValues = additionalFields.customFieldValues;
						}

						responseData = await this.helpers.requestWithAuthentication.call(
							this,
							'nextLeadApi',
							{
								method: 'POST',
								url: `${domain}/api/v2/receive/contact/new-contact`,
								body,
								json: true,
							},
						);
					} else if (operation === 'update') {
						const contactId = this.getNodeParameter('contactId', i) as string;
						const updateFields = this.getNodeParameter('updateFields', i);

						body.id = contactId;
						Object.assign(body, updateFields);

						responseData = await this.helpers.requestWithAuthentication.call(
							this,
							'nextLeadApi',
							{
								method: 'POST',
								url: `${domain}/api/v2/receive/contact/edit-contact`,
								body,
								json: true,
							},
						);
					} else if (operation === 'delete') {
						const contactId = this.getNodeParameter('contactId', i) as string;

						body.id = contactId;

						responseData = await this.helpers.requestWithAuthentication.call(
							this,
							'nextLeadApi',
							{
								method: 'POST',
								url: `${domain}/api/v2/receive/contact/delete-contact`,
								body,
								json: true,
							},
						);
					} else if (operation === 'find') {
						const searchBy = this.getNodeParameter('searchBy', i) as string;
						const searchValue = this.getNodeParameter('searchValue', i) as string;

						if (searchBy === 'email') {
							body.email = searchValue;
						} else if (searchBy === 'linkedin') {
							body.linkedin = searchValue;
						}

						responseData = await this.helpers.requestWithAuthentication.call(
							this,
							'nextLeadApi',
							{
								method: 'POST',
								url: `${domain}/api/v2/receive/contact/find-contact`,
								body,
								json: true,
							},
						);
					} else if (operation === 'getTeam') {
						responseData = await this.helpers.requestWithAuthentication.call(
							this,
							'nextLeadApi',
							{
								method: 'GET',
								url: `${domain}/api/v2/receive/contact/get-team`,
								json: true,
							},
						);
					} else if (operation === 'getConversion') {
						responseData = await this.helpers.requestWithAuthentication.call(
							this,
							'nextLeadApi',
							{
								method: 'GET',
								url: `${domain}/api/v2/receive/contact/get-conversion`,
								json: true,
							},
						);
					} else if (operation === 'getCustomFields') {
						responseData = await this.helpers.requestWithAuthentication.call(
							this,
							'nextLeadApi',
							{
								method: 'GET',
								url: `${domain}/api/v2/receive/contact/get-custom-fields`,
								json: true,
							},
						);
					}
				} else if (resource === 'structure') {
					if (operation === 'create') {
						const name = this.getNodeParameter('name', i) as string;
						const additionalFields = this.getNodeParameter('additionalFields', i);

						body.name = name;
						Object.assign(body, additionalFields);

						responseData = await this.helpers.requestWithAuthentication.call(
							this,
							'nextLeadApi',
							{
								method: 'POST',
								url: `${domain}/api/v2/receive/structure/new-structure`,
								body,
								json: true,
							},
						);
					} else if (operation === 'update') {
						const structureId = this.getNodeParameter('structureId', i) as string;
						const updateFields = this.getNodeParameter('updateFields', i);

						body.id = structureId;
						Object.assign(body, updateFields);

						responseData = await this.helpers.requestWithAuthentication.call(
							this,
							'nextLeadApi',
							{
								method: 'POST',
								url: `${domain}/api/v2/receive/structure/edit-structure`,
								body,
								json: true,
							},
						);
					} else if (operation === 'delete') {
						const structureId = this.getNodeParameter('structureId', i) as string;

						body.id = structureId;

						responseData = await this.helpers.requestWithAuthentication.call(
							this,
							'nextLeadApi',
							{
								method: 'POST',
								url: `${domain}/api/v2/receive/structure/delete-structure`,
								body,
								json: true,
							},
						);
					} else if (operation === 'getAll') {
						responseData = await this.helpers.requestWithAuthentication.call(
							this,
							'nextLeadApi',
							{
								method: 'GET',
								url: `${domain}/api/v2/receive/structure/get-structures`,
								json: true,
							},
						);
					}
				} else if (resource === 'sale') {
					if (operation === 'create') {
						const contactId = this.getNodeParameter('contactId', i) as string;
						const columnId = this.getNodeParameter('columnId', i) as string;
						const name = this.getNodeParameter('name', i) as string;
						const additionalFields = this.getNodeParameter('additionalFields', i);

						body.contactId = contactId;
						body.columnId = columnId;
						body.name = name;
						Object.assign(body, additionalFields);

						responseData = await this.helpers.requestWithAuthentication.call(
							this,
							'nextLeadApi',
							{
								method: 'POST',
								url: `${domain}/api/v2/receive/sales/create-sale`,
								body,
								json: true,
							},
						);
					} else if (operation === 'update') {
						const saleId = this.getNodeParameter('saleId', i) as string;
						const updateFields = this.getNodeParameter('updateFields', i);

						body.id = saleId;
						Object.assign(body, updateFields);

						responseData = await this.helpers.requestWithAuthentication.call(
							this,
							'nextLeadApi',
							{
								method: 'PUT',
								url: `${domain}/api/v2/receive/sales/update-sale`,
								body,
								json: true,
							},
						);
					} else if (operation === 'delete') {
						const saleId = this.getNodeParameter('saleId', i) as string;

						responseData = await this.helpers.requestWithAuthentication.call(
							this,
							'nextLeadApi',
							{
								method: 'DELETE',
								url: `${domain}/api/v2/receive/sales/delete-sale`,
								qs: { id: saleId },
								json: true,
							},
						);
					} else if (operation === 'getColumns') {
						responseData = await this.helpers.requestWithAuthentication.call(
							this,
							'nextLeadApi',
							{
								method: 'GET',
								url: `${domain}/api/v2/receive/sales/get-columns`,
								json: true,
							},
						);
					}
				} else if (resource === 'action') {
					if (operation === 'create') {
						const contactId = this.getNodeParameter('contactId', i) as string;
						const columnId = this.getNodeParameter('columnId', i) as string;
						const title = this.getNodeParameter('title', i) as string;
						const additionalFields = this.getNodeParameter('additionalFields', i);

						body.contactId = contactId;
						body.columnId = columnId;
						body.title = title;
						Object.assign(body, additionalFields);

						responseData = await this.helpers.requestWithAuthentication.call(
							this,
							'nextLeadApi',
							{
								method: 'POST',
								url: `${domain}/api/v2/receive/actions/create-action`,
								body,
								json: true,
							},
						);
					} else if (operation === 'update') {
						const actionId = this.getNodeParameter('actionId', i) as string;
						const updateFields = this.getNodeParameter('updateFields', i);

						body.id = actionId;
						Object.assign(body, updateFields);

						responseData = await this.helpers.requestWithAuthentication.call(
							this,
							'nextLeadApi',
							{
								method: 'POST',
								url: `${domain}/api/v2/receive/actions/update-action`,
								body,
								json: true,
							},
						);
					} else if (operation === 'delete') {
						const actionId = this.getNodeParameter('actionId', i) as string;

						body.id = actionId;

						responseData = await this.helpers.requestWithAuthentication.call(
							this,
							'nextLeadApi',
							{
								method: 'POST',
								url: `${domain}/api/v2/receive/actions/delete-action`,
								body,
								json: true,
							},
						);
					} else if (operation === 'getColumns') {
						responseData = await this.helpers.requestWithAuthentication.call(
							this,
							'nextLeadApi',
							{
								method: 'GET',
								url: `${domain}/api/v2/receive/actions/get-columns`,
								json: true,
							},
						);
					}
				} else if (resource === 'list') {
					if (operation === 'getAll') {
						responseData = await this.helpers.requestWithAuthentication.call(
							this,
							'nextLeadApi',
							{
								method: 'GET',
								url: `${domain}/api/v2/receive/lists/get-lists`,
								json: true,
							},
						);
					}
				}

				if (Array.isArray(responseData)) {
					returnData.push(...responseData);
				} else {
					returnData.push(responseData as IDataObject);
				}
			} catch (error) {
				if (this.continueOnFail()) {
					returnData.push({ error: error.message });
					continue;
				}
				throw new NodeOperationError(this.getNode(), error);
			}
		}

		return [this.helpers.returnJsonArray(returnData)];
	}
}