import * as Archiver from "archiver";

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