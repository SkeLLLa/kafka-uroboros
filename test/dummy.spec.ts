import assert from 'node:assert';
import { describe, test } from 'node:test';

void describe('Test placeholder', async () => {
  await test('Works', async () => {
    assert.equal(true, true, 'Sanity check failed');
  });
});
