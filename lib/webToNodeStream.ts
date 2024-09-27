import { Readable } from 'stream';

export function webResponseToNodeStream(response: Response) {
    // return Readable.fromWeb(response.body); // why doesn't this work?!
    return Readable.from(generateChunks(response.body));
}

async function* generateChunks(webStream: ReadableStream) {
    const reader = webStream.getReader();
    while (true) {
        const { done, value } = await reader.read();
        if (done) break;
        yield value;
    }
}