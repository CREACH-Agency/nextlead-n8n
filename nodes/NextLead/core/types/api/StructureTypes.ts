import { IDataObject } from 'n8n-workflow';

export type StructureType =
	| 'ESTABLISHMENT'
	| 'SYNDICATE'
	| 'PRIVATE_COMPANY'
	| 'PUBLIC_COMPANY'
	| 'ASSOCIATION'
	| 'FEDERATION'
	| 'PUBLIC_INSTITUTION'
	| 'GROUP'
	| 'HEAD_OFFICE'
	| 'BRANCH'
	| 'FRANCHISE';

export type StructureSize = 'MICRO' | 'SMALL' | 'MEDIUM' | 'LARGE' | 'VERY_LARGE';
export type StructureTurnover =
	| 'LESS_THAN_1M'
	| 'BETWEEN_1M_AND_10M'
	| 'BETWEEN_10M_AND_50M'
	| 'MORE_THAN_50M';
export type StructureBusinessModel = 'B2B' | 'B2C' | 'B2B2C' | 'B2G' | 'C2C' | 'NON_PROFIT';
export type StructureMarketArea = 'LOCAL' | 'REGIONAL' | 'NATIONAL' | 'EUROPEAN' | 'INTERNATIONAL';
export type StructureProductType = 'PRODUCTS' | 'SERVICES' | 'PRODUCTS_AND_SERVICES';

export interface StructureBaseFields {
	name: string;
	address1?: string;
	address2?: string;
	address3?: string;
	city?: string;
	country?: string;
	email?: string;
	phone?: string;
	zipCode?: string;
	siret?: string;
	website?: string;
	type?: StructureType;
	numberEmployees?: number;
	marketArea?: StructureMarketArea;
	companyType?: string;
	comment?: string;
	facturationAddress?: string;
	sendingAddress?: string;
	isGroup?: boolean;
	isHeadOffice?: boolean;
	isUES?: boolean;
	department?: string;
	region?: string;
	latGoogle?: number;
	lngGoogle?: number;
	fax?: string;
	quickDescription?: string;
	detailedDescription?: string;
	size?: StructureSize;
	businessModel?: StructureBusinessModel;
	annualTurnover?: StructureTurnover;
	mainSalesChannels?: string;
	productType?: StructureProductType;
}

export interface StructureCreateRequest extends IDataObject, StructureBaseFields {}

export interface StructureUpdateRequest extends IDataObject {
	id: string;
	name?: string;
	address1?: string;
	address2?: string;
	address3?: string;
	city?: string;
	country?: string;
	email?: string;
	phone?: string;
	zipCode?: string;
	siret?: string;
	website?: string;
	type?: StructureType;
	numberEmployees?: number;
	marketArea?: StructureMarketArea;
	companyType?: string;
	comment?: string;
	facturationAddress?: string;
	sendingAddress?: string;
	isGroup?: boolean;
	isHeadOffice?: boolean;
	isUES?: boolean;
	department?: string;
	region?: string;
	latGoogle?: number;
	lngGoogle?: number;
	fax?: string;
	quickDescription?: string;
	detailedDescription?: string;
	size?: StructureSize;
	businessModel?: StructureBusinessModel;
	annualTurnover?: StructureTurnover;
	mainSalesChannels?: string;
	productType?: StructureProductType;
}

export interface StructureResponse extends IDataObject, StructureBaseFields {
	id: string;
	createdAt: string;
	updatedAt: string;
}
