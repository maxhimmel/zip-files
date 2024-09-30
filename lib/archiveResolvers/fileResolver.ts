import { Archiver } from "archiver";
import { IArchiveResolver } from "./iarchiveResolver";
import { fileSync } from "../archiverHelpers";

export class FileResolver extends IArchiveResolver {
    async append(archive: Archiver) {
        console.log(`Adding file: ${this.filepath}`);
        await fileSync(archive, this.filepath, { name: path.basename(this.filepath) });
        console.log("Finished adding file");
    }
}