import {
	IAuthenticateGeneric,
	ICredentialType,
	INodeProperties,
	ICredentialTestRequest,
} from 'n8n-workflow';

export class NextLeadApi implements ICredentialType {
	name = 'nextLeadApi';
	displayName = 'NextLead API';
	documentationUrl = 'https://dashboard.nextlead.app/en/api-documentation';
	properties: INodeProperties[] = [
		{
			displayName: 'API Key',
			name: 'apiKey',
			type: 'string',
			typeOptions: {
				password: true,
			},
			default: '',
			required: true,
			description: 'The API key for authentication. Get it from your NextLead dashboard under Settings > Automation > API Key.',
		},
		{
			displayName: 'Domain',
			name: 'domain',
			type: 'string',
			default: 'https://dashboard.nextlead.app',
			description: 'The domain to use for API requests',
		},
	];

	authenticate: IAuthenticateGeneric = {
		type: 'generic',
		properties: {
			headers: {
				Authorization: '=Bearer {{$credentials.apiKey}}',
			},
		},
	};

	test: ICredentialTestRequest = {
		request: {
			baseURL: '={{$credentials.domain}}',
			url: '/api/v2/receive/contact/get-team',
			method: 'GET',
		},
	};
}