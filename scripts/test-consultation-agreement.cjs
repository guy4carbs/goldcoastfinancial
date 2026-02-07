/**
 * Test script for Autonomous Expert Consultation Agreement
 *
 * This tests the pattern recognition for consultation signals.
 * In actual debates, the LLM generates responses that may include
 * phrases like "we should bring in an expert" which triggers the flow.
 *
 * Usage: node scripts/test-consultation-agreement.cjs
 */

const WebSocket = require('ws');

const WS_URL = 'ws://localhost:4500/ws/avatar-council';

// Test phrases that should trigger consultation detection
const CONSULTATION_PHRASES = [
  "I think we should bring in a compliance expert to weigh in on this",
  "We might want to consult someone who specializes in underwriting",
  "This requires additional expert input on the regulatory side",
  "Let's bring in the mindset coach for this perspective",
  "I second that suggestion - let's get expert input on compliance",
];

console.log('🧪 Autonomous Consultation Agreement Test');
console.log('==========================================\n');

console.log('Phrases that WOULD trigger consultation detection:\n');
CONSULTATION_PHRASES.forEach((phrase, i) => {
  console.log(`${i + 1}. "${phrase}"`);
});

console.log('\n==========================================');
console.log('Testing WebSocket connection and debate flow...\n');

const ws = new WebSocket(WS_URL);

ws.on('open', () => {
  console.log('✓ WebSocket connected\n');

  // Authenticate
  ws.send(JSON.stringify({
    type: 'auth',
    userId: 'test-consultation-' + Date.now(),
    isAdmin: true,
  }));
});

let debateStarted = false;

ws.on('message', (data) => {
  const message = JSON.parse(data.toString());

  switch (message.type) {
    case 'auth:success':
      console.log(`Authenticated: ${message.userId}\n`);

      // Start a test debate
      console.log('Starting test debate to verify callback setup...\n');
      ws.send(JSON.stringify({
        type: 'debate:start',
        topic: 'Best approach to handle complex underwriting cases',
        avatarIds: [
          '36bf4951-ee64-42ec-a75c-9812ab58c8a0', // Insurance Expert
          '607e318b-8b6c-466e-b124-45dff27a263b', // Wolf Closer
        ],
        argumentRounds: 1,
        includeRebuttals: false,
      }));
      break;

    case 'debate:start':
      debateStarted = true;
      console.log('✓ Debate started:', message.topic);
      console.log('  Avatars:', message.avatars?.map(a => a.name).join(', '));
      console.log('\n  Watching for consultation signals...\n');
      break;

    case 'debate:phase:start':
      console.log(`  Phase: ${message.phase}`);
      break;

    case 'debate:turn:start':
      console.log(`  Turn starting: avatar ${message.avatarId?.slice(0, 8)}...`);
      break;

    case 'debate:turn:end':
    case 'debate:turn:complete':
      console.log(`  Turn complete: ${message.content?.slice(0, 50)}...`);
      break;

    // CONSULTATION EVENTS - what we're testing for
    case 'debate:consultation:proposed':
      console.log('\n🎯 CONSULTATION PROPOSED!');
      console.log(`   Avatar: ${message.signal?.avatarName || message.avatarName}`);
      console.log(`   Domain: ${message.signal?.domain || message.domain}`);
      console.log(`   Reason: ${message.signal?.reason || message.reason || 'N/A'}`);
      break;

    case 'debate:consultation:seconded':
      console.log('\n🎯 CONSULTATION SECONDED!');
      console.log(`   Both avatars agree on: ${message.agreement?.domain || message.domain}`);
      break;

    case 'debate:consultation:agreed':
      console.log('\n🎯 CONSULTATION AGREED!');
      console.log(`   Expert: ${message.expert?.name}`);
      console.log(`   Domain: ${message.agreement?.domain}`);
      break;

    case 'debate:expert:contribution:start':
      console.log('\n📢 Expert starting contribution...');
      break;

    case 'debate:expert:contribution:token':
      process.stdout.write(message.token);
      break;

    case 'debate:expert:contribution:complete':
      console.log('\n\n✓ Expert contribution complete!\n');
      break;

    case 'debate:expert:contributed':
      console.log(`✓ ${message.expertName} contributed to debate`);
      break;

    case 'debate:complete':
      console.log('\n==========================================');
      console.log('✓ Debate completed\n');
      console.log('Note: In real debates with OPENAI_API_KEY configured,');
      console.log('avatars may naturally suggest "let\'s bring in an expert"');
      console.log('which triggers the autonomous consultation flow.\n');
      ws.close();
      break;

    case 'debate:error':
      console.log(`✗ Debate error: ${message.error}`);
      // LLM not available is expected in test environment
      if (message.error?.includes('LLM') || message.error?.includes('API')) {
        console.log('\n(This is expected without OPENAI_API_KEY)\n');
        ws.close();
      }
      break;

    case 'error':
      console.log(`Error: ${message.error}`);
      break;

    case 'connected':
    case 'network:activity':
      // Ignore
      break;

    default:
      // Show other debate events briefly
      if (message.type?.startsWith('debate:')) {
        // console.log(`  Event: ${message.type}`);
      }
  }
});

ws.on('error', (error) => {
  console.error('WebSocket error:', error.message);
});

ws.on('close', () => {
  console.log('WebSocket closed');
  process.exit(0);
});

// Timeout after 60 seconds (debates can take a while)
setTimeout(() => {
  console.log('\n⏱ Test timeout');
  ws.close();
  process.exit(0);
}, 60000);
