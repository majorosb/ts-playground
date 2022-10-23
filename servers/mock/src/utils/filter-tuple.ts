export type FilterTuple<T extends unknown[], F> = T extends []
    ? []
    : T extends [infer Head, ...infer Rest]
        ? Head extends F
            ? [      ...FilterTuple<Rest, F>]
            : [Head, ...FilterTuple<Rest, F>]
        : T
;