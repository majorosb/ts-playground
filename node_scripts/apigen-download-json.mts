import fs from "fs";
import path from "path";
import fetch from 'node-fetch';
import type { JsonObject } from "type-fest";
import * as url from 'url';

const __filename = url.fileURLToPath(import.meta.url);
const __dirname = url.fileURLToPath(new URL('.', import.meta.url));

(async () => {
    const SERVER_MOCK_PORT = 9500;
    const URL_API_DOCS_JSON = `http://localhost:${SERVER_MOCK_PORT}/documentation/json` as const;
    const FILE_API_DOCS_JSON = "api-docs.json";
    try {
        const response = await fetch(URL_API_DOCS_JSON);
        const data: JsonObject = await response.json() as JsonObject;
        const prettified = JSON.stringify(data, null, 4);
        const outputPath = path.join(__dirname, `../src/api/_source/${FILE_API_DOCS_JSON}`);
        fs.writeFileSync(outputPath, prettified);
    } catch (error) {
        console.error(error);
        console.log("Failed to fetch api documentation from mock server. Make sure the mock server is running.");
        process.exit(1);
    }
})();
