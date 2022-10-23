export type IdSource = {
    curr(): number,
    next(): number,
    reset(): number,
};
export function useIdSource(start: number, step: number): IdSource {
    let _id: number = start;
    return {
        curr: () => _id,
        next: () => { const curr = _id; _id += step; return curr; },
        reset: () => { _id = start; return _id; },
    };
};