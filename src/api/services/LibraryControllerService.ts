/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */
import type { LibraryItemDto } from '../models/LibraryItemDto';

import type { CancelablePromise } from '../core/CancelablePromise';
import type { BaseHttpRequest } from '../core/BaseHttpRequest';

export class LibraryControllerService {

    constructor(public readonly httpRequest: BaseHttpRequest) {}

    /**
     * @returns any Default Response
     * @throws ApiError
     */
    public getLibraryView({
location,
orderId,
}: {
location: ('tender' | 'knowledgebase' | 'documents'),
orderId?: number,
}): CancelablePromise<{
items: Array<LibraryItemDto>;
isUploadEnabled?: (null | boolean);
}> {
        return this.httpRequest.request({
            method: 'GET',
            url: '/library/',
            query: {
                'location': location,
                'orderId': orderId,
            },
        });
    }

    /**
     * @returns any Default Response
     * @throws ApiError
     */
    public deleteLibraryItems({
requestBody,
}: {
requestBody: {
removedItems: Array<number>;
},
}): CancelablePromise<any> {
        return this.httpRequest.request({
            method: 'DELETE',
            url: '/library/',
            body: requestBody,
            mediaType: 'application/json',
        });
    }

}
