import {
	IExecuteFunctions,
	ILoadOptionsFunctions,
	INodeExecutionData,
	INodeListSearchResult,
	INodeProperties,
	INodePropertyOptions,
	INodeType,
	INodeTypeDescription,
	NodeConnectionType,
} from 'n8n-workflow';

import { NextLeadErrorHandler } from './core/NextLeadErrorHandler';
import { ResourceManager } from './core/ResourceManager';
import { OperationType, ResourceType } from './core/types/NextLeadTypes';
import { ConversionStatus } from './core/types/shared/ApiTypes';
import { ActionResource } from './resources/ActionResource';
import { AiResource } from './resources/AiResource';
import { ContactResource } from './resources/ContactResource';
import { GroupResource } from './resources/GroupResource';
import { IdentifyResource } from './resources/IdentifyResource';
import { ListResource } from './resources/ListResource';
import { SaleResource } from './resources/SaleResource';
import { StructureResource } from './resources/StructureResource';
import { fetchMetadata, unwrapArray } from './utils/MetadataCache';
import { fetchTeamMembers } from './utils/TeamMemberUtils';

interface INamedEntity {
	id?: string;
	name?: string;
}

/**
 * A fixedCollection materialises every one of its sub-fields as soon as the
 * group is added, so each dropdown starts on the empty string — a value n8n
 * refuses because it is not in the option list ("The value "" is not
 * supported!"). Offering the empty entry explicitly makes "leave this one out"
 * a legal choice, and the payload builders already strip empty values.
 */
const NONE_OPTION: INodePropertyOptions = { name: '- None -', value: '' };

/** Structures fetched per dropdown page. The route caps `limit` at 500. */
const STRUCTURE_PAGE_SIZE = 50;

/** Tag-backed dropdowns (contact type, lead source, sector) share this shape. */
async function loadTagOptions(
	context: ILoadOptionsFunctions,
	route: string,
): Promise<INodePropertyOptions[]> {
	try {
		const response = await fetchMetadata(context, route);

		return [
			NONE_OPTION,
			...unwrapArray<INamedEntity>(response)
				.filter((tag): tag is { id: string; name: string } => Boolean(tag.id && tag.name))
				.map((tag) => ({ name: tag.name, value: tag.id })),
		];
	} catch {
		return [NONE_OPTION];
	}
}

export class NextLead implements INodeType {
	description: INodeTypeDescription = {
		displayName: 'NextLead',
		name: 'nextLead',
		icon: 'file:nextlead.svg',
		/*
		 * - ['trigger']: Node waits for external triggers (webhooks, timers, events)
		 * - []: Empty array for standard nodes
		 *  https://docs.n8n.io/integrations/creating-nodes/build/reference/node-base-files/standard-parameters/#group
		 */
		group: [],
		version: 1,
		subtitle: '={{$parameter["operation"] + ": " + $parameter["resource"]}}',
		description: 'Interact with NextLead CRM API',
		usableAsTool: true,
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
						name: 'AI',
						value: 'ai',
					},
					{
						name: 'Contact',
						value: 'contact',
					},
					{
						name: 'Group',
						value: 'group',
					},
					{
						name: 'Identify',
						value: 'identify',
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
			// Operations will be added dynamically by ResourceManager
			...this.getOperations(),
			// Fields will be added dynamically by ResourceManager
			...this.getFields(),
		],
	};

	private static resourceManager: ResourceManager;

	static {
		NextLead.resourceManager = NextLead.createResourceManager();
	}

	private static createResourceManager(): ResourceManager {
		const manager = new ResourceManager();
		// Register all resource strategies
		manager.register(new ContactResource());
		manager.register(new StructureResource());
		manager.register(new SaleResource());
		manager.register(new ActionResource());
		manager.register(new ListResource());
		manager.register(new GroupResource());
		manager.register(new IdentifyResource());
		manager.register(new AiResource());
		return manager;
	}

	private getOperations(): INodeProperties[] {
		return NextLead.resourceManager.getAllOperations();
	}

	private getFields(): INodeProperties[] {
		return NextLead.resourceManager.getAllFields();
	}

	methods = {
		loadOptions: {
			async getConversionStatuses(this: ILoadOptionsFunctions): Promise<INodePropertyOptions[]> {
				try {
					const response = await fetchMetadata(this, '/api/v2/receive/contact/get-conversion');

					// An empty list is a valid answer: the user has to configure
					// conversion statuses in NextLead first.
					return [
						NONE_OPTION,
						...unwrapArray<ConversionStatus>(response).map((status) => ({
							name: status.name,
							value: status.id,
						})),
					];
				} catch {
					return [NONE_OPTION];
				}
			},
			async getContactTypes(this: ILoadOptionsFunctions): Promise<INodePropertyOptions[]> {
				return loadTagOptions(this, '/api/v2/receive/contact/get-contact-types');
			},
			async getLeadSources(this: ILoadOptionsFunctions): Promise<INodePropertyOptions[]> {
				return loadTagOptions(this, '/api/v2/receive/contact/get-lead-sources');
			},
			async getSectors(this: ILoadOptionsFunctions): Promise<INodePropertyOptions[]> {
				return loadTagOptions(this, '/api/v2/receive/contact/get-sectors');
			},
			async getSaleColumns(this: ILoadOptionsFunctions): Promise<INodePropertyOptions[]> {
				try {
					const response = await fetchMetadata(this, '/api/v2/receive/sales/get-columns');

					return unwrapArray<{ id: string; name: string }>(response).map((column) => ({
						name: column.name,
						value: column.id,
					}));
				} catch {
					return [];
				}
			},
			async getActionColumns(this: ILoadOptionsFunctions): Promise<INodePropertyOptions[]> {
				try {
					const response = await fetchMetadata(this, '/api/v2/receive/actions/get-columns');

					return unwrapArray<{ id: string; name: string }>(response).map((column) => ({
						name: column.name,
						value: column.id,
					}));
				} catch {
					return [];
				}
			},
			async getTeamMembers(this: ILoadOptionsFunctions): Promise<INodePropertyOptions[]> {
				const members = await fetchTeamMembers(this);

				return [
					NONE_OPTION,
					...members.map((member) => ({
						name: member.label,
						value: member.id,
					})),
				];
			},
			async getLists(this: ILoadOptionsFunctions): Promise<INodePropertyOptions[]> {
				try {
					const response = await fetchMetadata(this, '/api/v2/receive/lists/get-lists');

					return [
						NONE_OPTION,
						...unwrapArray<{ id: string; name: string }>(response).map((list) => ({
							name: list.name,
							value: list.id,
						})),
					];
				} catch {
					return [NONE_OPTION];
				}
			},
			async getGroups(this: ILoadOptionsFunctions): Promise<INodePropertyOptions[]> {
				try {
					const response = await fetchMetadata(this, '/api/v2/receive/groups/get-groups');

					return unwrapArray<{ id: string; name: string }>(response).map((group) => ({
						name: group.name,
						value: group.id,
					}));
				} catch {
					return [];
				}
			},
			async getCustomFieldTypes(this: ILoadOptionsFunctions): Promise<INodePropertyOptions[]> {
				try {
					const response = await fetchMetadata(this, '/api/v2/receive/contact/get-custom-fields');

					return [
						NONE_OPTION,
						...unwrapArray<{ id: string; name: string; groupName?: string }>(response).map(
							(field) => ({
								name: field.groupName ? `${field.groupName} > ${field.name}` : field.name,
								value: field.id,
							}),
						),
					];
				} catch {
					return [NONE_OPTION];
				}
			},
		},
		listSearch: {
			async searchTeamMembers(
				this: ILoadOptionsFunctions,
				filter?: string,
			): Promise<INodeListSearchResult> {
				const members = await fetchTeamMembers(this);
				const searchTerm = (filter ?? '').trim().toLowerCase();

				return {
					results: members
						.filter((member) => !searchTerm || member.label.toLowerCase().includes(searchTerm))
						.map((member) => ({ name: member.label, value: member.id })),
				};
			},
			/**
			 * `get-structures` filters on name/siret server-side and pages with
			 * `limit`/`offset`, so both are always sent: omitting `limit` makes the
			 * route answer with the organization's entire table, which an org with
			 * thousands of structures would download on every dropdown open — and
			 * metadata reads are billed against the EXTERNAL_AUTOMATION quota.
			 */
			async searchStructures(
				this: ILoadOptionsFunctions,
				filter?: string,
				paginationToken?: string,
			): Promise<INodeListSearchResult> {
				try {
					const searchTerm = (filter ?? '').trim();
					const parsedOffset = Number.parseInt(paginationToken ?? '', 10);
					const offset = Number.isFinite(parsedOffset) && parsedOffset > 0 ? parsedOffset : 0;

					const response = await fetchMetadata(this, '/api/v2/receive/structure/get-structures', {
						...(searchTerm && { search: searchTerm }),
						limit: STRUCTURE_PAGE_SIZE,
						...(offset > 0 && { offset }),
					});

					const structures = unwrapArray<INamedEntity & { siret?: string }>(response);

					return {
						results: structures
							.map((structure) => {
								const id = structure.id ?? '';
								if (!id) return null;
								const mainLabel = structure.name || 'Unnamed structure';
								const secondaryLabel = structure.siret ? ` (${structure.siret})` : '';
								return {
									name: `${mainLabel}${secondaryLabel}`,
									value: id,
								};
							})
							.filter((item): item is { name: string; value: string } => item !== null),
						// A short page means the end of the list. Handing back a token
						// there would have n8n fetch an empty page on every scroll.
						...(structures.length === STRUCTURE_PAGE_SIZE && {
							paginationToken: String(offset + STRUCTURE_PAGE_SIZE),
						}),
					};
				} catch {
					return { results: [] };
				}
			},
		},
	};

	async execute(this: IExecuteFunctions): Promise<INodeExecutionData[][]> {
		const items = this.getInputData();
		const results: INodeExecutionData[] = [];

		for (let itemIndex = 0; itemIndex < items.length; itemIndex++) {
			try {
				const resource = this.getNodeParameter('resource', itemIndex) as ResourceType;
				const operation = this.getNodeParameter('operation', itemIndex) as OperationType;

				const result = await NextLead.resourceManager.execute(resource, operation, this, itemIndex);

				// Item linking: every output item states which input item produced it,
				// so downstream nodes can trace a record back to its source.
				// https://docs.n8n.io/integrations/creating-nodes/build/reference/paired-items/
				results.push(
					...result.map((item) => ({
						...item,
						pairedItem: item.pairedItem ?? { item: itemIndex },
					})),
				);
			} catch (error) {
				if (this.continueOnFail()) {
					results.push({
						json: NextLeadErrorHandler.formatErrorData(error),
						pairedItem: { item: itemIndex },
					});
				} else {
					throw NextLeadErrorHandler.handleApiError(error, this.getNode());
				}
			}
		}

		return [results];
	}
}
