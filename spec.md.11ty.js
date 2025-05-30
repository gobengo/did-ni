import { readFile } from "node:fs/promises";

const specMdPath = new URL('./spec.md', import.meta.url);
const specMd = new Blob([await readFile(specMdPath)])

export default class Test {
	// or `async data() {`
	// or `get data() {`
	data() {
		return {
      permalink: '/spec.md',
		};
	}

	async render({ name }) {
		// will always be "Ted"
		const text = await specMd.text()
    console.debug('text', text)
    return text
	}
}