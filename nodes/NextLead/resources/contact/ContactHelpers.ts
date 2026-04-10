import { IDataObject } from 'n8n-workflow';

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
		const data = param[fieldName] as IDataObject;
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
}
