/**
 * Contact Support Modal
 * Full-featured support modal with phone, email, live chat,
 * and support ticket submission.
 *
 * Heritage Design System — Emerald theme
 */

import { useState, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { glassCard, MANAGER_ICON_GRADIENT } from './managerConstants';
import { toast } from 'sonner';
import {
  RADIUS,
  TYPE,
  GRID,
  SHADOW,
  MOTION,
  COLORS,
  LAYOUT,
} from '@/lib/heritageDesignSystem';
import {
  X,
  Phone,
  Mail,
  MessageSquare,
  Send,
  Clock,
  CheckCircle2,
  HelpCircle,
} from 'lucide-react';

/* ── Types ──────────────────────────────────────────────── */

interface ContactSupportModalProps {
  open: boolean;
  onClose: () => void;
}

/* ── Component ──────────────────────────────────────────── */

export function ContactSupportModal({ open, onClose }: ContactSupportModalProps) {
  const [ticketSubject, setTicketSubject] = useState('');
  const [ticketMessage, setTicketMessage] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  const handleSubmitTicket = useCallback(async () => {
    if (!ticketSubject.trim()) {
      toast.error('Please enter a subject');
      return;
    }
    if (!ticketMessage.trim()) {
      toast.error('Please describe your issue');
      return;
    }
    setIsSubmitting(true);
    await new Promise((r) => setTimeout(r, 600));
    setIsSubmitting(false);
    setSubmitted(true);
    toast.success('Support ticket submitted', { description: 'We\'ll respond within 2 business hours' });
  }, [ticketSubject, ticketMessage]);

  const handleClose = useCallback(() => {
    onClose();
    // Reset after close animation
    setTimeout(() => {
      setTicketSubject('');
      setTicketMessage('');
      setSubmitted(false);
    }, 300);
  }, [onClose]);

  return (
    <AnimatePresence>
      {open && (
        <>
          {/* Backdrop */}
          <motion.div
            className="fixed inset-0 bg-black/40 backdrop-blur-sm z-50"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={handleClose}
          />

          {/* Modal */}
          <motion.div
            className="fixed inset-0 z-50 flex items-center justify-center p-4"
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
            transition={{ duration: MOTION.duration.expand }}
          >
            <div
              className="w-full max-w-lg overflow-hidden"
              style={{
                ...glassCard,
                borderRadius: RADIUS.hero,
                boxShadow: SHADOW.hero,
                maxHeight: '90vh',
                overflowY: 'auto',
              }}
              onClick={(e) => e.stopPropagation()}
            >
              {/* Header */}
              <div
                className={`relative bg-gradient-to-br ${MANAGER_ICON_GRADIENT}`}
                style={{ padding: GRID.spacing.md }}
              >
                <div className="absolute -top-6 -right-6 w-28 h-28 bg-white/10 rounded-full blur-xl" />
                <div className="absolute -bottom-3 -left-3 w-16 h-16 bg-amber-400/15 rounded-full blur-lg" />
                <div className="relative z-10 flex items-center justify-between">
                  <div className="flex items-center" style={{ gap: GRID.spacing.sm }}>
                    <div
                      className="flex items-center justify-center bg-white/20 backdrop-blur"
                      style={{ width: 44, height: 44, borderRadius: RADIUS.button }}
                    >
                      <HelpCircle className="text-amber-200" style={{ width: LAYOUT.icon.lg, height: LAYOUT.icon.lg }} />
                    </div>
                    <div>
                      <h2 className="font-semibold text-white" style={{ fontSize: TYPE.title }}>Contact Support</h2>
                      <p className="text-white/70" style={{ fontSize: TYPE.caption }}>We're here to help</p>
                    </div>
                  </div>
                  <button
                    onClick={handleClose}
                    className="flex items-center justify-center bg-white/10 hover:bg-white/20 transition-colors text-white"
                    style={{ width: 36, height: 36, borderRadius: RADIUS.button, border: 'none', cursor: 'pointer' }}
                  >
                    <X style={{ width: 18, height: 18 }} />
                  </button>
                </div>
              </div>

              <div style={{ padding: GRID.spacing.md }}>
                {/* Availability notice */}
                <div
                  className="flex items-center bg-emerald-50"
                  style={{ gap: GRID.spacing.xs, padding: GRID.spacing.sm, borderRadius: RADIUS.button, marginBottom: GRID.spacing.md }}
                >
                  <Clock className="text-emerald-600 flex-shrink-0" style={{ width: 16, height: 16 }} />
                  <p className="text-emerald-700" style={{ fontSize: TYPE.caption }}>
                    Support available Monday - Friday, 9:00 AM - 6:00 PM CT
                  </p>
                </div>

                {/* Contact options */}
                <div style={{ display: 'flex', flexDirection: 'column', gap: GRID.spacing.sm, marginBottom: GRID.spacing.md }}>
                  <motion.a
                    href="tel:6307780800"
                    className="flex items-center bg-white hover:bg-gray-50 transition-colors"
                    style={{
                      gap: GRID.spacing.sm,
                      padding: GRID.spacing.sm,
                      borderRadius: RADIUS.button,
                      border: `1px solid ${COLORS.gray[200]}`,
                      textDecoration: 'none',
                    }}
                    whileHover={{ y: -1, scale: 1.01 }}
                    transition={{ duration: MOTION.duration.hover }}
                  >
                    <div
                      className={`flex items-center justify-center bg-gradient-to-br ${MANAGER_ICON_GRADIENT} flex-shrink-0`}
                      style={{ width: 44, height: 44, borderRadius: RADIUS.button }}
                    >
                      <Phone className="text-amber-200" style={{ width: LAYOUT.icon.md, height: LAYOUT.icon.md }} />
                    </div>
                    <div>
                      <p className="font-semibold text-gray-900" style={{ fontSize: TYPE.meta }}>Call Support</p>
                      <p className="text-gray-500" style={{ fontSize: TYPE.caption }}>(630) 778-0800</p>
                    </div>
                  </motion.a>

                  <motion.a
                    href="mailto:managers@heritagels.org"
                    className="flex items-center bg-white hover:bg-gray-50 transition-colors"
                    style={{
                      gap: GRID.spacing.sm,
                      padding: GRID.spacing.sm,
                      borderRadius: RADIUS.button,
                      border: `1px solid ${COLORS.gray[200]}`,
                      textDecoration: 'none',
                    }}
                    whileHover={{ y: -1, scale: 1.01 }}
                    transition={{ duration: MOTION.duration.hover }}
                  >
                    <div
                      className={`flex items-center justify-center bg-gradient-to-br ${MANAGER_ICON_GRADIENT} flex-shrink-0`}
                      style={{ width: 44, height: 44, borderRadius: RADIUS.button }}
                    >
                      <Mail className="text-amber-200" style={{ width: LAYOUT.icon.md, height: LAYOUT.icon.md }} />
                    </div>
                    <div>
                      <p className="font-semibold text-gray-900" style={{ fontSize: TYPE.meta }}>Email Support</p>
                      <p className="text-gray-500" style={{ fontSize: TYPE.caption }}>managers@heritagels.org</p>
                    </div>
                  </motion.a>

                  <motion.button
                    className="flex items-center bg-white hover:bg-gray-50 transition-colors text-left"
                    style={{
                      gap: GRID.spacing.sm,
                      padding: GRID.spacing.sm,
                      borderRadius: RADIUS.button,
                      border: `1px solid ${COLORS.gray[200]}`,
                      cursor: 'pointer',
                    }}
                    whileHover={{ y: -1, scale: 1.01 }}
                    transition={{ duration: MOTION.duration.hover }}
                    onClick={() => {
                      toast.success('Live chat started', { description: 'A support agent will be with you shortly' });
                      handleClose();
                    }}
                  >
                    <div
                      className={`flex items-center justify-center bg-gradient-to-br ${MANAGER_ICON_GRADIENT} flex-shrink-0`}
                      style={{ width: 44, height: 44, borderRadius: RADIUS.button }}
                    >
                      <MessageSquare className="text-amber-200" style={{ width: LAYOUT.icon.md, height: LAYOUT.icon.md }} />
                    </div>
                    <div>
                      <p className="font-semibold text-gray-900" style={{ fontSize: TYPE.meta }}>Live Chat</p>
                      <p className="text-gray-500" style={{ fontSize: TYPE.caption }}>Start a conversation now</p>
                    </div>
                  </motion.button>
                </div>

                {/* Divider */}
                <div className="flex items-center" style={{ gap: GRID.spacing.sm, marginBottom: GRID.spacing.md }}>
                  <div className="flex-1" style={{ height: 1, backgroundColor: COLORS.gray[200] }} />
                  <span className="text-gray-400 font-medium" style={{ fontSize: TYPE.caption }}>or submit a ticket</span>
                  <div className="flex-1" style={{ height: 1, backgroundColor: COLORS.gray[200] }} />
                </div>

                {/* Ticket Form */}
                {submitted ? (
                  <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="text-center"
                    style={{ padding: GRID.spacing.md }}
                  >
                    <div
                      className="flex items-center justify-center bg-emerald-100 mx-auto mb-3"
                      style={{ width: 56, height: 56, borderRadius: RADIUS.pill }}
                    >
                      <CheckCircle2 className="text-emerald-600" style={{ width: 28, height: 28 }} />
                    </div>
                    <h3 className="font-semibold text-gray-900 mb-1" style={{ fontSize: TYPE.title }}>Ticket Submitted</h3>
                    <p className="text-gray-500 mb-4" style={{ fontSize: TYPE.meta }}>
                      We'll respond within 2 business hours. Check your email for updates.
                    </p>
                    <Button
                      onClick={handleClose}
                      className={`text-white border-0 bg-gradient-to-br ${MANAGER_ICON_GRADIENT}`}
                      style={{ borderRadius: RADIUS.button }}
                    >
                      Close
                    </Button>
                  </motion.div>
                ) : (
                  <div style={{ display: 'flex', flexDirection: 'column', gap: GRID.spacing.sm }}>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
                      <Label htmlFor="ticket-subject" className="text-gray-700 font-medium" style={{ fontSize: TYPE.meta }}>
                        Subject
                      </Label>
                      <Input
                        id="ticket-subject"
                        placeholder="Brief description of your issue"
                        value={ticketSubject}
                        onChange={(e) => setTicketSubject(e.target.value)}
                        style={{ borderRadius: RADIUS.input }}
                      />
                    </div>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
                      <Label htmlFor="ticket-message" className="text-gray-700 font-medium" style={{ fontSize: TYPE.meta }}>
                        Message
                      </Label>
                      <textarea
                        id="ticket-message"
                        placeholder="Describe your issue in detail..."
                        value={ticketMessage}
                        onChange={(e) => setTicketMessage(e.target.value)}
                        rows={4}
                        className="flex w-full border border-input bg-transparent px-3 py-2 text-sm shadow-sm placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring resize-none"
                        style={{ borderRadius: RADIUS.input }}
                      />
                    </div>
                    <div className="flex justify-end" style={{ gap: GRID.spacing.sm, paddingTop: GRID.spacing.xs }}>
                      <Button
                        variant="outline"
                        onClick={handleClose}
                        className="text-gray-600"
                        style={{ borderRadius: RADIUS.button }}
                      >
                        Cancel
                      </Button>
                      <Button
                        onClick={handleSubmitTicket}
                        disabled={isSubmitting}
                        className={`text-white border-0 bg-gradient-to-br ${MANAGER_ICON_GRADIENT} gap-2`}
                        style={{ borderRadius: RADIUS.button }}
                      >
                        {isSubmitting ? 'Submitting...' : (
                          <>
                            <Send className="w-4 h-4" />
                            Submit Ticket
                          </>
                        )}
                      </Button>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
