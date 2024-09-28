import { Archiver } from "archiver";

export abstract class IArchiveResolver {
    protected filepath: string;

    constructor(filepath: string) {
        this.filepath = filepath;
    }

    abstract append(archive: Archiver): Promise<void>;
}