import { IExecuteFunctions, IDataObject } from 'n8n-workflow';
import { NextLeadCredentials, RequestConfig, NextLeadApiResponse } from './types/NextLeadTypes';

export class NextLeadApiService {
	private credentials: NextLeadCredentials;

	constructor(credentials: NextLeadCredentials) {
		this.credentials = credentials;
	}

	async makeRequest(
		context: IExecuteFunctions,
		config: RequestConfig
	): Promise<NextLeadApiResponse> {
		try {
			const { method, endpoint, data, queryParams } = config;

			const requestOptions: any = {
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
				requestOptions
			);

			return {
				success: true,
				data: response,
			};
		} catch (error: any) {
			return {
				success: false,
				error: error.message || 'Unknown error occurred',
				data: null,
			};
		}
	}

	async createContact(context: IExecuteFunctions, contactData: IDataObject): Promise<NextLeadApiResponse> {
		return this.makeRequest(context, {
			method: 'POST',
			endpoint: '/api/v2/receive/contact/new-contact',
			data: contactData,
		});
	}

	async updateContact(context: IExecuteFunctions, contactData: IDataObject): Promise<NextLeadApiResponse> {
		return this.makeRequest(context, {
			method: 'POST',
			endpoint: '/api/v2/receive/contact/edit-contact',
			data: contactData,
		});
	}

	async deleteContact(context: IExecuteFunctions, contactId: string): Promise<NextLeadApiResponse> {
		return this.makeRequest(context, {
			method: 'POST',
			endpoint: '/api/v2/receive/contact/delete-contact',
			data: { id: contactId },
		});
	}

	async findContact(context: IExecuteFunctions, searchData: IDataObject): Promise<NextLeadApiResponse> {
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

	async createStructure(context: IExecuteFunctions, structureData: IDataObject): Promise<NextLeadApiResponse> {
		return this.makeRequest(context, {
			method: 'POST',
			endpoint: '/api/v2/receive/structure/new-structure',
			data: structureData,
		});
	}

	async updateStructure(context: IExecuteFunctions, structureData: IDataObject): Promise<NextLeadApiResponse> {
		return this.makeRequest(context, {
			method: 'POST',
			endpoint: '/api/v2/receive/structure/edit-structure',
			data: structureData,
		});
	}

	async deleteStructure(context: IExecuteFunctions, structureId: string): Promise<NextLeadApiResponse> {
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

	async createSale(context: IExecuteFunctions, saleData: IDataObject): Promise<NextLeadApiResponse> {
		return this.makeRequest(context, {
			method: 'POST',
			endpoint: '/api/v2/receive/sales/create-sale',
			data: saleData,
		});
	}

	async updateSale(context: IExecuteFunctions, saleData: IDataObject): Promise<NextLeadApiResponse> {
		return this.makeRequest(context, {
			method: 'PUT',
			endpoint: '/api/v2/receive/sales/update-sale',
			data: saleData,
		});
	}

	async deleteSale(context: IExecuteFunctions, saleId: string): Promise<NextLeadApiResponse> {
		return this.makeRequest(context, {
			method: 'DELETE',
			endpoint: '/api/v2/receive/sales/delete-sale',
			queryParams: { id: saleId },
		});
	}

	async getSalesColumns(context: IExecuteFunctions): Promise<NextLeadApiResponse> {
		return this.makeRequest(context, {
			method: 'GET',
			endpoint: '/api/v2/receive/sales/get-columns',
		});
	}

	async createAction(context: IExecuteFunctions, actionData: IDataObject): Promise<NextLeadApiResponse> {
		return this.makeRequest(context, {
			method: 'POST',
			endpoint: '/api/v2/receive/actions/create-action',
			data: actionData,
		});
	}

	async updateAction(context: IExecuteFunctions, actionData: IDataObject): Promise<NextLeadApiResponse> {
		return this.makeRequest(context, {
			method: 'POST',
			endpoint: '/api/v2/receive/actions/update-action',
			data: actionData,
		});
	}

	async deleteAction(context: IExecuteFunctions, actionId: string): Promise<NextLeadApiResponse> {
		return this.makeRequest(context, {
			method: 'POST',
			endpoint: '/api/v2/receive/actions/delete-action',
			data: { id: actionId },
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
}
