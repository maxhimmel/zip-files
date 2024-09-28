import { Archiver } from "archiver";
import { IArchiveResolver } from "./iarchiveResolver";
import { fetchSync } from "../archiverHelpers";

export class URLResolver extends IArchiveResolver {
    async append(archive: Archiver) {
        console.log(`Fetching URL: ${this.filepath}`);

        const url = new URL(this.filepath);
        const name = path.join(url.hostname, url.pathname);

        await fetchSync(archive, url, { name });
        console.log("Finished fetching URL");
    }
}