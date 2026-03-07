/**
 * Schedule Coaching Session Modal
 * Inline modal for scheduling coaching sessions from the Team Roster drawer
 * Heritage Design System — Emerald theme
 */

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { toast } from 'sonner';
import { GraduationCap, X } from 'lucide-react';
import {
  RADIUS,
  TYPE,
  GRID,
  COLORS,
} from '@/lib/heritageDesignSystem';

interface ScheduleCoachingModalProps {
  agent: { name: string; avatar: string; role: string } | null;
  open: boolean;
  onClose: () => void;
}

export function ScheduleCoachingModal({ agent, open, onClose }: ScheduleCoachingModalProps) {
  const [date, setDate] = useState('');
  const [time, setTime] = useState('10:00');
  const [duration, setDuration] = useState(30);
  const [topic, setTopic] = useState('');
  const [notes, setNotes] = useState('');

  const reset = () => {
    setDate(''); setTime('10:00'); setDuration(30); setTopic(''); setNotes('');
  };

  const handleClose = () => { onClose(); reset(); };

  const handleSubmit = () => {
    if (!date || !topic.trim()) {
      toast.error('Please fill in date and topic');
      return;
    }
    toast.success(`Coaching session scheduled with ${agent!.name} on ${date}`);
    handleClose();
  };

  return (
    <AnimatePresence>
      {open && agent && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={handleClose}
          style={{
            position: 'fixed',
            inset: 0,
            backgroundColor: 'rgba(0,0,0,0.4)',
            backdropFilter: 'blur(4px)',
            WebkitBackdropFilter: 'blur(4px)',
            zIndex: 100,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            padding: GRID.spacing.lg,
          }}
        >
          <motion.div
            initial={{ scale: 0.95, opacity: 0, y: 20 }}
            animate={{ scale: 1, opacity: 1, y: 0 }}
            exit={{ scale: 0.95, opacity: 0, y: 20 }}
            transition={{ type: 'spring', damping: 25, stiffness: 350 }}
            onClick={(e) => e.stopPropagation()}
            style={{
              width: '100%',
              maxWidth: 440,
              backgroundColor: 'white',
              borderRadius: RADIUS.card,
              boxShadow: '0 24px 64px rgba(0,0,0,0.2)',
              overflow: 'hidden',
            }}
          >
            {/* Header */}
            <div
              style={{
                background: 'linear-gradient(135deg, #059669 0%, #0d9488 50%, #fb7185 100%)',
                padding: `${GRID.spacing.md}px ${GRID.spacing.md}px`,
                position: 'relative',
                overflow: 'hidden',
              }}
            >
              <div style={{ width: 100, height: 100, borderRadius: RADIUS.pill }} className="absolute top-0 right-0 bg-white/10 -translate-y-1/2 translate-x-1/3 blur-sm" />
              <div className="flex items-center justify-between relative z-10">
                <div className="flex items-center" style={{ gap: GRID.spacing.sm }}>
                  <div
                    className="flex items-center justify-center bg-white/20 backdrop-blur"
                    style={{ width: 40, height: 40, borderRadius: RADIUS.button }}
                  >
                    <GraduationCap className="text-white" style={{ width: 20, height: 20 }} />
                  </div>
                  <div>
                    <h3 className="font-bold text-white" style={{ fontSize: TYPE.body }}>Schedule Coaching</h3>
                    <p className="text-white/70" style={{ fontSize: TYPE.caption }}>with {agent.name}</p>
                  </div>
                </div>
                <motion.button
                  onClick={handleClose}
                  whileHover={{ scale: 1.1 }}
                  whileTap={{ scale: 0.95 }}
                  className="flex items-center justify-center text-white/80 hover:text-white bg-white/15 hover:bg-white/25"
                  style={{ width: 32, height: 32, borderRadius: RADIUS.button }}
                >
                  <X style={{ width: 16, height: 16 }} />
                </motion.button>
              </div>
            </div>

            {/* Body */}
            <div style={{ padding: GRID.spacing.md, display: 'flex', flexDirection: 'column', gap: GRID.spacing.sm }}>
              {/* Agent chip */}
              <div className="flex items-center" style={{ gap: GRID.spacing.xs }}>
                <div
                  className="flex items-center justify-center text-white font-bold bg-gradient-to-br from-emerald-500 to-emerald-700"
                  style={{ width: 28, height: 28, borderRadius: RADIUS.pill, fontSize: 10 }}
                >
                  {agent.avatar}
                </div>
                <span className="font-medium text-gray-900" style={{ fontSize: TYPE.meta }}>{agent.name}</span>
                <span className="text-gray-400" style={{ fontSize: TYPE.caption }}>· {agent.role}</span>
              </div>

              {/* Date & Time row */}
              <div className="grid grid-cols-2" style={{ gap: GRID.spacing.sm }}>
                <div>
                  <label className="block text-gray-500 font-medium" style={{ fontSize: TYPE.caption, marginBottom: 4 }}>Date</label>
                  <input
                    type="date"
                    value={date}
                    onChange={(e) => setDate(e.target.value)}
                    style={{
                      width: '100%',
                      padding: `${GRID.spacing.xs}px ${GRID.spacing.sm}px`,
                      borderRadius: RADIUS.input,
                      border: `1px solid ${COLORS.gray[200]}`,
                      fontSize: TYPE.meta,
                      outline: 'none',
                    }}
                  />
                </div>
                <div>
                  <label className="block text-gray-500 font-medium" style={{ fontSize: TYPE.caption, marginBottom: 4 }}>Time</label>
                  <input
                    type="time"
                    value={time}
                    onChange={(e) => setTime(e.target.value)}
                    style={{
                      width: '100%',
                      padding: `${GRID.spacing.xs}px ${GRID.spacing.sm}px`,
                      borderRadius: RADIUS.input,
                      border: `1px solid ${COLORS.gray[200]}`,
                      fontSize: TYPE.meta,
                      outline: 'none',
                    }}
                  />
                </div>
              </div>

              {/* Duration toggles */}
              <div>
                <label className="block text-gray-500 font-medium" style={{ fontSize: TYPE.caption, marginBottom: 4 }}>Duration</label>
                <div className="flex" style={{ gap: GRID.spacing.xs }}>
                  {[15, 30, 45, 60].map((d) => (
                    <motion.button
                      key={d}
                      onClick={() => setDuration(d)}
                      whileHover={{ scale: 1.04 }}
                      whileTap={{ scale: 0.96 }}
                      className="font-medium"
                      style={{
                        flex: 1,
                        padding: `${GRID.spacing.xs}px 0`,
                        borderRadius: RADIUS.pill,
                        fontSize: TYPE.caption,
                        border: duration === d ? 'none' : `1px solid ${COLORS.gray[200]}`,
                        background: duration === d ? 'linear-gradient(135deg, #059669, #0d9488)' : 'white',
                        color: duration === d ? 'white' : COLORS.gray[600],
                      }}
                    >
                      {d}m
                    </motion.button>
                  ))}
                </div>
              </div>

              {/* Topic */}
              <div>
                <label className="block text-gray-500 font-medium" style={{ fontSize: TYPE.caption, marginBottom: 4 }}>Topic</label>
                <input
                  type="text"
                  value={topic}
                  onChange={(e) => setTopic(e.target.value)}
                  placeholder="e.g. Objection Handling, Pipeline Review"
                  style={{
                    width: '100%',
                    padding: `${GRID.spacing.xs}px ${GRID.spacing.sm}px`,
                    borderRadius: RADIUS.input,
                    border: `1px solid ${COLORS.gray[200]}`,
                    fontSize: TYPE.meta,
                    outline: 'none',
                  }}
                />
              </div>

              {/* Notes */}
              <div>
                <label className="block text-gray-500 font-medium" style={{ fontSize: TYPE.caption, marginBottom: 4 }}>Notes <span className="text-gray-300">(optional)</span></label>
                <textarea
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  placeholder="Preparation notes, specific areas to cover..."
                  rows={3}
                  style={{
                    width: '100%',
                    padding: `${GRID.spacing.xs}px ${GRID.spacing.sm}px`,
                    borderRadius: RADIUS.input,
                    border: `1px solid ${COLORS.gray[200]}`,
                    fontSize: TYPE.meta,
                    outline: 'none',
                    resize: 'none',
                  }}
                />
              </div>
            </div>

            {/* Footer */}
            <div
              className="flex items-center justify-end"
              style={{
                padding: `${GRID.spacing.sm}px ${GRID.spacing.md}px`,
                gap: GRID.spacing.sm,
                borderTop: `1px solid ${COLORS.gray[100]}`,
              }}
            >
              <motion.button
                onClick={handleClose}
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                className="font-medium text-gray-600"
                style={{
                  padding: `${GRID.spacing.xs}px ${GRID.spacing.md}px`,
                  borderRadius: RADIUS.button,
                  fontSize: TYPE.meta,
                  background: 'transparent',
                  border: 'none',
                }}
              >
                Cancel
              </motion.button>
              <motion.button
                onClick={handleSubmit}
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                className="font-semibold text-white bg-gradient-to-r from-emerald-500 to-teal-600"
                style={{
                  padding: `${GRID.spacing.xs}px ${GRID.spacing.lg}px`,
                  borderRadius: RADIUS.button,
                  fontSize: TYPE.meta,
                }}
              >
                Schedule
              </motion.button>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
