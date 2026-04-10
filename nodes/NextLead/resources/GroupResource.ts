import { IExecuteFunctions, INodeExecutionData, INodeProperties, IDataObject } from 'n8n-workflow';

import { ResourceType, OperationType, NextLeadCredentials } from '../core/types/NextLeadTypes';
import { IResourceStrategy } from '../core/interfaces/IResourceStrategy';
import { NextLeadApiService } from '../core/NextLeadApiService';
import { ResponseUtils } from '../utils/ResponseUtils';
import { groupOperations, groupFields } from './group/GroupFields';

export class GroupResource implements IResourceStrategy {
	getResourceType(): ResourceType {
		return 'group';
	}

	getOperations(): INodeProperties[] {
		return groupOperations;
	}

	getFields(): INodeProperties[] {
		return groupFields;
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
				return this.handleCreateGroup(context, itemIndex, apiService);
			default:
				throw new Error(`Unknown operation: ${operation}`);
		}
	}

	private async handleCreateGroup(
		context: IExecuteFunctions,
		itemIndex: number,
		apiService: NextLeadApiService,
	): Promise<INodeExecutionData[]> {
		const name = context.getNodeParameter('name', itemIndex) as string;
		const type = context.getNodeParameter('type', itemIndex, 'REGULAR') as string;
		const additionalFields = context.getNodeParameter(
			'additionalFields',
			itemIndex,
			{},
		) as IDataObject;

		const groupData: IDataObject = {
			name,
			type,
			...additionalFields,
		};

		const response = await apiService.createGroup(context, groupData);

		return ResponseUtils.formatSingleResponse(response);
	}
}
