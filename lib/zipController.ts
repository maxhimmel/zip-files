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

        // do i hafta do "self" here as a workaround for not being able to use "this" inside the lamda below?
        const self = this;
        this.outputZip.on('close', function () {
            self.isClosed = true;
            console.log(self.archive.pointer() + ' total bytes');
        });

        this.archive.on('warning', function (err) {
            if (err.code === 'ENOENT') {
                console.warn(err);
            } else {
                throw err;
            }
        });

        this.archive.on('error', function (err) {
            throw err;
        });

        this.archive.pipe(this.outputZip);
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
        console.log("Finalizing archive ...");
        this.archive.finalize();

        while (!this.isClosed) {
            await new Promise<void>((resolve) => setTimeout(() => {
                resolve();
            }, 0));
        }
    }
}