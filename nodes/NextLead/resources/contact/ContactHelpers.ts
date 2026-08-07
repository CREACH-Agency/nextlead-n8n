import { IDataObject } from 'n8n-workflow';

/**
 * Zapier exposes the CRM qualification fields under `contact_*` names but sends
 * them to the API under the short names. Accept both so a workflow copied from
 * a Zapier payload keeps working.
 */
/**
 * Criteria `structure/get-single-structure` accepts, under the exact names it
 * reads them from the query string.
 */
const STRUCTURE_FIND_KEYS = ['name', 'siret', 'email', 'phone'] as const;

const CRM_CONFIG_ALIASES: Record<string, string> = {
	contact_lead_source: 'lead_source',
	contact_sector: 'sector',
	contact_priority: 'priority',
};

export class ContactHelpers {
	private static extractResourceLocatorValue(value: unknown): unknown {
		if (
			value &&
			typeof value === 'object' &&
			'mode' in (value as IDataObject) &&
			'value' in (value as IDataObject)
		) {
			return (value as IDataObject).value;
		}

		return value;
	}

	static transformComplexField(param: IDataObject, fieldName: string): IDataObject[] {
		if (!param || !param[fieldName] || typeof param[fieldName] !== 'object') return [];

		// A fixedCollection materialises every sub-field with its default as soon as
		// the group is added, so the untouched ones have to be dropped before the
		// payload leaves — the API rejects an empty string where it expects an ID.
		const data = this.cleanFields(param[fieldName] as IDataObject);
		return Object.keys(data).length > 0 ? [data] : [];
	}

	static transformCustomFields(param: IDataObject): IDataObject[] {
		if (!param?.customField || !Array.isArray(param.customField)) return [];

		const fields = param.customField as IDataObject[];
		const transformed: IDataObject = {};

		fields.forEach((field, index) => {
			const num = index + 1;
			if (field.selected_field) {
				transformed[`selected_field${num}`] = field.selected_field;
				transformed[`value_${num}`] = field.value || '';
			}
		});

		return Object.keys(transformed).length > 0 ? [transformed] : [];
	}

	static cleanFields(fields: IDataObject): IDataObject {
		const cleaned: IDataObject = {};
		Object.entries(fields).forEach(([key, value]) => {
			const normalizedValue = this.extractResourceLocatorValue(value);
			if (normalizedValue !== undefined && normalizedValue !== '') cleaned[key] = normalizedValue;
		});
		return cleaned;
	}

	/** Rewrites the Zapier-style `contact_*` keys to the names the API expects. */
	static normalizeCrmAliases(fields: IDataObject): IDataObject {
		const normalized: IDataObject = {};
		Object.entries(fields).forEach(([key, value]) => {
			const target = CRM_CONFIG_ALIASES[key] ?? key;
			// An explicit short-named value always wins over its alias.
			if (target !== key && normalized[target] !== undefined) return;
			normalized[target] = value;
		});
		return normalized;
	}

	/**
	 * Picks the structure lookup criteria out of a parameter group and returns
	 * them as the query string `structure/get-single-structure` reads.
	 *
	 * The keys are picked explicitly rather than filtered out, because the update
	 * operation reads them from the same collection as `setAsMainStructure`,
	 * which the lookup route does not understand.
	 */
	static buildStructureFindQuery(source: IDataObject): IDataObject {
		const query: IDataObject = {};

		// The route names its ID parameter `id`; the UI keeps Zapier's
		// `find_structure_id` so a payload copied from a Zap maps straight across.
		const id = source.find_structure_id;
		if (typeof id === 'string' && id.trim()) query.id = id.trim();

		for (const key of STRUCTURE_FIND_KEYS) {
			const value = source[key];
			if (typeof value === 'string' && value.trim()) query[key] = value.trim();
		}

		return query;
	}

	/**
	 * Turns the resourceLocator/expression forms a structure identifier can take
	 * into the plain ID string the API expects.
	 */
	static extractStructureIdFromLocator(value: unknown): string {
		const extracted = this.extractResourceLocatorValue(value);
		return typeof extracted === 'string' ? extracted.trim() : '';
	}

	/**
	 * Digs the structure ID out of an API answer. The structure routes wrap their
	 * payload inconsistently (`{ id }`, `{ data: { id } }`, `{ structure: { id } }`,
	 * or a one-element array), so every shape is probed before giving up.
	 */
	static extractStructureId(payload: unknown): string {
		if (!payload) return '';

		if (Array.isArray(payload)) {
			for (const entry of payload) {
				const id = this.extractStructureId(entry);
				if (id) return id;
			}
			return '';
		}

		if (typeof payload !== 'object') return '';

		const container = payload as IDataObject;
		for (const key of ['id', 'structureId', 'establishmentId']) {
			const value = container[key];
			if (typeof value === 'string' && value) return value;
		}

		for (const key of ['data', 'structure', 'result', 'structures']) {
			if (container[key]) {
				const id = this.extractStructureId(container[key]);
				if (id) return id;
			}
		}

		return '';
	}
}
