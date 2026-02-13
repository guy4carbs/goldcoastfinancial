/**
 * BILLING_AGENT
 * Payment setup, retry logic (exponential backoff), lapse prevention,
 * grace period management, payment method validation. Emits PAYMENT_PROCESSED.
 */

import {
  BaseAgent, EventType, AgentEvent,
  memoryGraph, NodeType, EdgeType,
  analyticsLedger, MetricType,
  securityLayer, Permission,
} from '../core';

interface PaymentRecord {
  clientId: string;
  policyId: string;
  amount: number;
  method: 'ach' | 'credit_card' | 'debit_card' | 'check';
  status: 'pending' | 'processed' | 'failed' | 'retrying' | 'lapsed';
  retryCount: number;
  maxRetries: number;
  nextRetryAt: number | null;
  dueDate: number;
  processedAt: number | null;
  gracePeriodEnd: number | null;
  failureReason?: string;
  lastFour?: string;
}

const GRACE_PERIOD_DAYS = 31;
const MAX_RETRIES = 4;
const BASE_RETRY_DELAY_MS = 2 * 60 * 60 * 1000; // 2 hours

export class BillingAgent extends BaseAgent {
  private retryCheckInterval: NodeJS.Timeout | null = null;

  constructor() {
    super({
      id: 'billing',
      name: 'BILLING_AGENT',
      tier: 6,
      description: 'Payment processing, retry logic, lapse prevention, grace period management',
      capabilities: ['payment_processing', 'retry_logic', 'lapse_prevention', 'grace_period'],
      consumesEvents: [EventType.APPLICATION_SUBMITTED, EventType.POLICY_SOLD],
      producesEvents: [EventType.PAYMENT_PROCESSED],
    });
  }

  protected async onStart(): Promise<void> {
    securityLayer.registerAgent(this.id, [
      Permission.READ_CLIENTS, Permission.READ_POLICIES,
      Permission.PROCESS_PAYMENTS,
    ]);
    this.retryCheckInterval = setInterval(() => this.processRetries(), 60 * 1000);
  }

  protected async onStop(): Promise<void> {
    if (this.retryCheckInterval) { clearInterval(this.retryCheckInterval); this.retryCheckInterval = null; }
  }

  protected async handleEvent(event: AgentEvent): Promise<void> {
    if (event.type === EventType.POLICY_SOLD) {
      await this.setupPayment(event.payload);
    }
  }

  private async setupPayment(payload: any): Promise<void> {
    const { leadId, premium, policyType, carrier } = payload;

    if (!securityLayer.authorize(this.id, 'setup_payment', Permission.PROCESS_PAYMENTS, 'payment', leadId)) {
      console.warn(`[BILLING] ⛔ Denied payment setup for ${leadId}`);
      return;
    }

    const payment: PaymentRecord = {
      clientId: leadId,
      policyId: payload.policyId || leadId,
      amount: premium,
      method: 'ach',
      status: 'pending',
      retryCount: 0,
      maxRetries: MAX_RETRIES,
      nextRetryAt: null,
      dueDate: Date.now(),
      processedAt: null,
      gracePeriodEnd: null,
    };

    // Validate payment method
    const validation = this.validatePaymentMethod(payment.method, payload);
    if (!validation.valid) {
      payment.status = 'failed';
      payment.failureReason = validation.reason;
      console.warn(`[BILLING] ❌ Payment validation failed: ${validation.reason}`);
    }

    const paymentNode = this.memory.addNode(NodeType.PAYMENT, payment, this.id, [
      'payment', payment.method, payment.status,
    ]);
    this.memory.addEdge(EdgeType.HAS_PAYMENT, leadId, paymentNode.id, this.id);

    if (payment.status !== 'failed') {
      await this.processPayment(paymentNode.id, payment);
    }
  }

  private async processPayment(paymentNodeId: string, payment: PaymentRecord): Promise<void> {
    // Simulate payment processing (in production, this calls payment gateway)
    const success = Math.random() > 0.1; // 90% success rate

    if (success) {
      this.memory.updateNode(paymentNodeId, {
        status: 'processed' as const,
        processedAt: Date.now(),
      }, this.id);

      analyticsLedger.record(MetricType.REVENUE_PREMIUM, payment.amount, this.id, {
        entityId: payment.clientId,
        unit: 'usd',
        metadata: { method: payment.method, policyId: payment.policyId },
      });

      this.emit(EventType.PAYMENT_PROCESSED, {
        paymentId: paymentNodeId,
        clientId: payment.clientId,
        policyId: payment.policyId,
        amount: payment.amount,
        method: payment.method,
        status: 'success',
      });

      console.log(`[BILLING] ✅ Payment processed: $${payment.amount} from ${payment.clientId} via ${payment.method}`);
    } else {
      const retryDelay = BASE_RETRY_DELAY_MS * Math.pow(2, payment.retryCount);
      const gracePeriodEnd = payment.dueDate + GRACE_PERIOD_DAYS * 24 * 60 * 60 * 1000;

      this.memory.updateNode(paymentNodeId, {
        status: 'retrying' as const,
        retryCount: payment.retryCount + 1,
        nextRetryAt: Date.now() + retryDelay,
        gracePeriodEnd,
        failureReason: 'Payment declined by processor',
      }, this.id);

      if (payment.retryCount + 1 >= MAX_RETRIES) {
        this.memory.updateNode(paymentNodeId, { status: 'lapsed' as const }, this.id);

        this.emit(EventType.PAYMENT_PROCESSED, {
          paymentId: paymentNodeId,
          clientId: payment.clientId,
          policyId: payment.policyId,
          amount: payment.amount,
          status: 'lapsed',
          gracePeriodEnd,
        }, { metadata: { tier: 6, priority: 'critical' } });

        console.warn(`[BILLING] 🚨 Payment LAPSED after ${MAX_RETRIES} retries: ${payment.clientId}`);
      } else {
        console.log(`[BILLING] 🔄 Retry ${payment.retryCount + 1}/${MAX_RETRIES} scheduled in ${Math.round(retryDelay / 3600000)}h for ${payment.clientId}`);
      }
    }
  }

  private async processRetries(): Promise<void> {
    const payments = this.memory.getNodesByType<PaymentRecord>(NodeType.PAYMENT);
    const now = Date.now();

    for (const p of payments) {
      if (p.data.status === 'retrying' && p.data.nextRetryAt && now >= p.data.nextRetryAt) {
        await this.processPayment(p.id, p.data);
      }
      // Lapse prevention: check grace period
      if (p.data.status === 'retrying' && p.data.gracePeriodEnd && now > p.data.gracePeriodEnd) {
        this.memory.updateNode(p.id, { status: 'lapsed' as const }, this.id);
        this.emit(EventType.PAYMENT_PROCESSED, {
          paymentId: p.id, clientId: p.data.clientId, policyId: p.data.policyId,
          amount: p.data.amount, status: 'grace_period_expired',
        }, { metadata: { tier: 6, priority: 'critical' } });
      }
    }
  }

  private validatePaymentMethod(method: string, payload: any): { valid: boolean; reason?: string } {
    if (method === 'credit_card' || method === 'debit_card') {
      if (payload.cardNumber) {
        const digits = payload.cardNumber.replace(/\D/g, '');
        if (!this.luhnCheck(digits)) return { valid: false, reason: 'Invalid card number (Luhn check failed)' };
        if (digits.length < 13 || digits.length > 19) return { valid: false, reason: 'Invalid card number length' };
      }
      if (payload.expiry) {
        const [month, year] = payload.expiry.split('/').map(Number);
        const expDate = new Date(2000 + year, month, 0);
        if (expDate < new Date()) return { valid: false, reason: 'Card expired' };
      }
    }
    if (method === 'ach') {
      if (payload.routingNumber && payload.routingNumber.replace(/\D/g, '').length !== 9) {
        return { valid: false, reason: 'Invalid routing number' };
      }
    }
    return { valid: true };
  }

  private luhnCheck(num: string): boolean {
    let sum = 0;
    let alternate = false;
    for (let i = num.length - 1; i >= 0; i--) {
      let n = parseInt(num[i], 10);
      if (alternate) { n *= 2; if (n > 9) n -= 9; }
      sum += n;
      alternate = !alternate;
    }
    return sum % 10 === 0;
  }
}
