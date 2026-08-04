import { IExecuteFunctions, NodeOperationError } from 'n8n-workflow';

export class DateUtils {
	/**
	 * Normalize a user provided date to the ISO 8601 format expected by the
	 * NextLead API (e.g. "2026-07-20T09:00:00.000Z").
	 *
	 * Accepts what the n8n `dateTime` field can emit: an ISO string, a
	 * date-only string, a Date, a luxon DateTime (has `toISO()`) or an epoch
	 * in milliseconds. Empty values return undefined so the field is simply
	 * omitted from the payload.
	 */
	static toIso8601(value: unknown): string | undefined {
		if (value === undefined || value === null || value === '') {
			return undefined;
		}

		if (value instanceof Date) {
			return Number.isNaN(value.getTime()) ? undefined : value.toISOString();
		}

		if (typeof value === 'object' && typeof (value as { toISO?: unknown }).toISO === 'function') {
			const iso = (value as { toISO: () => string | null }).toISO();
			return iso ?? undefined;
		}

		if (typeof value !== 'string' && typeof value !== 'number') {
			return undefined;
		}

		const parsed = new Date(value);
		return Number.isNaN(parsed.getTime()) ? undefined : parsed.toISOString();
	}

	/**
	 * Same as `toIso8601` but raises a node error instead of silently dropping
	 * an unparsable value — the API would answer 400 "Format de date invalide".
	 */
	static toIso8601OrThrow(
		context: IExecuteFunctions,
		value: unknown,
		fieldName = 'date',
	): string | undefined {
		if (value === undefined || value === null || value === '') {
			return undefined;
		}

		const iso = DateUtils.toIso8601(value);
		if (iso === undefined) {
			throw new NodeOperationError(
				context.getNode(),
				`Invalid date for "${fieldName}": ${String(value)}. Expected an ISO 8601 date, e.g. 2026-07-20T09:00:00.000Z`,
			);
		}

		return iso;
	}
}
