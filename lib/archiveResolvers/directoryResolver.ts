import * as Archiver from "archiver";
import { IArchiveResolver } from "./iarchiveResolver";

export class DirectoryResolver extends IArchiveResolver {
    async append(archive: Archiver.Archiver) {
        console.log(`Adding directory: ${this.filepath}`);
        await dirSync(archive, this.filepath, path.basename(this.filepath));
        console.log("Finished adding directory");
    }
}

export function dirSync(archive: Archiver.Archiver, dirPath: string, destPath: false | string) {
    return new Promise<void>((resolve, reject) => {
        archive.once("entry", () => {
            resolve();
        });

        archive.directory(dirPath, destPath);
    });
}