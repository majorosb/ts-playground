import type { TypeBoxTypeProvider } from "@fastify/type-provider-typebox";
import type { FastifyBaseLogger, FastifyInstance, FastifyRegisterOptions } from "fastify";
import type { IncomingMessage, Server, ServerResponse } from "http";

type FastifyInstanceWithTypebox = FastifyInstance<Server, IncomingMessage, ServerResponse, FastifyBaseLogger, TypeBoxTypeProvider>;
/** Provides a fastify instance with the TypeBox type provider, for use with {@link registerController}  */
export function makeController(cb: (fastify: FastifyInstanceWithTypebox) => void): typeof cb { return cb };
/** Registers a controller with the TypeBox type provider, for use with {@link makeController} */
export function registerController(
    fastify: FastifyInstance,
    cb: (fastifyWithTypebox: FastifyInstanceWithTypebox) => void,
    opts?: FastifyRegisterOptions<Record<never, never>>,
) {
    const fastifyWithTypebox = fastify.withTypeProvider<TypeBoxTypeProvider>();
    return fastifyWithTypebox.register((_fastify: typeof fastifyWithTypebox, _opts, done) => {
        cb(_fastify);
        done();
    }, opts);
};