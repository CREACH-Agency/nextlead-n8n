import {
	IExecuteFunctions,
	IDataObject,
	NodeOperationError,
} from 'n8n-workflow';

export interface IApiService {
	[key: string]: (context: IExecuteFunctions, ...args: any[]) => Promise<any>;
}

export interface IOperationConfig {
	operationName: string;
	requiredParams: string[];
	optionalParams?: string[];
	apiMethodName: string;
}

export interface ICreateOperationConfig extends IOperationConfig {
	requiredParams: string[];
	additionalFieldsParam?: string;
}

export interface IUpdateOperationConfig extends IOperationConfig {
	idParam: string;
	updateFieldsParam: string;
}

export interface IDeleteOperationConfig extends IOperationConfig {
	idParam: string;
}

export interface IFindOperationConfig extends IOperationConfig {
	searchByParam: string;
	searchValueParam: string;
}

export class OperationHandlerUtils {
	static async handleCreateOperation(
		context: IExecuteFunctions,
		itemIndex: number,
		apiService: IApiService,
		config: ICreateOperationConfig
	): Promise<any> {
		const data: IDataObject = {};

		// Extract required parameters
		for (const param of config.requiredParams) {
			const value = context.getNodeParameter(param, itemIndex) as string;
			if (!value) {
				throw new NodeOperationError(
					context.getNode(),
					`Required parameter '${param}' is missing`
				);
			}
			data[param] = value;
		}

		// Extract additional fields if specified
		if (config.additionalFieldsParam) {
			const additionalFields = context.getNodeParameter(
				config.additionalFieldsParam,
				itemIndex
			) as IDataObject;
			Object.assign(data, additionalFields);
		}

		// Extract optional parameters
		if (config.optionalParams) {
			for (const param of config.optionalParams) {
				const value = context.getNodeParameter(param, itemIndex, undefined);
				if (value !== undefined) {
					data[param] = value;
				}
			}
		}

		return this.executeApiCall(
			context,
			apiService,
			config.apiMethodName,
			config.operationName,
			[context, data]
		);
	}

	static async handleUpdateOperation(
		context: IExecuteFunctions,
		itemIndex: number,
		apiService: IApiService,
		config: IUpdateOperationConfig
	): Promise<any> {
		const id = context.getNodeParameter(config.idParam, itemIndex) as string;
		const updateFields = context.getNodeParameter(
			config.updateFieldsParam,
			itemIndex
		) as IDataObject;

		if (!id) {
			throw new NodeOperationError(
				context.getNode(),
				`Required parameter '${config.idParam}' is missing`
			);
		}

		const data: IDataObject = {
			id,
			...updateFields,
		};

		return this.executeApiCall(
			context,
			apiService,
			config.apiMethodName,
			config.operationName,
			[context, data]
		);
	}

	static async handleDeleteOperation(
		context: IExecuteFunctions,
		itemIndex: number,
		apiService: IApiService,
		config: IDeleteOperationConfig
	): Promise<any> {
		const id = context.getNodeParameter(config.idParam, itemIndex) as string;

		if (!id) {
			throw new NodeOperationError(
				context.getNode(),
				`Required parameter '${config.idParam}' is missing`
			);
		}

		return this.executeApiCall(
			context,
			apiService,
			config.apiMethodName,
			config.operationName,
			[context, id]
		);
	}

	static async handleFindOperation(
		context: IExecuteFunctions,
		itemIndex: number,
		apiService: IApiService,
		config: IFindOperationConfig
	): Promise<any> {
		const searchBy = context.getNodeParameter(config.searchByParam, itemIndex) as string;
		const searchValue = context.getNodeParameter(config.searchValueParam, itemIndex) as string;

		if (!searchBy || !searchValue) {
			throw new NodeOperationError(
				context.getNode(),
				`Required parameters '${config.searchByParam}' and '${config.searchValueParam}' are missing`
			);
		}

		const searchData: IDataObject = {
			[searchBy]: searchValue,
		};

		return this.executeApiCall(
			context,
			apiService,
			config.apiMethodName,
			config.operationName,
			[context, searchData]
		);
	}

	static async handleGetOperation(
		context: IExecuteFunctions,
		apiService: IApiService,
		config: IOperationConfig
	): Promise<any> {
		return this.executeApiCall(
			context,
			apiService,
			config.apiMethodName,
			config.operationName,
			[context]
		);
	}

	static async executeApiCall(
		context: IExecuteFunctions,
		apiService: IApiService,
		methodName: string,
		operationName: string,
		args: [IExecuteFunctions, ...any[]]
	): Promise<any> {
		const method = apiService[methodName];
		
		if (!method || typeof method !== 'function') {
			throw new NodeOperationError(
				context.getNode(),
				`API method '${methodName}' not found`
			);
		}

		try {
			const response = await method.apply(apiService, args);
			
			if (!response || !response.success) {
				throw new NodeOperationError(
					context.getNode(),
					response?.error || `${operationName} failed`
				);
			}

			return response.data;
		} catch (error: any) {
			if (error instanceof NodeOperationError) {
				throw error;
			}
			throw new NodeOperationError(
				context.getNode(),
				`${operationName} failed: ${error.message}`
			);
		}
	}

	static buildDataObject(params: { [key: string]: any }): IDataObject {
		const data: IDataObject = {};
		
		for (const [key, value] of Object.entries(params)) {
			if (value !== undefined && value !== null && value !== '') {
				data[key] = value;
			}
		}

		return data;
	}

	static validateRequiredParams(
		context: IExecuteFunctions,
		params: string[],
		itemIndex: number
	): void {
		for (const param of params) {
			const value = context.getNodeParameter(param, itemIndex);
			if (!value) {
				throw new NodeOperationError(
					context.getNode(),
					`Required parameter '${param}' is missing`
				);
			}
		}
	}

	static extractParameters(
		context: IExecuteFunctions,
		itemIndex: number,
		paramNames: string[]
	): IDataObject {
		const params: IDataObject = {};
		
		for (const paramName of paramNames) {
			const value = context.getNodeParameter(paramName, itemIndex);
			if (value !== undefined) {
				params[paramName] = value;
			}
		}

		return params;
	}
}