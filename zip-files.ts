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

    const outputZip = fs.createWriteStream(outputPath);
    const archive = Archiver.create("zip", {
        zlib: { level: 9 }
    });

    // listen for all archive data to be written
    // 'close' event is fired only when a file descriptor is involved
    outputZip.on('close', function () {
        console.log(archive.pointer() + ' total bytes');
        console.log('archiver has been finalized and the output file descriptor has closed.');
    });

    // good practice to catch warnings (ie stat failures and other non-blocking errors)
    archive.on('warning', function (err) {
        if (err.code === 'ENOENT') {
            console.warn(err);
        } else {
            // throw error
            throw err;
        }
    });

    // good practice to catch this error explicitly
    archive.on('error', function (err) {
        throw err;
    });

    archive.pipe(outputZip);

    const filepaths = args["_"] as unknown as string[];
    for (const f of filepaths) {
        const archiveResolver = ArchiveResolverFactory.create(f);
        await archiveResolver.append(archive);
    }

    console.log("Finalizing archive ...");
    await archive.finalize();
})();