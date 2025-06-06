#!/usr/bin/env node --no-warnings

import { parseArgs } from 'node:util'
const DEFAULT_CONTROLLER = 'did:key:z6MknrnRKpC1pDWyu4DVcJJCHKwMjAYXLJHuzPRRjsM3pv2Y'
const args = parseArgs({
  strict: false,
  options: {
    controller: {
      type: 'string',
    },
    server: {
      type: 'string',
    },
    space: {
      type: 'string',
      default: process.env.SPACE_UUID || crypto.randomUUID(),
    }
  }
})
const spaceUuid = args.values.space
const id = `urn:uuid:${spaceUuid}`
const link = `/space/${spaceUuid}/linkset.json`
const controller = 'false' === args.values.controller ? undefined : (true === args.values.controller) ? DEFAULT_CONTROLLER : args.values.controller || DEFAULT_CONTROLLER
const space = {
  controller,
  id,
  link,
}
console.info(JSON.stringify(space, null, 2))
