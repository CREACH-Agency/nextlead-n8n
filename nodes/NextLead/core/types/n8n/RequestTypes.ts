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
	/** Extra request headers, on top of the ones added by the credential */
	headers?: Record<string, string>;
	/** Request timeout in ms, for endpoints slower than the default */
	timeout?: number;
	/**
	 * Resolve with `{ body, headers, statusCode }` instead of the body alone, for
	 * routes that page through a response header (`X-Next-Cursor`).
	 */
	returnFullResponse?: boolean;
}

export interface NextLeadCredentials {
	apiKey: string;
	domain: string;
}
