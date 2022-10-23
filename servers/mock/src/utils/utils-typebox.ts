import { TUnion, TLiteral, SchemaOptions, TSchema, TNull, TOptional, TUndefined, Kind, TNever, TNumber, TBoolean, TString } from "@sinclair/typebox";
import { Type } from "@sinclair/typebox";
import { FilterTuple } from "./filter-tuple";

type TStringUnion<T extends string[]> = TUnion<{[K in keyof T]: TLiteral<T[K] & string>}>;
type TPickOneFromUnion<T extends TUnion<TSchema[]>, TM extends TSchema> = TM extends T["anyOf"][number] ? TM extends TLiteral ? TM : TM : TNever;
type TOmitFromUnion<T extends TUnion<TSchema[]>, F extends TSchema> = { x: TUnion<FilterTuple<T["anyOf"], F>> }["x"];

export class TypeUtils {
    static StringUnion<T extends string[]>(literals: [...T], options?: SchemaOptions): TStringUnion<T> {
        const union = Type.Union(literals.map(literal => Type.Literal(literal)), options);
        return union as TUnion<{[K in keyof T]: TLiteral<T[K] & string>}>;
    };
    static Nullable<T extends TSchema>(item: T): TUnion<[TNull, T]> {
        return Type.Union([Type.Null(), item]);
    };
    static Untrusted<T extends TSchema>(item: T): TUnion<[TUndefined, T]> {
        return Type.Union([Type.Undefined(), item]);
    };
    static UntrustedNullable<T extends TSchema>(item: T): TUnion<[TNull, TUndefined, T]> {
        return Type.Union([Type.Null(), Type.Undefined(), item]);
    };
    /**
     * Makes a property optional and nullable, for backends where optionality and nullability is vaguely defined, and serialization issues could cause accidentally missing or null values
     * 
     * Same as Type.Optional(Type.Union([Type.Null(), item]));
     */
    static ApiUntrusted<T extends TSchema>(item: T): TOptional<TUnion<[TNull, TUndefined, T]>> {
        return Type.Optional(TypeUtils.UntrustedNullable(item));
    };

    static PickOneFromUnion<T extends TUnion<TSchema[]>, P extends TSchema>(union: T, pick: P): TPickOneFromUnion<T, P> {
        for (const item of union.anyOf) {
            const matching_Kind = item[Kind] === pick[Kind];
            if (matching_Kind) {
                if (isTypeLiteral(item) && isTypeLiteral(pick)) {
                    const matching_const = item.const === pick.const;
                    if (matching_const) return item as TPickOneFromUnion<T, P>;
                } else {
                    return item as TPickOneFromUnion<T, P>
                }
            };
        }
        return Type.Never() as TPickOneFromUnion<T, P>;
    };
    static PickOneFromStringUnion<S extends string[], TM extends S[number]>(union: TStringUnion<S>, pick: TM): TLiteral<TM> {
        const result = TypeUtils.PickOneFromUnion(union, Type.Literal(pick)) as TLiteral<TM> | TNever;
        if (result[Kind] === Type.Never()[Kind]) throw new Error("Tried to pick a string literal type from the StringUnion that doesn't exist in it");
        return result;
    };
    static OmitFromUnion<T extends TUnion<TSchema[]>, TM extends TSchema>(union: T, omit: TM): TOmitFromUnion<T, TM> {
        const afterOmit = union.anyOf.filter(item => {
            const matching_Kind = item[Kind] === omit[Kind];
            if (matching_Kind) {
                if (isTypeLiteral(item) && isTypeLiteral(omit)) {
                    const matching_const = item.const === omit.const;
                    return !matching_const;
                }
                return false;
            };
            return true;
        });
        const unionAfterOmit = Type.Union(afterOmit);
        return unionAfterOmit as TOmitFromUnion<T, TM>;
    };
    static OmitFromStringUnion<S extends string[], TM extends S[number]>(union: TStringUnion<S>, omit: TM): TOmitFromUnion<TStringUnion<S>, TLiteral<TM>> {
        const result = TypeUtils.OmitFromUnion(union, Type.Literal(omit));
        return result;
    };
};

function isTypeLiteral(item: TSchema): item is TLiteral {
    const _kind_Literal: TLiteral[typeof Kind] = "Literal";
    return item[Kind] === _kind_Literal;
};