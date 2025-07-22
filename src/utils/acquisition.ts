import {
	ZipWriter,
	TextReader,
} from '@zip.js/zip.js';
import { Encrypter } from 'age-encryption';
import { AdbClient } from 'wadb';

export class Acquisition {
	private zipWriter: ZipWriter<unknown>;

	constructor(output: WritableStream, ageRecipient: string | null) {
		let writer: WritableStream;
		if (ageRecipient !== null) {
			const identityStream = new TransformStream();
			const encryptor = new Encrypter();
			encryptor.addRecipient(ageRecipient);
			encryptor.encrypt(identityStream.readable).then(x => x.pipeTo(output));
			writer = identityStream.writable;
		} else {
			writer = output;
		}
		this.zipWriter = new ZipWriter(writer);
	}

	public async addFileFromReadableStream(filename: string, content: ReadableStream) {
		return await this.zipWriter.add(filename, content)
	}

	public async addFileFromString(filename: string, content: string) {
		const doc = new TextReader(content);
		await this.zipWriter.add(filename, doc);
	}

	public async close() {
		await this.zipWriter.close();
	}
}

function addShellResultToAcquisition(
	result: { stdout: ReadableStream; stderr: ReadableStream; exitCode: Promise<number> },
	acq: Acquisition,
	basename: string,
): Promise<unknown> {
	return Promise.all([
		acq.addFileFromReadableStream(`${basename}.txt`, result.stdout),
		acq.addFileFromReadableStream(`${basename}.stderr`, result.stderr),
		result.exitCode.then((exit) => { acq.addFileFromString(`${basename}.return_code`, exit.toString()) }),
	]);
}

export async function runShellAndAddToAcquisition(
	acq: Acquisition,
	client: AdbClient,
	cmd: string,
	basename: string,
) {
	try {
		const result = await client.shellV2(cmd);
		await addShellResultToAcquisition(result, acq, basename);
	} catch (e) {
		console.warn("shellv2 failed", e);
		const result = await client.shell(cmd);
		await acq.addFileFromString(`${basename}.txt`, result);
	}
}
