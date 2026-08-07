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

/**
 * Reads the HTTP status out of the shapes a failure can take. The HTTP client
 * rejects with `statusCode`, but n8n's own helpers wrap that rejection in a
 * `NodeApiError`, which carries the status as a string `httpCode` and keeps the
 * original error under `cause`. Only probing `statusCode` therefore misses
 * every failure that went through a n8n helper — and a caller branching on 404
 * or 409 would never see it.
 */
function readStatusCode(error: unknown, depth = 0): number | undefined {
	if (depth > 3 || !error || typeof error !== 'object') return undefined;

	const candidate = error as {
		statusCode?: unknown;
		httpCode?: unknown;
		status?: unknown;
		cause?: unknown;
		response?: { statusCode?: unknown; status?: unknown };
	};

	const sources = [
		candidate.statusCode,
		candidate.httpCode,
		candidate.status,
		candidate.response?.statusCode,
		candidate.response?.status,
	];

	for (const source of sources) {
		const parsed = typeof source === 'string' ? Number.parseInt(source, 10) : source;
		if (typeof parsed === 'number' && Number.isInteger(parsed) && parsed >= 100) return parsed;
	}

	return readStatusCode(candidate.cause, depth + 1);
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
	const statusCode = readStatusCode(error);

	if (error && typeof error === 'object' && statusCode !== undefined) {
		const httpError = error as {
			message?: string;
			description?: unknown;
			body?: unknown;
			response?: { body?: unknown };
			error?: unknown;
			cause?: { body?: unknown; error?: unknown; response?: { body?: unknown } };
		};

		// When n8n wrapped the rejection, `message` is a canned per-status sentence
		// ("Your request is invalid...") and the server's own explanation only
		// survives under `cause` or `description`. Read those before giving up on
		// it, otherwise the API's reason is replaced by boilerplate.
		const apiMessage =
			extractApiMessage(httpError.body) ||
			extractApiMessage(httpError.error) ||
			extractApiMessage(httpError.response?.body) ||
			extractApiMessage(httpError.cause?.body) ||
			extractApiMessage(httpError.cause?.error) ||
			extractApiMessage(httpError.cause?.response?.body) ||
			extractApiMessage(httpError.description);

		return {
			message: apiMessage || httpError.message || 'HTTP Error',
			code: `HTTP_${statusCode}`,
			statusCode,
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
