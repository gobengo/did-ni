import { parseArgs } from 'node:util'
import dedent from 'dedent'
import { createDidNi } from "./scripts/did-ni.ts"
import { canonicalize } from 'json-canonicalize'
class CLI {
  async invoke(...argv: string[]) {
    const { values, positionals } = parseArgs({
      args: argv.slice(0, 3),
      options: {
        help: {
          type: 'boolean',
          short: 'h',
          default: false,
        },
        version: {
          type: 'boolean',
          short: 'v',
          default: false,
        },
      },
      strict: false,
      allowPositionals: true,
    })

    if (values.help) {
      console.log(this.help)
      return
    }

    // create ni from stdin
    console.log(await createDidNi({
      stdin: process.stdin,
      canonicalize,
    }))
  }

  get help() {
    // http://docopt.org/
    return dedent`
      # did-ni

      Create a did:ni from a Controlled Identity Document

      Usage:
        did-ni <<< {}
        did-ni -h | --help

      Options:
        -h --help     Show this screen.
    `
  }
}

export default async function cli(...argv: string[]) {
  await new CLI().invoke(...argv)
}
