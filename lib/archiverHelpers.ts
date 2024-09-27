import * as Archiver from "archiver";
import { webResponseToNodeStream } from "./webToNodeStream";

export function fileSync(archive: Archiver.Archiver, filename: string, data: Archiver.EntryData) {
    return new Promise<void>((resolve, reject) => {
        archive.once("entry", () => {
            resolve();
        });

        archive.file(filename, data);
    });
}

export function dirSync(archive: Archiver.Archiver, dirPath: string, destPath: false | string) {
    return new Promise<void>((resolve, reject) => {
        archive.once("entry", () => {
            resolve();
        });

        archive.directory(dirPath, destPath);
    });
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