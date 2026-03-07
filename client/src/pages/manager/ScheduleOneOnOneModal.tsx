/**
 * Schedule 1:1 Meeting Modal
 * Inline modal for scheduling one-on-one meetings from the Team Roster drawer
 * Heritage Design System — Emerald theme
 */

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { toast } from 'sonner';
import { Calendar, X } from 'lucide-react';
import {
  RADIUS,
  TYPE,
  GRID,
  COLORS,
} from '@/lib/heritageDesignSystem';

type MeetingTemplate = 'performance' | 'coaching' | 'development';

const TEMPLATES: { value: MeetingTemplate; label: string }[] = [
  { value: 'performance', label: 'Performance' },
  { value: 'coaching', label: 'Coaching' },
  { value: 'development', label: 'Development' },
];

const TEMPLATE_LABELS: Record<MeetingTemplate, string> = {
  performance: 'Performance Check-In',
  coaching: 'Coaching Focus',
  development: 'Development Planning',
};

const AGENDA_HINTS: Record<MeetingTemplate, string> = {
  performance: 'KPI review, pipeline status, weekly goals, blockers...',
  coaching: 'Call review, skill assessment, practice scenarios...',
  development: 'Career goals, certification progress, learning path...',
};

interface ScheduleOneOnOneModalProps {
  agent: { name: string; avatar: string; role: string } | null;
  open: boolean;
  onClose: () => void;
}

export function ScheduleOneOnOneModal({ agent, open, onClose }: ScheduleOneOnOneModalProps) {
  const [date, setDate] = useState('');
  const [time, setTime] = useState('10:00');
  const [duration, setDuration] = useState(30);
  const [template, setTemplate] = useState<MeetingTemplate>('performance');
  const [agenda, setAgenda] = useState('');

  const reset = () => {
    setDate(''); setTime('10:00'); setDuration(30); setTemplate('performance'); setAgenda('');
  };

  const handleClose = () => { onClose(); reset(); };

  const handleSubmit = () => {
    if (!date) {
      toast.error('Please select a date');
      return;
    }
    toast.success(`${TEMPLATE_LABELS[template]} 1:1 scheduled with ${agent!.name} on ${date}`);
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
                    <Calendar className="text-white" style={{ width: 20, height: 20 }} />
                  </div>
                  <div>
                    <h3 className="font-bold text-white" style={{ fontSize: TYPE.body }}>Schedule 1:1 Meeting</h3>
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

              {/* Template toggles */}
              <div>
                <label className="block text-gray-500 font-medium" style={{ fontSize: TYPE.caption, marginBottom: 4 }}>Meeting Type</label>
                <div className="flex" style={{ gap: GRID.spacing.xs }}>
                  {TEMPLATES.map((t) => (
                    <motion.button
                      key={t.value}
                      onClick={() => setTemplate(t.value)}
                      whileHover={{ scale: 1.04 }}
                      whileTap={{ scale: 0.96 }}
                      className="font-medium"
                      style={{
                        flex: 1,
                        padding: `${GRID.spacing.xs}px 0`,
                        borderRadius: RADIUS.pill,
                        fontSize: TYPE.caption,
                        border: template === t.value ? 'none' : `1px solid ${COLORS.gray[200]}`,
                        background: template === t.value ? 'linear-gradient(135deg, #059669, #0d9488)' : 'white',
                        color: template === t.value ? 'white' : COLORS.gray[600],
                      }}
                    >
                      {t.label}
                    </motion.button>
                  ))}
                </div>
              </div>

              {/* Agenda */}
              <div>
                <label className="block text-gray-500 font-medium" style={{ fontSize: TYPE.caption, marginBottom: 4 }}>Agenda <span className="text-gray-300">(optional)</span></label>
                <textarea
                  value={agenda}
                  onChange={(e) => setAgenda(e.target.value)}
                  placeholder={AGENDA_HINTS[template]}
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
