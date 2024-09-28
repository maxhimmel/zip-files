import { Archiver } from "archiver";
import { IArchiveResolver } from "./iarchiveResolver";
import { dirSync } from "../archiverHelpers";

export class DirectoryResolver extends IArchiveResolver {
    async append(archive: Archiver) {
        console.log(`Adding directory: ${this.filepath}`);
        await dirSync(archive, this.filepath, path.basename(this.filepath));
        console.log("Finished adding directory");
    }
}