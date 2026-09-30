import { IExecuteFunctions, INodeExecutionData, INodeProperties, IDataObject } from 'n8n-workflow';

import { ResourceType, OperationType, NextLeadCredentials } from '../core/types/NextLeadTypes';
import { IResourceStrategy } from '../core/interfaces/IResourceStrategy';
import { NextLeadApiService } from '../core/NextLeadApiService';
import { ResponseUtils } from '../utils/ResponseUtils';
import { structureOperations, structureFields } from './structure/StructureFields';

export class StructureResource implements IResourceStrategy {
	getResourceType(): ResourceType {
		return 'structure';
	}

	getOperations(): INodeProperties[] {
		return structureOperations;
	}

	getFields(): INodeProperties[] {
		return structureFields;
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
				return this.handleCreateStructure(context, itemIndex, apiService);
			case 'update':
				return this.handleUpdateStructure(context, itemIndex, apiService);
			case 'delete':
				return this.handleDeleteStructure(context, itemIndex, apiService);
			case 'getMany':
				return this.handleGetManyStructures(context, apiService);
			case 'linkToContact':
				return this.handleLinkToContact(context, itemIndex, apiService);
			default:
				throw new Error(`Unknown operation: ${operation}`);
		}
	}

	private async handleCreateStructure(
		context: IExecuteFunctions,
		itemIndex: number,
		apiService: NextLeadApiService,
	): Promise<INodeExecutionData[]> {
		const name = context.getNodeParameter('name', itemIndex) as string;
		const additionalFields = context.getNodeParameter(
			'additionalFields',
			itemIndex,
			{},
		) as IDataObject;

		const structureData: IDataObject = {
			name,
			...additionalFields,
		};

		const response = await apiService.createStructure(context, structureData);

		return ResponseUtils.formatSingleResponse(context, response);
	}

	private async handleUpdateStructure(
		context: IExecuteFunctions,
		itemIndex: number,
		apiService: NextLeadApiService,
	): Promise<INodeExecutionData[]> {
		const structureLocator = context.getNodeParameter('structureId', itemIndex, {}) as
			| IDataObject
			| string;
		const structureId = (
			typeof structureLocator === 'string'
				? structureLocator
				: ((structureLocator.value as string) ?? '')
		).trim();
		const findSiret = (context.getNodeParameter('findSiret', itemIndex, '') as string).trim();
		const findName = (context.getNodeParameter('findName', itemIndex, '') as string).trim();
		const createIfMissing = context.getNodeParameter(
			'createIfMissing',
			itemIndex,
			false,
		) as boolean;
		const updateFields = context.getNodeParameter('updateFields', itemIndex, {}) as IDataObject;

		if (!structureId && !findSiret && !findName) {
			throw new Error('Provide a structure ID, a SIRET or a name to identify the structure');
		}

		// `edit-structure` matches any of id / siret / name; with create_if_missing
		// it creates the structure from values_update when nothing matches.
		const updateData: IDataObject = {
			...(structureId && { id: structureId }),
			...(findSiret && { siret: findSiret }),
			...(findName && { name: findName }),
			values_update: [updateFields],
			...(createIfMissing && { create_if_missing: true }),
		};

		const response = await apiService.updateStructure(context, updateData);

		return ResponseUtils.formatSingleResponse(context, response);
	}

	private async handleDeleteStructure(
		context: IExecuteFunctions,
		itemIndex: number,
		apiService: NextLeadApiService,
	): Promise<INodeExecutionData[]> {
		const structureId = context.getNodeParameter('structureId', itemIndex) as string;

		await apiService.deleteStructure(context, structureId);

		return ResponseUtils.formatSuccessResponse(`Structure deleted successfully: ${structureId}`);
	}

	private async handleGetManyStructures(
		context: IExecuteFunctions,
		apiService: NextLeadApiService,
	): Promise<INodeExecutionData[]> {
		const response = await apiService.getStructures(context);

		return ResponseUtils.formatArrayResponse(context, response);
	}

	private async handleLinkToContact(
		context: IExecuteFunctions,
		itemIndex: number,
		apiService: NextLeadApiService,
	): Promise<INodeExecutionData[]> {
		const structureIdentifiers = context.getNodeParameter(
			'structureIdentifiers',
			itemIndex,
			{},
		) as IDataObject;
		const contactIdentifiers = context.getNodeParameter(
			'contactIdentifiers',
			itemIndex,
			{},
		) as IDataObject;
		const structureCustomField = context.getNodeParameter(
			'structureCustomField',
			itemIndex,
			{},
		) as IDataObject;
		const contactCustomField = context.getNodeParameter(
			'contactCustomField',
			itemIndex,
			{},
		) as IDataObject;
		const linkAsSecondary = context.getNodeParameter(
			'linkAsSecondary',
			itemIndex,
			false,
		) as boolean;

		const linkData: IDataObject = {
			...structureIdentifiers,
			...contactIdentifiers,
			// `link-to-contact` reads mainStructure; `linkAsSecondary` on its own was
			// ignored server-side, so every link ended up secondary.
			mainStructure: !linkAsSecondary,
		};

		if (structureCustomField.customFieldTypeId && structureCustomField.value) {
			linkData.structureCustomField = {
				customFieldTypeId: structureCustomField.customFieldTypeId,
				value: structureCustomField.value,
			};
		}

		if (contactCustomField.customFieldTypeId && contactCustomField.value) {
			linkData.customField = {
				customFieldTypeId: contactCustomField.customFieldTypeId,
				value: contactCustomField.value,
			};
		}

		const response = await apiService.linkStructureToContact(context, linkData);
		return ResponseUtils.formatSingleResponse(context, response);
	}
}
