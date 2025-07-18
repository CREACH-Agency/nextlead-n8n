import { IExecuteFunctions, INodeExecutionData, INodeProperties } from 'n8n-workflow';

import { ResourceType, OperationType } from '../types/NextLeadTypes';

export interface IResourceStrategy {
	/**
	 * Get the resource type this strategy handles
	 */
	getResourceType(): ResourceType;

	/**
	 * Get the operations available for this resource
	 */
	getOperations(): INodeProperties[];

	/**
	 * Get the fields specific to this resource
	 */
	getFields(): INodeProperties[];

	/**
	 * Execute an operation for this resource
	 */
	execute(
		operation: OperationType,
		context: IExecuteFunctions,
		itemIndex: number,
	): Promise<INodeExecutionData[]>;
}
