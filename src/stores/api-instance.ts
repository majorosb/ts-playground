import { defineStore } from "pinia";
import { EffectScope, getCurrentScope, markRaw, onScopeDispose, ref } from "vue";
import { ApiError, AppClient, CancelablePromise } from "src/api";
import { FetchHttpRequest } from "src/api/core/FetchHttpRequest"
import { ApiRequestOptions } from "src/api/core/ApiRequestOptions";

const storeId = "api";

export interface IStore_Api {

};

/**
 * TODO: Seeing less and less reasons for this to be a store, should probably be a "useApi" composable with its own effectScope instead?
 * Pinia stores do however have the benefit of being singletons out-of-the-box, and state could be useful later
 */
export const useApi = defineStore(storeId, () => {
    const initialState: IStore_Api = {

    };
    const state = ref(initialState);

    type ApiErrorHandler = (error: { type: "net", error: Error } | { type: "api", error: ApiError }, requestOptions: ApiRequestOptions) => void;
    const errorHandlers: Set<ApiErrorHandler> = new Set();

    const watchRequestErrors = markRaw((handler: ApiErrorHandler) => {

        const _makeHandlerWithCallerScope = (fn: ApiErrorHandler, s: EffectScope): ApiErrorHandler => (...args) => s.run(() => fn(...args));

        /**
         * The scope that calls `watchRequestErrors()` is the current scope, if it exists.
         * NOT the scope of `defineStore()`!
         * If it exists, the handler is ran in the scope, to allow running reactive effects at the call site
         */
        const scopeOfCaller = getCurrentScope();
        const usedHandler: ApiErrorHandler = scopeOfCaller ? _makeHandlerWithCallerScope(handler, scopeOfCaller) : handler;
        errorHandlers.add(usedHandler);

        onScopeDispose(() => { errorHandlers.delete(usedHandler); });
    });

    class CustomFetchHttpRequest extends FetchHttpRequest {

        public override request<T>(options: ApiRequestOptions): CancelablePromise<T> {
            return new CancelablePromise(async (resolve, reject, onCancel) => {
                try {
                    const res: CancelablePromise<T> = super.request(options);
                    onCancel(res.cancel);
                    resolve(await res);
                } catch (error) {
                    if (error instanceof ApiError) for (const handler of errorHandlers) handler({ type: "api", error }, options);
                    reject(error);
                }
            });
        }
    };

    /** TODO: make a custom one that has interception support */
    const HttpRequestImplementationConstructor = CustomFetchHttpRequest;

    const appClient = new AppClient({
        BASE: `/api`,
    }, HttpRequestImplementationConstructor);

    const { request, fastifyInternal, ..._controllers } = appClient;
    const controllers = markRaw(_controllers);

    return {
        state,

        ...controllers,

        /**
         * Register callbacks, invoked when any request on any controller errors.
         *
         * TODO: Connectivity errors aren't caught, fix this, rename
         *
         * If called inside an {@link EffectScope} (e.g. a component, or a Pinia store's `defineStore()`),
         * the handler function will be ran inside that scope too,
         * allowing reactive effects to be used safely (like `watch()`, `computed()`, etc)
         */
        watchRequestErrors,
    };
});
