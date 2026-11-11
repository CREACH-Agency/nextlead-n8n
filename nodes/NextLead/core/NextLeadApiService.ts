import { IExecuteFunctions, IDataObject, IN8nHttpFullResponse, IPollFunctions } from 'n8n-workflow';
import { NextLeadCredentials, RequestConfig, N8nRequestOptions } from './types/n8n/RequestTypes';
import { NextLeadApiResponse } from './types/shared/ApiTypes';
import { createNextLeadError } from './types/n8n/ErrorTypes';
import {
	SaleCompletionEvent,
	SaleCompletionOutcome,
	SaleCompletionPage,
	SaleCompletionQuery,
} from './types/api/SalesDealTypes';

export class NextLeadApiService {
	private credentials: NextLeadCredentials;

	constructor(credentials: NextLeadCredentials) {
		this.credentials = credentials;
	}

	async makeRequest(
		context: IExecuteFunctions | IPollFunctions,
		config: RequestConfig,
	): Promise<NextLeadApiResponse> {
		const { method, endpoint, data, queryParams, headers, timeout, returnFullResponse } = config;

		try {
			const domain = this.credentials.domain.endsWith('/')
				? this.credentials.domain.slice(0, -1)
				: this.credentials.domain;

			// The payload is deliberately left out: it carries contact data, and the
			// execution log is not the place for personal information.
			context.logger.debug('NextLead API request', { method, endpoint });

			const requestOptions: N8nRequestOptions = {
				method,
				url: `${domain}${endpoint}`,
				json: true,
			};

			if (data) {
				requestOptions.body = data;
			}

			if (queryParams) {
				requestOptions.qs = queryParams;
			}

			if (headers && Object.keys(headers).length > 0) {
				requestOptions.headers = headers;
			}

			if (timeout) {
				requestOptions.timeout = timeout;
			}

			// Response headers are only reachable through the modern helper, which
			// resolves with `{ body, headers, statusCode }` when asked to.
			if (returnFullResponse) {
				const fullResponse = (await context.helpers.httpRequestWithAuthentication.call(
					context,
					'nextLeadApi',
					{ ...requestOptions, returnFullResponse: true },
				)) as IN8nHttpFullResponse;

				return {
					success: true,
					data: { body: fullResponse.body, headers: fullResponse.headers },
				};
			}

			// `requestWithAuthentication` (request-promise) is deprecated and rejected
			// by the n8n community package scan since 0.4.1.
			const response = await context.helpers.httpRequestWithAuthentication.call(
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

			// A 403 is almost always a scope or quota problem on the API key, so the
			// endpoint and the server's own explanation are worth keeping. The raw
			// error is not logged: it echoes back the request, credentials included.
			if (nextLeadError.statusCode === 403) {
				context.logger.debug('NextLead API returned 403', {
					endpoint,
					message: nextLeadError.message,
				});
			}

			return {
				success: false,
				error: nextLeadError.message,
				data: null,
				httpError: error,
			};
		}
	}

	async identifyUser(context: IExecuteFunctions): Promise<NextLeadApiResponse> {
		return this.makeRequest(context, {
			method: 'GET',
			endpoint: '/api/v2/identify-user',
		});
	}

	/**
	 * Runs a natural language prompt through the NextLead AI agent and returns the
	 * answer synchronously. The agent loop can run up to 5 minutes server-side, so
	 * the request timeout is raised accordingly.
	 */
	async runAiPrompt(
		context: IExecuteFunctions,
		runData: IDataObject,
	): Promise<NextLeadApiResponse> {
		return this.makeRequest(context, {
			method: 'POST',
			endpoint: '/api/v2/ai/run',
			data: runData,
			timeout: 300000,
		});
	}

	async createContact(
		context: IExecuteFunctions,
		contactData: IDataObject,
		headers?: Record<string, string>,
	): Promise<NextLeadApiResponse> {
		return this.makeRequest(context, {
			method: 'POST',
			endpoint: '/api/v2/receive/contact/new-contact',
			data: contactData,
			...(headers && { headers }),
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

	/**
	 * Resolve a single structure from loose criteria (id, name, siret, email,
	 * phone). Mirrors the lookup the Zapier integration performs before creating
	 * or editing a contact, so both integrations resolve a structure the same way.
	 */
	async findSingleStructure(
		context: IExecuteFunctions,
		searchParams: IDataObject,
	): Promise<NextLeadApiResponse> {
		return this.makeRequest(context, {
			method: 'GET',
			endpoint: '/api/v2/receive/structure/get-single-structure',
			queryParams: searchParams,
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
		actionData: IDataObject,
	): Promise<NextLeadApiResponse> {
		return this.makeRequest(context, {
			method: 'DELETE',
			endpoint: '/api/v2/receive/actions/delete-action',
			data: actionData,
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

	async createList(
		context: IExecuteFunctions,
		listData: IDataObject,
	): Promise<NextLeadApiResponse> {
		return this.makeRequest(context, {
			method: 'POST',
			endpoint: '/api/v2/receive/lists/create-list',
			data: listData,
		});
	}

	/**
	 * The route is plural — `create-groups`. The singular form used previously
	 * does not exist server-side and answered 404, so group creation never worked.
	 * Do not "fix" this back to the singular.
	 */
	async createGroup(
		context: IExecuteFunctions,
		groupData: IDataObject,
	): Promise<NextLeadApiResponse> {
		return this.makeRequest(context, {
			method: 'POST',
			endpoint: '/api/v2/receive/groups/create-groups',
			data: groupData,
		});
	}

	async getGroups(context: IExecuteFunctions): Promise<NextLeadApiResponse> {
		return this.makeRequest(context, {
			method: 'GET',
			endpoint: '/api/v2/receive/groups/get-groups',
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

	/**
	 * One page of `polling/sales/sale-won` or `sale-lost`: the sales currently
	 * closed in that outcome, newest closure first. The route pages backwards
	 * through `X-Next-Cursor`, so the response is resolved in full and the
	 * cursor surfaced next to the events. It does not consume the action quota.
	 */
	async pollSalesCompleted(
		context: IExecuteFunctions | IPollFunctions,
		outcome: SaleCompletionOutcome,
		query: SaleCompletionQuery = {},
	): Promise<NextLeadApiResponse<SaleCompletionPage>> {
		const response = await this.makeRequest(context, {
			method: 'GET',
			endpoint: `/api/v2/polling/sales/sale-${outcome}`,
			queryParams: {
				...(query.limit !== undefined && { limit: query.limit }),
				...(query.since && { since: query.since }),
				...(query.cursor && { cursor: query.cursor }),
			},
			returnFullResponse: true,
		});

		if (!response.success) {
			return { ...response, data: undefined };
		}

		const { body, headers } = (response.data ?? {}) as { body?: unknown; headers?: IDataObject };
		const cursor = headers?.['x-next-cursor'];

		return {
			success: true,
			data: {
				events: Array.isArray(body) ? (body as SaleCompletionEvent[]) : [],
				nextCursor: typeof cursor === 'string' && cursor ? cursor : null,
			},
		};
	}

	async linkContactToStructure(
		context: IExecuteFunctions,
		linkData: IDataObject,
	): Promise<NextLeadApiResponse> {
		return this.makeRequest(context, {
			method: 'POST',
			endpoint: '/api/v2/receive/contact/link-to-structure',
			data: linkData,
		});
	}

	async linkStructureToContact(
		context: IExecuteFunctions,
		linkData: IDataObject,
	): Promise<NextLeadApiResponse> {
		return this.makeRequest(context, {
			method: 'POST',
			endpoint: '/api/v2/receive/structure/link-to-contact',
			data: linkData,
		});
	}
}
