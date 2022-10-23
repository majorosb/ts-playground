import { fastify as _fastify } from "fastify";
import fastifyCookie from "@fastify/cookie";
import fastifyAuth from "@fastify/auth";
import fastifySwagger from "@fastify/swagger";
import fastifySwaggerUi from "@fastify/swagger-ui";
import { plugin_restart } from "./restart/restart";
import { useEnvParser } from "./utils/env-parser";
import type { TypeBoxTypeProvider } from "@fastify/type-provider-typebox";
import * as path from "path";
import { plugin_controller_library } from "./controllers/library";

const { ENV_PARSE_MAP, ENV_DEFAULT } = useEnvParser();

const { ENV_PARSED, ENV_SOURCE } = ENV_PARSE_MAP({
    PORT: ENV_DEFAULT(9500, env_var => Number.parseInt(env_var)),
});

const {
    PORT,
} = ENV_PARSED;

;(async function main() {

    console.log("Starting mock server...");
    console.log("Startup params:", {
        parsed: ENV_PARSED,
        from: ENV_SOURCE,
    });

    const fastify = _fastify({
        logger: {
            transport: {
                target: "pino-pretty",
                options: {
                    translateTime: "SYS:yyyy-mm-dd HH:MM:ss.l o",
                    ignore: "pid,hostname",
                },
            },
        },
    }).withTypeProvider<TypeBoxTypeProvider>();

    const cookieSecret = "DHzr5IItbd0alz69o_PkJ";
    fastify.register(fastifyCookie, {
        secret: cookieSecret,
        parseOptions: {},
    });
    fastify.register(fastifyAuth);

    const openapiRoutePrefix = "/documentation";
    fastify.register(fastifySwagger, {
        stripBasePath: false,
        /**
         * Fixes having def-{counter} formatted names for schemas instead of the actual schema names.
         * https://github.com/fastify/fastify-swagger/issues/364
         * https://github.com/Eomm/json-schema-resolver/pull/4
         * https://github.com/Eomm/json-schema-resolver/pull/5
         * https://github.com/fastify/fastify-swagger/pull/459
         * https://github.com/fastify/fastify-swagger#managing-your-refs
         */
        refResolver: {
            buildLocalReference(json, baseUri, fragment, i) {
                return (json.$id as string) || `my-fragment-${i}`;
            }
        },
        openapi: {
            info: {
                title: 'Bors stuff',
                description: 'Bors stuff',
                version: '0.1.0',
            },
            externalDocs: {
                url: 'https://swagger.io/specification/',
                description: 'Find more info here',
            },
        },
    });
    fastify.register(fastifySwaggerUi, {
        routePrefix: openapiRoutePrefix,
        uiConfig: {
            docExpansion: 'list', // can be "list", "full", "none"
            deepLinking: false,
            displayOperationId: true,
        },
    });

    fastify.register(plugin_restart);

    fastify.register(plugin_controller_library);

    try {
        await fastify.listen({ port: PORT, host: "::" }); // :: is the IPv6-inclusive version of 0.0.0.0 ("listen on every available network interface")
        const link = `http://localhost:${ PORT }`;
        fastify.log.info(`Mock server OpenAPI v3 Swagger UI: ${link}${openapiRoutePrefix}`);
    } catch (err: any) {
        fastify.log.error(err);
        process.exit(1);
    }

})().catch(
    /** Avoids not terminating due to "UnhandledPromiseRejectionWarning" */
    (error) => { console.error(error); }
);
