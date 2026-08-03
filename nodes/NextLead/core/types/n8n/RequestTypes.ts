import { IDataObject } from 'n8n-workflow';

export interface N8nRequestOptions {
	method: 'GET' | 'POST' | 'PUT' | 'DELETE';
	url: string;
	json: boolean;
	body?: IDataObject;
	qs?: IDataObject;
	headers?: Record<string, string>;
	timeout?: number;
}

export interface RequestConfig {
	method: 'GET' | 'POST' | 'PUT' | 'DELETE';
	endpoint: string;
	data?: IDataObject;
	queryParams?: IDataObject;
	/** Request timeout in ms, for endpoints slower than the default */
	timeout?: number;
}

export interface NextLeadCredentials {
	apiKey: string;
	domain: string;
}
