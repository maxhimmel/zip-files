import { Readable } from 'stream';
import { ReadableStream } from "stream/web";

export function webResponseToNodeStream(response: Response) {
    return Readable.fromWeb(response.body as ReadableStream);
}