import { INodeProperties } from 'n8n-workflow';

export interface IFieldConfig {
	name: string;
	displayName: string;
	description: string;
	required?: boolean;
	placeholder?: string;
	default?: string | number | boolean;
	typeOptions?: {
		email?: boolean;
		rows?: number;
		numberPrecision?: number;
		minValue?: number;
		maxValue?: number;
		loadOptionsMethod?: string;
		loadOptionsDependsOn?: string[];
	};
}

export interface ICollectionFieldConfig {
	name: string;
	displayName: string;
	description: string;
	operations: string[];
	fields: IFieldConfig[];
}

export class FieldDefinitionUtils {
	static createStringField(config: IFieldConfig & { operations: string[] }): INodeProperties {
		return {
			displayName: config.displayName,
			name: config.name,
			type: 'string',
			required: config.required ?? false,
			displayOptions: {
				show: {
					operation: config.operations,
				},
			},
			default: '',
			description: config.description,
			...(config.placeholder && { placeholder: config.placeholder }),
		};
	}

	static createEmailField(config: IFieldConfig & { operations: string[] }): INodeProperties {
		return {
			displayName: config.displayName,
			name: config.name,
			type: 'string',
			required: config.required ?? false,
			displayOptions: {
				show: {
					operation: config.operations,
				},
			},
			placeholder: config.placeholder ?? 'name@email.com',
			typeOptions: {
				email: true,
			},
			default: '',
			description: config.description,
		};
	}

	static createIdField(config: IFieldConfig & { operations: string[] }): INodeProperties {
		return {
			displayName: config.displayName,
			name: config.name,
			type: 'string',
			required: config.required ?? true,
			displayOptions: {
				show: {
					operation: config.operations,
				},
			},
			default: '',
			description: config.description,
		};
	}

	static createCollectionField(config: ICollectionFieldConfig): INodeProperties {
		return {
			displayName: config.displayName,
			name: config.name,
			type: 'collection',
			placeholder: 'Add Field',
			default: {},
			displayOptions: {
				show: {
					operation: config.operations,
				},
			},
			options: config.fields.map((field) => ({
				default: '',
				displayName: field.displayName,
				name: field.name,
				type: 'string',
				description: field.description,
				...(field.typeOptions && { typeOptions: field.typeOptions }),
				...(field.placeholder && { placeholder: field.placeholder }),
			})),
		};
	}

	static createNumberField(
		config: IFieldConfig & { operations: string[]; min?: number; max?: number; precision?: number },
	): INodeProperties {
		return {
			displayName: config.displayName,
			name: config.name,
			type: 'number',
			required: config.required ?? false,
			displayOptions: {
				show: {
					operation: config.operations,
				},
			},
			default: 0,
			description: config.description,
			...((config.min !== undefined ||
				config.max !== undefined ||
				config.precision !== undefined) && {
				typeOptions: {
					...(config.precision !== undefined && { numberPrecision: config.precision }),
					...(config.min !== undefined && { minValue: config.min }),
					...(config.max !== undefined && { maxValue: config.max }),
				},
			}),
		};
	}

	static createDateTimeField(config: IFieldConfig & { operations: string[] }): INodeProperties {
		return {
			displayName: config.displayName,
			name: config.name,
			type: 'dateTime',
			required: config.required ?? false,
			displayOptions: {
				show: {
					operation: config.operations,
				},
			},
			default: '',
			description: config.description,
		};
	}

	static createTextAreaField(
		config: IFieldConfig & { operations: string[]; rows?: number },
	): INodeProperties {
		return {
			displayName: config.displayName,
			name: config.name,
			type: 'string',
			required: config.required ?? false,
			displayOptions: {
				show: {
					operation: config.operations,
				},
			},
			typeOptions: {
				rows: config.rows ?? 3,
			},
			default: '',
			description: config.description,
		};
	}

	static createOptionsField(
		config: IFieldConfig & {
			operations: string[];
			options: Array<{ name: string; value: string; description?: string; action?: string }>;
		},
	): INodeProperties {
		return {
			displayName: config.displayName,
			name: config.name,
			type: 'options',
			required: config.required ?? false,
			displayOptions: {
				show: {
					operation: config.operations,
				},
			},
			options: config.options.map((option) => ({
				name: option.name,
				value: option.value,
				description: option.description,
				...(option.action && { action: option.action }),
			})),
			default: '',
			description: config.description,
		};
	}

	static getCommonContactFields(): IFieldConfig[] {
		return [
			{
				name: 'city',
				displayName: 'City',
				description: 'City of the contact',
			},
			{
				name: 'company',
				displayName: 'Company',
				description: 'Company of the contact',
			},
			{
				name: 'job',
				displayName: 'Job Title',
				description: 'Job title of the contact',
			},
			{
				name: 'linkedin',
				displayName: 'LinkedIn',
				description: 'LinkedIn profile URL',
			},
			{
				name: 'phone',
				displayName: 'Phone',
				description: 'Phone number of the contact',
			},
		];
	}

	static getCommonStructureFields(): IFieldConfig[] {
		return [
			{
				name: 'address',
				displayName: 'Address',
				description: 'Address of the structure',
			},
			{
				name: 'city',
				displayName: 'City',
				description: 'City of the structure',
			},
			{
				name: 'country',
				displayName: 'Country',
				description: 'Country of the structure',
			},
			{
				name: 'phone',
				displayName: 'Phone',
				description: 'Phone number of the structure',
			},
			{
				name: 'postalCode',
				displayName: 'Postal Code',
				description: 'Postal code of the structure',
			},
			{
				name: 'siret',
				displayName: 'SIRET',
				description: 'SIRET number of the structure',
			},
			{
				name: 'website',
				displayName: 'Website',
				description: 'Website URL of the structure',
			},
		];
	}
}
