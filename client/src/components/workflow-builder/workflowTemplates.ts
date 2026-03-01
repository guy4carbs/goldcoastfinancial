/**
 * Workflow Templates
 * Pre-built automation workflows for common insurance sales scenarios
 */

import { Node, Edge } from "reactflow";

export interface WorkflowTemplate {
  id: string;
  name: string;
  description: string;
  category: "sales" | "retention" | "engagement" | "reminders";
  icon: string; // Lucide icon name
  nodes: Node[];
  edges: Edge[];
}

export const workflowTemplates: WorkflowTemplate[] = [
  // ═══════════════════════════════════════════════════════════════
  // POST-SALES CALL
  // Follow up after a successful sales call to reinforce the relationship
  // ═══════════════════════════════════════════════════════════════
  {
    id: "post-sales-call",
    name: "Post-Sales Call",
    description: "Automated follow-up sequence after a sales call to nurture the relationship",
    category: "sales",
    icon: "Phone",
    nodes: [
      {
        id: "trigger-1",
        type: "trigger",
        position: { x: 250, y: 50 },
        data: {
          label: "Call Completed",
          config: { triggerType: "event_based", eventType: "CALL_CONNECTED" },
        },
      },
      {
        id: "wait-1",
        type: "wait",
        position: { x: 250, y: 150 },
        data: {
          label: "Wait 30 Minutes",
          config: { duration: "30m" },
        },
      },
      {
        id: "action-1",
        type: "action",
        position: { x: 250, y: 250 },
        data: {
          label: "Thank You SMS",
          config: {
            actionType: "send_sms",
            message: "Hi {{first_name}}, thank you for speaking with me today! I'm here if you have any questions about your coverage options. - {{agent_name}}",
          },
        },
      },
      {
        id: "condition-1",
        type: "condition",
        position: { x: 250, y: 350 },
        data: {
          label: "Policy Sold?",
          config: { field: "policy_status", operator: "eq", value: "sold" },
        },
      },
      {
        id: "action-2",
        type: "action",
        position: { x: 100, y: 450 },
        data: {
          label: "Welcome Email",
          config: {
            actionType: "send_email",
            subject: "Welcome to Heritage Life! Your Policy Details",
            message: "Welcome to the Heritage family! Attached are your policy documents...",
          },
        },
      },
      {
        id: "wait-2",
        type: "wait",
        position: { x: 400, y: 450 },
        data: {
          label: "Wait 1 Day",
          config: { duration: "24h" },
        },
      },
      {
        id: "action-3",
        type: "action",
        position: { x: 400, y: 550 },
        data: {
          label: "Follow-up SMS",
          config: {
            actionType: "send_sms",
            message: "Hi {{first_name}}, just checking in! Would you like to schedule a quick call to discuss your coverage options?",
          },
        },
      },
      {
        id: "end-1",
        type: "end",
        position: { x: 100, y: 550 },
        data: {
          label: "Complete",
          config: { status: "success" },
        },
      },
      {
        id: "end-2",
        type: "end",
        position: { x: 400, y: 650 },
        data: {
          label: "Complete",
          config: { status: "success" },
        },
      },
    ],
    edges: [
      { id: "e1", source: "trigger-1", target: "wait-1", type: "smoothstep", style: { stroke: "#8B5CF6", strokeWidth: 2 } },
      { id: "e2", source: "wait-1", target: "action-1", type: "smoothstep", style: { stroke: "#8B5CF6", strokeWidth: 2 } },
      { id: "e3", source: "action-1", target: "condition-1", type: "smoothstep", style: { stroke: "#8B5CF6", strokeWidth: 2 } },
      { id: "e4", source: "condition-1", target: "action-2", sourceHandle: "yes", type: "smoothstep", label: "Yes", labelStyle: { fill: "#475569", fontWeight: 600, fontSize: 11 }, labelBgStyle: { fill: "#FFFFFF", fillOpacity: 0.9 }, labelBgPadding: [4, 8] as [number, number], labelBgBorderRadius: 4, style: { stroke: "#8B5CF6", strokeWidth: 2 } },
      { id: "e5", source: "condition-1", target: "wait-2", sourceHandle: "no", type: "smoothstep", label: "No", labelStyle: { fill: "#475569", fontWeight: 600, fontSize: 11 }, labelBgStyle: { fill: "#FFFFFF", fillOpacity: 0.9 }, labelBgPadding: [4, 8] as [number, number], labelBgBorderRadius: 4, style: { stroke: "#8B5CF6", strokeWidth: 2 } },
      { id: "e6", source: "action-2", target: "end-1", type: "smoothstep", style: { stroke: "#8B5CF6", strokeWidth: 2 } },
      { id: "e7", source: "wait-2", target: "action-3", type: "smoothstep", style: { stroke: "#8B5CF6", strokeWidth: 2 } },
      { id: "e8", source: "action-3", target: "end-2", type: "smoothstep", style: { stroke: "#8B5CF6", strokeWidth: 2 } },
    ],
  },

  // ═══════════════════════════════════════════════════════════════
  // MISSED CALL
  // Re-engage leads who didn't answer the phone
  // ═══════════════════════════════════════════════════════════════
  {
    id: "missed-call",
    name: "Missed Call",
    description: "Re-engage leads who missed your call with SMS and follow-up attempts",
    category: "sales",
    icon: "PhoneMissed",
    nodes: [
      {
        id: "trigger-1",
        type: "trigger",
        position: { x: 250, y: 50 },
        data: {
          label: "Call Missed",
          config: { triggerType: "event_based", eventType: "CALL_FAILED" },
        },
      },
      {
        id: "wait-1",
        type: "wait",
        position: { x: 250, y: 150 },
        data: {
          label: "Wait 5 Minutes",
          config: { duration: "5m" },
        },
      },
      {
        id: "action-1",
        type: "action",
        position: { x: 250, y: 250 },
        data: {
          label: "Missed Call SMS",
          config: {
            actionType: "send_sms",
            message: "Hi {{first_name}}, sorry I missed you! I was calling about your life insurance quote. When's a good time to connect? - {{agent_name}}",
          },
        },
      },
      {
        id: "wait-2",
        type: "wait",
        position: { x: 250, y: 350 },
        data: {
          label: "Wait 2 Hours",
          config: { duration: "2h" },
        },
      },
      {
        id: "condition-1",
        type: "condition",
        position: { x: 250, y: 450 },
        data: {
          label: "SMS Response?",
          config: { field: "sms_replied", operator: "eq", value: "true" },
        },
      },
      {
        id: "action-2",
        type: "action",
        position: { x: 100, y: 550 },
        data: {
          label: "Create Callback Task",
          config: {
            actionType: "create_task",
            taskType: "callback",
            priority: "high",
            description: "Lead responded to missed call SMS - call back ASAP",
          },
        },
      },
      {
        id: "action-3",
        type: "action",
        position: { x: 400, y: 550 },
        data: {
          label: "Schedule Retry Call",
          config: {
            actionType: "create_task",
            taskType: "call",
            priority: "medium",
            description: "Retry call - no response to missed call SMS",
          },
        },
      },
      {
        id: "end-1",
        type: "end",
        position: { x: 100, y: 650 },
        data: {
          label: "Complete",
          config: { status: "success" },
        },
      },
      {
        id: "end-2",
        type: "end",
        position: { x: 400, y: 650 },
        data: {
          label: "Complete",
          config: { status: "success" },
        },
      },
    ],
    edges: [
      { id: "e1", source: "trigger-1", target: "wait-1", type: "smoothstep", style: { stroke: "#8B5CF6", strokeWidth: 2 } },
      { id: "e2", source: "wait-1", target: "action-1", type: "smoothstep", style: { stroke: "#8B5CF6", strokeWidth: 2 } },
      { id: "e3", source: "action-1", target: "wait-2", type: "smoothstep", style: { stroke: "#8B5CF6", strokeWidth: 2 } },
      { id: "e4", source: "wait-2", target: "condition-1", type: "smoothstep", style: { stroke: "#8B5CF6", strokeWidth: 2 } },
      { id: "e5", source: "condition-1", target: "action-2", sourceHandle: "yes", type: "smoothstep", label: "Yes", labelStyle: { fill: "#475569", fontWeight: 600, fontSize: 11 }, labelBgStyle: { fill: "#FFFFFF", fillOpacity: 0.9 }, labelBgPadding: [4, 8] as [number, number], labelBgBorderRadius: 4, style: { stroke: "#8B5CF6", strokeWidth: 2 } },
      { id: "e6", source: "condition-1", target: "action-3", sourceHandle: "no", type: "smoothstep", label: "No", labelStyle: { fill: "#475569", fontWeight: 600, fontSize: 11 }, labelBgStyle: { fill: "#FFFFFF", fillOpacity: 0.9 }, labelBgPadding: [4, 8] as [number, number], labelBgBorderRadius: 4, style: { stroke: "#8B5CF6", strokeWidth: 2 } },
      { id: "e7", source: "action-2", target: "end-1", type: "smoothstep", style: { stroke: "#8B5CF6", strokeWidth: 2 } },
      { id: "e8", source: "action-3", target: "end-2", type: "smoothstep", style: { stroke: "#8B5CF6", strokeWidth: 2 } },
    ],
  },

  // ═══════════════════════════════════════════════════════════════
  // APPOINTMENT REMINDER
  // Reduce no-shows with timely reminders
  // ═══════════════════════════════════════════════════════════════
  {
    id: "appointment-reminder",
    name: "Appointment Reminder",
    description: "Reduce no-shows with automated SMS and email reminders before appointments",
    category: "reminders",
    icon: "Calendar",
    nodes: [
      {
        id: "trigger-1",
        type: "trigger",
        position: { x: 250, y: 50 },
        data: {
          label: "Appointment Booked",
          config: { triggerType: "event_based", eventType: "APPOINTMENT_BOOKED" },
        },
      },
      {
        id: "action-1",
        type: "action",
        position: { x: 250, y: 150 },
        data: {
          label: "Confirmation SMS",
          config: {
            actionType: "send_sms",
            message: "Hi {{first_name}}! Your appointment with {{agent_name}} is confirmed for {{appointment_date}} at {{appointment_time}}. Reply YES to confirm or call us to reschedule.",
          },
        },
      },
      {
        id: "condition-1",
        type: "condition",
        position: { x: 250, y: 250 },
        data: {
          label: "24+ Hours Away?",
          config: { field: "hours_until_appointment", operator: "gte", value: "24" },
        },
      },
      {
        id: "wait-1",
        type: "wait",
        position: { x: 100, y: 350 },
        data: {
          label: "Wait Until 24h Before",
          config: { duration: "until_24h_before" },
        },
      },
      {
        id: "action-2",
        type: "action",
        position: { x: 100, y: 450 },
        data: {
          label: "24hr Reminder Email",
          config: {
            actionType: "send_email",
            subject: "Reminder: Your Appointment Tomorrow",
            message: "Hi {{first_name}}, just a friendly reminder about your appointment tomorrow at {{appointment_time}}. We look forward to speaking with you!",
          },
        },
      },
      {
        id: "wait-2",
        type: "wait",
        position: { x: 250, y: 550 },
        data: {
          label: "Wait Until 1h Before",
          config: { duration: "until_1h_before" },
        },
      },
      {
        id: "action-3",
        type: "action",
        position: { x: 250, y: 650 },
        data: {
          label: "1hr Reminder SMS",
          config: {
            actionType: "send_sms",
            message: "Hi {{first_name}}, reminder: your call with {{agent_name}} is in 1 hour! We'll call you at {{phone}}.",
          },
        },
      },
      {
        id: "end-1",
        type: "end",
        position: { x: 250, y: 750 },
        data: {
          label: "Complete",
          config: { status: "success" },
        },
      },
      {
        id: "end-2",
        type: "end",
        position: { x: 400, y: 350 },
        data: {
          label: "Skip to 1hr Reminder",
          config: { status: "success" },
        },
      },
    ],
    edges: [
      { id: "e1", source: "trigger-1", target: "action-1", type: "smoothstep", style: { stroke: "#8B5CF6", strokeWidth: 2 } },
      { id: "e2", source: "action-1", target: "condition-1", type: "smoothstep", style: { stroke: "#8B5CF6", strokeWidth: 2 } },
      { id: "e3", source: "condition-1", target: "wait-1", sourceHandle: "yes", type: "smoothstep", label: "Yes", labelStyle: { fill: "#475569", fontWeight: 600, fontSize: 11 }, labelBgStyle: { fill: "#FFFFFF", fillOpacity: 0.9 }, labelBgPadding: [4, 8] as [number, number], labelBgBorderRadius: 4, style: { stroke: "#8B5CF6", strokeWidth: 2 } },
      { id: "e4", source: "condition-1", target: "wait-2", sourceHandle: "no", type: "smoothstep", label: "No", labelStyle: { fill: "#475569", fontWeight: 600, fontSize: 11 }, labelBgStyle: { fill: "#FFFFFF", fillOpacity: 0.9 }, labelBgPadding: [4, 8] as [number, number], labelBgBorderRadius: 4, style: { stroke: "#8B5CF6", strokeWidth: 2 } },
      { id: "e5", source: "wait-1", target: "action-2", type: "smoothstep", style: { stroke: "#8B5CF6", strokeWidth: 2 } },
      { id: "e6", source: "action-2", target: "wait-2", type: "smoothstep", style: { stroke: "#8B5CF6", strokeWidth: 2 } },
      { id: "e7", source: "wait-2", target: "action-3", type: "smoothstep", style: { stroke: "#8B5CF6", strokeWidth: 2 } },
      { id: "e8", source: "action-3", target: "end-1", type: "smoothstep", style: { stroke: "#8B5CF6", strokeWidth: 2 } },
    ],
  },

  // ═══════════════════════════════════════════════════════════════
  // GET YOU COVERED
  // Nurture sequence for leads who haven't purchased yet
  // ═══════════════════════════════════════════════════════════════
  {
    id: "get-you-covered",
    name: "Get You Covered",
    description: "Nurture sequence for leads who requested a quote but haven't purchased yet",
    category: "sales",
    icon: "Shield",
    nodes: [
      {
        id: "trigger-1",
        type: "trigger",
        position: { x: 250, y: 50 },
        data: {
          label: "Quote Requested",
          config: { triggerType: "event_based", eventType: "QUOTE_CREATED" },
        },
      },
      {
        id: "wait-1",
        type: "wait",
        position: { x: 250, y: 150 },
        data: {
          label: "Wait 1 Day",
          config: { duration: "24h" },
        },
      },
      {
        id: "condition-1",
        type: "condition",
        position: { x: 250, y: 250 },
        data: {
          label: "Policy Purchased?",
          config: { field: "policy_status", operator: "eq", value: "sold" },
        },
      },
      {
        id: "end-1",
        type: "end",
        position: { x: 100, y: 350 },
        data: {
          label: "Already Covered",
          config: { status: "success" },
        },
      },
      {
        id: "action-1",
        type: "action",
        position: { x: 400, y: 350 },
        data: {
          label: "Value SMS",
          config: {
            actionType: "send_sms",
            message: "Hi {{first_name}}, I wanted to follow up on your life insurance quote. Did you know that rates increase as we age? Let's lock in your rate today! - {{agent_name}}",
          },
        },
      },
      {
        id: "wait-2",
        type: "wait",
        position: { x: 400, y: 450 },
        data: {
          label: "Wait 3 Days",
          config: { duration: "72h" },
        },
      },
      {
        id: "condition-2",
        type: "condition",
        position: { x: 400, y: 550 },
        data: {
          label: "Policy Purchased?",
          config: { field: "policy_status", operator: "eq", value: "sold" },
        },
      },
      {
        id: "end-2",
        type: "end",
        position: { x: 250, y: 650 },
        data: {
          label: "Covered",
          config: { status: "success" },
        },
      },
      {
        id: "action-2",
        type: "action",
        position: { x: 550, y: 650 },
        data: {
          label: "Educational Email",
          config: {
            actionType: "send_email",
            subject: "Why Life Insurance Matters for Your Family",
            message: "Hi {{first_name}}, I wanted to share some important information about protecting your family's future...",
          },
        },
      },
      {
        id: "wait-3",
        type: "wait",
        position: { x: 550, y: 750 },
        data: {
          label: "Wait 4 Days",
          config: { duration: "96h" },
        },
      },
      {
        id: "action-3",
        type: "action",
        position: { x: 550, y: 850 },
        data: {
          label: "Final Outreach SMS",
          config: {
            actionType: "send_sms",
            message: "Hi {{first_name}}, your quote is still available! I'd love to answer any questions and help get your family protected. Call me anytime at {{agent_phone}}.",
          },
        },
      },
      {
        id: "action-4",
        type: "action",
        position: { x: 550, y: 950 },
        data: {
          label: "Create Follow-up Task",
          config: {
            actionType: "create_task",
            taskType: "call",
            priority: "medium",
            description: "Final follow-up call for quote - nurture sequence complete",
          },
        },
      },
      {
        id: "end-3",
        type: "end",
        position: { x: 550, y: 1050 },
        data: {
          label: "Sequence Complete",
          config: { status: "success" },
        },
      },
    ],
    edges: [
      { id: "e1", source: "trigger-1", target: "wait-1", type: "smoothstep", style: { stroke: "#8B5CF6", strokeWidth: 2 } },
      { id: "e2", source: "wait-1", target: "condition-1", type: "smoothstep", style: { stroke: "#8B5CF6", strokeWidth: 2 } },
      { id: "e3", source: "condition-1", target: "end-1", sourceHandle: "yes", type: "smoothstep", label: "Yes", labelStyle: { fill: "#475569", fontWeight: 600, fontSize: 11 }, labelBgStyle: { fill: "#FFFFFF", fillOpacity: 0.9 }, labelBgPadding: [4, 8] as [number, number], labelBgBorderRadius: 4, style: { stroke: "#8B5CF6", strokeWidth: 2 } },
      { id: "e4", source: "condition-1", target: "action-1", sourceHandle: "no", type: "smoothstep", label: "No", labelStyle: { fill: "#475569", fontWeight: 600, fontSize: 11 }, labelBgStyle: { fill: "#FFFFFF", fillOpacity: 0.9 }, labelBgPadding: [4, 8] as [number, number], labelBgBorderRadius: 4, style: { stroke: "#8B5CF6", strokeWidth: 2 } },
      { id: "e5", source: "action-1", target: "wait-2", type: "smoothstep", style: { stroke: "#8B5CF6", strokeWidth: 2 } },
      { id: "e6", source: "wait-2", target: "condition-2", type: "smoothstep", style: { stroke: "#8B5CF6", strokeWidth: 2 } },
      { id: "e7", source: "condition-2", target: "end-2", sourceHandle: "yes", type: "smoothstep", label: "Yes", labelStyle: { fill: "#475569", fontWeight: 600, fontSize: 11 }, labelBgStyle: { fill: "#FFFFFF", fillOpacity: 0.9 }, labelBgPadding: [4, 8] as [number, number], labelBgBorderRadius: 4, style: { stroke: "#8B5CF6", strokeWidth: 2 } },
      { id: "e8", source: "condition-2", target: "action-2", sourceHandle: "no", type: "smoothstep", label: "No", labelStyle: { fill: "#475569", fontWeight: 600, fontSize: 11 }, labelBgStyle: { fill: "#FFFFFF", fillOpacity: 0.9 }, labelBgPadding: [4, 8] as [number, number], labelBgBorderRadius: 4, style: { stroke: "#8B5CF6", strokeWidth: 2 } },
      { id: "e9", source: "action-2", target: "wait-3", type: "smoothstep", style: { stroke: "#8B5CF6", strokeWidth: 2 } },
      { id: "e10", source: "wait-3", target: "action-3", type: "smoothstep", style: { stroke: "#8B5CF6", strokeWidth: 2 } },
      { id: "e11", source: "action-3", target: "action-4", type: "smoothstep", style: { stroke: "#8B5CF6", strokeWidth: 2 } },
      { id: "e12", source: "action-4", target: "end-3", type: "smoothstep", style: { stroke: "#8B5CF6", strokeWidth: 2 } },
    ],
  },

  // ═══════════════════════════════════════════════════════════════
  // PAYMENT REMINDER
  // Remind clients about upcoming premium payments
  // ═══════════════════════════════════════════════════════════════
  {
    id: "payment-reminder",
    name: "Payment Reminder",
    description: "Automated reminders for upcoming and overdue premium payments",
    category: "retention",
    icon: "CreditCard",
    nodes: [
      {
        id: "trigger-1",
        type: "trigger",
        position: { x: 250, y: 50 },
        data: {
          label: "Payment Due Soon",
          config: { triggerType: "scheduled", schedule: "7_days_before_due" },
        },
      },
      {
        id: "action-1",
        type: "action",
        position: { x: 250, y: 150 },
        data: {
          label: "7-Day Reminder SMS",
          config: {
            actionType: "send_sms",
            message: "Hi {{first_name}}, your {{policy_type}} premium of ${{amount}} is due on {{due_date}}. Pay online at {{payment_link}} or call us for assistance.",
          },
        },
      },
      {
        id: "wait-1",
        type: "wait",
        position: { x: 250, y: 250 },
        data: {
          label: "Wait 5 Days",
          config: { duration: "120h" },
        },
      },
      {
        id: "condition-1",
        type: "condition",
        position: { x: 250, y: 350 },
        data: {
          label: "Payment Made?",
          config: { field: "payment_status", operator: "eq", value: "paid" },
        },
      },
      {
        id: "end-1",
        type: "end",
        position: { x: 100, y: 450 },
        data: {
          label: "Payment Received",
          config: { status: "success" },
        },
      },
      {
        id: "action-2",
        type: "action",
        position: { x: 400, y: 450 },
        data: {
          label: "2-Day Urgent Reminder",
          config: {
            actionType: "send_sms",
            message: "REMINDER: {{first_name}}, your premium payment is due in 2 days. Avoid a lapse in coverage - pay now at {{payment_link}}",
          },
        },
      },
      {
        id: "wait-2",
        type: "wait",
        position: { x: 400, y: 550 },
        data: {
          label: "Wait 3 Days",
          config: { duration: "72h" },
        },
      },
      {
        id: "condition-2",
        type: "condition",
        position: { x: 400, y: 650 },
        data: {
          label: "Payment Made?",
          config: { field: "payment_status", operator: "eq", value: "paid" },
        },
      },
      {
        id: "end-2",
        type: "end",
        position: { x: 250, y: 750 },
        data: {
          label: "Payment Received",
          config: { status: "success" },
        },
      },
      {
        id: "action-3",
        type: "action",
        position: { x: 550, y: 750 },
        data: {
          label: "Overdue Alert",
          config: {
            actionType: "send_email",
            subject: "URGENT: Your Policy Payment is Overdue",
            message: "Hi {{first_name}}, your payment is now overdue. To prevent policy cancellation, please make your payment immediately...",
          },
        },
      },
      {
        id: "action-4",
        type: "action",
        position: { x: 550, y: 850 },
        data: {
          label: "Create Urgent Task",
          config: {
            actionType: "create_task",
            taskType: "call",
            priority: "urgent",
            description: "URGENT: Payment overdue - call to prevent policy lapse",
          },
        },
      },
      {
        id: "end-3",
        type: "end",
        position: { x: 550, y: 950 },
        data: {
          label: "Escalated",
          config: { status: "escalated" },
        },
      },
    ],
    edges: [
      { id: "e1", source: "trigger-1", target: "action-1", type: "smoothstep", style: { stroke: "#8B5CF6", strokeWidth: 2 } },
      { id: "e2", source: "action-1", target: "wait-1", type: "smoothstep", style: { stroke: "#8B5CF6", strokeWidth: 2 } },
      { id: "e3", source: "wait-1", target: "condition-1", type: "smoothstep", style: { stroke: "#8B5CF6", strokeWidth: 2 } },
      { id: "e4", source: "condition-1", target: "end-1", sourceHandle: "yes", type: "smoothstep", label: "Yes", labelStyle: { fill: "#475569", fontWeight: 600, fontSize: 11 }, labelBgStyle: { fill: "#FFFFFF", fillOpacity: 0.9 }, labelBgPadding: [4, 8] as [number, number], labelBgBorderRadius: 4, style: { stroke: "#8B5CF6", strokeWidth: 2 } },
      { id: "e5", source: "condition-1", target: "action-2", sourceHandle: "no", type: "smoothstep", label: "No", labelStyle: { fill: "#475569", fontWeight: 600, fontSize: 11 }, labelBgStyle: { fill: "#FFFFFF", fillOpacity: 0.9 }, labelBgPadding: [4, 8] as [number, number], labelBgBorderRadius: 4, style: { stroke: "#8B5CF6", strokeWidth: 2 } },
      { id: "e6", source: "action-2", target: "wait-2", type: "smoothstep", style: { stroke: "#8B5CF6", strokeWidth: 2 } },
      { id: "e7", source: "wait-2", target: "condition-2", type: "smoothstep", style: { stroke: "#8B5CF6", strokeWidth: 2 } },
      { id: "e8", source: "condition-2", target: "end-2", sourceHandle: "yes", type: "smoothstep", label: "Yes", labelStyle: { fill: "#475569", fontWeight: 600, fontSize: 11 }, labelBgStyle: { fill: "#FFFFFF", fillOpacity: 0.9 }, labelBgPadding: [4, 8] as [number, number], labelBgBorderRadius: 4, style: { stroke: "#8B5CF6", strokeWidth: 2 } },
      { id: "e9", source: "condition-2", target: "action-3", sourceHandle: "no", type: "smoothstep", label: "No", labelStyle: { fill: "#475569", fontWeight: 600, fontSize: 11 }, labelBgStyle: { fill: "#FFFFFF", fillOpacity: 0.9 }, labelBgPadding: [4, 8] as [number, number], labelBgBorderRadius: 4, style: { stroke: "#8B5CF6", strokeWidth: 2 } },
      { id: "e10", source: "action-3", target: "action-4", type: "smoothstep", style: { stroke: "#8B5CF6", strokeWidth: 2 } },
      { id: "e11", source: "action-4", target: "end-3", type: "smoothstep", style: { stroke: "#8B5CF6", strokeWidth: 2 } },
    ],
  },

  // ═══════════════════════════════════════════════════════════════
  // CLIENT BIRTHDAY
  // Build relationships with personalized birthday wishes
  // ═══════════════════════════════════════════════════════════════
  {
    id: "client-birthday",
    name: "Client Birthday",
    description: "Send personalized birthday wishes to strengthen client relationships",
    category: "engagement",
    icon: "Cake",
    nodes: [
      {
        id: "trigger-1",
        type: "trigger",
        position: { x: 250, y: 50 },
        data: {
          label: "Birthday Today",
          config: { triggerType: "scheduled", schedule: "on_birthday" },
        },
      },
      {
        id: "condition-1",
        type: "condition",
        position: { x: 250, y: 150 },
        data: {
          label: "Active Policy?",
          config: { field: "policy_status", operator: "eq", value: "active" },
        },
      },
      {
        id: "action-1",
        type: "action",
        position: { x: 100, y: 250 },
        data: {
          label: "Client Birthday SMS",
          config: {
            actionType: "send_sms",
            message: "Happy Birthday, {{first_name}}! Wishing you a wonderful day filled with joy. Thank you for being a valued Heritage Life client! - {{agent_name}}",
          },
        },
      },
      {
        id: "action-2",
        type: "action",
        position: { x: 400, y: 250 },
        data: {
          label: "Prospect Birthday SMS",
          config: {
            actionType: "send_sms",
            message: "Happy Birthday, {{first_name}}! Wishing you health and happiness in the year ahead. Let's chat about protecting what matters most to you! - {{agent_name}}",
          },
        },
      },
      {
        id: "action-3",
        type: "action",
        position: { x: 100, y: 350 },
        data: {
          label: "Birthday Email",
          config: {
            actionType: "send_email",
            subject: "Happy Birthday from Heritage Life!",
            message: "Dear {{first_name}},\n\nWishing you a very happy birthday! As your insurance partner, we're grateful for your trust in us.\n\nHere's to another year of health, happiness, and peace of mind knowing your family is protected.\n\nWarm regards,\n{{agent_name}}",
          },
        },
      },
      {
        id: "end-1",
        type: "end",
        position: { x: 100, y: 450 },
        data: {
          label: "Complete",
          config: { status: "success" },
        },
      },
      {
        id: "end-2",
        type: "end",
        position: { x: 400, y: 350 },
        data: {
          label: "Complete",
          config: { status: "success" },
        },
      },
    ],
    edges: [
      { id: "e1", source: "trigger-1", target: "condition-1", type: "smoothstep", style: { stroke: "#8B5CF6", strokeWidth: 2 } },
      { id: "e2", source: "condition-1", target: "action-1", sourceHandle: "yes", type: "smoothstep", label: "Yes", labelStyle: { fill: "#475569", fontWeight: 600, fontSize: 11 }, labelBgStyle: { fill: "#FFFFFF", fillOpacity: 0.9 }, labelBgPadding: [4, 8] as [number, number], labelBgBorderRadius: 4, style: { stroke: "#8B5CF6", strokeWidth: 2 } },
      { id: "e3", source: "condition-1", target: "action-2", sourceHandle: "no", type: "smoothstep", label: "No", labelStyle: { fill: "#475569", fontWeight: 600, fontSize: 11 }, labelBgStyle: { fill: "#FFFFFF", fillOpacity: 0.9 }, labelBgPadding: [4, 8] as [number, number], labelBgBorderRadius: 4, style: { stroke: "#8B5CF6", strokeWidth: 2 } },
      { id: "e4", source: "action-1", target: "action-3", type: "smoothstep", style: { stroke: "#8B5CF6", strokeWidth: 2 } },
      { id: "e5", source: "action-3", target: "end-1", type: "smoothstep", style: { stroke: "#8B5CF6", strokeWidth: 2 } },
      { id: "e6", source: "action-2", target: "end-2", type: "smoothstep", style: { stroke: "#8B5CF6", strokeWidth: 2 } },
    ],
  },
];

// Helper to get template by ID
export const getTemplateById = (id: string): WorkflowTemplate | undefined => {
  return workflowTemplates.find((t) => t.id === id);
};

// Helper to get templates by category
export const getTemplatesByCategory = (category: WorkflowTemplate["category"]): WorkflowTemplate[] => {
  return workflowTemplates.filter((t) => t.category === category);
};
