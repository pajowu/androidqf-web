import {
	ZipWriter,
	Uint8ArrayWriter,
	TextReader,
	BlobReader,
	SplitDataWriter,
	WritableWriter,
} from '@zip.js/zip.js';
import { Encrypter } from './encryption';

const MAX_CHUNK_SIZE = 1024 * 1024 * 512; // 512 MiB

class CallbackSink implements UnderlyingSink {
	closeCallback: (u1: Uint8Array) => void;
	_array: Uint8Array;
	_offset: number;
	constructor(closeCallback: (u1: Uint8Array) => void) {
		this.closeCallback = closeCallback;
		this._array = new Uint8Array(0);
		this._offset = 0;
	}
	write(chunk: Uint8Array) {
		if (this._offset + chunk.length > this._array.length) {
			const newArray = new Uint8Array(this._array.length + chunk.length);
			newArray.set(this._array);
			this._array = newArray;
		}
		this._array.set(chunk, this._offset);
		this._offset += chunk.length;
	}
	close() {
		this.closeCallback(this._array);
	}
}
class CallbackStream implements WritableWriter {
	writable: WritableStream<Uint8Array>;
	constructor(closeCallback: (u1: Uint8Array) => void) {
		this.writable = new WritableStream(new CallbackSink(closeCallback));
	}
}

type ChunkCallbackData = {
	idx: number;
};
type ChunkCallback = (a1: Uint8Array, data: ChunkCallbackData) => void;

export class Acquisition {
	zipWriter: ZipWriter<unknown>;
	ageRecipient: string | null;
	writers: Array<Uint8ArrayWriter>;
	chunkCallback: ChunkCallback;

	constructor(ageReciptient: string | null, chunkCallback: ChunkCallback) {
		this.writers = [];
		const zipFileWriter = new SplitDataWriter(this.arrayWriterGenerator(), MAX_CHUNK_SIZE);
		this.zipWriter = new ZipWriter(zipFileWriter, { level: 0 });
		this.ageRecipient = ageReciptient;
		this.chunkCallback = (arr, data) => chunkCallback(this.encryptIfNeeded(arr), data);
	}

	private async *arrayWriterGenerator(): AsyncGenerator<WritableWriter, boolean> {
		let idx = 0;
		while (true) {
			yield new CallbackStream((arr) => this.chunkCallback(arr, { idx }));
			idx += 1;
		}
	}

	public async addFileFromString(filename: string, content: string) {
		const doc = new TextReader(content);
		await this.zipWriter.add(filename, doc);
	}
	public async addFileFromBlob(filename: string, content: Blob) {
		const doc = new BlobReader(content);
		await this.zipWriter.add(filename, doc);
	}

	encryptIfNeeded(array: Uint8Array): Uint8Array {
		if (this.ageRecipient === null) {
			return array;
		} else {
			const e = new Encrypter();
			e.addRecipient(this.ageRecipient);
			return e.encrypt(array);
		}
	}

	public async close() {
		await this.zipWriter.close();
	}
}

export function addShellResultToAcquisition(
	result: { stdout: string; stderr: string; exit: number },
	acq: Acquisition,
	basename: string,
): Promise<unknown> {
	return Promise.all([
		acq.addFileFromString(`${basename}.txt`, result.stdout),
		acq.addFileFromString(`${basename}.stderr`, result.stderr),
		acq.addFileFromString(`${basename}.return_code`, result.exit.toString()),
	]);
}

export function getReadableStreamFromAsyncGenerator(
	gen: AsyncGenerator<ArrayBuffer>,
	errorCallback?: (e: Error) => void,
) {
	return new ReadableStream({
		async pull(controller) {
			try {
				const { value, done } = await gen.next();
				if (done) {
					controller.close();
				} else {
					controller.enqueue(new Uint8Array(value));
				}
			} catch (e) {
				if (errorCallback) {
					errorCallback(e as Error);
				}
				controller.close();
			}
		},
	});
}
