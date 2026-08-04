import { ILoadOptionsFunctions, NodeOperationError } from 'n8n-workflow';

import { fetchMetadata, unwrapArray } from './MetadataCache';

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
		response = await fetchMetadata(context, '/api/v2/receive/contact/get-team');
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

	const members = unwrapArray<IRawTeamMember>(response, ['users', 'team', 'members'])
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
