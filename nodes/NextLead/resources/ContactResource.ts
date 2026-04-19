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
			case 'linkToStructure':
				return this.handleLinkToStructure(context, itemIndex, apiService);
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

		const noteWrapper = context.getNodeParameter('note', itemIndex, {}) as IDataObject;
		const noteInput = (noteWrapper.noteData ?? {}) as IDataObject;

		if (socials.length > 0) contactData.socials = socials;
		if (nextlead_config.length > 0) contactData.nextlead_config = nextlead_config;
		if (custom_fields.length > 0) contactData.custom_fields = custom_fields;
		if (noteInput.note_content) {
			contactData.note = noteInput.note_title
				? { content: noteInput.note_content, title: noteInput.note_title }
				: noteInput.note_content;
			if (noteInput.note_author_user_id) {
				contactData.note_author_user_id = noteInput.note_author_user_id;
			}
		}

		const newStructureWrapper = context.getNodeParameter(
			'newStructure',
			itemIndex,
			{},
		) as IDataObject;
		const newStructureInput = (newStructureWrapper.structure ?? {}) as IDataObject;
		const newStructureName = ((newStructureInput.name as string) || '').trim();

		context.logger.info('Creating contact with data:', contactData);
		const contactResponse = await apiService.createContact(context, contactData);

		if (!contactResponse.success || !newStructureName) {
			return ResponseUtils.formatSingleResponse(contactResponse);
		}

		const { setAsMainStructure, ...structurePayload } = newStructureInput as {
			setAsMainStructure?: boolean;
		} & IDataObject;

		const structureData = ContactHelpers.cleanFields({
			...structurePayload,
			name: newStructureName,
		});

		context.logger.info('Creating structure with data:', structureData);
		const structureResponse = await apiService.createStructure(context, structureData);

		if (!structureResponse.success) {
			return ResponseUtils.formatSingleResponse({
				success: true,
				data: {
					contact: contactResponse.data,
					structure: null,
					link: null,
					structureError: structureResponse.error,
				},
			});
		}

		const shouldSetAsMain = setAsMainStructure !== false;
		const linkData: IDataObject = {
			email,
			structure_name: newStructureName,
			mainStructure: shouldSetAsMain,
		};

		const siret = (structureData.siret as string) || '';
		if (siret) linkData.siret = siret;

		context.logger.info('Linking structure to contact with data:', linkData);
		const linkResponse = await apiService.linkStructureToContact(context, linkData);

		return ResponseUtils.formatSingleResponse({
			success: true,
			data: {
				contact: contactResponse.data,
				structure: structureResponse.data,
				link: linkResponse.success ? linkResponse.data : null,
				...(linkResponse.success ? {} : { linkError: linkResponse.error }),
			},
		});
	}

	private async handleUpdate(
		context: IExecuteFunctions,
		itemIndex: number,
		apiService: NextLeadApiService,
	): Promise<INodeExecutionData[]> {
		const email = context.getNodeParameter('email', itemIndex, '') as string;
		const linkedinFind = context.getNodeParameter('linkedinFind', itemIndex, '') as string;

		if (!email && !linkedinFind) throw new Error('Either email or LinkedIn URL must be provided');

		const rawUpdateFields = context.getNodeParameter('updateFields', itemIndex) as IDataObject;

		// Extract linkStructure fixedCollection
		const linkStructureWrapper = context.getNodeParameter('linkStructure', itemIndex, {}) as IDataObject;
		const linkStructureInput = (linkStructureWrapper.structure ?? {}) as IDataObject;

		if (linkStructureInput.structureId) {
			const locator = linkStructureInput.structureId as IDataObject;
			rawUpdateFields.structureId = (typeof locator === 'object' ? locator.value as string : locator as unknown as string) || '';
			rawUpdateFields.setAsMainStructure = linkStructureInput.setAsMainStructure !== false;
		}

		const noteUpdateWrapper = context.getNodeParameter('noteUpdate', itemIndex, {}) as IDataObject;
		const noteUpdateInput = (noteUpdateWrapper.noteData ?? {}) as IDataObject;

		const updateData: IDataObject = {
			...(email && { mail: email }),
			...(linkedinFind && { linkedin_find: linkedinFind }),
			values_update: [rawUpdateFields],
			...(noteUpdateInput.note_content && {
				note: noteUpdateInput.note_title
					? { content: noteUpdateInput.note_content, title: noteUpdateInput.note_title }
					: noteUpdateInput.note_content,
				...(noteUpdateInput.note_author_user_id && {
					note_author_user_id: noteUpdateInput.note_author_user_id,
				}),
			}),
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

	private async handleLinkToStructure(
		context: IExecuteFunctions,
		itemIndex: number,
		apiService: NextLeadApiService,
	): Promise<INodeExecutionData[]> {
		const contactIdentifiers = context.getNodeParameter(
			'contactIdentifiers',
			itemIndex,
			{},
		) as IDataObject;
		const structureIdentifiers = context.getNodeParameter(
			'structureIdentifiers',
			itemIndex,
			{},
		) as IDataObject;
		const contactCustomField = context.getNodeParameter(
			'contactCustomField',
			itemIndex,
			{},
		) as IDataObject;
		const structureCustomField = context.getNodeParameter(
			'structureCustomField',
			itemIndex,
			{},
		) as IDataObject;
		const setAsMainStructure = context.getNodeParameter(
			'setAsMainStructure',
			itemIndex,
			true,
		) as boolean;

		const linkData: IDataObject = {
			...contactIdentifiers,
			...structureIdentifiers,
			mainStructure: setAsMainStructure,
		};

		if (contactCustomField.customFieldTypeId && contactCustomField.value) {
			linkData.customField = {
				customFieldTypeId: contactCustomField.customFieldTypeId,
				value: contactCustomField.value,
			};
		}

		if (structureCustomField.customFieldTypeId && structureCustomField.value) {
			linkData.structureCustomField = {
				customFieldTypeId: structureCustomField.customFieldTypeId,
				value: structureCustomField.value,
			};
		}

		const response = await apiService.linkContactToStructure(context, linkData);
		return ResponseUtils.formatSingleResponse(response);
	}
}
