import { IExecuteFunctions, INodeExecutionData, INodeProperties, IDataObject } from 'n8n-workflow';
import { ResourceType, OperationType, NextLeadCredentials } from '../core/types/NextLeadTypes';
import { IResourceStrategy } from '../core/interfaces/IResourceStrategy';
import { NextLeadApiService } from '../core/NextLeadApiService';
import { ResponseUtils } from '../utils/ResponseUtils';
import { contactOperations, contactFields } from './contact/ContactFields';
import { ContactHelpers } from './contact/ContactHelpers';

export class ContactResource implements IResourceStrategy {
	getResourceType(): ResourceType {
		return 'contact';
	}

	getOperations(): INodeProperties[] {
		return contactOperations;
	}

	getFields(): INodeProperties[] {
		return contactFields;
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
				return this.handleCreate(context, itemIndex, apiService);
			case 'update':
				return this.handleUpdate(context, itemIndex, apiService);
			case 'delete':
				return this.handleDelete(context, itemIndex, apiService);
			case 'find':
				return this.handleFind(context, itemIndex, apiService);
			case 'getTeam':
				return ResponseUtils.formatArrayResponse(await apiService.getTeam(context));
			case 'getConversion':
				return ResponseUtils.formatArrayResponse(await apiService.getConversion(context));
			case 'getCustomFields':
				return ResponseUtils.formatArrayResponse(await apiService.getCustomFields(context));
			default:
				throw new Error(`Unknown operation: ${operation}`);
		}
	}

	private async handleCreate(
		context: IExecuteFunctions,
		itemIndex: number,
		apiService: NextLeadApiService,
	): Promise<INodeExecutionData[]> {
		const email = context.getNodeParameter('email', itemIndex) as string;
		const firstName = context.getNodeParameter('firstName', itemIndex) as string;
		const lastName = context.getNodeParameter('lastName', itemIndex) as string;

		const contactFields = ContactHelpers.cleanFields(
			context.getNodeParameter('contactFields', itemIndex, {}) as IDataObject,
		);
		const organizationFields = ContactHelpers.cleanFields(
			context.getNodeParameter('organizationFields', itemIndex, {}) as IDataObject,
		);

		const contactData: IDataObject = {
			email,
			firstName,
			lastName,
			civility: contactFields.civility || organizationFields.civility || 'NEUTRAL',
			...contactFields,
			...organizationFields,
		};

		const socials = ContactHelpers.transformComplexField(
			context.getNodeParameter('socials', itemIndex, {}) as IDataObject,
			'social',
		);
		const nextlead_config = ContactHelpers.transformComplexField(
			context.getNodeParameter('nextlead_config', itemIndex, {}) as IDataObject,
			'config',
		);
		const custom_fields = ContactHelpers.transformCustomFields(
			context.getNodeParameter('custom_fields', itemIndex, {}) as IDataObject,
		);

		if (socials.length > 0) contactData.socials = socials;
		if (nextlead_config.length > 0) contactData.nextlead_config = nextlead_config;
		if (custom_fields.length > 0) contactData.custom_fields = custom_fields;

		context.logger.info('Creating contact with data:', contactData);
		return ResponseUtils.formatSingleResponse(await apiService.createContact(context, contactData));
	}

	private async handleUpdate(
		context: IExecuteFunctions,
		itemIndex: number,
		apiService: NextLeadApiService,
	): Promise<INodeExecutionData[]> {
		const email = context.getNodeParameter('email', itemIndex, '') as string;
		const linkedinFind = context.getNodeParameter('linkedinFind', itemIndex, '') as string;

		if (!email && !linkedinFind) throw new Error('Either email or LinkedIn URL must be provided');

		const updateData: IDataObject = {
			...(email && { mail: email }),
			...(linkedinFind && { linkedin_find: linkedinFind }),
			values_update: [context.getNodeParameter('updateFields', itemIndex) as IDataObject],
		};

		return ResponseUtils.formatSingleResponse(await apiService.updateContact(context, updateData));
	}

	private async handleDelete(
		context: IExecuteFunctions,
		itemIndex: number,
		apiService: NextLeadApiService,
	): Promise<INodeExecutionData[]> {
		const email = context.getNodeParameter('email', itemIndex, '') as string;
		const linkedin = context.getNodeParameter('linkedin', itemIndex, '') as string;

		if (!email && !linkedin) throw new Error('Either email or LinkedIn URL must be provided');

		await apiService.deleteContact(context, {
			...(email && { email }),
			...(linkedin && { linkedin }),
		});

		return ResponseUtils.formatSuccessResponse(`Contact deleted successfully`);
	}

	private async handleFind(
		context: IExecuteFunctions,
		itemIndex: number,
		apiService: NextLeadApiService,
	): Promise<INodeExecutionData[]> {
		const email = context.getNodeParameter('email', itemIndex, '') as string;
		const linkedinUrl = context.getNodeParameter('linkedinUrl', itemIndex, '') as string;

		if (!email && !linkedinUrl) throw new Error('Either email or LinkedIn URL must be provided');

		const response = await apiService.findContact(context, {
			...(email && { email }),
			...(linkedinUrl && { linkedin_url: linkedinUrl }),
		});

		return ResponseUtils.formatSingleResponse(response);
	}
}
