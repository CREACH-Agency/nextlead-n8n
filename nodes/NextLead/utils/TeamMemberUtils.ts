import { ILoadOptionsFunctions, NodeOperationError } from 'n8n-workflow';

import { NextLeadCredentials } from '../core/types/n8n/RequestTypes';

export interface ITeamMember {
	id: string;
	label: string;
}

interface IRawTeamMember {
	id?: string;
	userId?: string;
	name?: string;
	firstName?: string;
	lastName?: string;
	email?: string;
}

/**
 * The API may answer with a bare array or wrap it in a container key depending
 * on the endpoint version, so unwrap the usual shapes before mapping.
 */
function unwrapMembers(response: unknown): IRawTeamMember[] {
	if (Array.isArray(response)) {
		return response as IRawTeamMember[];
	}

	if (response && typeof response === 'object') {
		const container = response as Record<string, unknown>;
		for (const key of ['data', 'users', 'team', 'members', 'result']) {
			if (Array.isArray(container[key])) {
				return container[key] as IRawTeamMember[];
			}
		}
	}

	return [];
}

function buildLabel(member: IRawTeamMember): string {
	const fullName = [member.firstName, member.lastName].filter(Boolean).join(' ').trim();
	return member.name || fullName || member.email || member.id || member.userId || 'Unnamed user';
}

/**
 * Fetch the organization members that can be assigned work or designated as the
 * executing user. Errors are surfaced instead of swallowed: an empty dropdown
 * with no explanation is impossible to debug from the n8n UI.
 */
export async function fetchTeamMembers(context: ILoadOptionsFunctions): Promise<ITeamMember[]> {
	let response: unknown;

	try {
		const credentials = (await context.getCredentials('nextLeadApi')) as NextLeadCredentials;
		const domain = credentials.domain.endsWith('/')
			? credentials.domain.slice(0, -1)
			: credentials.domain;

		response = await context.helpers.httpRequestWithAuthentication.call(context, 'nextLeadApi', {
			method: 'GET' as const,
			url: `${domain}/api/v2/receive/contact/get-team`,
			json: true,
		});
	} catch (error) {
		const message = error instanceof Error ? error.message : String(error);
		throw new NodeOperationError(
			context.getNode(),
			`Could not load NextLead team members: ${message}`,
			{
				description:
					'Check that the NextLead credential is selected and that its API key and domain are valid.',
			},
		);
	}

	const members = unwrapMembers(response)
		.map((member) => ({ id: member.id ?? member.userId ?? '', label: buildLabel(member) }))
		.filter((member) => member.id !== '');

	if (members.length === 0) {
		throw new NodeOperationError(context.getNode(), 'No team member returned by NextLead', {
			description:
				'The organization linked to this API key has no selectable member. Add a member in NextLead, or set the field to "By ID" and provide the user ID directly.',
		});
	}

	return members;
}
