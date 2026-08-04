import {
	IAuthenticateGeneric,
	ICredentialType,
	INodeProperties,
	ICredentialTestRequest,
} from 'n8n-workflow';

export class NextLeadApi implements ICredentialType {
	name = 'nextLeadApi';
	displayName = 'NextLead API';
	icon = 'file:nextlead.svg' as const;
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
			description:
				'The API key for authentication. Get it from your NextLead dashboard under Settings > Automation > API Key.',
		},
		{
			displayName: 'Domain',
			name: 'domain',
			type: 'string',
			default: 'https://dashboard.nextlead.app',
			placeholder: 'https://dashboard.nextlead.app',
			description:
				'The API domain. Use "http://localhost:3000" for local development or "https://dashboard.nextlead.app" for production.',
			hint: 'For local development, use http://localhost:3000',
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

	// `identify-user` is the connection-check endpoint every provider uses and is
	// exempt from the organization API quota. Testing against a `receive/` route
	// instead would bill one call each time the credential is saved.
	test: ICredentialTestRequest = {
		request: {
			baseURL: '={{$credentials.domain}}',
			url: '/api/v2/identify-user',
			method: 'GET',
		},
	};
}
