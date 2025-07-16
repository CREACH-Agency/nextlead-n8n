import {
	IExecuteFunctions,
	INodeTypeDescription,
	INodeProperties,
	INodeExecutionData,
	NodeOperationError,
} from 'n8n-workflow';

import { BaseNextLeadNode } from '../core/BaseNextLeadNode';
import { ResourceType, OperationType } from '../core/types/NextLeadTypes';
import { NodeExecuteUtils, INodeExecuteContext } from '../utils/NodeExecuteUtils';
import { FieldDefinitionUtils } from '../utils/FieldDefinitionUtils';
import {
	OperationHandlerUtils,
	IApiService,
	IOperationConfig,
} from '../utils/OperationHandlerUtils';

export class NextLeadList extends BaseNextLeadNode implements INodeExecuteContext {
	description: INodeTypeDescription = this.getBaseDescription(
		'NextLead List',
		'nextLeadList',
		'={{$parameter["operation"]}}',
		'list'
	);

	getResourceType(): ResourceType {
		return 'list';
	}

	getOperations(): INodeProperties[] {
		return [
			FieldDefinitionUtils.createOptionsField({
				name: 'operation',
				displayName: 'Operation',
				description: 'Operation to perform',
				required: true,
				operations: [],
				options: [
					{
						name: 'Get Many',
						value: 'getAll',
						description: 'Get many lists',
						action: 'Get many lists',
					},
				],
				default: 'getAll',
			}),
		];
	}

	getFields(): INodeProperties[] {
		return [];
	}

	async execute(this: IExecuteFunctions): Promise<INodeExecutionData[][]> {
		return NodeExecuteUtils.executeStandardFlow(this, this as any);
	}

	async executeOperationWithService(
		context: IExecuteFunctions,
		operation: OperationType,
		_itemIndex: number,
		apiService: IApiService
	): Promise<any> {
		switch (operation) {
			case 'getAll':
				return this.handleGetAllLists(context, apiService);
			default:
				throw new NodeOperationError(
					context.getNode(),
					`Operation "${operation}" is not supported`
				);
		}
	}

	private async handleGetAllLists(
		context: IExecuteFunctions,
		apiService: IApiService
	): Promise<any> {
		const config: IOperationConfig = {
			operationName: 'Get All Lists',
			requiredParams: [],
			apiMethodName: 'getLists',
		};

		return OperationHandlerUtils.handleGetOperation(context, apiService, config);
	}

	protected async executeOperation(
		context: IExecuteFunctions,
		operation: OperationType,
		itemIndex: number
	): Promise<any> {
		if (!this.apiService) {
			throw new NodeOperationError(context.getNode(), 'API service not initialized');
		}

		return this.executeOperationWithService(context, operation, itemIndex, this.apiService);
	}
}
