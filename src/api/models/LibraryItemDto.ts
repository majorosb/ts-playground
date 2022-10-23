/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */

export type LibraryItemDto = {
    id: number;
    type: ('folder' | 'file');
    parentId?: (null | number);
    name: string;
    documentId?: (null | number);
    documentUrl?: (null | string);
    description?: (null | string);
    creationTime?: (null | string);
    linkUrl?: (null | string);
};
