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

		return ResponseUtils.formatSingleResponse(response);
	}

	private async handleUpdateStructure(
		context: IExecuteFunctions,
		itemIndex: number,
		apiService: NextLeadApiService,
	): Promise<INodeExecutionData[]> {
		const structureId = context.getNodeParameter('structureId', itemIndex) as string;
		const updateFields = context.getNodeParameter('updateFields', itemIndex, {}) as IDataObject;

		const updateData: IDataObject = {
			id: structureId,
			...updateFields,
		};

		const response = await apiService.updateStructure(context, updateData);

		return ResponseUtils.formatSingleResponse(response);
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

		return ResponseUtils.formatArrayResponse(response);
	}
}
