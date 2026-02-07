/**
 * Test script for Expert Summoning feature
 *
 * Tests:
 * 1. Expert matching by domain (findExpertForDomain)
 * 2. Multiple domain queries
 * 3. Note: Full summon requires an active debate (tested via UI)
 *
 * Usage: node scripts/test-expert-summon.cjs
 */

const WebSocket = require('ws');

const WS_URL = 'ws://localhost:4500/ws/avatar-council';

// Test domains to search
const DOMAINS_TO_TEST = [
  { domain: 'compliance regulations', expect: 'Compliance' },
  { domain: 'persuasion techniques', expect: 'Wolf' },
  { domain: 'insurance policies', expect: 'Insurance' },
  { domain: 'motivation and mindset', expect: 'Mindset' },
  { domain: 'objection handling', expect: 'Objection' },
  { domain: 'actuarial science', expect: 'Father' },
];

let currentTestIndex = 0;
let passedTests = 0;

console.log('🧪 Expert Summoning - Domain Matching Test');
console.log('==========================================\n');

const ws = new WebSocket(WS_URL);

ws.on('open', () => {
  console.log('✓ WebSocket connected\n');

  // Authenticate first
  ws.send(JSON.stringify({
    type: 'auth',
    userId: 'test-user-' + Date.now(),
    isAdmin: true,
  }));
});

function runNextTest() {
  if (currentTestIndex >= DOMAINS_TO_TEST.length) {
    console.log('\n==========================================');
    console.log(`✓ Tests completed: ${passedTests}/${DOMAINS_TO_TEST.length} passed\n`);
    ws.close();
    return;
  }

  const test = DOMAINS_TO_TEST[currentTestIndex];
  console.log(`\nTest ${currentTestIndex + 1}: Finding expert for "${test.domain}"`);
  console.log(`  Expected: contains "${test.expect}"`);

  ws.send(JSON.stringify({
    type: 'debate:find:expert',
    domain: test.domain,
    excludeAvatarIds: [],
  }));
}

ws.on('message', (data) => {
  const message = JSON.parse(data.toString());

  switch (message.type) {
    case 'auth:success':
      console.log(`Authenticated as: ${message.userId}\n`);
      console.log('Running domain matching tests...');
      runNextTest();
      break;

    case 'debate:expert:found':
      const test = DOMAINS_TO_TEST[currentTestIndex];
      const foundName = message.expert?.name || 'None';

      if (message.expert) {
        const passed = foundName.toLowerCase().includes(test.expect.toLowerCase());
        if (passed) {
          console.log(`  ✓ Found: ${foundName}`);
          console.log(`    Expertise: ${message.expert.domainExpertise?.slice(0,3).join(', ')}`);
          passedTests++;
        } else {
          console.log(`  ⚠ Found: ${foundName} (expected "${test.expect}")`);
          console.log(`    Expertise: ${message.expert.domainExpertise?.slice(0,3).join(', ')}`);
        }
      } else {
        console.log(`  ✗ No expert found (expected "${test.expect}")`);
      }

      currentTestIndex++;
      runNextTest();
      break;

    case 'network:activity':
    case 'connected':
      // Ignore
      break;

    case 'error':
      console.log(`✗ Error: ${message.error}`);
      break;

    default:
      // Ignore other messages
      break;
  }
});

ws.on('error', (error) => {
  console.error('✗ WebSocket error:', error.message);
});

ws.on('close', () => {
  console.log('WebSocket closed');
  process.exit(passedTests === DOMAINS_TO_TEST.length ? 0 : 1);
});

// Timeout after 15 seconds
setTimeout(() => {
  console.log('\n⏱ Test timeout');
  ws.close();
  process.exit(1);
}, 15000);
