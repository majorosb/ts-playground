import { FastifyInstance, FastifyPluginCallback } from "fastify";
import * as fs from "fs";
import * as path from "path";

export const plugin_restart: FastifyPluginCallback = (fastify, opts, done) => {
    registerController_restart(fastify);
    done();
};

function registerController_restart(fastify: FastifyInstance) {
    const tags = ["_fastify-internal"];

    restart();

    /**
     * Changes a file to exploit nodemon's restart-on-file-change mechanism
     */
    function restart() {
        return fastify.get(
            '/__restart',
            {
                schema: {
                    tags,
                },
            },
            async (request, reply) => {
                rewriteWatchFile();
                return reply.send(`${new Date().toLocaleString('sv', { timeZoneName: 'short' })}: Restarting...`);
            }
        );
    };

};

function rewriteWatchFile() {
    const filePath = path.resolve(__dirname, "./_watch-file.ts");
    fs.writeFileSync(filePath, fs.readFileSync(filePath));
};