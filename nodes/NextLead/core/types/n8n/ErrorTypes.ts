export interface NextLeadError {
	message: string;
	code?: string;
	statusCode?: number;
	details?: Record<string, unknown>;
	/**
	 * True when `message` was read from the API response body rather than
	 * synthesized from the HTTP layer. Callers use it to decide whether the
	 * server's own explanation should win over a canned per-status message.
	 */
	fromApiBody?: boolean;
	/** `Retry-After` header value, when the API sent one. */
	retryAfter?: string;
}

/** Keys the API v2 uses to carry a human-readable message, most specific first. */
const MESSAGE_KEYS = ['error', 'message', 'detail', 'errors'];

/**
 * API v2 still emits four frozen error shapes — bare text, `{ error }`,
 * `{ error }` lowercased, and `[{ error }]` — because uniformising them would
 * break the Zapier/Make integrations. Read all of them rather than surfacing an
 * opaque "403 - Forbidden" for the routes that do not answer plain text.
 */
function extractApiMessage(payload: unknown, depth = 0): string {
	if (depth > 5) return '';

	if (typeof payload === 'string') {
		const trimmed = payload.trim();
		if (!trimmed) return '';

		// Some routes answer text/plain, others JSON that reaches us unparsed.
		if (trimmed.startsWith('{') || trimmed.startsWith('[')) {
			try {
				return extractApiMessage(JSON.parse(trimmed), depth + 1);
			} catch {
				return trimmed;
			}
		}

		return trimmed;
	}

	if (Array.isArray(payload)) {
		for (const entry of payload) {
			const message = extractApiMessage(entry, depth + 1);
			if (message) return message;
		}
		return '';
	}

	if (payload && typeof payload === 'object') {
		const record = payload as Record<string, unknown>;
		for (const key of MESSAGE_KEYS) {
			const message = extractApiMessage(record[key], depth + 1);
			if (message) return message;
		}
	}

	return '';
}

function readHeader(source: unknown, name: string): string | undefined {
	if (!source || typeof source !== 'object') return undefined;

	const headers = (source as { headers?: Record<string, unknown> }).headers;
	if (!headers || typeof headers !== 'object') return undefined;

	// HTTP header names are case-insensitive and the HTTP client is free to keep
	// the casing the server sent, so the lookup cannot assume lowercase.
	const wanted = name.toLowerCase();
	const match = Object.entries(headers).find(([key]) => key.toLowerCase() === wanted);
	if (!match) return undefined;

	const value = match[1];
	if (typeof value === 'string' || typeof value === 'number') return String(value);
	return Array.isArray(value) && typeof value[0] === 'string' ? value[0] : undefined;
}

export class TypedError extends Error {
	public readonly code?: string;
	public readonly statusCode?: number;
	public readonly details?: Record<string, unknown>;

	constructor(error: NextLeadError) {
		super(error.message);
		this.name = 'NextLeadError';
		this.code = error.code;
		this.statusCode = error.statusCode;
		this.details = error.details;
	}
}

/**
 * Only an error this module produced qualifies. Matching on a string `message`
 * alone would match every Error and every HTTP rejection n8n raises, which is
 * how the body parsing below ended up unreachable.
 */
export function isNextLeadError(error: unknown): error is NextLeadError {
	if (typeof error !== 'object' || error === null) return false;

	const candidate = error as NextLeadError;
	return typeof candidate.message === 'string' && typeof candidate.code === 'string';
}

export function createNextLeadError(error: unknown): NextLeadError {
	// The HTTP shape is tested first: an API rejection carries both a status code
	// and a message, and it is the body that holds the useful explanation.
	if (error && typeof error === 'object' && 'statusCode' in error) {
		const httpError = error as {
			statusCode: number;
			message?: string;
			body?: unknown;
			response?: { body?: unknown };
			error?: unknown;
		};

		const apiMessage =
			extractApiMessage(httpError.body) ||
			extractApiMessage(httpError.error) ||
			extractApiMessage(httpError.response?.body);

		return {
			message: apiMessage || httpError.message || 'HTTP Error',
			code: `HTTP_${httpError.statusCode}`,
			statusCode: httpError.statusCode,
			fromApiBody: apiMessage !== '',
			retryAfter: readHeader(httpError.response, 'retry-after') ?? readHeader(error, 'retry-after'),
			details: {
				body: httpError.body,
				response: httpError.response,
				error: httpError.error,
				originalError: error,
			},
		};
	}

	if (isNextLeadError(error)) {
		return error;
	}

	if (error instanceof Error) {
		return {
			message: error.message,
			code: 'UNKNOWN_ERROR',
		};
	}

	return {
		message: 'An unknown error occurred',
		code: 'UNKNOWN_ERROR',
		details: { originalError: error },
	};
}
