import { fileHelpers } from "../fileHelpers";
import { DirectoryResolver } from "./directoryResolver";
import { FileResolver } from "./fileResolver";
import { IArchiveResolver } from "./iarchiveResolver";
import { URLResolver } from "./urlResolver";

export class ArchiveResolverFactory {
    static create(filepath: string): IArchiveResolver {
        if (fileHelpers.isUrl(filepath)) {
            return new URLResolver(filepath);
        } else if (fileHelpers.isFile(filepath)) {
            return new FileResolver(filepath);
        } else if (fileHelpers.isDirectory(filepath)) {
            return new DirectoryResolver(filepath);
        } else {
            throw new Error(`Resolver type not implemented for '${filepath}'`);
        }
    }
}