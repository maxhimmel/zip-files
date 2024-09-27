import * as Archiver from "archiver";

export function fileSync(archive: Archiver.Archiver, filename: string, data: Archiver.EntryData) {
    return new Promise<void>((resolve, reject) => {
        let isStreaming = true;
        archive.once("entry", () => {
            isStreaming = false;
            resolve();
        });

        archive.file(filename, data);
    });
}

export function dirSync(archive: Archiver.Archiver, dirPath: string, destPath: false | string) {
    return new Promise<void>((resolve, reject) => {
        let isStreaming = true;
        archive.once("entry", () => {
            isStreaming = false;
            resolve();
        });

        archive.directory(dirPath, destPath);
    });
}