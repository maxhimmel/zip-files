import * as path from "path";

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
}

export const fileHelpers = new FileHelpers();