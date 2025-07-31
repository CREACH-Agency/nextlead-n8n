import { IExecuteFunctions, INodeExecutionData, INodeProperties, IDataObject } from 'n8n-workflow';

import { ResourceType, OperationType, NextLeadCredentials } from '../core/types/NextLeadTypes';
import { IResourceStrategy } from '../core/interfaces/IResourceStrategy';
import { NextLeadApiService } from '../core/NextLeadApiService';
import { ResponseUtils } from '../utils/ResponseUtils';
import { saleOperations, saleFields } from './sale/SaleFields';

export class SaleResource implements IResourceStrategy {
	getResourceType(): ResourceType {
		return 'sale';
	}

	getOperations(): INodeProperties[] {
		return saleOperations;
	}

	getFields(): INodeProperties[] {
		return saleFields;
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
				return this.handleCreateSale(context, itemIndex, apiService);
			case 'update':
				return this.handleUpdateSale(context, itemIndex, apiService);
			case 'delete':
				return this.handleDeleteSale(context, itemIndex, apiService);
			case 'getColumns':
				return this.handleGetColumns(context, apiService);
			default:
				throw new Error(`Unknown operation: ${operation}`);
		}
	}

	private async handleCreateSale(
		context: IExecuteFunctions,
		itemIndex: number,
		apiService: NextLeadApiService,
	): Promise<INodeExecutionData[]> {
		const name = context.getNodeParameter('name', itemIndex) as string;
		const column = context.getNodeParameter('column', itemIndex) as string;
		const additionalFields = context.getNodeParameter(
			'additionalFields',
			itemIndex,
			{},
		) as IDataObject;

		const saleData: IDataObject = {
			name,
			column,
			...additionalFields,
		};

		const response = await apiService.createSale(context, saleData);

		return ResponseUtils.formatSingleResponse(response);
	}

	private async handleUpdateSale(
		context: IExecuteFunctions,
		itemIndex: number,
		apiService: NextLeadApiService,
	): Promise<INodeExecutionData[]> {
		const contactEmail = context.getNodeParameter('contactEmail', itemIndex) as string;
		const updateFields = context.getNodeParameter('updateFields', itemIndex, {}) as IDataObject;

		const updateData: IDataObject = {
			contact_email: contactEmail,
			...updateFields,
		};

		const response = await apiService.updateSale(context, updateData);

		return ResponseUtils.formatSingleResponse(response);
	}

	private async handleDeleteSale(
		context: IExecuteFunctions,
		itemIndex: number,
		apiService: NextLeadApiService,
	): Promise<INodeExecutionData[]> {
		const contactEmail = context.getNodeParameter('contactEmail', itemIndex) as string;
		const deleteStrategy = context.getNodeParameter(
			'deleteStrategy',
			itemIndex,
			'recent',
		) as string;

		const deleteData: IDataObject = {
			contact_email: contactEmail,
		};

		if (deleteStrategy === 'byName') {
			const name = context.getNodeParameter('name', itemIndex) as string;
			deleteData.name = name;
		}

		await apiService.deleteSale(context, deleteData);

		const strategy = deleteStrategy === 'recent' ? 'most recent sale' : 'specified sale';
		return ResponseUtils.formatSuccessResponse(
			`Sale deleted successfully (${strategy}) for contact: ${contactEmail}`,
		);
	}

	private async handleGetColumns(
		context: IExecuteFunctions,
		apiService: NextLeadApiService,
	): Promise<INodeExecutionData[]> {
		const response = await apiService.getSalesColumns(context);

		return ResponseUtils.formatArrayResponse(response);
	}
}
