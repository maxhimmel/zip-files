import { cd, chalk, minimist } from "zx/.";
import { exitWithError } from "./errorHelpers";

export interface IArgInput<T = any> {
    name: string;
    alias?: string | string[];
    default: T;
}

class CLIHelpers {
    // NOTE: I wish this could return inferred types but I dunno how
    getArgs<T extends IArgInput>(argOptions: { inputs: T[] }): {
        [K in T["name"]]: T["default"]
    } {
        const defaultValueLookup = this.createDefaultValuesLookup(argOptions);
        const { aliasMap, defaultMap } = this.createMinimistOptionMaps(argOptions);

        const rawArgs = minimist(process.argv.slice(2), {
            alias: aliasMap,
            default: defaultMap,
        });

        const result = {} as { [K in T["name"]]: T["default"] };
        result["_"] = rawArgs._;

        // Validate that the types and names of the arguments are correct
        for (const key in rawArgs) {
            const rawValue = rawArgs[key];
            const defaultValueType = defaultValueLookup[key];

            if (key === "_") {
                continue;
            }

            if (defaultValueType === undefined) {
                let errorMessage = `Unknown argument '${key}'\n`;
                errorMessage += chalk.bgRed(`Available arguments are:\n`);
                const args = argOptions.inputs.map((input) => {
                    const name = input.name;
                    const alias = input.alias
                        ? Array.isArray(input.alias)
                            ? (input.alias as string[]).join(", ")
                            : `${input.alias}`
                        : "";
                    return `  # ${name} ${alias ? `(${alias})` : ""}`;
                }).join("\n");
                errorMessage += `${args}`;
                exitWithError(errorMessage);
            }

            if (typeof rawValue !== defaultValueType) {
                exitWithError(`Expected '${key}' to be of type ${chalk.bgGreen(defaultValueType)} but got ${chalk.bgRed(typeof rawValue)}`);
            }

            result[key] = rawValue;
        }

        return result;
    }

    private createDefaultValuesLookup(argOptions: { inputs: IArgInput[] }) {
        const defaultValueLookup: { [key: string]: any } = {};
        for (const arg of argOptions.inputs) {
            const defaultType = typeof arg.default;
            defaultValueLookup[arg.name] = defaultType;

            if (!arg.alias) { continue; }

            if (Array.isArray(arg.alias)) {
                for (const alias of arg.alias) {
                    defaultValueLookup[alias] = defaultType;
                }
            }
            else {
                defaultValueLookup[arg.alias] = defaultType;
            }
        }
        return defaultValueLookup;
    }

    private createMinimistOptionMaps(argOptions: { inputs: IArgInput[] }) {
        const aliasMap: { [key: string]: string | string[] } = {};
        const defaultMap: { [key: string]: any } = {};

        for (const arg of argOptions.inputs) {
            if (arg.alias) {
                aliasMap[arg.name] = arg.alias;
            }

            defaultMap[arg.name] = arg.default;
        }

        return { aliasMap, defaultMap };
    }
}
export const cliHelpers = new CLIHelpers();

export function invokeAtDirectory<T>(directory: string, fn: () => T) {
    const navigator = new DirectoryNavigator();
    navigator.moveTo(directory);
    const result = fn();
    navigator.moveBack();
    return result;
}

export class DirectoryNavigator {
    private directoryHistory: string[] = [];

    moveTo(directory: string) {
        this.directoryHistory.push(process.cwd());
        cd(directory);
    }

    moveBack() {
        const previousDirectory = this.directoryHistory.pop();
        if (!previousDirectory) {
            exitWithError("No previous directory to move back to");
        }
        cd(previousDirectory);
    }

    moveBackToRoot() {
        if (this.directoryHistory.length === 0) {
            return this;
        }

        cd(this.directoryHistory[0]);
        this.directoryHistory = [];
    }
}