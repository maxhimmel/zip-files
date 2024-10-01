import * as Archiver from "archiver";
import * as path from "path"
import { IArchiveResolver } from "./iarchiveResolver";

export class FileResolver extends IArchiveResolver {
    async append(archive: Archiver.Archiver) {
        console.log(`Adding file: ${this.filepath}`);
        await fileSync(archive, this.filepath, { name: path.basename(this.filepath) });
        console.log("Finished adding file");
    }
}

export function fileSync(archive: Archiver.Archiver, filename: string, data: Archiver.EntryData) {
    return new Promise<void>((resolve, reject) => {
        archive.once("entry", () => {
            resolve();
        });

        archive.file(filename, data);
    });
}