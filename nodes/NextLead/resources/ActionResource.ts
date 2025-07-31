import { IExecuteFunctions, INodeExecutionData, INodeProperties, IDataObject } from 'n8n-workflow';

import { ResourceType, OperationType, NextLeadCredentials } from '../core/types/NextLeadTypes';
import { IResourceStrategy } from '../core/interfaces/IResourceStrategy';
import { NextLeadApiService } from '../core/NextLeadApiService';
import { ResponseUtils } from '../utils/ResponseUtils';
import { actionOperations, actionFields } from './action/ActionFields';

export class ActionResource implements IResourceStrategy {
	getResourceType(): ResourceType {
		return 'action';
	}

	getOperations(): INodeProperties[] {
		return actionOperations;
	}

	getFields(): INodeProperties[] {
		return actionFields;
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
				return this.handleCreateAction(context, itemIndex, apiService);
			case 'update':
				return this.handleUpdateAction(context, itemIndex, apiService);
			case 'delete':
				return this.handleDeleteAction(context, itemIndex, apiService);
			case 'getColumns':
				return this.handleGetColumns(context, apiService);
			default:
				throw new Error(`Unknown operation: ${operation}`);
		}
	}

	private async handleCreateAction(
		context: IExecuteFunctions,
		itemIndex: number,
		apiService: NextLeadApiService,
	): Promise<INodeExecutionData[]> {
		const title = context.getNodeParameter('title', itemIndex) as string;
		const column = context.getNodeParameter('column', itemIndex) as string;
		const assign_contact = context.getNodeParameter('assign_contact', itemIndex, '') as string;
		const additionalFields = context.getNodeParameter(
			'additionalFields',
			itemIndex,
			{},
		) as IDataObject;

		const actionData: IDataObject = {
			title,
			column,
			...(assign_contact && { assign_contact }),
			...additionalFields,
		};

		const response = await apiService.createAction(context, actionData);

		return ResponseUtils.formatSingleResponse(response);
	}

	private async handleUpdateAction(
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

		const response = await apiService.updateAction(context, updateData);

		return ResponseUtils.formatSingleResponse(response);
	}

	private async handleDeleteAction(
		context: IExecuteFunctions,
		itemIndex: number,
		apiService: NextLeadApiService,
	): Promise<INodeExecutionData[]> {
		const contactEmail = context.getNodeParameter('contactEmail', itemIndex) as string;

		await apiService.deleteAction(context, contactEmail);

		return ResponseUtils.formatSuccessResponse(
			`Action deleted successfully for contact: ${contactEmail}`,
		);
	}

	private async handleGetColumns(
		context: IExecuteFunctions,
		apiService: NextLeadApiService,
	): Promise<INodeExecutionData[]> {
		const response = await apiService.getActionsColumns(context);

		return ResponseUtils.formatArrayResponse(response);
	}
}
