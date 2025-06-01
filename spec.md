
## Abstract

`did:ni` is a method for [Decentralized Identifiers][] that leverages syntax of `ni:` URIs defined in [RFC 6920 Naming Things With Hashes][].

## Epigraph

> We are the Knights Who Say... Ni!&hellip;
> 
> We are the keepers of the sacred words: "Ni"&hellip;
>
> Ni! Ni! Ni! Ni!&hellip;
>
> We shall say "Ni!" again to you if you do not appease us.

&horbar;[Head Knight who says "Ni!"](https://en.wikipedia.org/wiki/Knights_Who_Say_%22Ni!%22)

![image of Knight who says "Ni!"](http://luminescencias.blogspot.com/uploaded_images/Arthur-and-Bedevere-and-the-Knights-of-Ni-715052.jpg)

> Well, what is it you want?

&horbar;Arthur

## Context

RFC 6920 defines `ni:` URIs for named information.

An example of an RFC 6920 `ni:` is

```
ni://example.com/sha-256;f4OxZX_x_FO5LcGBSKHWXfwtSx-j1ncoSt3SABJtkGk
```

It even describes how to use this to commit to digital signature keys

> When the input to the hash algorithm is a public key value, as may be
   used by various security protocols, the hash SHOULD be calculated
   over the public key in an X.509 SubjectPublicKeyInfo structure
   (Section 4.1 of [RFC5280])

This spec essentially recommends how to do something similar but,
instead of representing it as X.509 SubjectPublicKeyInfo,
you represent it as [application/did](https://www.w3.org/TR/did-1.0/#representations).
One benefit is that web developers frequently have ready-to-hand familiarity with `JSON.parse`, but not an X.509 parser.

## Overview

The simplest way to construct a `did:ni:` from a ni is to [pct-encode][] the ni and then prepend `did:ni:rfc6920:`.

```
did:ni:rfc6920:ni%3A%2F%2Fexample.com%2Fsha-256%3Bf4OxZX_x_FO5LcGBSKHWXfwtSx-j1ncoSt3SABJtkGk
```

Then it can be normalized to forms like

```
did:ni:sha-256:f4OxZX_x_FO5LcGBSKHWXfwtSx-j1ncoSt3SABJtkGk
```

## Syntax

### ABNF

```abnf
did-ni-format     = "did:ni:" did-ni-msi

did-ni-msi        = (alg-col-val / rfc6920-ni-uri)

alg-col-val       = alg ":" val
rfc-6920-ni-uri   = "rfc6920" ":" pct-encoded-NI-URI ; NI-URI from RFC 6920

alg               = 1*idchar ; hash alg from RFC 6920
val               = 1*idchar ; hash val from RFC 6920

idchar             = ALPHA / DIGIT / "." / "-" / "_" / pct-encoded
pct-encoded        = "%" HEXDIG HEXDIG
```

## Method Name

The `method-name` MUST be `ni`.

A `did:ni` DID MUST have the case-sensitive prefix `did:ni:`.

The remainder of the DID, after the prefix, is specified below.

## Method-specific Identifier

### pct-encoded `ni` URI

The `method-specific-id` in the DID MAY be a [pct-encode][]d [Named Information (ni) URI][].

### `did:ni:{alg}:{val}`

`alg` and `val` MUST correspond to values as described in [Named Information (ni) URI][].

## Method Operations

### Create (Register)

* let `doc` be a DID Document without any `id` property
* let `docJson` be `doc` serialized as [RFC 8785 JSON Canonicalization Scheme (JCS)][]
* let `docSha256` be the result of hashing `docJson` with SHA-256
* let `docSha256Ni` be the result of encoding `docSha256` to an RFC 6920 `ni` URI.
* let `docSha256NiPct` be the result of [pct-encode][]ing `docSha256Ni`
* prepend `did:ni:rfc6920:` to `docSha256NiPct`
* normalize per [Normalize did:ni:rfc6920](#normalize-did-ni-rfc6920)

For an explication of this process, see 

### Read (Resolve)

Inputs
* Initial DID Document + optional proof of latest

Expectations
* Readers MUST use the hash `alg` to verify that the input initial DID document hashes to the hash `val` in the `method-specific-id` generated during create.

### Update

This document does not specify a way to update, but may do so in the future.

### Delete (Revoke)

This document does not specify a way to delete, but may do so in the future.

## `did:ni` Algorithms

### Normalize `did:ni:rfc6920`

The simplest conformant constructions of `did:ni` are like `did:ni:rfc6920:{encodeURIComponent(ni)}`.
However, there is a lot of unnecessary data that get's ugly pct-encoded.

This is the process for normalizing DIDs like `did:ni:rfc6920:{encodeURIComponent(ni)}`:
* let `ni` be the ni uri de-pct-encoded
* parse the `ni` to get `alg`, `val`
* let `algb` be the binary encoding of `alg`, if there is one
* let `algshort` be `algb`, if defined, otherwise `alg` (e.g. `sha-256`)
* the normalized DID is like `did:ni:{algshort}:{val}`

## Examples

### `did:ni:mh`

i.e. Naming DIDs with Multihashes

As described in [The Secret of NIMHs: Naming Things with Multihashes][], `mh` is registered by [Multihash][] into the [Named Information Hash Algorithm registry][].
This allows `ni:mh:` URIs to be created, which also allows `did:ni:mh:` URIs to be created.

The rest of `method-specific-id` after `mh:` is a base64url encoded [Multihash][]

#### `did:ni:mh` from nimh-SHA2

This example nimh uses [SHA2][]

```
did:ni:mh:EiB_g7Flf_H8U7ktwYFIodZd_C1LH6PWdyhK3dIAEm2QaQ
```

#### `did:ni:mh` from nimh-BLAKE3

This example nimh uses [BLAKE3][]

```
did:ni:mh:HiBcp4Fa3LSE6aE2wR7-acHVMBdtVJtdGNA461KAtLNHDA
```

## Security and Privacy Considerations

There are a number of security and privacy considerations that implementers will want to take into consideration when implementing this specification.

### Verifiability requires privacy

The did:ni method is only as verifiable as the verification methods used in the did document, and the extent to which their corresponding secret keys can be kept private by the controller.

### Key Rotation Not Supported

The did:ni method is a purely generative method, which means that updates are not supported.
This can be an issue if a did:ni is expected to be used over a long period of time.
For example, if a did:ni is ever compromised, it is not possible to rotate the compromised key.
For this reason, using a did:ni for interactions that last weeks to months is strongly discouraged. 

This consideration was inspired by [did:key](https://w3c-ccg.github.io/did-key-spec/#key-rotation-not-supported).

### Deactivation Not Supported

The did:ni method is a purely generative method, which means that deactivations are not supported.
This can be an issue if a did:ni is expected to be used over a long period of time.
For example, if a did:ni is ever compromised, it is not possible to deactivate the DID to stop an attacker from using it.
For this reason, using a did:ni for interactions that last weeks to months is strongly discouraged. 

This consideration was inspired by [did:key](https://w3c-ccg.github.io/did-key-spec/#deactivation-not-supported).

### Long Term Usage is Discouraged

Since there is no support for update and deactivate for the did:ni method, it is not possible to recover from a security compromise.
For this reason, using a did:ni for interactions that last weeks to months is strongly discouraged. 

This consideration was inspired by [did:key](https://w3c-ccg.github.io/did-key-spec/#long-term-usage-is-discouraged).

## Normative References

* [RFC 6920 Named Information (ni) URI][]
* [RFC 8785 JSON Canonicalization Scheme (JCS)][]

## Informative References

* [The Secret of NIMHs: Naming Things with Multihashes][]
* [Named Information Hash Algorithm registry][]
* [Multihash][]

<section id="conformance"></section>

## Appendix: Creating a did:ni

This script is in TypeScript and should be executable in node.js >=23.6.0.

```typescript
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
```

Example Usage

```shell
⚡ echo '{"authentication":[{"type":"Ni!"}]}' | ./scripts/did-ni.ts
did:ni:sha-256:DkDA2bOnHFwMXsV-aZLsFjs56FKckciqVpT8w9f-oGQ
```

[pct-encode]: https://datatracker.ietf.org/doc/html/rfc3986#section-2.1
[pct-encoded]: https://datatracker.ietf.org/doc/html/rfc3986#section-2.1
[Named Information (ni) URI]: https://www.rfc-editor.org/rfc/rfc6920#section-3
[RFC 6920 Named Information (ni) URI]: https://www.rfc-editor.org/rfc/rfc6920#section-3
[RFC 8785 JSON Canonicalization Scheme (JCS)]: https://www.rfc-editor.org/rfc/rfc8785
[Multihash]: https://w3c-ccg.github.io/multihash/#rfc.section.D.3
[The Secret of NIMHs: Naming Things with Multihashes]: https://bengo.is/blogging/the-secret-of-nimhs/
[Named Information Hash Algorithm registry]: https://www.iana.org/assignments/named-information/named-information.xhtml#hash-alg
[RFC 6920 Naming Things With Hashes]: https://www.rfc-editor.org/rfc/rfc6920.html
[BLAKE3]: https://www.ietf.org/archive/id/draft-aumasson-blake3-00.html
[SHA2]: https://en.wikipedia.org/wiki/SHA-2
[Decentralized Identifiers]: https://www.w3.org/TR/did-1.0/
