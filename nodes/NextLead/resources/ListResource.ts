import { IExecuteFunctions, INodeExecutionData, INodeProperties, IDataObject } from 'n8n-workflow';

import { ResourceType, OperationType, NextLeadCredentials } from '../core/types/NextLeadTypes';
import { IResourceStrategy } from '../core/interfaces/IResourceStrategy';
import { NextLeadApiService } from '../core/NextLeadApiService';
import { ResponseUtils } from '../utils/ResponseUtils';
import { listOperations, listFields } from './list/ListFields';

export class ListResource implements IResourceStrategy {
	getResourceType(): ResourceType {
		return 'list';
	}

	getOperations(): INodeProperties[] {
		return listOperations;
	}

	getFields(): INodeProperties[] {
		return listFields;
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
				return this.handleCreateList(context, itemIndex, apiService);
			case 'getMany':
				return this.handleGetManyLists(context, apiService);
			default:
				throw new Error(`Unknown operation: ${operation}`);
		}
	}

	private async handleCreateList(
		context: IExecuteFunctions,
		itemIndex: number,
		apiService: NextLeadApiService,
	): Promise<INodeExecutionData[]> {
		const name = context.getNodeParameter('name', itemIndex) as string;
		const type = context.getNodeParameter('type', itemIndex, 'REGULAR') as string;

		const listData: IDataObject = {
			name,
			type,
		};

		const response = await apiService.createList(context, listData);

		return ResponseUtils.formatSingleResponse(context, response);
	}

	private async handleGetManyLists(
		context: IExecuteFunctions,
		apiService: NextLeadApiService,
	): Promise<INodeExecutionData[]> {
		const response = await apiService.getLists(context);

		return ResponseUtils.formatArrayResponse(context, response);
	}
}
