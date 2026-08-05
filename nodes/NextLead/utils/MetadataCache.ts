import { createHash } from 'crypto';
import {
	IDataObject,
	ILoadOptionsFunctions,
	NodeApiError,
	NodeOperationError,
} from 'n8n-workflow';

import { NextLeadErrorHandler } from '../core/NextLeadErrorHandler';
import { NextLeadCredentials } from '../core/types/n8n/RequestTypes';

/**
 * Metadata reads (`get-team`, `get-columns`, `get-lists`, ...) are billed against
 * the organization EXTERNAL_AUTOMATION quota, and n8n re-runs every loadOptions
 * method each time a dropdown is opened. Without this cache, configuring a
 * single node can exhaust a whole monthly allowance before the first execution.
 *
 * The cache is per n8n process and deliberately short-lived: metadata created in
 * NextLead shows up in the dropdowns within a minute.
 */
const TTL_MS = 60_000;

interface CacheEntry {
	expiresAt: number;
	/** The in-flight promise, so concurrent dropdowns share a single request. */
	value: Promise<unknown>;
}

const cache = new Map<string, CacheEntry>();

export function normalizeDomain(domain: string): string {
	return domain.endsWith('/') ? domain.slice(0, -1) : domain;
}

/** The API key never lands in the cache key in clear text. */
function fingerprint(apiKey: string): string {
	return createHash('sha256').update(apiKey).digest('hex').slice(0, 16);
}

function buildKey(domain: string, apiKey: string, route: string, qs?: IDataObject): string {
	const query = qs ? JSON.stringify(Object.entries(qs).sort()) : '';
	return `${domain}|${fingerprint(apiKey)}|${route}|${query}`;
}

function prune(now: number): void {
	for (const [key, entry] of cache) {
		if (entry.expiresAt <= now) cache.delete(key);
	}
}

/**
 * GET a metadata route, reusing a recent response when there is one. Failures
 * are never cached so a transient error does not stick for the whole TTL.
 */
export async function fetchMetadata<T = unknown>(
	context: ILoadOptionsFunctions,
	route: string,
	qs?: IDataObject,
): Promise<T> {
	const credentials = (await context.getCredentials('nextLeadApi')) as NextLeadCredentials;
	const domain = normalizeDomain(credentials.domain);
	const key = buildKey(domain, credentials.apiKey, route, qs);

	const now = Date.now();
	const cached = cache.get(key);
	if (cached && cached.expiresAt > now) {
		return cached.value as Promise<T>;
	}

	prune(now);

	// `httpRequestWithAuthentication` applies the credential's Bearer header, so
	// the Authorization header must not be set by hand here.
	const request = context.helpers.httpRequestWithAuthentication.call(context, 'nextLeadApi', {
		method: 'GET' as const,
		url: `${domain}${route}`,
		...(qs && { qs }),
		json: true,
	});

	cache.set(key, { expiresAt: now + TTL_MS, value: request });

	try {
		return (await request) as T;
	} catch (error) {
		cache.delete(key);

		// A raw rejection must never leave the node: n8n needs a NodeApiError (or a
		// NodeOperationError when the failure carries no HTTP status) to render the
		// status code, the response body and a readable message in the UI.
		// `handleApiError` builds exactly one of those and already maps 401/403/404/429
		// to their explanation — metadata routes are billed against the organization
		// quota, so a 429 has to read as "quota spent", not as an opaque rejection.
		// https://docs.n8n.io/integrations/creating-nodes/build/reference/verification-guidelines/
		const nodeError: NodeApiError | NodeOperationError = NextLeadErrorHandler.handleApiError(
			error,
			context.getNode(),
		);
		throw nodeError;
	}
}

/**
 * The API answers either with a bare array or with the array wrapped in a
 * container key, depending on the route. Unwrap the usual shapes.
 */
export function unwrapArray<T = unknown>(response: unknown, extraKeys: string[] = []): T[] {
	if (Array.isArray(response)) {
		return response as T[];
	}

	if (response && typeof response === 'object') {
		const container = response as Record<string, unknown>;
		for (const key of ['data', ...extraKeys, 'result']) {
			if (Array.isArray(container[key])) {
				return container[key] as T[];
			}
		}
	}

	return [];
}

/** Exposed for tests: drops every cached entry. */
export function clearMetadataCache(): void {
	cache.clear();
}
