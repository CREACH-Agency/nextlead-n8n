import { IExecuteFunctions, INodeExecutionData, INodeProperties, IDataObject } from 'n8n-workflow';
import { ResourceType, OperationType, NextLeadCredentials } from '../core/types/NextLeadTypes';
import { IResourceStrategy } from '../core/interfaces/IResourceStrategy';
import { NextLeadApiService } from '../core/NextLeadApiService';
import { NextLeadApiResponse } from '../core/types/shared/ApiTypes';
import { createNextLeadError } from '../core/types/n8n/ErrorTypes';
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
				return ResponseUtils.formatArrayResponse(context, await apiService.getTeam(context));
			case 'getConversion':
				return ResponseUtils.formatArrayResponse(context, await apiService.getConversion(context));
			case 'getCustomFields':
				return ResponseUtils.formatArrayResponse(
					context,
					await apiService.getCustomFields(context),
				);
			default:
				throw new Error(`Unknown operation: ${operation}`);
		}
	}

	/**
	 * Resolves an existing structure from the Find Structure criteria.
	 *
	 * Only a 404 counts as "no match" and lets the caller fall back to creating a
	 * structure. Every other failure is raised: `get-single-structure` answers 409
	 * when the criteria match several structures, and silently creating a
	 * duplicate there would be the opposite of what the user asked for.
	 */
	private async findStructureId(
		context: IExecuteFunctions,
		apiService: NextLeadApiService,
		criteria: IDataObject,
	): Promise<string> {
		if (Object.keys(criteria).length === 0) return '';

		// Only the criteria names are logged; their values identify a real company.
		context.logger.debug('Looking up structure', { criteria: Object.keys(criteria) });
		const response = await apiService.findSingleStructure(context, criteria);

		if (!response.success) {
			const { statusCode } = createNextLeadError(response.httpError);

			if (statusCode === 404) {
				context.logger.debug('No structure matched the Find Structure criteria');
				return '';
			}

			// The route answers 409 when the criteria match more than one structure.
			// Its own wording does not always survive n8n's error wrapping, so the
			// actionable version is spelled out here rather than relayed.
			if (statusCode === 409) {
				throw new Error(
					'Several structures match the Find Structure criteria. Add a narrower criterion (structure ID or SIRET) so that exactly one structure matches.',
				);
			}

			throw new Error(`Structure lookup failed: ${response.error}`);
		}

		return ContactHelpers.extractStructureId(response.data);
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
		).map((config) => ContactHelpers.normalizeCrmAliases(config));
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
		const { setAsMainStructure, ...structurePayload } = (newStructureWrapper.structure ?? {}) as {
			setAsMainStructure?: boolean;
		} & IDataObject;
		const structureData = ContactHelpers.cleanFields(structurePayload);

		const findStructureInput = context.getNodeParameter(
			'findStructure',
			itemIndex,
			{},
		) as IDataObject;
		const findCriteria = ContactHelpers.buildStructureFindQuery(findStructureInput);
		const pickedStructureId = ContactHelpers.extractStructureIdFromLocator(
			organizationFields.establishmentId,
		);
		// Creating a structure needs at least one of the fields NextLead identifies
		// it by; anything else would produce an anonymous record.
		const createRequested = Boolean(
			structureData.name || structureData.siret || structureData.email,
		);

		// Whether a structure step was asked for is read from the configuration
		// alone, before any call is made. The output shape follows this flag, so it
		// never depends on whether the lookup happened to match.
		const structureRequested =
			Boolean(pickedStructureId) || Object.keys(findCriteria).length > 0 || createRequested;

		// Structure resolution follows the Zapier order — explicit ID, then lookup,
		// then creation — and happens *before* the contact so the link can be part
		// of the create payload instead of a follow-up call.
		let structureId = pickedStructureId;

		if (!structureId && Object.keys(findCriteria).length > 0) {
			structureId = await this.findStructureId(context, apiService, findCriteria);
		}

		// Which toggle applies depends on how the structure was obtained: an
		// existing one carries the toggle sitting next to the lookup criteria, a
		// structure created here keeps the one next to its own fields. Reading a
		// single toggle for both had the creation group silently govern a structure
		// picked in Organization Settings.
		const shouldSetAsMain = structureId
			? findStructureInput.setAsMainStructure !== false
			: setAsMainStructure !== false;

		let structureResponse: NextLeadApiResponse | null = null;

		if (!structureId && createRequested) {
			context.logger.debug('Creating structure');
			structureResponse = await apiService.createStructure(context, structureData);

			if (structureResponse.success) {
				structureId = ContactHelpers.extractStructureId(structureResponse.data);
			}
		}

		// A secondary link cannot be expressed in the create payload, so it stays a
		// follow-up `link-to-contact` call with `mainStructure: false`.
		if (structureId && shouldSetAsMain) {
			contactData.structureId = structureId;
		} else if (!shouldSetAsMain) {
			// The picker writes its selection into `organizationFields`, which is
			// spread into the payload above. Left in place it would link the
			// structure as main and contradict the follow-up call.
			delete contactData.establishmentId;
		}

		const preferredLanguage = (contactFields.preferredLanguage as string) || '';

		context.logger.debug('Creating contact', { linkedStructure: Boolean(structureId) });
		const contactResponse = await apiService.createContact(
			context,
			contactData,
			preferredLanguage ? { 'X-PREFERRED-LANGUAGE': preferredLanguage } : undefined,
		);

		// Without a structure step the response shape stays exactly what it was: a
		// plain create keeps returning the contact at the root.
		if (!contactResponse.success || !structureRequested) {
			return ResponseUtils.formatSingleResponse(context, contactResponse);
		}

		// From here every branch returns the same `{ contact, structure, link }`
		// envelope, so a downstream node can map the output from the node's
		// configuration alone — with `structure` and `link` set to null when the
		// lookup found nothing rather than the envelope disappearing.
		if (structureResponse && !structureResponse.success) {
			return ResponseUtils.formatSingleResponse(context, {
				success: true,
				data: {
					contact: contactResponse.data,
					structure: null,
					link: null,
					structureError: structureResponse.error,
				},
			});
		}

		if (structureId && shouldSetAsMain) {
			return ResponseUtils.formatSingleResponse(context, {
				success: true,
				data: {
					contact: contactResponse.data,
					structure: structureResponse?.data ?? null,
					link: { linked: true, structureId, mainStructure: true },
				},
			});
		}

		// Nothing left to link: the lookup matched nothing and no structure was
		// created. The `link-structure` route needs a name or a SIRET, so there is
		// no call left to make — only the envelope, kept for the shape.
		if (!structureId && !structureData.name && !structureData.siret) {
			return ResponseUtils.formatSingleResponse(context, {
				success: true,
				data: { contact: contactResponse.data, structure: null, link: null },
			});
		}

		const linkData: IDataObject = {
			email,
			mainStructure: shouldSetAsMain,
			...(structureId ? { structureId } : {}),
			...(structureData.name ? { structure_name: structureData.name } : {}),
			...(structureData.siret ? { siret: structureData.siret } : {}),
		};

		context.logger.debug('Linking structure to contact', {
			mainStructure: shouldSetAsMain,
			byId: Boolean(structureId),
		});
		const linkResponse = structureId
			? await apiService.linkContactToStructure(context, linkData)
			: await apiService.linkStructureToContact(context, linkData);

		return ResponseUtils.formatSingleResponse(context, {
			success: true,
			data: {
				contact: contactResponse.data,
				structure: structureResponse?.data ?? null,
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
		const contactId = context.getNodeParameter('contactId', itemIndex, '') as string;
		const email = context.getNodeParameter('email', itemIndex, '') as string;
		const linkedinFind = context.getNodeParameter('linkedinFind', itemIndex, '') as string;

		if (!contactId && !email && !linkedinFind) {
			throw new Error('Either contact ID, email or LinkedIn URL must be provided');
		}

		// Left uncleaned on purpose: a collection only carries the fields the user
		// explicitly added, so an empty value there means "clear this field".
		const rawUpdateFields = ContactHelpers.normalizeCrmAliases(
			context.getNodeParameter('updateFields', itemIndex, {}) as IDataObject,
		);

		const customFields = ContactHelpers.transformCustomFields(
			context.getNodeParameter('customFieldsUpdate', itemIndex, {}) as IDataObject,
		);
		// `values_update` is flat, so the custom fields land as
		// `selected_fieldN` / `value_N` next to the other keys.
		if (customFields.length > 0) Object.assign(rawUpdateFields, customFields[0]);

		// The structure is always resolved through `get-single-structure`, so the
		// criteria can come from the incoming item rather than being fixed in the
		// editor.
		const findStructureInput = context.getNodeParameter(
			'findStructureUpdate',
			itemIndex,
			{},
		) as IDataObject;
		const findCriteria = ContactHelpers.buildStructureFindQuery(findStructureInput);

		let structureId = '';
		let setAsMainStructure = findStructureInput.setAsMainStructure !== false;

		if (Object.keys(findCriteria).length > 0) {
			structureId = await this.findStructureId(context, apiService, findCriteria);
		} else {
			// Find Structure replaced the Link Structure picker. Workflows built
			// against the old field still carry their selection, and dropping it
			// would unlink structures without reporting anything, so it is read as
			// a fallback whenever no lookup criterion is configured.
			const legacy = ContactHelpers.readLegacyLinkStructure(context.getNode().parameters);

			if (legacy.structureId) {
				structureId = legacy.structureId;
				setAsMainStructure = legacy.setAsMainStructure;
			}
		}

		if (structureId) {
			rawUpdateFields.structureId = structureId;
			rawUpdateFields.setAsMainStructure = setAsMainStructure;
		}

		const noteUpdateWrapper = context.getNodeParameter('noteUpdate', itemIndex, {}) as IDataObject;
		const noteUpdateInput = (noteUpdateWrapper.noteData ?? {}) as IDataObject;

		const updateData: IDataObject = {
			...(contactId && { contactId }),
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

		return ResponseUtils.formatSingleResponse(
			context,
			await apiService.updateContact(context, updateData),
		);
	}

	private async handleDelete(
		context: IExecuteFunctions,
		itemIndex: number,
		apiService: NextLeadApiService,
	): Promise<INodeExecutionData[]> {
		const contactId = context.getNodeParameter('contactId', itemIndex, '') as string;
		const email = context.getNodeParameter('email', itemIndex, '') as string;
		const linkedin = context.getNodeParameter('linkedin', itemIndex, '') as string;

		if (!contactId && !email && !linkedin) {
			throw new Error('Either contact ID, email or LinkedIn URL must be provided');
		}

		// The response has to be inspected: discarding it reported a success even
		// when the contact did not exist or the API rejected the call.
		const response = await apiService.deleteContact(context, {
			...(contactId && { contactId }),
			...(email && { email }),
			...(linkedin && { linkedin }),
		});

		if (!response.success) {
			// Raises a NodeApiError carrying the API explanation.
			return ResponseUtils.formatSingleResponse(context, response);
		}

		// Keep the historical `{ success, message }` output when the API returns no
		// payload, so downstream nodes reading `$json.success` keep working.
		const data = response.data as IDataObject | undefined;
		return data && Object.keys(data).length > 0
			? [{ json: data }]
			: ResponseUtils.formatSuccessResponse('Contact deleted successfully');
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

		return ResponseUtils.formatSingleResponse(context, response);
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
		return ResponseUtils.formatSingleResponse(context, response);
	}
}
