&horbar;[bengo](//bengo.is)

> Ni!

&horbar;[Knight who says "Ni!"](https://en.wikipedia.org/wiki/Knights_Who_Say_%22Ni!%22)

![image of Knight who says "Ni!"](https://upload.wikimedia.org/wikipedia/en/e/eb/Knightni.jpg)

## Abstract

`did:ni` is a method for decentralized identifiers that leverages syntax of `ni:` URIs defined in [RFC 6920: Naming Things With Hashes](https://www.rfc-editor.org/rfc/rfc6920)

## Context

An example of an RFC 6920 `ni:` is

```
ni://example.com/sha-256;f4OxZX_x_FO5LcGBSKHWXfwtSx-j1ncoSt3SABJtkGk
```

## Overview

The simplest way to construct a `did:ni:` from a ni is to [pct-encode][] the ni and then prepend `did:ni:rfc6920:`.

```
did:ni:rfc6920:ni%3A%2F%2Fexample.com%2Fsha-256%3Bf4OxZX_x_FO5LcGBSKHWXfwtSx-j1ncoSt3SABJtkGk
```

Then it can be normalized to forms like

```
did:ni:sha-256:f4OxZX_x_FO5LcGBSKHWXfwtSx-j1ncoSt3SABJtkGk
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

* let `doc` be a DID Document
* let `docJson` be `doc` serialized as [RFC 8785 JSON Canonicalization Scheme (JCS)][]
* let `docSha256` be the result of hashing `docJson` with SHA-256
* let `docSha256Ni` be the result of encoding `docSha256` to an RFC 6920 `ni` URI.
* let `docSha256NiPct` be the result of [pct-encode][]ing `docSha256Ni`
* prepend `did:ni:rfc6920:` to `docSha256NiPct`

### Read (Resolve)

Inputs
* Initial DID Document + optional proof of latest

Expectations
* Readers MUST verify that the input initial DID document hashes to the `val` in the `method-specific-id` generated during create.

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

## Normative References

* [RFC 6920 Named Information (ni) URI][]
* [RFC 8785 JSON Canonicalization Scheme (JCS)][]

## Informative References

## Conformance

<section id="conformance"></section>

None

[pct-encode]: https://datatracker.ietf.org/doc/html/rfc3986#section-2.1
[pct-encoded]: https://datatracker.ietf.org/doc/html/rfc3986#section-2.1
[Named Information (ni) URI]: https://www.rfc-editor.org/rfc/rfc6920#section-3
[RFC 6920 Named Information (ni) URI]: https://www.rfc-editor.org/rfc/rfc6920#section-3
[RFC 8785 JSON Canonicalization Scheme (JCS)]: https://www.rfc-editor.org/rfc/rfc8785
