import { useState, useEffect, useRef, useCallback } from 'react';
import type { UseTelnyxDeviceReturn, CallStatus } from './useTelnyxDevice';

// =============================================================================
// TYPES
// =============================================================================

export type PowerDialerStatus =
  | 'idle'       // Not loaded
  | 'loading'    // Fetching leads
  | 'ready'      // Queue loaded, waiting for Start
  | 'dialing'    // Batch calls going out
  | 'ringing'    // Batch calls ringing
  | 'connected'  // One person picked up, on the phone
  | 'completed'; // Queue exhausted

export interface PowerDialerLead {
  id: string;
  firstName: string;
  lastName: string;
  phone: string;
  email: string;
  leadScore: number | null;
  priority: string;
  status: string;
  pipelineStage: string | null;
  lastContactedAt: string | null;
  callCount: number;
}

export interface PowerDialerStats {
  totalInQueue: number;
  dialed: number;
  connected: number;
  noAnswer: number;
}

export interface UsePowerDialerReturn {
  status: PowerDialerStatus;
  queue: PowerDialerLead[];
  currentLead: PowerDialerLead | null;
  currentBatch: PowerDialerLead[];
  currentIndex: number;
  stats: PowerDialerStats;
  lines: number;
  ringCount: number;
  loadQueue: () => Promise<void>;
  start: () => void;
  stop: () => void;
  setLines: (n: number) => void;
  setRingCount: (n: number) => void;
}

// =============================================================================
// HOOK
// =============================================================================

export function usePowerDialer(telnyx: UseTelnyxDeviceReturn): UsePowerDialerReturn {
  const [status, setStatus] = useState<PowerDialerStatus>('idle');
  const [queue, setQueue] = useState<PowerDialerLead[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [stats, setStats] = useState<PowerDialerStats>({
    totalInQueue: 0,
    dialed: 0,
    connected: 0,
    noAnswer: 0,
  });
  const [lines, setLinesState] = useState(1);
  const [ringCount, setRingCountState] = useState(3);
  const [currentBatch, setCurrentBatch] = useState<PowerDialerLead[]>([]);

  // Refs
  const statusRef = useRef<PowerDialerStatus>('idle');
  const ringTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const ringCountRef = useRef(3);
  const currentIndexRef = useRef(0);
  const queueRef = useRef<PowerDialerLead[]>([]);
  const batchSizeRef = useRef(0);
  const prevCallStatusRef = useRef<CallStatus>('idle');

  // Keep refs in sync
  useEffect(() => { statusRef.current = status; }, [status]);
  useEffect(() => { currentIndexRef.current = currentIndex; }, [currentIndex]);
  useEffect(() => { queueRef.current = queue; }, [queue]);
  useEffect(() => { ringCountRef.current = ringCount; }, [ringCount]);

  // The lead whose call was answered (set when callStatus goes to 'open')
  const [currentLead, setCurrentLead] = useState<PowerDialerLead | null>(null);

  // Clear ring timeout
  const clearRingTimeout = useCallback(() => {
    if (ringTimeoutRef.current) {
      clearTimeout(ringTimeoutRef.current);
      ringTimeoutRef.current = null;
    }
  }, []);

  // ===========================================================================
  // Watch telnyx.callStatus for state transitions
  // ===========================================================================
  useEffect(() => {
    const prev = prevCallStatusRef.current;
    const curr = telnyx.callStatus;
    prevCallStatusRef.current = curr;

    const s = statusRef.current;
    if (s === 'idle' || s === 'loading' || s === 'ready' || s === 'completed') return;

    // Batch is ringing
    if (curr === 'ringing' && (s === 'dialing')) {
      setStatus('ringing');
      // Start ring timeout
      clearRingTimeout();
      const timeout = ringCountRef.current * 6000;
      ringTimeoutRef.current = setTimeout(() => {
        if (statusRef.current === 'ringing') {
          // Nobody answered — hang up all batch calls
          setStats(p => ({ ...p, noAnswer: p.noAnswer + batchSizeRef.current }));
          telnyx.hangUpBatch();
          // callStatus will go to idle, which we handle below
        }
      }, timeout);
    }

    // Someone picked up — first to answer wins (batch logic in useTelnyxDevice)
    if (curr === 'open' && (s === 'ringing' || s === 'dialing')) {
      clearRingTimeout();
      setStatus('connected');
      setStats(p => ({
        ...p,
        connected: p.connected + 1,
        noAnswer: p.noAnswer + (batchSizeRef.current - 1), // the rest didn't answer
      }));
    }

    // All calls ended (either ring timeout or agent hung up)
    if (curr === 'idle' && prev !== 'idle' && (s === 'ringing' || s === 'connected' || s === 'dialing')) {
      clearRingTimeout();
      // Advance index past this batch
      const nextIndex = currentIndexRef.current + batchSizeRef.current;
      setCurrentIndex(nextIndex);
      setCurrentLead(null);
      setCurrentBatch([]);
      batchSizeRef.current = 0;

      if (nextIndex >= queueRef.current.length) {
        setStatus('completed');
      } else {
        setStatus('ready');
      }
    }
  }, [telnyx.callStatus, clearRingTimeout, telnyx]);

  // Cleanup on unmount
  useEffect(() => {
    return () => clearRingTimeout();
  }, [clearRingTimeout]);

  // ===========================================================================
  // ACTIONS
  // ===========================================================================

  const loadQueue = useCallback(async () => {
    setStatus('loading');
    try {
      const res = await fetch('/api/lead-distribution/inbox?limit=200&sortBy=score', {
        credentials: 'include',
      });
      if (!res.ok) throw new Error('Failed to load leads');
      const data = await res.json();

      let allLeads: PowerDialerLead[] = (data.leads || [])
        .filter((l: any) => l.phone)
        .map((l: any) => ({
          id: l.id,
          firstName: l.firstName || '',
          lastName: l.lastName || '',
          phone: l.phone,
          email: l.email || '',
          leadScore: l.leadScore ?? null,
          priority: l.priority || 'medium',
          status: l.status || 'new',
          pipelineStage: l.pipelineStage || null,
          lastContactedAt: l.lastContactedAt || null,
          callCount: 0,
        }));

      // Batch check DNC and call counts in parallel
      const phones = allLeads.map(l => l.phone);
      if (phones.length > 0) {
        const [dncRes, countRes] = await Promise.all([
          fetch('/api/dnc/check-batch', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            credentials: 'include',
            body: JSON.stringify({ phoneNumbers: phones }),
          }),
          fetch('/api/calls/count-batch', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            credentials: 'include',
            body: JSON.stringify({ phoneNumbers: phones }),
          }),
        ]);

        if (dncRes.ok) {
          const dncData = await dncRes.json();
          const dncSet = new Set(dncData.dncNumbers || []);
          allLeads = allLeads.filter(l => !dncSet.has(l.phone));
        }

        if (countRes.ok) {
          const counts: Record<string, number> = await countRes.json();
          allLeads = allLeads.map(l => ({
            ...l,
            callCount: counts[l.phone] || 0,
          }));
        }
      }

      setQueue(allLeads);
      setCurrentIndex(0);
      setCurrentLead(null);
      setCurrentBatch([]);
      setStats({
        totalInQueue: allLeads.length,
        dialed: 0,
        connected: 0,
        noAnswer: 0,
      });
      setStatus(allLeads.length > 0 ? 'ready' : 'completed');
    } catch (err) {
      console.error('[PowerDialer] Failed to load queue:', err);
      setStatus('idle');
    }
  }, []);

  /** Start dialing the next batch of leads */
  const start = useCallback(() => {
    const remaining = queueRef.current.slice(currentIndexRef.current);
    if (remaining.length === 0) {
      setStatus('completed');
      return;
    }

    // Take up to `lines` leads for this batch
    const batch = remaining.slice(0, lines);
    batchSizeRef.current = batch.length;
    setCurrentBatch(batch);
    setCurrentLead(batch[0]); // Show the first lead as "current" until someone answers
    setStats(p => ({ ...p, dialed: p.dialed + batch.length }));
    setStatus('dialing');

    // Extract phone numbers and make simultaneous calls
    const phones = batch.map(l => l.phone);
    if (phones.length === 1) {
      // Single call — use normal makeCall (no batch mode needed)
      telnyx.makeCall(phones[0]);
    } else {
      // Multiple calls — use batch mode
      telnyx.makeBatchCalls(phones);
    }
  }, [lines, telnyx]);

  /** Stop the power dialer — hang up everything, return to ready */
  const stop = useCallback(() => {
    clearRingTimeout();
    telnyx.hangUpBatch();
    setCurrentLead(null);
    setCurrentBatch([]);
    batchSizeRef.current = 0;
    setStatus('ready');
  }, [clearRingTimeout, telnyx]);

  const setLines = useCallback((n: number) => {
    setLinesState(Math.max(1, Math.min(5, n)));
  }, []);

  const setRingCount = useCallback((n: number) => {
    setRingCountState(Math.max(1, Math.min(5, n)));
  }, []);

  return {
    status,
    queue,
    currentLead,
    currentBatch,
    currentIndex,
    stats,
    lines,
    ringCount,
    loadQueue,
    start,
    stop,
    setLines,
    setRingCount,
  };
}
