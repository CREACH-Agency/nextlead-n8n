import { IExecuteFunctions, IDataObject, IPollFunctions } from 'n8n-workflow';
import { NextLeadCredentials, RequestConfig, N8nRequestOptions } from './types/n8n/RequestTypes';
import { NextLeadApiResponse } from './types/shared/ApiTypes';
import { createNextLeadError } from './types/n8n/ErrorTypes';

export class NextLeadApiService {
	private credentials: NextLeadCredentials;

	constructor(credentials: NextLeadCredentials) {
		this.credentials = credentials;
	}

	async makeRequest(
		context: IExecuteFunctions | IPollFunctions,
		config: RequestConfig,
	): Promise<NextLeadApiResponse> {
		const { method, endpoint, data, queryParams } = config;

		try {
			// Debug log
			context.logger.info('NextLead API Request:', {
				method,
				endpoint,
				data,
				hasApiKey: !!this.credentials.apiKey,
			});

			const requestOptions: N8nRequestOptions = {
				method,
				url: `${this.credentials.domain}${endpoint}`,
				json: true,
			};

			if (data) {
				requestOptions.body = data;
			}

			if (queryParams) {
				requestOptions.qs = queryParams;
			}

			const response = await context.helpers.requestWithAuthentication.call(
				context,
				'nextLeadApi',
				requestOptions,
			);

			return {
				success: true,
				data: response,
			};
		} catch (error: unknown) {
			const nextLeadError = createNextLeadError(error);

			if (nextLeadError.statusCode === 403) {
				context.logger.error('403 Forbidden Error Details:', {
					endpoint,
					statusCode: nextLeadError.statusCode,
					message: nextLeadError.message,
					details: nextLeadError.details,
					rawError: error,
				});

				if (error && typeof error === 'object' && 'response' in error) {
					const errorResponse = error as { response?: { body?: unknown } };
					context.logger.error('Raw error response body:', {
						body: errorResponse.response?.body,
					});
				}
			}

			return {
				success: false,
				error: nextLeadError.message,
				data: null,
			};
		}
	}

	async identifyUser(context: IExecuteFunctions): Promise<NextLeadApiResponse> {
		return this.makeRequest(context, {
			method: 'GET',
			endpoint: '/api/v2/identify-user',
		});
	}

	async createContact(
		context: IExecuteFunctions,
		contactData: IDataObject,
	): Promise<NextLeadApiResponse> {
		return this.makeRequest(context, {
			method: 'POST',
			endpoint: '/api/v2/receive/contact/new-contact',
			data: contactData,
		});
	}

	async updateContact(
		context: IExecuteFunctions,
		contactData: IDataObject,
	): Promise<NextLeadApiResponse> {
		return this.makeRequest(context, {
			method: 'POST',
			endpoint: '/api/v2/receive/contact/edit-contact',
			data: contactData,
		});
	}

	async deleteContact(
		context: IExecuteFunctions,
		contactData: IDataObject,
	): Promise<NextLeadApiResponse> {
		return this.makeRequest(context, {
			method: 'POST',
			endpoint: '/api/v2/receive/contact/delete-contact',
			data: contactData,
		});
	}

	async findContact(
		context: IExecuteFunctions,
		searchData: IDataObject,
	): Promise<NextLeadApiResponse> {
		return this.makeRequest(context, {
			method: 'POST',
			endpoint: '/api/v2/receive/contact/find-contact',
			data: searchData,
		});
	}

	async getTeam(context: IExecuteFunctions): Promise<NextLeadApiResponse> {
		return this.makeRequest(context, {
			method: 'GET',
			endpoint: '/api/v2/receive/contact/get-team',
		});
	}

	async getConversion(context: IExecuteFunctions): Promise<NextLeadApiResponse> {
		return this.makeRequest(context, {
			method: 'GET',
			endpoint: '/api/v2/receive/contact/get-conversion',
		});
	}

	async getCustomFields(context: IExecuteFunctions): Promise<NextLeadApiResponse> {
		return this.makeRequest(context, {
			method: 'GET',
			endpoint: '/api/v2/receive/contact/get-custom-fields',
		});
	}

	async createStructure(
		context: IExecuteFunctions,
		structureData: IDataObject,
	): Promise<NextLeadApiResponse> {
		return this.makeRequest(context, {
			method: 'POST',
			endpoint: '/api/v2/receive/structure/new-structure',
			data: structureData,
		});
	}

	async updateStructure(
		context: IExecuteFunctions,
		structureData: IDataObject,
	): Promise<NextLeadApiResponse> {
		return this.makeRequest(context, {
			method: 'POST',
			endpoint: '/api/v2/receive/structure/edit-structure',
			data: structureData,
		});
	}

	async deleteStructure(
		context: IExecuteFunctions,
		structureId: string,
	): Promise<NextLeadApiResponse> {
		return this.makeRequest(context, {
			method: 'POST',
			endpoint: '/api/v2/receive/structure/delete-structure',
			data: { id: structureId },
		});
	}

	async getStructures(context: IExecuteFunctions): Promise<NextLeadApiResponse> {
		return this.makeRequest(context, {
			method: 'GET',
			endpoint: '/api/v2/receive/structure/get-structures',
		});
	}

	async createSale(
		context: IExecuteFunctions,
		saleData: IDataObject,
	): Promise<NextLeadApiResponse> {
		return this.makeRequest(context, {
			method: 'POST',
			endpoint: '/api/v2/receive/sales/create-sale',
			data: saleData,
		});
	}

	async updateSale(
		context: IExecuteFunctions,
		saleData: IDataObject,
	): Promise<NextLeadApiResponse> {
		return this.makeRequest(context, {
			method: 'PUT',
			endpoint: '/api/v2/receive/sales/update-sale',
			data: saleData,
		});
	}

	async deleteSale(
		context: IExecuteFunctions,
		saleData: IDataObject,
	): Promise<NextLeadApiResponse> {
		return this.makeRequest(context, {
			method: 'DELETE',
			endpoint: '/api/v2/receive/sales/delete-sale',
			data: saleData,
		});
	}

	async getSalesColumns(context: IExecuteFunctions): Promise<NextLeadApiResponse> {
		return this.makeRequest(context, {
			method: 'GET',
			endpoint: '/api/v2/receive/sales/get-columns',
		});
	}

	async createAction(
		context: IExecuteFunctions,
		actionData: IDataObject,
	): Promise<NextLeadApiResponse> {
		return this.makeRequest(context, {
			method: 'POST',
			endpoint: '/api/v2/receive/actions/create-action',
			data: actionData,
		});
	}

	async updateAction(
		context: IExecuteFunctions,
		actionData: IDataObject,
	): Promise<NextLeadApiResponse> {
		return this.makeRequest(context, {
			method: 'PUT',
			endpoint: '/api/v2/receive/actions/update-action',
			data: actionData,
		});
	}

	async deleteAction(
		context: IExecuteFunctions,
		contactEmail: string,
	): Promise<NextLeadApiResponse> {
		return this.makeRequest(context, {
			method: 'DELETE',
			endpoint: '/api/v2/receive/actions/delete-action',
			data: { contact_email: contactEmail },
		});
	}

	async getActionsColumns(context: IExecuteFunctions): Promise<NextLeadApiResponse> {
		return this.makeRequest(context, {
			method: 'GET',
			endpoint: '/api/v2/receive/actions/get-columns',
		});
	}

	async getLists(context: IExecuteFunctions): Promise<NextLeadApiResponse> {
		return this.makeRequest(context, {
			method: 'GET',
			endpoint: '/api/v2/receive/lists/get-lists',
		});
	}

	async pollContactsCreated(
		context: IExecuteFunctions | IPollFunctions,
	): Promise<NextLeadApiResponse> {
		return this.makeRequest(context, {
			method: 'GET',
			endpoint: '/api/v2/polling/contact/user-created',
		});
	}

	async pollContactsUpdated(
		context: IExecuteFunctions | IPollFunctions,
	): Promise<NextLeadApiResponse> {
		return this.makeRequest(context, {
			method: 'GET',
			endpoint: '/api/v2/polling/contact/user-edited',
		});
	}

	async pollContactsDeleted(
		context: IExecuteFunctions | IPollFunctions,
	): Promise<NextLeadApiResponse> {
		return this.makeRequest(context, {
			method: 'GET',
			endpoint: '/api/v2/polling/contact/user-deleted',
		});
	}

	async pollStructuresCreated(
		context: IExecuteFunctions | IPollFunctions,
	): Promise<NextLeadApiResponse> {
		return this.makeRequest(context, {
			method: 'GET',
			endpoint: '/api/v2/polling/structures/structure-created',
		});
	}

	async pollStructuresUpdated(
		context: IExecuteFunctions | IPollFunctions,
	): Promise<NextLeadApiResponse> {
		return this.makeRequest(context, {
			method: 'GET',
			endpoint: '/api/v2/polling/structures/structure-edited',
		});
	}

	async pollStructuresDeleted(
		context: IExecuteFunctions | IPollFunctions,
	): Promise<NextLeadApiResponse> {
		return this.makeRequest(context, {
			method: 'GET',
			endpoint: '/api/v2/polling/structures/structure-deleted',
		});
	}

	async pollEmailAddedToList(
		context: IExecuteFunctions | IPollFunctions,
	): Promise<NextLeadApiResponse> {
		return this.makeRequest(context, {
			method: 'GET',
			endpoint: '/api/v2/polling/email/added-to-list',
		});
	}

	async pollEmailRemovedFromList(
		context: IExecuteFunctions | IPollFunctions,
	): Promise<NextLeadApiResponse> {
		return this.makeRequest(context, {
			method: 'GET',
			endpoint: '/api/v2/polling/email/deleted-from-list',
		});
	}
}
