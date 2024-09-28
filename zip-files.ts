#! ./node_modules/.bin/ts-node-esm

// NOTE: I had so much trouble getting this .ts file to run
// ...

import * as Archiver from "archiver";
import * as path from "path";
import * as fs from "fs";
import "zx/globals";
import { cliHelpers, IArgInput, invokeAtDirectory } from "./lib/cliHelpers";
import { fileHelpers } from "./lib/fileHelpers";
import { Readable } from "stream";
import { finished } from "stream/promises";
import { dirSync, fetchSync, fileSync } from "./lib/archiverHelpers";
import { webResponseToNodeStream } from "./lib/webToNodeStream";
import { IArchiveResolver } from "./lib/archiveResolvers/iarchiveResolver";
import { ArchiveResolverFactory } from "./lib/archiveResolvers/archiveResolverFactory";
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
            name: "filename",
            alias: "f",
            default: fileHelpers.getCurrentDirectoryName(),
        },
        {
            name: "targetDir",
            alias: "t",
            default: fileHelpers.getCurrentDirectoryPath(),
        },
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

    const outputPath = `${path.join(args["outputDir"], args["filename"])}.zip`;

    const zipController = new ZipController({
        outputPath,
        options: { zlib: { level: 9 } }
    });

    const filepaths = args["_"] as unknown as string[];
    for (const f of filepaths) {
        const archiveResolver = ArchiveResolverFactory.create(f);
        await zipController.append(archiveResolver);
    }

    await zipController.finalize();
})();