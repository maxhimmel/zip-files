import * as Archiver from "archiver";
import * as fs from "fs";
import { IArchiveResolver } from "./archiveResolvers/iarchiveResolver";
import { finished } from "stream/promises"
import { chalk } from "zx/.";

export class ZipController {
    private archive: Archiver.Archiver;
    private onClosed: Promise<void>;

    constructor({ outputStream, options }: {
        outputStream: fs.WriteStream;
        options?: Archiver.ArchiverOptions
    }) {
        this.archive = Archiver.create("zip", options);

        this.archive.on('warning', this.handleError.bind(this));
        this.archive.on('error', this.handleError.bind(this));

        this.onClosed = finished(outputStream);

        this.archive.pipe(outputStream);
    }

    private handleError(error: Archiver.ArchiverError) {
        if (error.code === 'ENOENT') {
            console.warn(error);
        } else {
            throw error;
        }
    }

    async appendGroup(resolvers: IArchiveResolver[]) {
        for (const r of resolvers) {
            await this.append(r);
        }
    }

    async append(resolver: IArchiveResolver) {
        await resolver.append(this.archive);
    }

    async finalize() {
        console.log(chalk.bgGreenBright("Finalizing archive ..."));
        await this.archive.finalize();

        return await this.onClosed;
    }
}