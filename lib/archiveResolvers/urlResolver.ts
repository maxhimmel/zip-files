import * as Archiver from "archiver";
import * as path from "path"
import { IArchiveResolver } from "./iarchiveResolver";
import { webResponseToNodeStream } from "../webToNodeStream";
export class URLResolver extends IArchiveResolver {
    async append(archive: Archiver.Archiver) {
        console.log(`Fetching URL: ${this.filepath}`);

        const url = new URL(this.filepath);
        const name = path.join(url.hostname, url.pathname);

        await fetchSync(archive, url, { name });
        console.log("Finished fetching URL");
    }
}

export async function fetchSync(
    archive: Archiver.Archiver,
    url: string | URL,
    data?: Archiver.EntryData | Archiver.ZipEntryData | Archiver.TarEntryData) {

    const response = await fetch(url);
    const webStream = webResponseToNodeStream(response);

    return new Promise<void>((resolve, reject) => {
        archive.once("entry", () => {
            resolve();
        });

        archive.append(webStream, data);
    });
}