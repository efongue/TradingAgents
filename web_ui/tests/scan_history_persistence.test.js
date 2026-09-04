import test from 'node:test';
import assert from 'node:assert/strict';

test('Scan History Persistence: each analyzed stock is immediately queryable in /api/history', async () => {
  const res = await fetch('http://127.0.0.1:8787/api/history');
  assert.equal(res.status, 200, 'HTTP status should be 200');
  const payload = await res.json();
  assert.ok(Array.isArray(payload.items), 'Payload should have items array');
  assert.ok(payload.items.length > 0, 'History should contain items');

  const firstItem = payload.items[0];
  assert.ok(firstItem.id, 'History item must have an id');
  assert.ok(firstItem.ticker, 'History item must have a ticker');
  assert.ok(firstItem.display_decision, 'History item must have a display_decision');

  // Verify detailed report endpoint
  const reportRes = await fetch(`http://127.0.0.1:8787/api/history/${firstItem.id}`);
  assert.equal(reportRes.status, 200, 'Report endpoint should return 200');
  const reportPayload = await reportRes.json();
  assert.equal(reportPayload.id, firstItem.id, 'Loaded report ID must match');
  assert.ok(reportPayload.result, 'Report payload must contain result');
});
