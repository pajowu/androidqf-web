import { Encrypter } from "age-encryption";

export function isValidAgeRecipient(recipient: string): boolean {
	const e = new Encrypter();
	try {
		e.addRecipient(recipient);
		return true;
	} catch (e) {
		return false;
	}
}
