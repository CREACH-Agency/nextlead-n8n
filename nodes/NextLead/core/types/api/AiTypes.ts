import { IDataObject } from 'n8n-workflow';

export type AiLocale = 'fr' | 'en';

export interface AiRunRequest extends IDataObject {
	/** Natural language instruction sent to the NextLead AI agent (1-8000 chars) */
	prompt: string;
	locale: AiLocale;
	/**
	 * Explicit write opt-in. The API stays read-only unless this is true, so a
	 * misconfigured workflow can never mutate the CRM by accident.
	 */
	allow_mutations: boolean;
	/**
	 * Organization member the AI acts on behalf of. The API key is org-level, so
	 * the caller designates the executor: writes are attributed to them and their
	 * role drives the RBAC checks.
	 */
	as_user_id: string;
}

export interface AiRunResponse extends IDataObject {
	conversationId: string;
	response?: string;
	mutationsApplied?: boolean;
	status: 'ok' | 'error';
	error?: string;
}
