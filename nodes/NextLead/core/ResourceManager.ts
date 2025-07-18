import {
	IExecuteFunctions,
	INodeExecutionData,
	INodeProperties,
	NodeOperationError,
} from 'n8n-workflow';

import { ResourceType, OperationType } from './types/NextLeadTypes';
import { IResourceStrategy } from './interfaces/IResourceStrategy';

export class ResourceManager {
	private strategies = new Map<ResourceType, IResourceStrategy>();

	/**
	 * Register a resource strategy
	 */
	register(strategy: IResourceStrategy): void {
		this.strategies.set(strategy.getResourceType(), strategy);
	}

	/**
	 * Get all available resources
	 */
	getResourceOptions(): Array<{ name: string; value: string }> {
		return Array.from(this.strategies.keys()).map((resourceType) => ({
			name: this.capitalizeResource(resourceType),
			value: resourceType,
		}));
	}

	/**
	 * Get operations for a specific resource
	 */
	getOperationsForResource(resourceType: ResourceType): INodeProperties[] {
		const strategy = this.strategies.get(resourceType);
		if (!strategy) {
			throw new Error(`Resource strategy not found for: ${resourceType}`);
		}
		return strategy.getOperations();
	}

	/**
	 * Get fields for a specific resource
	 */
	getFieldsForResource(resourceType: ResourceType): INodeProperties[] {
		const strategy = this.strategies.get(resourceType);
		if (!strategy) {
			throw new Error(`Resource strategy not found for: ${resourceType}`);
		}
		return strategy.getFields();
	}

	/**
	 * Execute an operation for a specific resource
	 */
	async execute(
		resourceType: ResourceType,
		operation: OperationType,
		context: IExecuteFunctions,
		itemIndex: number,
	): Promise<INodeExecutionData[]> {
		const strategy = this.strategies.get(resourceType);
		if (!strategy) {
			throw new NodeOperationError(
				context.getNode(),
				`Resource strategy not found for: ${resourceType}`,
			);
		}
		return strategy.execute(operation, context, itemIndex);
	}

	/**
	 * Get all operations for all resources (for unified properties)
	 */
	getAllOperations(): INodeProperties[] {
		const allOperations: INodeProperties[] = [];

		for (const [resourceType, strategy] of this.strategies) {
			const operations = strategy.getOperations();
			operations.forEach((op) => {
				// Add display options to show only for this resource
				const operationWithDisplay = {
					...op,
					displayOptions: {
						show: { resource: [resourceType] },
					},
				};
				allOperations.push(operationWithDisplay);
			});
		}

		return allOperations;
	}

	/**
	 * Get all fields for all resources (for unified properties)
	 */
	getAllFields(): INodeProperties[] {
		const allFields: INodeProperties[] = [];

		for (const [resourceType, strategy] of this.strategies) {
			const fields = strategy.getFields();
			fields.forEach((field) => {
				// Add display options to show only for this resource
				const fieldWithDisplay = {
					...field,
					displayOptions: {
						...field.displayOptions,
						show: {
							...field.displayOptions?.show,
							resource: [resourceType],
						},
					},
				};
				allFields.push(fieldWithDisplay);
			});
		}

		return allFields;
	}

	private capitalizeResource(resourceType: string): string {
		return resourceType.charAt(0).toUpperCase() + resourceType.slice(1);
	}
}
