#! ./node_modules/.bin/ts-node-esm

import * as AdmZip from "adm-zip";
import * as path from "path";
import "zx/globals";
import { cliHelpers, IArgInput, invokeAtDirectory } from "./lib/cliHelpers";
import { fileHelpers } from "./lib/fileHelpers";

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

    const targetDir = args["targetDir"];
    const outputPath = `${path.join(args["outputDir"], args["filename"])}.zip`;
    const files = fileHelpers.getFilesInDirectory(targetDir);

    console.log(chalk.bgGreen(`Zipping ${files.length} files to ${outputPath}`));

    const zip = invokeAtDirectory(targetDir, () => {
        const zip = new AdmZip();

        console.log(chalk.greenBright(`Adding ${targetDir}`));
        zip.addLocalFolder(".");

        return zip;
    });

    console.log(chalk.greenBright(`Writing ${outputPath} ...`));
    zip.writeZip(outputPath);

    console.log(chalk.bgGreen("Zipped!"));
})();