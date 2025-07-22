import { IDataObject } from 'n8n-workflow';

export interface N8nRequestOptions {
	method: 'GET' | 'POST' | 'PUT' | 'DELETE';
	url: string;
	json: boolean;
	body?: IDataObject;
	qs?: IDataObject;
	headers?: Record<string, string>;
}

export interface RequestConfig {
	method: 'GET' | 'POST' | 'PUT' | 'DELETE';
	endpoint: string;
	data?: IDataObject;
	queryParams?: IDataObject;
}

export interface NextLeadCredentials {
	domain: string;
	apiKey: string;
}
