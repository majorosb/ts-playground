export type Keyof <T, K extends keyof T> = K;
export const keyof = <T>() => <K extends keyof T>(key: K): Keyof<T, K> => key;