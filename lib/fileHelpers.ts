import * as path from "path";
import * as fs from "fs";

export type FileType = "file" | "directory";

class FileHelpers {
    getFilesInCurrentDirectory() {
        return this.getFilesInDirectory(this.getCurrentDirectoryPath());
    }

    getFilesInDirectory(directory: string) {
        return fs
            .readdirSync(directory, { withFileTypes: true, recursive: false })
            .map((dirent) => {
                return {
                    name: dirent.name,
                    absolutePath: path.resolve(directory, dirent.name),
                    fileType: (dirent.isDirectory() ? "directory" : "file") as FileType,
                };
            });
    }

    getCurrentDirectoryPath() {
        return process.cwd();
    }

    getCurrentDirectoryName() {
        return path.basename(process.cwd());
    }

    isFile(filePath: string) {
        try {
            return fs.statSync(filePath).isFile();
        } catch (err) {
            console.error(err);
            return false;
        }
    }

    isDirectory(filePath: string) {
        try {
            return fs.statSync(filePath).isDirectory();
        } catch (err) {
            console.error(err);
            return false;
        }
    }

    isUrl(filePath: string) {
        try {
            new URL(filePath);
            return true;
        } catch (_) {
            return false;
        }
    }
}

export const fileHelpers = new FileHelpers();