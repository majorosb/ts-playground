/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */

import type { LibraryItemDto } from './LibraryItemDto';

export type LibraryViewDto = {
    items: Array<LibraryItemDto>;
    isUploadEnabled?: (null | boolean);
};
