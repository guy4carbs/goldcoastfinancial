/**
 * SEQUENCE QUEUE
 * BullMQ wiring for the drip/email-sequence engine (Phase 3).
 *
 * Two job types on the 'sequences' queue:
 *   - 'sequence:dispatch'  repeatable (every 60s, single instance via the
 *                          Job Scheduler): claims a batch of due enrollments
 *                          and fans out one 'sequence:send' job per enrollment.
 *   - 'sequence:send'      processes one enrollment step. BullMQ retries on
 *                          throw (3-attempt exp backoff from jobQueue defaults);
 *                          on the FINAL failed attempt we DLQ + self-recover.
 *
 * Both exports are REDIS_URL-gated no-ops (mirrors jobQueue.ts) so the app runs
 * cleanly without Redis — the sequence engine is simply dormant.
 *
 * Atlas wires the two exported functions into server/index.ts startup:
 *   registerSequenceWorkers()  — after jobQueue.initialize()
 *   scheduleDispatcher()       — after registerSequenceWorkers()
 */

import type { Job } from "bullmq";
import { getQueue, registerWorker, addBulkJobs } from "./jobQueue";
import {
  claimDueEnrollments,
  processEnrollmentStep,
  handleStepFailure,
} from "./sequenceProcessor";

const SEQUENCES_QUEUE = "sequences";
const DISPATCH_SCHEDULER_ID = "sequence-dispatch";
const DISPATCH_EVERY_MS = 60_000;
const SEND_CONCURRENCY = 5;
const CLAIM_BATCH_LIMIT = 100;
const LEASE_MINUTES = 10;

interface DispatchJobData {
  // no payload — the dispatcher claims work itself
}
interface SendJobData {
  enrollmentId: string;
}

/**
 * Register the worker that processes both 'sequence:dispatch' and
 * 'sequence:send' jobs on the sequences queue. No-op without REDIS_URL.
 */
export function registerSequenceWorkers(): void {
  if (!process.env.REDIS_URL) {
    console.warn("[SequenceQueue] REDIS_URL not set — sequence workers disabled");
    return;
  }

  const worker = registerWorker<DispatchJobData | SendJobData, unknown>(
    SEQUENCES_QUEUE,
    async (job: Job<DispatchJobData | SendJobData>) => {
      if (job.name === "sequence:dispatch") {
        return runDispatch();
      }
      if (job.name === "sequence:send") {
        const { enrollmentId } = job.data as SendJobData;
        try {
          return await processEnrollmentStep(enrollmentId);
        } catch (err: any) {
          // On the final attempt, DLQ + self-recover, then rethrow so BullMQ
          // marks the job failed. Earlier attempts just rethrow to retry.
          const isFinalAttempt =
            job.attemptsMade + 1 >= (job.opts.attempts ?? 3);
          if (isFinalAttempt) {
            await handleStepFailure(
              enrollmentId,
              err instanceof Error ? err : new Error(String(err)),
            );
          }
          throw err;
        }
      }
      console.warn(`[SequenceQueue] Unknown job name: ${job.name}`);
      return undefined;
    },
    { concurrency: SEND_CONCURRENCY },
  );

  if (worker) {
    console.log("[SequenceQueue] Sequence workers registered");
  }
}

/**
 * Claim due enrollments and fan out one 'sequence:send' job per enrollment.
 * Exported for the admin run-now path (which processes synchronously instead).
 */
async function runDispatch(): Promise<{ claimed: number }> {
  const claimed = await claimDueEnrollments(CLAIM_BATCH_LIMIT, LEASE_MINUTES);
  if (claimed.length === 0) {
    return { claimed: 0 };
  }

  await addBulkJobs<SendJobData>(
    SEQUENCES_QUEUE,
    claimed.map((enrollment) => ({
      name: "sequence:send",
      data: { enrollmentId: enrollment.id },
    })),
  );

  console.log(`[SequenceQueue] Dispatched ${claimed.length} enrollment(s)`);
  return { claimed: claimed.length };
}

/**
 * Install the repeatable dispatch job via the BullMQ Job Scheduler. Idempotent
 * (upsert) so it's safe to call on every boot. No-op without REDIS_URL.
 */
export async function scheduleDispatcher(): Promise<void> {
  if (!process.env.REDIS_URL) {
    console.warn("[SequenceQueue] REDIS_URL not set — dispatcher scheduler disabled");
    return;
  }

  const queue = getQueue(SEQUENCES_QUEUE);
  if (!queue) {
    console.warn("[SequenceQueue] sequences queue unavailable — dispatcher not scheduled");
    return;
  }

  try {
    await queue.upsertJobScheduler(
      DISPATCH_SCHEDULER_ID,
      { every: DISPATCH_EVERY_MS },
      { name: "sequence:dispatch", data: {} },
    );
    console.log(
      `[SequenceQueue] Dispatcher scheduled (every ${DISPATCH_EVERY_MS / 1000}s)`,
    );
  } catch (err: any) {
    console.error("[SequenceQueue] Failed to schedule dispatcher:", err?.message || err);
  }
}

export { runDispatch };
