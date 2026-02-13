/**
 * INTEGRATION BRIDGES
 * Connect the agent system to external services.
 */

import { DatabaseBridge, databaseBridge } from './database-bridge';
import { GmailBridge, gmailBridge } from './gmail-bridge';
import { CalendarBridge, calendarBridge } from './calendar-bridge';

// Re-export for external use
export { DatabaseBridge, databaseBridge } from './database-bridge';
export { GmailBridge, gmailBridge } from './gmail-bridge';
export { CalendarBridge, calendarBridge } from './calendar-bridge';

/**
 * Start all integration bridges.
 * Call this after bootstrapping the agent system.
 */
export async function startAllBridges(): Promise<void> {
  console.log('\n═══════════════════════════════════════════════');
  console.log('  STARTING INTEGRATION BRIDGES');
  console.log('═══════════════════════════════════════════════\n');

  const bridges = [
    { name: 'Database', bridge: databaseBridge },
    { name: 'Gmail', bridge: gmailBridge },
    { name: 'Calendar', bridge: calendarBridge },
  ];

  for (const { name, bridge } of bridges) {
    try {
      await bridge.start();
    } catch (error) {
      console.error(`[BRIDGES] Failed to start ${name} bridge:`, error);
    }
  }

  console.log('\n═══════════════════════════════════════════════');
  console.log('  ✅ ALL BRIDGES STARTED');
  console.log('═══════════════════════════════════════════════\n');
}

/**
 * Stop all integration bridges.
 * Call this during graceful shutdown.
 */
export async function stopAllBridges(): Promise<void> {
  console.log('[BRIDGES] Stopping all bridges...');

  await databaseBridge.stop();
  await gmailBridge.stop();
  await calendarBridge.stop();

  console.log('[BRIDGES] All bridges stopped');
}

/**
 * Get stats from all bridges.
 */
export function getBridgeStats() {
  return {
    database: databaseBridge.getStats(),
    gmail: gmailBridge.getStats(),
    calendar: calendarBridge.getStats(),
  };
}
