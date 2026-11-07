import {
	IPollFunctions,
	INodeType,
	INodeTypeDescription,
	INodeExecutionData,
	IDataObject,
	NodeConnectionType,
	NodeOperationError,
} from 'n8n-workflow';

import { NextLeadApiService } from './core/NextLeadApiService';
import { NextLeadApiResponse } from './core/types/shared/ApiTypes';
import { NextLeadCredentials } from './core/types/n8n/RequestTypes';
import { NextLeadErrorHandler } from './core/NextLeadErrorHandler';
import { SaleCompletionEvent, SaleCompletionOutcome } from './core/types/api/SalesDealTypes';
import { unwrapArray } from './utils/MetadataCache';
import { DedupStrategy, PollDedupStore } from './utils/PollDedup';

interface FetchOptions {
	/** "Fetch Test Event": a single, most recent event is enough. */
	manual: boolean;
	/** No dedup state yet: this poll only records a baseline. */
	firstRun: boolean;
	/** Whether an earlier poll already emitted this event. */
	isKnown: (item: IDataObject) => boolean;
}

interface EventConfig {
	fetch: (
		apiService: NextLeadApiService,
		context: IPollFunctions,
		options: FetchOptions,
	) => Promise<NextLeadApiResponse>;
	strategy: DedupStrategy;
}

/** Closures per page. The route caps `limit` at 200 (default 100). */
const SALE_PAGE_SIZE = 200;

/** Pages walked per poll, so a mass closure cannot turn one poll into a crawl. */
const SALE_MAX_PAGES = 5;

/**
 * Unlike the contact and structure queues, the sale-won / sale-lost routes
 * page backwards through `X-Next-Cursor`, newest closure first. A poll walks
 * pages until it reaches a closure an earlier poll already emitted — every
 * older one was handled then — so a burst of closures between two polls is
 * not truncated at the page size. The route reflects the current state: a sale
 * reopened before the poll is absent, and closing it again yields a new `id`.
 */
async function fetchCompletedSales(
	apiService: NextLeadApiService,
	context: IPollFunctions,
	outcome: SaleCompletionOutcome,
	{ manual, firstRun, isKnown }: FetchOptions,
): Promise<NextLeadApiResponse> {
	const events: SaleCompletionEvent[] = [];
	let cursor: string | undefined;

	for (let page = 0; page < SALE_MAX_PAGES; page++) {
		const response = await apiService.pollSalesCompleted(context, outcome, {
			limit: manual ? 1 : SALE_PAGE_SIZE,
			...(cursor && { cursor }),
		});

		if (!response.success) return response;

		const { events: pageEvents, nextCursor } = response.data ?? { events: [], nextCursor: null };
		events.push(...pageEvents);

		// The baseline and the test sample only need the newest page.
		if (manual || firstRun || !nextCursor || pageEvents.some(isKnown)) break;
		cursor = nextCursor;
	}

	return { success: true, data: events };
}

/**
 * Every event is deduplicated. The queues behind these routes are not consumed
 * on read, so an event left undeduplicated re-fires the workflow on each poll
 * for as long as the row stays queued.
 */
const EVENT_CONFIG: Record<string, EventConfig> = {
	contactCreated: {
		fetch: (apiService, context) => apiService.pollContactsCreated(context),
		strategy: 'id',
	},
	contactUpdated: {
		fetch: (apiService, context) => apiService.pollContactsUpdated(context),
		strategy: 'versioned',
	},
	contactDeleted: {
		fetch: (apiService, context) => apiService.pollContactsDeleted(context),
		strategy: 'versioned',
	},
	structureCreated: {
		fetch: (apiService, context) => apiService.pollStructuresCreated(context),
		strategy: 'id',
	},
	structureUpdated: {
		fetch: (apiService, context) => apiService.pollStructuresUpdated(context),
		strategy: 'versioned',
	},
	structureDeleted: {
		fetch: (apiService, context) => apiService.pollStructuresDeleted(context),
		strategy: 'versioned',
	},
	emailAddedToList: {
		fetch: (apiService, context) => apiService.pollEmailAddedToList(context),
		strategy: 'emailList',
	},
	emailRemovedFromList: {
		fetch: (apiService, context) => apiService.pollEmailRemovedFromList(context),
		strategy: 'versioned',
	},
	// `id` is `<saleId>:<closure date>`, unique per closure: the bare id is the key.
	saleWon: {
		fetch: (apiService, context, options) =>
			fetchCompletedSales(apiService, context, 'won', options),
		strategy: 'id',
	},
	saleLost: {
		fetch: (apiService, context, options) =>
			fetchCompletedSales(apiService, context, 'lost', options),
		strategy: 'id',
	},
};

// Trigger nodes cannot be invoked as AI tools (n8n review of 0.3.0), and the
// INodeTypeDescription type only allows `usableAsTool: true`, so the property
// is left out and the community-nodes rule is disabled for this class only.
// eslint-disable-next-line @n8n/community-nodes/node-usable-as-tool
export class NextLeadTrigger implements INodeType {
	description: INodeTypeDescription = {
		displayName: 'NextLead Trigger',
		name: 'nextLeadTrigger',
		icon: { light: 'file:nextlead.svg', dark: 'file:nextlead.dark.svg' },
		group: ['trigger'],
		version: 1,
		subtitle: '={{$parameter["event"]}}',
		description: 'Trigger workflows on NextLead events through polling',
		defaults: {
			name: 'NextLead Trigger',
		},
		inputs: [],
		outputs: [NodeConnectionType.Main],
		credentials: [
			{
				name: 'nextLeadApi',
				required: true,
			},
		],
		polling: true,
		properties: [
			{
				displayName: 'Event',
				name: 'event',
				type: 'options',
				required: true,
				default: 'contactCreated',
				options: [
					{
						name: 'Contact Created',
						value: 'contactCreated',
						description: 'Trigger when a new contact is created',
					},
					{
						name: 'Contact Deleted',
						value: 'contactDeleted',
						description: 'Trigger when a contact is deleted',
					},
					{
						name: 'Contact Updated',
						value: 'contactUpdated',
						description: 'Trigger when a contact is updated',
					},
					{
						name: 'Email Added to List',
						value: 'emailAddedToList',
						description: 'Trigger when an email is added to a list',
					},
					{
						name: 'Email Removed From List',
						value: 'emailRemovedFromList',
						description: 'Trigger when an email is removed from a list',
					},
					{
						name: 'Sale Lost',
						value: 'saleLost',
						description: 'Trigger when a sale is closed as lost',
					},
					{
						name: 'Sale Won',
						value: 'saleWon',
						description: 'Trigger when a sale is closed as won',
					},
					{
						name: 'Structure Created',
						value: 'structureCreated',
						description: 'Trigger when a new structure is created',
					},
					{
						name: 'Structure Deleted',
						value: 'structureDeleted',
						description: 'Trigger when a structure is deleted',
					},
					{
						name: 'Structure Updated',
						value: 'structureUpdated',
						description: 'Trigger when a structure is updated',
					},
				],
			},
		],
	};

	async poll(this: IPollFunctions): Promise<INodeExecutionData[][] | null> {
		const event = this.getNodeParameter('event') as string;
		const config = EVENT_CONFIG[event];

		if (!config) {
			throw new NodeOperationError(this.getNode(), `Unknown NextLead trigger event: ${event}`);
		}

		try {
			const credentials = (await this.getCredentials('nextLeadApi')) as NextLeadCredentials;
			const apiService = new NextLeadApiService(credentials);

			const webhookData = this.getWorkflowStaticData('node');
			const store = PollDedupStore.load(webhookData, event);
			const manual = this.getMode() === 'manual';

			const response = await config.fetch(apiService, this, {
				manual,
				firstRun: store.isFirstRun,
				isKnown: (item) => store.has(item, config.strategy),
			});

			// A failed poll used to be swallowed: the trigger simply never fired and
			// left no trace, so a revoked key or a 500 looked like "no new events".
			if (!response.success) {
				throw NextLeadErrorHandler.handleApiError(
					response.httpError ?? new Error(response.error ?? 'NextLead polling failed'),
					this.getNode(),
				);
			}

			const items = unwrapArray<IDataObject>(response.data);

			// "Fetch Test Event" must stay repeatable and must not dump a backlog of
			// thousands of rows into the editor, so it samples the latest queued
			// event without recording it.
			if (manual) {
				const latest = items[items.length - 1];
				return latest ? [this.helpers.returnJsonArray([latest])] : null;
			}

			const newItems = store.filterNew(items, config.strategy);

			// Only commit when the queue answered: an empty response must not wipe
			// a backlog the node would then replay in full on the next poll.
			if (items.length > 0) {
				store.persist();
			}

			webhookData.lastPollTime = new Date().toISOString();

			// The first poll only establishes the baseline. Emitting it would fire
			// the workflow once per historical row still sitting in the queue.
			if (store.isFirstRun) {
				return null;
			}

			return newItems.length > 0 ? [this.helpers.returnJsonArray(newItems)] : null;
		} catch (error) {
			throw NextLeadErrorHandler.handleApiError(error, this.getNode());
		}
	}
}
