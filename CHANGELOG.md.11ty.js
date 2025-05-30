import { readFile } from "node:fs/promises";

const mdPath = new URL('./CHANGELOG.md', import.meta.url);
const md = new Blob([await readFile(mdPath)])

export default class Test {
	// or `async data() {`
	// or `get data() {`
	data() {
		return {
      permalink: '/CHANGELOG.md',
		};
	}

	async render({ name }) {
		// will always be "Ted"
		const text = await md.text()
    return text
	}
}