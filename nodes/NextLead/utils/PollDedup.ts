import { createHash } from 'crypto';
import { IDataObject } from 'n8n-workflow';

/**
 * The NextLead polling queues are not consumed on read: every poll returns the
 * whole backlog, so deduplication has to happen here or a workflow re-fires on
 * the same events every minute forever.
 *
 * Keys are remembered across polls in the node static data. The store is a
 * union of what was already known and what the current response contained:
 * forgetting a key that is still queued would re-emit it, which is precisely
 * the failure being fixed, so bounded memory is preferred over early eviction.
 */
const MAX_KEYS_PER_EVENT = 5000;

const STATE_KEY = 'seenEventKeys';
const LEGACY_STATE_KEY = 'processedIds';

/** Maps the pre-0.1.7 static data buckets onto the per-event store. */
const LEGACY_BUCKET_BY_EVENT: Record<string, string> = {
	contactCreated: 'contacts',
	structureCreated: 'structures',
	emailAddedToList: 'emailLists',
};

export type DedupStrategy =
	/** Creation events: an entity is created once, so its id never repeats. */
	| 'id'
	/** List membership additions, keyed on the email/list pair. */
	| 'emailList'
	/** Update and delete events: the same entity recurs, so the key carries a revision. */
	| 'versioned';

const IDENTITY_FIELDS = ['id', 'contactId', 'structureId'];
const REVISION_FIELDS = ['updatedAt', 'modifiedAt', 'deletedAt', 'removedAt', 'createdAt', 'date'];

function asString(value: unknown): string {
	return typeof value === 'string' || typeof value === 'number' ? String(value) : '';
}

function firstPresent(item: IDataObject, fields: string[]): string {
	for (const field of fields) {
		const value = asString(item[field]);
		if (value) return value;
	}
	return '';
}

/** JSON.stringify with deterministic key ordering, so hashes are comparable. */
function canonicalize(value: unknown): string {
	if (value === null || typeof value !== 'object') return JSON.stringify(value) ?? 'null';
	if (Array.isArray(value)) return `[${value.map(canonicalize).join(',')}]`;

	const entries = Object.entries(value as Record<string, unknown>)
		.filter(([, entryValue]) => entryValue !== undefined)
		.sort(([a], [b]) => (a < b ? -1 : a > b ? 1 : 0))
		.map(([key, entryValue]) => `${JSON.stringify(key)}:${canonicalize(entryValue)}`);

	return `{${entries.join(',')}}`;
}

function contentHash(item: IDataObject): string {
	return createHash('sha256').update(canonicalize(item)).digest('hex').slice(0, 32);
}

function emailListKey(item: IDataObject): string {
	const email = asString(item.email);
	const listId = asString(item.listId);
	return email || listId ? `${email}_${listId}` : '';
}

/**
 * Build the identity part of a key. Falls back to a content hash when the
 * payload carries no recognisable identifier, so an unknown shape degrades to
 * "dedupe identical payloads" instead of dropping the item.
 */
export function buildEventKey(item: IDataObject, strategy: DedupStrategy): string {
	switch (strategy) {
		case 'id': {
			// Kept as the bare id so keys stored by earlier versions still match.
			const id = asString(item.id);
			return id || contentHash(item);
		}
		case 'emailList': {
			const key = emailListKey(item);
			return key || contentHash(item);
		}
		case 'versioned': {
			const identity = firstPresent(item, IDENTITY_FIELDS) || emailListKey(item);
			const revision = firstPresent(item, REVISION_FIELDS);
			// Without a revision field the hash still separates a genuine second
			// change from a replay: only a change that alters nothing is absorbed.
			return identity && revision ? `${identity}:${revision}` : contentHash(item);
		}
	}
}

function readLegacyKeys(staticData: IDataObject, event: string): string[] {
	const bucket = LEGACY_BUCKET_BY_EVENT[event];
	if (!bucket) return [];

	const legacy = staticData[LEGACY_STATE_KEY] as IDataObject | undefined;
	const values = legacy?.[bucket];
	return Array.isArray(values)
		? values.filter((value): value is string => typeof value === 'string')
		: [];
}

export class PollDedupStore {
	private constructor(
		private readonly staticData: IDataObject,
		private readonly event: string,
		private readonly keys: string[],
		private readonly seen: Set<string>,
		/**
		 * True when no state existed for this event yet. The queues hold months of
		 * history and are never purged server-side, so the first poll records the
		 * backlog as a baseline instead of firing the workflow thousands of times.
		 */
		readonly isFirstRun: boolean,
	) {}

	/**
	 * Hydrate the store for one event, seeding it from the pre-0.1.7 static data
	 * layout when present so upgrading does not replay an entire backlog once.
	 */
	static load(staticData: IDataObject, event: string): PollDedupStore {
		const state = (staticData[STATE_KEY] ?? {}) as IDataObject;
		const stored = state[event];

		const keys = Array.isArray(stored)
			? stored.filter((value): value is string => typeof value === 'string')
			: readLegacyKeys(staticData, event);

		const isFirstRun = !Array.isArray(stored) && keys.length === 0;

		return new PollDedupStore(staticData, event, keys, new Set(keys), isFirstRun);
	}

	/**
	 * Return the items not seen before and record them. An empty response leaves
	 * the store untouched: a transient empty answer must not make the node forget
	 * a backlog it would then re-emit in full.
	 */
	filterNew(items: IDataObject[], strategy: DedupStrategy): IDataObject[] {
		const fresh: IDataObject[] = [];

		for (const item of items) {
			const key = buildEventKey(item, strategy);
			if (this.seen.has(key)) continue;

			this.seen.add(key);
			this.keys.push(key);
			fresh.push(item);
		}

		return fresh;
	}

	/** Write the store back, evicting the oldest keys past the cap. */
	persist(): void {
		const state = (this.staticData[STATE_KEY] ?? {}) as IDataObject;

		state[this.event] =
			this.keys.length > MAX_KEYS_PER_EVENT ? this.keys.slice(-MAX_KEYS_PER_EVENT) : this.keys;

		this.staticData[STATE_KEY] = state;
		// The legacy buckets have been folded into the per-event store.
		delete this.staticData[LEGACY_STATE_KEY];
	}
}
