import { INodeProperties } from 'n8n-workflow';
import { FieldDefinitionUtils } from '../../utils/FieldDefinitionUtils';

export const structureOperations: INodeProperties[] = [
	{
		displayName: 'Operation',
		name: 'operation',
		type: 'options',
		noDataExpression: true,
		displayOptions: {
			show: { resource: ['structure'] },
		},
		options: [
			{
				name: 'Create',
				value: 'create',
				description: 'Create a new structure',
				action: 'Create a structure',
			},
			{
				name: 'Delete',
				value: 'delete',
				description: 'Delete a structure',
				action: 'Delete a structure',
			},
			{
				name: 'Get Many',
				value: 'getMany',
				description: 'Get many structures',
				action: 'Get many structures',
			},
			{
				name: 'Update',
				value: 'update',
				description: 'Update a structure',
				action: 'Update a structure',
			},
		],
		default: 'create',
	},
];

const createFields = [
	FieldDefinitionUtils.createStringField({
		name: 'name',
		displayName: 'Name',
		description: 'Name of the structure',
		required: false,
		operations: ['create'],
	}),
	FieldDefinitionUtils.createCollectionField({
		name: 'additionalFields',
		displayName: 'Additional Fields',
		description: 'Additional fields for the structure',
		operations: ['create'],
		fields: [
			{
				displayName: 'SIRET',
				name: 'siret',
				description: 'SIRET number of the structure',
				default: '',
			},
			{
				displayName: 'Address',
				name: 'address1',
				description: 'Street address of the structure',
				default: '',
			},
			{
				displayName: 'City',
				name: 'city',
				description: 'City of the structure',
				default: '',
			},
			{
				displayName: 'Zip Code',
				name: 'zipCode',
				description: 'Postal code of the structure',
				default: '',
			},
			{
				displayName: 'Website',
				name: 'website',
				description: 'Website URL of the structure',
				default: '',
				placeholder: 'https://www.example.com',
			},
			{
				displayName: 'Phone',
				name: 'phone',
				description: 'Phone number of the structure',
				default: '',
			},
			{
				displayName: 'Email',
				name: 'email',
				description: 'Email address of the structure',
				default: '',
			},
			{
				displayName: 'Comment',
				name: 'comment',
				description: 'Comment about the structure',
				default: '',
			},
		],
	}),
];

const updateFields = [
	FieldDefinitionUtils.createIdField({
		name: 'structureId',
		displayName: 'Structure ID',
		description: 'ID of the structure to update',
		operations: ['update'],
	}),
	FieldDefinitionUtils.createCollectionField({
		name: 'updateFields',
		displayName: 'Update Fields',
		description: 'Fields to update',
		operations: ['update'],
		fields: [
			{
				displayName: 'Name',
				name: 'name',
				description: 'Name of the structure',
				default: '',
			},
			{
				displayName: 'Email',
				name: 'email',
				description: 'Email address of the structure',
				default: '',
			},
			{
				displayName: 'Phone',
				name: 'phone',
				description: 'Phone number of the structure',
				default: '',
			},
			{
				displayName: 'Address',
				name: 'address1',
				description: 'Street address of the structure',
				default: '',
			},
			{
				displayName: 'City',
				name: 'city',
				description: 'City of the structure',
				default: '',
			},
			{
				displayName: 'Zip Code',
				name: 'zipCode',
				description: 'Postal code of the structure',
				default: '',
			},
			{
				displayName: 'Website',
				name: 'website',
				description: 'Website URL of the structure',
				default: '',
				placeholder: 'https://www.example.com',
			},
			{
				displayName: 'SIRET',
				name: 'siret',
				description: 'SIRET number of the structure',
				default: '',
			},
			{
				displayName: 'Comment',
				name: 'comment',
				description: 'Comment about the structure',
				default: '',
			},
		],
	}),
];

const deleteFields = [
	FieldDefinitionUtils.createIdField({
		name: 'structureId',
		displayName: 'Structure ID',
		description: 'ID of the structure to delete',
		operations: ['delete'],
	}),
];

const getManyFields: INodeProperties[] = [];

export const structureFields: INodeProperties[] = [
	...createFields,
	...updateFields,
	...deleteFields,
	...getManyFields,
];
