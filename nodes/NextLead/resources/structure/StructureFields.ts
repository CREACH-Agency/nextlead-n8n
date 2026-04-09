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
				name: 'Link to Contact',
				value: 'linkToContact',
				description: 'Link a structure to a contact',
				action: 'Link a structure to a contact',
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

const linkToContactFields = [
	FieldDefinitionUtils.createCollectionField({
		name: 'structureIdentifiers',
		displayName: 'Structure Identifiers',
		description:
			'Choose at least one identifier to find the structure. Structure ID or SIRET is most reliable.',
		placeholder: 'Add Identifier',
		operations: ['linkToContact'],
		fields: [
			{
				name: 'structureId',
				displayName: 'Structure ID',
				description: 'Structure ID (most reliable identifier)',
			},
			{
				name: 'siret',
				displayName: 'SIRET',
				description: 'SIRET number (most reliable identifier)',
			},
			{
				name: 'structure_name',
				displayName: 'Structure Name',
				description: 'Name of the structure',
			},
			{
				name: 'structure_email',
				displayName: 'Structure Email',
				description: 'Email address of the structure',
			},
		],
	}),
	FieldDefinitionUtils.createCollectionField({
		name: 'structureCustomField',
		displayName: 'Structure Custom Field Identifier',
		description: 'Use a custom field to identify the structure',
		placeholder: 'Add Custom Field Identifier',
		operations: ['linkToContact'],
		fields: [
			{
				name: 'customFieldTypeId',
				displayName: 'Custom Field Type ID',
				description: 'ID of the custom field type',
			},
			{
				name: 'value',
				displayName: 'Value',
				description: 'Value of the custom field',
			},
		],
	}),
	FieldDefinitionUtils.createCollectionField({
		name: 'contactIdentifiers',
		displayName: 'Contact Identifiers',
		description:
			'Choose at least one identifier to find the contact. Contact ID is the most reliable method.',
		placeholder: 'Add Identifier',
		operations: ['linkToContact'],
		fields: [
			{
				name: 'contactId',
				displayName: 'Contact ID',
				description: 'Contact ID (most reliable identifier)',
			},
			{
				name: 'email',
				displayName: 'Email',
				description: 'Email address',
			},
			{
				name: 'linkedin_url',
				displayName: 'LinkedIn URL',
				description: 'LinkedIn profile URL',
			},
			{
				name: 'phone',
				displayName: 'Phone',
				description: 'Phone number',
			},
			{
				name: 'mobile',
				displayName: 'Mobile',
				description: 'Mobile number',
			},
		],
	}),
	FieldDefinitionUtils.createCollectionField({
		name: 'contactCustomField',
		displayName: 'Contact Custom Field Identifier',
		description: 'Use a custom field to identify the contact',
		placeholder: 'Add Custom Field Identifier',
		operations: ['linkToContact'],
		fields: [
			{
				name: 'customFieldTypeId',
				displayName: 'Custom Field Type ID',
				description: 'ID of the custom field type',
			},
			{
				name: 'value',
				displayName: 'Value',
				description: 'Value of the custom field',
			},
		],
	}),
	{
		displayName: 'Link As Secondary Structure',
		name: 'linkAsSecondary',
		type: 'boolean' as const,
		default: false,
		displayOptions: {
			show: {
				resource: ['structure'],
				operation: ['linkToContact'],
			},
		},
		description:
			'Whether to link this structure as a secondary structure only. If disabled (default), the structure is set as the contact\'s main structure.',
	},
];

export const structureFields: INodeProperties[] = [
	...createFields,
	...updateFields,
	...deleteFields,
	...getManyFields,
	...linkToContactFields,
];
