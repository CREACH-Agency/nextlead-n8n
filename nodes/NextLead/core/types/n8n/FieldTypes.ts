import { INodeProperties } from 'n8n-workflow';

export type FieldType = 'string' | 'number' | 'boolean' | 'dateTime' | 'collection' | 'options';

export interface FieldOptions {
	name: string;
	displayName: string;
	description: string;
	required?: boolean;
	operations: string[];
	default?: string | number | boolean;
}

export interface StringFieldOptions extends FieldOptions {
	type?: 'string';
	placeholder?: string;
}

export interface NumberFieldOptions extends FieldOptions {
	type?: 'number';
	min?: number;
	max?: number;
}

export interface BooleanFieldOptions extends FieldOptions {
	type?: 'boolean';
}

export interface EmailFieldOptions extends FieldOptions {
	type?: 'string';
	validation?: 'email';
}

export interface IdFieldOptions extends FieldOptions {
	type?: 'string';
	validation?: 'id';
}

export interface CollectionFieldConfig {
	displayName: string;
	name: string;
	description: string;
	default: string | number;
	type?: FieldType;
}

export interface CollectionFieldOptions extends FieldOptions {
	type?: 'collection';
	fields: CollectionFieldConfig[];
}

export interface TypedNodeProperties extends INodeProperties {
	typeOptions?: {
		loadOptionsMethod?: string;
		loadOptionsDependsOn?: string[];
	};
}
