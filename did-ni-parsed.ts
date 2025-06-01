export class DidNiParsed {
  alg: string
  val: string

  static parse(did: string) {
    const match = did.match(/did:ni:(?<alg>[^:]+):(?<val>[^:$]+)/)
    if (!match) throw new Error(`unable to parse did:ni`, { cause: { did } })
    const { alg, val } = match.groups || {};
    if (!alg) throw new Error(`unable to parse did:ni alg`, { cause: { did, alg } })
    if (!val) throw new Error(`unable to parse did:ni val`, { cause: { did, val } })
    return new DidNiParsed({ alg, val })
  }
  constructor(options: {
    alg: string,
    val: string,
  }) {
    this.alg = options.alg
    this.val = options.val
  }

  get hash(): Uint8Array {
    return base64urlDecode(this.val)
  }
}

function base64urlDecode(s: string) { return new Uint8Array([...atob((s+='==='.slice((s.length+3)%4)).replace(/-/g,'+').replace(/_/g,'/'))].map(c=>c.charCodeAt(0))) }
