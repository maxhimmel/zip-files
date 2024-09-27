#! ./node_modules/.bin/ts-node-esm

// NOTE: I had so much trouble getting this .ts file to run
// ...

import * as Archiver from "archiver";
import * as path from "path";
import "zx/globals";
import { cliHelpers, IArgInput, invokeAtDirectory } from "./lib/cliHelpers";
import { fileHelpers } from "./lib/fileHelpers";
import { Readable } from "stream";

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
    const filePaths = args["_"] as unknown as string[];
    const { urls, files, directories } = parseFileTypes(filePaths);

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

    // This event is fired when the data source is drained no matter what was the data source.
    // It is not part of this library but rather from the NodeJS Stream API.
    // @see: https://nodejs.org/api/stream.html#stream_event_end
    outputZip.on('end', function () {
        console.log('Data has been drained');
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

    for (const f of files) {
        console.log(`Adding file: ${f}`);
        archive.file(f, { name: path.basename(f) });
        // zip.addLocalFile(f);
    }
    for (const d of directories) {
        console.log(`Adding directory: ${d}`);
        archive.directory(d, path.basename(d));
        // zip.addLocalFolder(d);
    }

    for (const u of urls) {
    }

    console.log("Finalizing archive ...");
    await archive.finalize();

    // const targetDir = args["targetDir"];
    // const outputPath = `${path.join(args["outputDir"], args["filename"])}.zip`;
    // const files = fileHelpers.getFilesInDirectory(targetDir);

    // console.log(chalk.bgGreen(`Zipping ${files.length} files to ${outputPath}`));

    // const zip = invokeAtDirectory(targetDir, () => {
    //     const zip = new AdmZip();

    //     console.log(chalk.greenBright(`Adding ${targetDir}`));
    //     zip.addLocalFolder(".");

    //     return zip;
    // });

    // console.log(chalk.greenBright(`Writing ${outputPath} ...`));
    // zip.writeZip(outputPath);

    // console.log(chalk.bgGreen("Zipped!"));
})();

function parseFileTypes(filePaths: string[]) {
    const urls = [] as string[];
    const files = [] as string[];
    const directories = [] as string[];

    for (const filePath of filePaths) {
        if (fileHelpers.isUrl(filePath)) {
            urls.push(filePath);
        } else if (fileHelpers.isFile(filePath)) {
            files.push(filePath);
        } else if (fileHelpers.isDirectory(filePath)) {
            directories.push(filePath);
        }
    }

    return { urls, files, directories };
}