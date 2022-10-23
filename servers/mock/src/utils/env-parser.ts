export type EnvSource_SetFrom = "environment" | "default" | "environment (mapped to type)";
type EnvProcRet<TKey extends string, R = string> = (ENV_KEY: TKey) => { value: R, setFrom: EnvSource_SetFrom };

function envDefault<TKey extends string, R = string, SD = string>(defaultValue: SD): EnvProcRet<TKey, SD>
function envDefault<TKey extends string, R = string>(defaultValue: R, mapEnvVarToDefaultType: (val: string) => R): EnvProcRet<TKey, R>
function envDefault<TKey extends string, R = string>(defaultValue: R, mapEnvVarToDefaultType?: (val: string) => R): EnvProcRet<TKey, R> {
    return (ENV_KEY) => {
        const ENV_VAL = process.env[ENV_KEY];
        if (ENV_VAL === void 0) return { value: defaultValue, setFrom: "default" };
        else return mapEnvVarToDefaultType
            ? { value: mapEnvVarToDefaultType(ENV_VAL) as R, setFrom: "environment (mapped to type)" }
            : { value: ENV_VAL as any as R, setFrom: "environment" }
        ;
    }
}

type EnvMap<TObj> = { [K in keyof TObj]: EnvProcRet<K & string, any> };

type EnvMapParsed<TEnvMap extends EnvMap<any>> = { x: { [K in keyof TEnvMap]: TEnvMap[K] extends EnvProcRet<infer TKey, infer R> ? R : never }}["x"];
type EnvSource<TEnvMap extends EnvMap<any>> = { x: { [K in keyof TEnvMap]: EnvSource_SetFrom }}["x"];

type EnvMapRet<TEnvMap extends EnvMap<any>> = { ENV_PARSED: EnvMapParsed<TEnvMap>, ENV_SOURCE: EnvSource<TEnvMap> };

function envParse<TEnvMap extends EnvMap<TEnvMap>>(t: TEnvMap): EnvMapRet<TEnvMap> {
    const ENV_PARSED = {} as EnvMapParsed<TEnvMap>;
    const ENV_SOURCE = {} as EnvSource<TEnvMap>;
    for (const [key, _envProcCurried] of Object.entries(t as EnvMap<any>)) {
        const result = _envProcCurried(key);
        ENV_PARSED[key as keyof TEnvMap] = result.value;
        ENV_SOURCE[key as keyof TEnvMap] = result.setFrom;
    }
    return { ENV_PARSED, ENV_SOURCE };
};

export function useEnvParser() {
    return { ENV_PARSE_MAP: envParse, ENV_DEFAULT: envDefault };
};

function sandbox() {
    const { ENV_PARSE_MAP, ENV_DEFAULT } = useEnvParser();
    const { ENV_PARSED, ENV_SOURCE } = ENV_PARSE_MAP({
        MYKEY: ENV_DEFAULT(""),
        MYOTHERKEY: ENV_DEFAULT(1, env => Number.parseInt(env)),
        MYNEWKEY: ENV_DEFAULT("0", () => "1"),
    });
}