import {
	IExecuteFunctions,
	INodeExecutionData,
	INodeProperties,
	NodeOperationError,
} from 'n8n-workflow';

import { ResourceType, OperationType, NextLeadCredentials } from '../core/types/NextLeadTypes';
import { AiLocale, AiRunRequest } from '../core/types/api/AiTypes';
import { IResourceStrategy } from '../core/interfaces/IResourceStrategy';
import { NextLeadApiService } from '../core/NextLeadApiService';
import { ResponseUtils } from '../utils/ResponseUtils';
import { aiOperations, aiFields } from './ai/AiFields';

export class AiResource implements IResourceStrategy {
	getResourceType(): ResourceType {
		return 'ai';
	}

	getOperations(): INodeProperties[] {
		return aiOperations;
	}

	getFields(): INodeProperties[] {
		return aiFields;
	}

	async execute(
		operation: OperationType,
		context: IExecuteFunctions,
		itemIndex: number,
	): Promise<INodeExecutionData[]> {
		const credentials = (await context.getCredentials('nextLeadApi')) as NextLeadCredentials;
		const apiService = new NextLeadApiService(credentials);

		switch (operation) {
			case 'run':
				return this.handleRunPrompt(context, itemIndex, apiService);
			default:
				throw new Error(`Unknown AI operation: ${operation}`);
		}
	}

	private async handleRunPrompt(
		context: IExecuteFunctions,
		itemIndex: number,
		apiService: NextLeadApiService,
	): Promise<INodeExecutionData[]> {
		const prompt = context.getNodeParameter('prompt', itemIndex) as string;
		const asUserId = context.getNodeParameter('asUserId', itemIndex, '', {
			extractValue: true,
		}) as string;
		const allowMutations = context.getNodeParameter('allowMutations', itemIndex, false) as boolean;
		const locale = context.getNodeParameter('locale', itemIndex, 'fr') as AiLocale;

		if (!asUserId) {
			throw new NodeOperationError(
				context.getNode(),
				'No executing user selected: the API key is organization-level, so the member the AI acts on behalf of must be set',
				{ itemIndex },
			);
		}

		const runData: AiRunRequest = {
			prompt,
			locale,
			allow_mutations: allowMutations,
			as_user_id: asUserId,
		};

		const response = await apiService.runAiPrompt(context, runData);

		return ResponseUtils.formatSingleResponse(context, response);
	}
}
