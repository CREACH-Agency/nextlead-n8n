import { IExecuteFunctions, INodeExecutionData, INodeProperties } from 'n8n-workflow';

import { ResourceType, OperationType, NextLeadCredentials } from '../core/types/NextLeadTypes';
import { IResourceStrategy } from '../core/interfaces/IResourceStrategy';
import { NextLeadApiService } from '../core/NextLeadApiService';
import { ResponseUtils } from '../utils/ResponseUtils';
import { identifyOperations, identifyFields } from './identify/IdentifyFields';

export class IdentifyResource implements IResourceStrategy {
	getResourceType(): ResourceType {
		return 'identify';
	}

	getOperations(): INodeProperties[] {
		return identifyOperations;
	}

	getFields(): INodeProperties[] {
		return identifyFields;
	}

	async execute(
		operation: OperationType,
		context: IExecuteFunctions,
		_itemIndex: number,
	): Promise<INodeExecutionData[]> {
		const credentials = (await context.getCredentials('nextLeadApi')) as NextLeadCredentials;
		const apiService = new NextLeadApiService(credentials);

		switch (operation) {
			case 'user':
				return this.handleIdentifyUser(context, apiService);
			default:
				throw new Error(`Unknown operation: ${operation}`);
		}
	}

	private async handleIdentifyUser(
		context: IExecuteFunctions,
		apiService: NextLeadApiService,
	): Promise<INodeExecutionData[]> {
		const response = await apiService.identifyUser(context);

		return ResponseUtils.formatSingleResponse(response);
	}
}
