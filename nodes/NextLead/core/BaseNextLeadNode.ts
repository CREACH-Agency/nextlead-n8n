import {
	IExecuteFunctions,
	INodeType,
	INodeTypeDescription,
	IDataObject,
	INodeExecutionData,
	INodeProperties,
	NodeConnectionType,
} from 'n8n-workflow';

import { NextLeadApiService } from './NextLeadApiService';
import { NextLeadErrorHandler } from './NextLeadErrorHandler';
import { NextLeadCredentials, ResourceType, OperationType } from './types/NextLeadTypes';
import { NextLeadApiResponse } from './types/shared/ApiTypes';

export abstract class BaseNextLeadNode implements INodeType {
	protected apiService: NextLeadApiService | undefined;
	protected errorHandler = NextLeadErrorHandler;

	abstract description: INodeTypeDescription;

	protected getBaseDescription(
		displayName: string,
		name: string,
		_subtitle: string,
		resourceType: ResourceType,
	): INodeTypeDescription {
		return {
			displayName,
			name,
			icon: 'file:nextlead.svg',
			/*
			 * - ['trigger']: Node waits for external triggers (webhooks, timers, events)
			 * - []: Empty array for standard nodes
			 *   https://docs.n8n.io/integrations/creating-nodes/build/reference/node-base-files/standard-parameters/#group
			 */
			group: [],
			version: 1,
			subtitle: '={{ $parameter["operation"] + ": " + $parameter["resource"] }}',
			description: `Interact with NextLead CRM API - ${displayName}`,
			defaults: {
				name: displayName,
			},
			inputs: [NodeConnectionType.Main],
			outputs: [NodeConnectionType.Main],
			credentials: [
				{
					name: 'nextLeadApi',
					required: true,
				},
			],
			properties: [
				{
					displayName: 'Resource',
					name: 'resource',
					type: 'hidden',
					default: resourceType,
				},
				...this.getOperations(),
				...this.getFields(),
			],
		};
	}

	protected async initializeApiService(context: IExecuteFunctions): Promise<void> {
		const credentials = (await context.getCredentials('nextLeadApi')) as NextLeadCredentials;
		this.apiService = new NextLeadApiService(credentials);
	}

	protected processResponse<T = unknown>(response: NextLeadApiResponse<T>): IDataObject[] {
		if (!response || !response.success || !response.data) {
			return [];
		}

		if (Array.isArray(response.data)) {
			return response.data.map((item) => item as IDataObject);
		}
		return [response.data as IDataObject];
	}

	protected handleError(error: unknown, context: IExecuteFunctions): IDataObject[] {
		if (context.continueOnFail()) {
			return [this.errorHandler.formatErrorData(error)];
		}
		throw this.errorHandler.handleApiError(error, context.getNode());
	}

	abstract getOperations(): INodeProperties[];
	abstract getFields(): INodeProperties[];
	abstract getResourceType(): ResourceType;

	abstract execute(this: IExecuteFunctions): Promise<INodeExecutionData[][]>;

	protected abstract executeOperation(
		context: IExecuteFunctions,
		operation: OperationType,
		itemIndex: number,
	): Promise<INodeExecutionData[]>;
}
