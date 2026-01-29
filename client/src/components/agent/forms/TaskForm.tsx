import { useState } from "react";
import { motion } from "framer-motion";
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  CheckSquare, Calendar, Clock, Flag, User, Tag,
  Save, X, Loader2, Bell, Repeat, Link2, Zap
} from "lucide-react";
import { cn } from "@/lib/utils";
import { FormField, FormSelect } from "./FormField";
import { fadeInUp, staggerContainer } from "@/lib/animations";

export interface TaskFormData {
  title: string;
  description: string;
  dueDate: string;
  dueTime: string;
  priority: 'low' | 'medium' | 'high' | 'urgent';
  category: string;
  assignedTo: string;
  relatedLeadId: string;
  relatedLeadName: string;
  reminder: string;
  recurring: string;
  estimatedMinutes: string;
}

interface TaskFormProps {
  initialData?: Partial<TaskFormData>;
  onSubmit?: (data: TaskFormData) => void;
  onCancel?: () => void;
  isLoading?: boolean;
  className?: string;
  leads?: Array<{ id: string; name: string }>;
}

const categoryOptions = [
  { value: 'call', label: 'Phone Call' },
  { value: 'email', label: 'Send Email' },
  { value: 'meeting', label: 'Meeting' },
  { value: 'follow-up', label: 'Follow-up' },
  { value: 'quote', label: 'Prepare Quote' },
  { value: 'paperwork', label: 'Paperwork' },
  { value: 'training', label: 'Training' },
  { value: 'other', label: 'Other' },
];

const reminderOptions = [
  { value: 'none', label: 'No reminder' },
  { value: '15min', label: '15 minutes before' },
  { value: '30min', label: '30 minutes before' },
  { value: '1hour', label: '1 hour before' },
  { value: '1day', label: '1 day before' },
];

const recurringOptions = [
  { value: 'none', label: 'Does not repeat' },
  { value: 'daily', label: 'Daily' },
  { value: 'weekly', label: 'Weekly' },
  { value: 'biweekly', label: 'Every 2 weeks' },
  { value: 'monthly', label: 'Monthly' },
];

const priorityConfig = {
  low: { label: 'Low', color: 'text-gray-500', bg: 'bg-gray-100', border: 'border-gray-300' },
  medium: { label: 'Medium', color: 'text-blue-500', bg: 'bg-blue-100', border: 'border-blue-300' },
  high: { label: 'High', color: 'text-orange-500', bg: 'bg-orange-100', border: 'border-orange-300' },
  urgent: { label: 'Urgent', color: 'text-red-500', bg: 'bg-red-100', border: 'border-red-300' },
};

const initialFormData: TaskFormData = {
  title: '',
  description: '',
  dueDate: '',
  dueTime: '',
  priority: 'medium',
  category: '',
  assignedTo: '',
  relatedLeadId: '',
  relatedLeadName: '',
  reminder: 'none',
  recurring: 'none',
  estimatedMinutes: '',
};

export function TaskForm({
  initialData,
  onSubmit,
  onCancel,
  isLoading = false,
  className,
  leads = [],
}: TaskFormProps) {
  const [formData, setFormData] = useState<TaskFormData>({
    ...initialFormData,
    ...initialData,
  });

  const [errors, setErrors] = useState<Partial<Record<keyof TaskFormData, string>>>({});

  const updateField = (field: keyof TaskFormData, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: undefined }));
    }
  };

  const validateForm = (): boolean => {
    const newErrors: Partial<Record<keyof TaskFormData, string>> = {};

    if (!formData.title.trim()) {
      newErrors.title = 'Task title is required';
    }

    if (!formData.dueDate) {
      newErrors.dueDate = 'Due date is required';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (validateForm()) {
      onSubmit?.(formData);
    }
  };

  const leadOptions = leads.map(lead => ({
    value: lead.id,
    label: lead.name,
  }));

  return (
    <Card className={cn("border-gray-100 overflow-hidden", className)}>
      <CardHeader className="bg-gradient-to-r from-violet-500/10 to-transparent border-b border-gray-100">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-violet-500 flex items-center justify-center">
              <CheckSquare className="w-5 h-5 text-white" />
            </div>
            <div>
              <CardTitle className="text-lg text-primary">Create Task</CardTitle>
              <p className="text-xs text-gray-500 mt-0.5">
                Add a new task to your list
              </p>
            </div>
          </div>
          <Badge className="bg-violet-500/10 text-violet-500 text-xs">
            <Zap className="w-3 h-3 mr-1" />
            +10 XP
          </Badge>
        </div>
      </CardHeader>

      <form onSubmit={handleSubmit}>
        <CardContent className="p-6">
          <motion.div
            variants={staggerContainer}
            initial="hidden"
            animate="visible"
            className="space-y-6"
          >
            {/* Title & Description */}
            <motion.div variants={fadeInUp} className="space-y-4">
              <FormField
                label="Task Title"
                name="title"
                placeholder="What needs to be done?"
                value={formData.title}
                onChange={(v) => updateField('title', v)}
                error={errors.title}
                required
              />
              <FormField
                label="Description"
                name="description"
                type="textarea"
                placeholder="Add more details about this task..."
                value={formData.description}
                onChange={(v) => updateField('description', v)}
                rows={2}
              />
            </motion.div>

            {/* Priority Selection */}
            <motion.div variants={fadeInUp}>
              <label className="text-sm font-medium text-primary mb-3 block flex items-center gap-2">
                <Flag className="w-4 h-4" />
                Priority
              </label>
              <div className="grid grid-cols-4 gap-2">
                {(Object.keys(priorityConfig) as Array<keyof typeof priorityConfig>).map((priority) => {
                  const config = priorityConfig[priority];
                  const isSelected = formData.priority === priority;

                  return (
                    <button
                      key={priority}
                      type="button"
                      onClick={() => updateField('priority', priority)}
                      className={cn(
                        "p-3 rounded-xl border-2 transition-all text-center",
                        isSelected
                          ? `${config.border} ${config.bg}`
                          : "border-gray-200 hover:border-gray-300"
                      )}
                    >
                      <Flag className={cn(
                        "w-5 h-5 mx-auto mb-1",
                        isSelected ? config.color : "text-gray-400"
                      )} />
                      <p className={cn(
                        "text-xs font-medium",
                        isSelected ? config.color : "text-gray-500"
                      )}>
                        {config.label}
                      </p>
                    </button>
                  );
                })}
              </div>
            </motion.div>

            {/* Due Date & Time */}
            <motion.div variants={fadeInUp}>
              <h3 className="text-sm font-semibold text-primary mb-4 flex items-center gap-2">
                <Calendar className="w-4 h-4" />
                Schedule
              </h3>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <FormField
                  label="Due Date"
                  name="dueDate"
                  type="date"
                  value={formData.dueDate}
                  onChange={(v) => updateField('dueDate', v)}
                  error={errors.dueDate}
                  required
                />
                <FormField
                  label="Due Time"
                  name="dueTime"
                  type="time"
                  value={formData.dueTime}
                  onChange={(v) => updateField('dueTime', v)}
                  icon={<Clock className="w-4 h-4" />}
                />
                <FormField
                  label="Estimated Time"
                  name="estimatedMinutes"
                  type="number"
                  placeholder="30"
                  value={formData.estimatedMinutes}
                  onChange={(v) => updateField('estimatedMinutes', v)}
                  suffix="min"
                />
              </div>
            </motion.div>

            {/* Category & Related Lead */}
            <motion.div variants={fadeInUp}>
              <h3 className="text-sm font-semibold text-primary mb-4 flex items-center gap-2">
                <Tag className="w-4 h-4" />
                Organization
              </h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <FormSelect
                  label="Category"
                  name="category"
                  options={categoryOptions}
                  value={formData.category}
                  onChange={(v) => updateField('category', v)}
                  placeholder="Select category"
                />
                {leadOptions.length > 0 && (
                  <FormSelect
                    label="Related Lead"
                    name="relatedLeadId"
                    options={leadOptions}
                    value={formData.relatedLeadId}
                    onChange={(v) => updateField('relatedLeadId', v)}
                    placeholder="Link to lead"
                  />
                )}
              </div>
            </motion.div>

            {/* Reminder & Recurring */}
            <motion.div variants={fadeInUp}>
              <h3 className="text-sm font-semibold text-primary mb-4 flex items-center gap-2">
                <Bell className="w-4 h-4" />
                Notifications & Repeat
              </h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <FormSelect
                  label="Reminder"
                  name="reminder"
                  options={reminderOptions}
                  value={formData.reminder}
                  onChange={(v) => updateField('reminder', v)}
                />
                <FormSelect
                  label="Repeat"
                  name="recurring"
                  options={recurringOptions}
                  value={formData.recurring}
                  onChange={(v) => updateField('recurring', v)}
                />
              </div>
            </motion.div>
          </motion.div>
        </CardContent>

        <CardFooter className="border-t border-gray-100 bg-gray-50/50 flex justify-between items-center p-4">
          <div className="flex items-center gap-2">
            {formData.dueDate && (
              <motion.div
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-violet-500/10"
              >
                <Calendar className="w-4 h-4 text-violet-500" />
                <span className="text-sm font-medium text-violet-500">
                  {new Date(formData.dueDate).toLocaleDateString('en-US', {
                    month: 'short',
                    day: 'numeric',
                  })}
                  {formData.dueTime && ` at ${formData.dueTime}`}
                </span>
              </motion.div>
            )}
            {formData.priority !== 'medium' && (
              <Badge className={cn(
                "text-xs",
                priorityConfig[formData.priority].bg,
                priorityConfig[formData.priority].color
              )}>
                <Flag className="w-3 h-3 mr-1" />
                {priorityConfig[formData.priority].label}
              </Badge>
            )}
          </div>

          <div className="flex gap-3">
            {onCancel && (
              <Button
                type="button"
                variant="outline"
                onClick={onCancel}
                disabled={isLoading}
                className="gap-2"
              >
                <X className="w-4 h-4" />
                Cancel
              </Button>
            )}
            <Button
              type="submit"
              disabled={isLoading}
              className="bg-primary hover:bg-primary/90 gap-2"
            >
              {isLoading ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : (
                <Save className="w-4 h-4" />
              )}
              Create Task
            </Button>
          </div>
        </CardFooter>
      </form>
    </Card>
  );
}

export default TaskForm;
