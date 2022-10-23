/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */
import type { CancelablePromise } from '../core/CancelablePromise';
import type { BaseHttpRequest } from '../core/BaseHttpRequest';

export class FastifyInternalService {

    constructor(public readonly httpRequest: BaseHttpRequest) {}

    /**
     * @returns any Default Response
     * @throws ApiError
     */
    public getRestart(): CancelablePromise<any> {
        return this.httpRequest.request({
            method: 'GET',
            url: '/__restart',
        });
    }

}
