import { IDataObject } from 'n8n-workflow';

export type StructureType = 'ESTABLISHMENT';

export interface StructureBaseFields {
	name: string;
	siret?: string;
	address1?: string;
	city?: string;
	zipCode?: string;
	website?: string;
	phone?: string;
	phone2?: string;
	phone3?: string;
	email?: string;
	email2?: string;
	email3?: string;
	comment?: string;
	groupId?: string;
	/**
	 * IMPLANTATION_STATUS tag ID (see `get-implantation-status`). On update,
	 * `null` removes the status; an unknown ID is a 400.
	 */
	implantationStatusId?: string | null;
}

export interface StructureCreateRequest extends IDataObject, StructureBaseFields {}

/** Body of `structure/edit-structure`: at least one of id / siret / name. */
export interface StructureUpdateRequest extends IDataObject, Partial<StructureBaseFields> {
	id?: string;
	create_if_missing?: boolean;
}

export interface StructureAddress extends IDataObject {
	id?: string;
	address1?: string | null;
	address2?: string | null;
	zipCode?: string | null;
	city?: string | null;
	country?: string | null;
}

/**
 * Structure as returned by `new-structure` and, again since November 2026,
 * under `structure` in the `edit-structure` envelope: the full record, its
 * `addresses`, and the main address flattened at the root (`address1`,
 * `zipCode`, `city`...).
 */
export interface StructureResponse extends IDataObject, StructureBaseFields {
	id: string;
	createdAt: string;
	updatedAt: string;
	addresses?: StructureAddress[];
	groups?: Array<{ id: string; name: string }>;
}

/** Envelope answered by `edit-structure` (200 on update, 201 when created). */
export interface StructureEditResponse extends IDataObject {
	message: string;
	success: boolean;
	/** True when Create If Missing created the record. */
	created: boolean;
	structure: StructureResponse | null;
}
