#!/usr/bin/env node --no-warnings
import * as JCS from "json-canonicalize"

if (process.stdin.isTTY) throw new Error('Please pipe JSON to stdin to generate a did:ni')

await main({ stdin: process.stdin, canonicalize: JCS.canonicalize, console })

// create a did:ni from stdin json and print the did:ni to console
async function main(
  imports: {
    stdin: AsyncIterable<Uint8Array>
    canonicalize: (doc: unknown) => string
    console: Console
  }
) {
  imports.console.log(await createDidNi(imports))
}

// given a did doc like input, return a did:ni
async function createDidNi(
  imports: {
    stdin: AsyncIterable<Uint8Array>,
    canonicalize: (doc: unknown) => string
  }
): Promise<`did:ni:${string}`> {
  const streamToResponse = (stream: AsyncIterable<Uint8Array>) => new Response(new ReadableStream({
    async pull(c) {
      for await (const chunk of stream) c.enqueue(chunk)
      c.close() 
    }
  }))
  const docResponse = streamToResponse(imports.stdin)
  const docObject = JSON.parse(await docResponse.text())
  const docCanonicalized = imports.canonicalize(docObject)
  const sha256Hash = await crypto.subtle.digest('SHA-256', new TextEncoder().encode(docCanonicalized))
  const sha256Base64url = base64urlEncode(new Uint8Array(sha256Hash))
  const didNi = `did:ni:sha-256:${sha256Base64url}` as const
  return didNi
}

function base64urlEncode (b: Uint8Array) { return btoa(String.fromCharCode(...b)).replace(/\+/g,'-').replace(/\//g,'_').replace(/=/g,'') }
