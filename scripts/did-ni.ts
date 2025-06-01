import * as JCS from "json-canonicalize"

// given a did doc like input, return a did:ni
export async function createDidNi(
  imports: {
    stdin: string | AsyncIterable<Uint8Array>,
    canonicalize?: (doc: unknown) => string
  }
): Promise<`did:ni:${string}`> {
  const { stdin } = imports
  const docText = typeof stdin === 'string' ? stdin : await streamToResponse(stdin).text()
  const docObject = JSON.parse(docText)
  const { canonicalize = JCS.canonicalize } = imports
  const docCanonicalized = canonicalize(docObject)
  const sha256Hash = await crypto.subtle.digest('SHA-256', new TextEncoder().encode(docCanonicalized))
  const sha256Base64url = base64urlEncode(new Uint8Array(sha256Hash))
  const alg = `sha-256`
  const algVal = `${alg};${sha256Base64url}`
  const didNi = `did:ni:${encodeURIComponent(algVal)}` as const
  return didNi
}

function streamToResponse(stream: AsyncIterable<Uint8Array>) {
  return new Response(new ReadableStream({
    async pull(c) {
      for await (const chunk of stream) c.enqueue(chunk)
      c.close()
    }
  }))
}

function base64urlEncode(b: Uint8Array) { return btoa(String.fromCharCode(...b)).replace(/\+/g, '-').replace(/\//g, '_').replace(/=/g, '') }
