#! ./node_modules/.bin/ts-node-esm

// NOTE: I had so much trouble getting this .ts file to run
// ...

import * as path from "path";
import * as fs from "fs";
import { ArchiveResolverFactory } from "./lib/archiveResolvers/archiveResolverFactory";
import { cliHelpers, IArgInput } from "./lib/cliHelpers";
import { fileHelpers } from "./lib/fileHelpers";
import { ZipController } from "./lib/zipController";

// example inputs:
/*
/Users/maxymax/Repos/zip-files/tester
"/Users/maxymax/Repos/zip-files/tester/test magoo.txt"
https://raw.githubusercontent.com/maxhimmel/zip-files/refs/heads/main/lib/fileHelpers.ts

npx ts-node ./zip-files.ts /Users/maxymax/Repos/zip-files/tester "/Users/maxymax/Repos/zip-files/tester/test magoo.txt" https://raw.githubusercontent.com/maxhimmel/zip-files/refs/heads/main/lib/fileHelpers.ts
*/

const argOptions = {
    inputs: [
        {
            name: "outputDir",
            alias: "o",
            default: fileHelpers.getCurrentDirectoryPath(),
        },
    ] satisfies IArgInput[],
};

void (async function () {
    const args = cliHelpers.getArgs({
        inputs: argOptions.inputs,
    });

    const outputStream = fs.createWriteStream(
        `${path.join(args["outputDir"], args["filename"])}.zip`
    );

    const zipController = new ZipController({
        outputStream,
        options: { zlib: { level: 9 } }
    });

    const filepaths = args["_"] as unknown as string[];
    for (const f of filepaths) {
        const archiveResolver = ArchiveResolverFactory.create(f);
        await zipController.append(archiveResolver);
    }

    await zipController.finalize();
})();