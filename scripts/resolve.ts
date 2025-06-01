#!/usr/bin/env node --no-warnings
import { realpathSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { parseArgs } from "node:util";
import { createDidNi } from "./did-ni.ts";

export async function resolveDidNi({ did, doc }: { did: string, doc: object }) {
  if (typeof doc === 'string') {
    doc = JSON.parse(doc);
  }
  const didForDoc = await createDidNi({ stdin: JSON.stringify(doc) })
  if (didForDoc !== did) {
    throw new Error(`The doc MUST match the hash in the DID`, {
      cause: { did, doc, didForDoc, }
    })
  }
  const didDocumentMetadata = {}
  const didResolutionMetadata = {}
  const didDocument = {
    ...doc,
    id: did,
  }
  return {
    didDocument,
    didDocumentMetadata,
    didResolutionMetadata,
  }
}

async function main(...argv: string[]) {
  const { values, positionals } = parseArgs({
    options: {
      did: { type: 'string' },
      doc: { type: 'string' },
      help: { type: 'boolean', short: 'h' },
    }
  })
  const logHelp = () => console.log(`Usage: ./resolve.ts --did <did> --doc <doc>`)
  if (values.help) {
    logHelp()
    return
  }
  const { did } = values
  if (!did) {
    console.error('--did is required')
    logHelp()
    process.exit(1)
  }
  const { doc: docString } = values
  if (!docString) {
    console.error('--doc is required')
    logHelp()
    process.exit(1)
  }
  const doc = JSON.parse(docString)
  const resolution = await resolveDidNi({ did, doc })
  console.log(JSON.stringify(resolution, null, 2))
}

if (realpathSync(process.argv[1]) === fileURLToPath(import.meta.url)) {
  main().catch(error => { console.error('error running main', error); process.exit(1) })
}
