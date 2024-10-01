import { chalk } from "zx/.";

export function exitWithError(message: string) {
    console.error(chalk.red(message));
    process.exit(1);
}