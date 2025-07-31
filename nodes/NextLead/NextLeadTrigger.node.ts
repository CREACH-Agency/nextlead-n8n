import {
	IPollFunctions,
	INodeType,
	INodeTypeDescription,
	INodeExecutionData,
	IDataObject,
	NodeConnectionType,
} from 'n8n-workflow';

import { NextLeadApiService } from './core/NextLeadApiService';
import { NextLeadCredentials } from './core/types/n8n/RequestTypes';
import { NextLeadErrorHandler } from './core/NextLeadErrorHandler';

export class NextLeadTrigger implements INodeType {
	description: INodeTypeDescription = {
		displayName: 'NextLead Trigger',
		name: 'nextLeadTrigger',
		icon: 'file:nextlead.svg',
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
		const webhookData = this.getWorkflowStaticData('node');
		const event = this.getNodeParameter('event') as string;

		// Initialize processed IDs if not exists
		if (!webhookData.processedIds) {
			webhookData.processedIds = {
				contacts: [],
				structures: [],
				emailLists: [],
			};
		}

		const processedIds = webhookData.processedIds as {
			contacts: string[];
			structures: string[];
			emailLists: string[];
		};

		try {
			const credentials = (await this.getCredentials('nextLeadApi')) as NextLeadCredentials;
			const apiService = new NextLeadApiService(credentials);

			let response;
			let newItems: IDataObject[] = [];

			switch (event) {
				case 'contactCreated':
					response = await apiService.pollContactsCreated(this);
					if (response.success && response.data && Array.isArray(response.data)) {
						for (const item of response.data) {
							if (item.id && !processedIds.contacts.includes(item.id)) {
								newItems.push(item as IDataObject);
								processedIds.contacts.push(item.id);
							}
						}
						// Keep only last 1000 IDs
						if (processedIds.contacts.length > 1000) {
							processedIds.contacts = processedIds.contacts.slice(-1000);
						}
					}
					break;

				case 'contactUpdated':
					response = await apiService.pollContactsUpdated(this);
					if (response.success && response.data && Array.isArray(response.data)) {
						// For updates, return all items
						newItems = response.data as IDataObject[];
					}
					break;

				case 'contactDeleted':
					response = await apiService.pollContactsDeleted(this);
					if (response.success && response.data && Array.isArray(response.data)) {
						// For deletions, return all items
						newItems = response.data as IDataObject[];
					}
					break;

				case 'structureCreated':
					response = await apiService.pollStructuresCreated(this);
					if (response.success && response.data && Array.isArray(response.data)) {
						for (const item of response.data) {
							if (item.id && !processedIds.structures.includes(item.id)) {
								newItems.push(item as IDataObject);
								processedIds.structures.push(item.id);
							}
						}
						// Keep only last 1000 IDs
						if (processedIds.structures.length > 1000) {
							processedIds.structures = processedIds.structures.slice(-1000);
						}
					}
					break;

				case 'structureUpdated':
					response = await apiService.pollStructuresUpdated(this);
					if (response.success && response.data && Array.isArray(response.data)) {
						// For updates, return all items
						newItems = response.data as IDataObject[];
					}
					break;

				case 'structureDeleted':
					response = await apiService.pollStructuresDeleted(this);
					if (response.success && response.data && Array.isArray(response.data)) {
						// For deletions, return all items
						newItems = response.data as IDataObject[];
					}
					break;

				case 'emailAddedToList':
					response = await apiService.pollEmailAddedToList(this);
					if (response.success && response.data && Array.isArray(response.data)) {
						for (const item of response.data) {
							const compositeKey = `${item.email}_${item.listId}`;
							if (!processedIds.emailLists.includes(compositeKey)) {
								newItems.push(item as IDataObject);
								processedIds.emailLists.push(compositeKey);
							}
						}
						// Keep only last 1000 IDs
						if (processedIds.emailLists.length > 1000) {
							processedIds.emailLists = processedIds.emailLists.slice(-1000);
						}
					}
					break;

				case 'emailRemovedFromList':
					response = await apiService.pollEmailRemovedFromList(this);
					if (response.success && response.data && Array.isArray(response.data)) {
						// For removals, return all items
						newItems = response.data as IDataObject[];
					}
					break;
			}

			// Update last poll time
			webhookData.lastPollTime = new Date().toISOString();

			// Return null if no new items
			if (newItems.length === 0) {
				return null;
			}

			// Return new items
			return [this.helpers.returnJsonArray(newItems)];
		} catch (error) {
			throw NextLeadErrorHandler.handleApiError(error, this.getNode());
		}
	}
}
