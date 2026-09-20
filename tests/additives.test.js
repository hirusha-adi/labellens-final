import test from 'node:test'
import assert from 'node:assert/strict'
import { normalizeCode } from '../src/utils/additives.js'

test('converts an INS code to an E code', () => {
  assert.equal(normalizeCode('INS 330'), 'E330')
})
