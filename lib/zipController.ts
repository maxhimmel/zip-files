import * as Archiver from "archiver";
import * as fs from "fs";
import { IArchiveResolver } from "./archiveResolvers/iarchiveResolver";

export class ZipController {
    private outputZip: fs.WriteStream;
    private archive: Archiver.Archiver;
    private isClosed: boolean = false;

    constructor({ outputPath, options }: {
        outputPath: string;
        options?: Archiver.ArchiverOptions
    }) {
        this.outputZip = fs.createWriteStream(outputPath);
        this.archive = Archiver.create("zip", options);

        this.archive.on('warning', this.handleError.bind(this));
        this.archive.on('error', this.handleError.bind(this));

        this.outputZip.on('close', this.handleClose.bind(this));

        this.archive.pipe(this.outputZip);
    }

    private handleError(error: Archiver.ArchiverError) {
        if (error.code === 'ENOENT') {
            console.warn(error);
        } else {
            throw error;
        }
    }

    private handleClose() {
        this.isClosed = true;
        console.log(chalk.green(this.archive.pointer() + ' total bytes'));
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
        this.archive.finalize();

        while (!this.isClosed) {
            await new Promise<void>((resolve) => setTimeout(() => {
                resolve();
            }, 0));
        }
    }
}