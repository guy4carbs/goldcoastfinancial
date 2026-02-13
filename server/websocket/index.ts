/**
 * WebSocket Module - Barrel Export
 */

export { GCFWebSocketServer, Channels, ALL_CHANNELS } from './GCFWebSocketServer';
export type { AuthenticatedSocket, WebSocketMessage, Channel } from './GCFWebSocketServer';
export { bridgeEventBus, notifyUser, alertAdmins, broadcastPipelineUpdate } from './eventBridge';
