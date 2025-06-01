
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

## Syntax

### ABNF

```abnf
did-ni-format     = "did:ni:" did-ni-msi
did-ni-msi        = ( [domain ":"] hash / rfc692-ni-uri )
hash              = (alg-val-pct / hex-uuid / mb-uri)
alg-val           = alg ";" val
alg-val-pct       = *( unreserved / pct-encoded )
                  ; semantically equivalent to 'alg-val' when decoded
rfc-6920-ni-uri   = "rfc6920" ":" pct-encoded-NI-URI ; NI-URI from RFC 6920
hex-uuid          = 4 hex-octet "-"
                    2 hex-octet "-"
                    2 hex-octet "-"
                    2 hex-octet "-"
                    6 hex-octet
hex-octet         = hexdig hexdig
digit             = %x30-39
hexdig            = digit / "A" / "B" / "C" / "D" / "E" / "F"
alpha             = %x61-7A   ; lowercase a-z
hex-or-dash       = hexdig / "-"
mb-uri            = "mb:" (mb-hexdash / mb-base58btc / mb-p)
mb-hexdash        = "f" 1 * hex-or-dash
mb-base58btc      = "z" 1 * BASE58BTC ; https://en.bitcoin.it/wiki/Base58Check_encoding#Base58_symbol_chart
mb-p              = "p" 1 * alpha

alg               = 1*idchar ; hash alg from RFC 6920
val               = 1*idchar ; hash val from RFC 6920

idchar            = ALPHA / DIGIT / "." / "-" / "_" / pct-encoded
pct-encoded       = "%" HEXDIG HEXDIG
unreserved        = ALPHA / DIGIT / "-" / "." / "_" / "~"
```

`hexUUID` is intended to match the hex-and-dash 8-4-4-4-12 syntax of the [RFC 9562 UUID Format](https://datatracker.ietf.org/doc/html/rfc9562#section-4).

## Method Name

The `method-name` MUST be `ni`.

A `did:ni` DID MUST have the case-sensitive prefix `did:ni:`.

The remainder of the DID, after the prefix, is specified below.

## Method-specific Identifier

### `did:ni:{hash}`

```
did:ni:sha-256%3Bf4OxZX_x_FO5LcGBSKHWXfwtSx-j1ncoSt3SABJtkGk
did:ni:1%3Bf4OxZX_x_FO5LcGBSKHWXfwtSx-j1ncoSt3SABJtkGk
```

### `did:ni:{authority}:{hash}`

```
did:ni:did.coop:1%3Bf4OxZX_x_FO5LcGBSKHWXfwtSx-j1ncoSt3SABJtkGk
```

This corresponds to the ni URI with authority of did.coop like

```
ni://did.coop/sha-256;f4OxZX_x_FO5LcGBSKHWXfwtSx-j1ncoSt3SABJtkGk
```

[RFC 6920 §4 .well-known URI](https://www.rfc-editor.org/rfc/rfc6920#section-4) describes how to build HTTPS URLs from `ni://{authority}/{hash}` URIs.

```
https://did.coop/.well-known/ni/sha-256/f4OxZX_x_FO5LcGBSKHWXfwtSx-j1ncoSt3SABJtkGk
```

### `did:ni:{uuid-ish}`

[RFC 6920 Naming Things With Hashes S9.4 defines](https://www.rfc-editor.org/rfc/rfc6920#section-9.4)
Suite ID 3 `sha-256-120` as a 120-bit truncated SHA-256 hash.

[S6 defines a binary format](https://www.rfc-editor.org/rfc/rfc6920#section-6) with the first byte containing the Suite ID (et al).
> A hash value that is truncated to 120 bits will result in the overall name being a 128-bit value, which may be useful for protocols that can easily use 128-bit identifiers.

The [did:ni syntax][] allows the `method-specific-id` to be a 128 bit binary value, hex encoded, and formatted with dashes in a deterministic way.
Four dashes should be inserted such that the resulting pattern of base-16 digits are in groups of size `.{8}-.{4}-.{4}-.{4}-.{12}`.
The previous pattern is a regular expression [pattern](https://tc39.es/ecma262/#sec-patterns).

The resulting value is indistinguishable from any other UUID by simple textual syntax, but strictly speaking it is not an RFC 9562 UUID because it does not satisfy RFC 9562's additional requirements on the binary layout. Instead it follows the binary encoding from [RFC 6920 Section 6](https://www.rfc-editor.org/rfc/rfc6920#section-6), e.g. the first two bits will always be 0, i.e. the "Res field" preceeding the Suite ID.

```
did:ni:03532690-57e1-2fe2-b74b-a07c892560a2
```

### `did:ni:mb:{hash}`

`{hash}` is the [Multibase](https://www.ietf.org/archive/id/draft-multiformats-multibase-07.html) text encoding of the [RFC 6920 Binary Format](https://www.rfc-editor.org/rfc/rfc6920#section-6).

## Method Operations

### Create

* let `doc` be a DID Document without any `id` property
* let `docJson` be `doc` serialized as [RFC 8785 JSON Canonicalization Scheme (JCS)][]
* let `docHash` be the result of hashing `docJson`, e.g. with SHA-256
* let `docHashAlgVal` be the result of encoding the hash as an `alg-val` from RFC6920 syntax (i.e. `{alg};{base64url(hash)}`). `alg` MAY be either of the hash name string or a decimal suite id.
* let `docHashNi` be the result of prepending "did:ni" to `docHashAlgVal`

For a more precise description of this process, see [Creating a did:ni](#creating-a-did-ni).

### Resolve

Inputs
* `did`: A did:ni
* `doc` A DID Document provided by the resolving client
   * In some ways it doesn't matter where this comes from, as it will be verified against the hash in the `did` itself.
   * In practice it may be provided by the client invoking resolution, reused from a cache when the resolver has previously resolved the did:ni, or looked up in some other public or private database.

Expectations
* let `docFromDidDoc` be `doc` but with the following modifications:
   * remove the `id` property, if present
* let `didForDoc` be the result of creating a did:ni for `doc` (see [Create](#create))
* if `didForDoc` does not match `did`, the Read fails with an error code `didForDocMismatch`
* let `docForDid` be `doc` with the following modifications
   * set the `id` property to `did`

The read results in a DID Document of `docForDid`.

For a more precise description of this process, see [Reading a did:ni](#resolving-a-did-ni).

### Update

This document does not specify a way to update, but may do so in the future.

### Delete (Revoke)

This document does not specify a way to delete, but may do so in the future.

## Examples

### `did:ni:mh`

i.e. Naming DIDs with Multihashes

As described in [The Secret of NIMHs: Naming Things with Multihashes][], `mh` is registered by [Multihash][] into the [Named Information Hash Algorithm registry][].
This allows `ni:mh:` URIs to be created, which also allows `did:ni:mh:` URIs to be created.

The rest of `method-specific-id` after `mh:` is a base64url encoded [Multihash][]

#### `did:ni:mh` from nimh-SHA2

This example nimh uses [SHA2][]

```
did:ni:mh%3BEiB_g7Flf_H8U7ktwYFIodZd_C1LH6PWdyhK3dIAEm2QaQ
```

#### `did:ni:mh` from nimh-BLAKE3

This example nimh uses [BLAKE3][]

```
did:ni:mh%3BHiBcp4Fa3LSE6aE2wR7-acHVMBdtVJtdGNA461KAtLNHDA
```

## DID URL Parameters

[DID Parameters are described in did-core](https://www.w3.org/TR/did-1.0/#did-parameters).

### `ct` DID URL Parameter

`did:ni` URLs MAY include a `ct` parameter in the query string.

When present, this MAY be interpreted similarly to its use in [RFC 6920 §3.1.  Content Type Query String Attribute](https://www.rfc-editor.org/rfc/rfc6920#section-3.1). It MAY indicate the content type of the named resource. It MAY inform client resolution, e.g. any value here should be used in an HTTP `Accept` header. When this is omitted, it may generally assumed to be `application/did+json`.

```
did:ni:1%3Bf4OxZX_x_FO5LcGBSKHWXfwtSx-j1ncoSt3SABJtkGk?ct=application/json
```

### `ws` DID URL Parameter

`did:ni` URLs MAY include a `ws` parameter in the query string.

When present, this may indicate a URL from which the named resource may be fetched, e.g. via HTTPS.

```
did:ni:1%3Bf4OxZX_x_FO5LcGBSKHWXfwtSx-j1ncoSt3SABJtkGk?ws=https://example.com/department/did.json&ws=https://backup.example.com/department/did.json
```

Note that multiple `ws` parameters MAY be included in a did:ni URL.
As long as one of them can help locate a DID document that verifies according to the hash, then DID resolution will be possible.

#### Privacy Considerats of `ws`

Do not put personally identifiable information in the URLs of the `ws` URLs.
e.g. if the DID is supposed to be private, but the `ws` value is `MyRealName.com`,
then the DID URL with `ws` itself will imply or reveal a relationship between the supposedly private DID and a real name.

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

### Other Considerations

* See [Privacy Considerations of `ws`](#privacy-considerats-of-ws)

## Normative References

* [RFC 6920 Named Information (ni) URI][]
* [RFC 8785 JSON Canonicalization Scheme (JCS)][]

## Informative References

* [The Secret of NIMHs: Naming Things with Multihashes][]
* [Named Information Hash Algorithm registry][]
* [Multihash][]

<section id="conformance"></section>

## Example Code

### Creating a did:ni

#### JavaScript

```javascript
import * as JCS from "json-canonicalize"

// given a did doc like input, return a did:ni
async function createDidNi({
   canonicalize = JCS.canonicalize,
   doc,
}) {
  const docCanonicalized = canonicalize(doc)
  const sha256Hash = await crypto.subtle.digest('SHA-256', new TextEncoder().encode(docCanonicalized))
  const sha256Base64url = base64urlEncode(new Uint8Array(sha256Hash))
  const didNi = `did:ni:sha-256:${sha256Base64url}`
  return didNi
}

/**
 * @param b {Uint8Array} - bytes
 * @returns {string} base64url encoded
 */
function base64urlEncode (b) { return btoa(String.fromCharCode(...b)).replace(/\+/g,'-').replace(/\//g,'_').replace(/=/g,'') }
```

#### TypeScript

```typescript
import * as JCS from "json-canonicalize"

// given a did doc like input, return a did:ni
export async function createDidNi(
  imports: {
    doc: unknown,
    canonicalize: (doc: unknown) => string
  }
): Promise<`did:ni:${string}`> {
  const { doc } = imports
  const { canonicalize = JCS.canonicalize } = imports
  const docCanonicalized = canonicalize(doc)
  const sha256Hash = await crypto.subtle.digest('SHA-256', new TextEncoder().encode(docCanonicalized))
  const sha256Base64url = base64urlEncode(new Uint8Array(sha256Hash))
  const didNi = `did:ni:sha-256:${sha256Base64url}` as const
  return didNi
}

function base64urlEncode (b: Uint8Array) { return btoa(String.fromCharCode(...b)).replace(/\+/g,'-').replace(/\//g,'_').replace(/=/g,'') }
```

### Resolving a did:ni

#### JavaScript

```javascript
/**
 * @param {object} o - options
 * @param {string} o.did - a did:ni string to resolve
 * @param {object} o.doc - an unverified candidate DID Document
 * @returns {object} with standard resolution values https://www.w3.org/TR/did-resolution/#resolving
 */
export async function resolveDidNi({ did, doc }) {
  if (typeof doc === 'string') {
    doc = JSON.parse(doc);
  }
  const didForDoc = await createDidNi({ doc: JSON.stringify(doc) })
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
```

[did:ni syntax]: http://localhost:8080/#syntax
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


