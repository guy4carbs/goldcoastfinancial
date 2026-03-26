import { Queue, Worker, Job, QueueEvents, type ConnectionOptions } from 'bullmq';

/**
 * Background Job Queue Service
 * Uses BullMQ for reliable async job processing
 */

let connectionConfig: ConnectionOptions | null = null;
let queues: Map<string, Queue> = new Map();
let workers: Map<string, Worker> = new Map();

/**
 * Get or create Redis connection config for job queue
 */
function getConnectionConfig(): ConnectionOptions | null {
  if (connectionConfig) return connectionConfig;

  const redisUrl = process.env.REDIS_URL;
  if (!redisUrl) {
    console.warn('[JobQueue] REDIS_URL not configured - job queue disabled');
    return null;
  }

  try {
    // Parse the Redis URL to get connection options
    const url = new URL(redisUrl);
    connectionConfig = {
      host: url.hostname,
      port: parseInt(url.port || '6379', 10),
      password: url.password || undefined,
      maxRetriesPerRequest: null, // Required for BullMQ
    };

    console.log('[JobQueue] Redis config created');
    return connectionConfig;
  } catch (error: any) {
    console.error('[JobQueue] Failed to parse Redis URL:', error.message);
    return null;
  }
}

// =============================================================================
// QUEUE MANAGEMENT
// =============================================================================

export type JobName =
  | 'email:send'
  | 'email:quote-notification'
  | 'email:password-reset'
  | 'email:booking-confirmation'
  | 'notification:push'
  | 'notification:sms'
  | 'reminder:appointment'
  | 'reminder:lead-followup'
  | 'reminder:post-close-followup'
  | 'call:ai-welcome'
  | 'report:generate'
  | 'cleanup:expired-tokens'
  | 'cleanup:audit-logs';

/**
 * Get or create a queue
 */
export function getQueue(queueName: string): Queue | null {
  const conn = getConnectionConfig();
  if (!conn) return null;

  if (!queues.has(queueName)) {
    const queue = new Queue(queueName, {
      connection: conn,
      defaultJobOptions: {
        attempts: 3,
        backoff: {
          type: 'exponential',
          delay: 1000,
        },
        removeOnComplete: 100, // Keep last 100 completed jobs
        removeOnFail: 1000, // Keep last 1000 failed jobs
      },
    });

    queues.set(queueName, queue);
  }

  return queues.get(queueName)!;
}

// =============================================================================
// JOB SUBMISSION
// =============================================================================

interface AddJobOptions {
  delay?: number; // Delay in milliseconds
  priority?: number; // 1 = highest priority
  attempts?: number;
  removeOnComplete?: boolean | number;
  removeOnFail?: boolean | number;
}

/**
 * Add a job to a queue
 */
export async function addJob<T>(
  queueName: string,
  jobName: JobName,
  data: T,
  options?: AddJobOptions
): Promise<Job<T> | null> {
  const queue = getQueue(queueName);
  if (!queue) {
    console.warn(`[JobQueue] Queue ${queueName} not available, job ${jobName} not added`);
    return null;
  }

  try {
    const job = await queue.add(jobName, data, options);
    console.log(`[JobQueue] Job ${jobName} added to ${queueName}: ${job.id}`);
    return job;
  } catch (error: any) {
    console.error(`[JobQueue] Failed to add job ${jobName}:`, error.message);
    return null;
  }
}

/**
 * Add multiple jobs to a queue
 */
export async function addBulkJobs<T>(
  queueName: string,
  jobs: Array<{ name: JobName; data: T; options?: AddJobOptions }>
): Promise<Job<T>[]> {
  const queue = getQueue(queueName);
  if (!queue) {
    console.warn(`[JobQueue] Queue ${queueName} not available`);
    return [];
  }

  try {
    const bulkJobs = jobs.map(j => ({
      name: j.name,
      data: j.data,
      opts: j.options,
    }));

    const result = await queue.addBulk(bulkJobs);
    console.log(`[JobQueue] ${result.length} jobs added to ${queueName}`);
    return result;
  } catch (error: any) {
    console.error(`[JobQueue] Failed to add bulk jobs:`, error.message);
    return [];
  }
}

/**
 * Schedule a job at a specific time
 */
export async function scheduleJob<T>(
  queueName: string,
  jobName: JobName,
  data: T,
  runAt: Date,
  options?: Omit<AddJobOptions, 'delay'>
): Promise<Job<T> | null> {
  const delay = runAt.getTime() - Date.now();
  if (delay <= 0) {
    // Run immediately if the time has passed
    return addJob(queueName, jobName, data, options);
  }
  return addJob(queueName, jobName, data, { ...options, delay });
}

// =============================================================================
// WORKER REGISTRATION
// =============================================================================

type JobProcessor<T, R> = (job: Job<T>) => Promise<R>;

/**
 * Register a worker to process jobs from a queue
 */
export function registerWorker<T, R>(
  queueName: string,
  processor: JobProcessor<T, R>,
  options?: { concurrency?: number }
): Worker | null {
  const conn = getConnectionConfig();
  if (!conn) return null;

  if (workers.has(queueName)) {
    console.warn(`[JobQueue] Worker for ${queueName} already registered`);
    return workers.get(queueName)!;
  }

  const worker = new Worker(
    queueName,
    async (job: Job<T>) => {
      console.log(`[JobQueue] Processing job ${job.name} (${job.id})`);
      try {
        const result = await processor(job);
        console.log(`[JobQueue] Job ${job.id} completed`);
        return result;
      } catch (error: any) {
        console.error(`[JobQueue] Job ${job.id} failed:`, error.message);
        throw error;
      }
    },
    {
      connection: conn,
      concurrency: options?.concurrency || 5,
    }
  );

  worker.on('completed', (job) => {
    console.log(`[JobQueue] Job ${job.id} completed successfully`);
  });

  worker.on('failed', (job, err) => {
    console.error(`[JobQueue] Job ${job?.id} failed:`, err.message);
  });

  worker.on('error', (err) => {
    console.error(`[JobQueue] Worker error:`, err.message);
  });

  workers.set(queueName, worker);
  console.log(`[JobQueue] Worker registered for ${queueName}`);

  return worker;
}

// =============================================================================
// CONVENIENCE METHODS FOR COMMON QUEUES
// =============================================================================

const EMAIL_QUEUE = 'email';
const NOTIFICATION_QUEUE = 'notifications';
const REMINDER_QUEUE = 'reminders';
const CLEANUP_QUEUE = 'cleanup';
const CALLS_QUEUE = 'calls';

/**
 * Queue an email to be sent
 */
export async function queueEmail(
  type: 'quote-notification' | 'password-reset' | 'booking-confirmation' | 'send',
  data: {
    to: string;
    subject: string;
    body?: string;
    template?: string;
    templateData?: Record<string, unknown>;
  }
): Promise<Job | null> {
  return addJob(EMAIL_QUEUE, `email:${type}` as JobName, data);
}

/**
 * Queue a push notification
 */
export async function queuePushNotification(data: {
  userId: string;
  title: string;
  body: string;
  data?: Record<string, unknown>;
}): Promise<Job | null> {
  return addJob(NOTIFICATION_QUEUE, 'notification:push', data);
}

/**
 * Queue an SMS notification
 */
export async function queueSmsNotification(data: {
  phone: string;
  message: string;
}): Promise<Job | null> {
  return addJob(NOTIFICATION_QUEUE, 'notification:sms', data);
}

/**
 * Schedule an appointment reminder
 */
export async function scheduleAppointmentReminder(
  appointmentId: string,
  userId: string,
  title: string,
  reminderTime: Date
): Promise<Job | null> {
  return scheduleJob(
    REMINDER_QUEUE,
    'reminder:appointment',
    { appointmentId, userId, title },
    reminderTime
  );
}

/**
 * Schedule a lead follow-up reminder
 */
export async function scheduleLeadFollowup(
  leadId: string,
  agentUserId: string,
  reminderTime: Date
): Promise<Job | null> {
  return scheduleJob(
    REMINDER_QUEUE,
    'reminder:lead-followup',
    { leadId, agentUserId },
    reminderTime
  );
}

/**
 * Queue an AI welcome call with a delay (post-close workflow)
 */
export async function queueAiWelcomeCall(data: {
  leadId: string;
  workflowId: string;
  clientPhone: string;
  clientFirstName: string;
  agentName: string;
  coverageType?: string;
}, delayMs: number): Promise<Job | null> {
  return addJob(CALLS_QUEUE, 'call:ai-welcome', data, {
    delay: delayMs,
    attempts: 2,
  });
}

/**
 * Schedule a post-close follow-up reminder
 */
export async function schedulePostCloseFollowup(
  data: {
    leadId: string;
    agentUserId: string;
    followUpType: string;
    title: string;
    clientName: string;
  },
  scheduledFor: Date
): Promise<Job | null> {
  return scheduleJob(
    REMINDER_QUEUE,
    'reminder:post-close-followup',
    data,
    scheduledFor
  );
}

// =============================================================================
// QUEUE STATUS
// =============================================================================

/**
 * Get queue statistics
 */
export async function getQueueStats(queueName: string): Promise<{
  waiting: number;
  active: number;
  completed: number;
  failed: number;
  delayed: number;
} | null> {
  const queue = getQueue(queueName);
  if (!queue) return null;

  try {
    const [waiting, active, completed, failed, delayed] = await Promise.all([
      queue.getWaitingCount(),
      queue.getActiveCount(),
      queue.getCompletedCount(),
      queue.getFailedCount(),
      queue.getDelayedCount(),
    ]);

    return { waiting, active, completed, failed, delayed };
  } catch (error: any) {
    console.error(`[JobQueue] Error getting stats for ${queueName}:`, error.message);
    return null;
  }
}

/**
 * Get all queue names and their stats
 */
export async function getAllQueueStats(): Promise<Map<string, ReturnType<typeof getQueueStats>>> {
  const stats = new Map();
  const queueNames = Array.from(queues.keys());
  for (const name of queueNames) {
    stats.set(name, await getQueueStats(name));
  }
  return stats;
}

// =============================================================================
// LIFECYCLE
// =============================================================================

/**
 * Initialize the job queue system
 */
export function initialize(): boolean {
  const conn = getConnectionConfig();
  if (!conn) {
    console.warn('[JobQueue] Job queue not initialized - Redis not available');
    return false;
  }

  // Create default queues
  getQueue(EMAIL_QUEUE);
  getQueue(NOTIFICATION_QUEUE);
  getQueue(REMINDER_QUEUE);
  getQueue(CLEANUP_QUEUE);
  getQueue(CALLS_QUEUE);

  console.log('[JobQueue] Job queue system initialized');
  return true;
}

/**
 * Gracefully shut down all queues and workers
 */
export async function shutdown(): Promise<void> {
  console.log('[JobQueue] Shutting down...');

  // Close all workers
  const workerEntries = Array.from(workers.entries());
  for (const [name, worker] of workerEntries) {
    try {
      await worker.close();
      console.log(`[JobQueue] Worker ${name} closed`);
    } catch (error: any) {
      console.error(`[JobQueue] Error closing worker ${name}:`, error.message);
    }
  }
  workers.clear();

  // Close all queues
  const queueEntries = Array.from(queues.entries());
  for (const [name, queue] of queueEntries) {
    try {
      await queue.close();
      console.log(`[JobQueue] Queue ${name} closed`);
    } catch (error: any) {
      console.error(`[JobQueue] Error closing queue ${name}:`, error.message);
    }
  }
  queues.clear();

  // Clear connection config
  connectionConfig = null;

  console.log('[JobQueue] Shutdown complete');
}

export default {
  initialize,
  shutdown,
  getQueue,
  addJob,
  addBulkJobs,
  scheduleJob,
  registerWorker,
  queueEmail,
  queuePushNotification,
  queueSmsNotification,
  scheduleAppointmentReminder,
  scheduleLeadFollowup,
  queueAiWelcomeCall,
  schedulePostCloseFollowup,
  getQueueStats,
  getAllQueueStats,
};
