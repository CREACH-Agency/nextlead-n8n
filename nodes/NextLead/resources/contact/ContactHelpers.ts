import { IDataObject } from 'n8n-workflow';

export class ContactHelpers {
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
			if (value !== undefined && value !== '') cleaned[key] = value;
		});
		return cleaned;
	}
}
