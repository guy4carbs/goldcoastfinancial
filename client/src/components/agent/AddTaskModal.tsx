import { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { 
  CheckSquare, Clock, Phone, GraduationCap, FileText, 
  UserPlus, Zap, AlertTriangle, Flag
} from "lucide-react";
import { cn } from "@/lib/utils";
import type { Task } from "@/lib/agentStore";

interface AddTaskModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onAddTask: (task: Omit<Task, 'id' | 'assignedTo' | 'completed'>) => void;
}

const CATEGORIES = [
  { value: 'calls', label: 'Calls', icon: Phone, color: 'text-primary' },
  { value: 'followup', label: 'Follow-up', icon: UserPlus, color: 'text-secondary' },
  { value: 'training', label: 'Training', icon: GraduationCap, color: 'text-primary' },
  { value: 'admin', label: 'Admin', icon: FileText, color: 'text-muted-foreground' },
];

const PRIORITIES = [
  { value: 'high', label: 'High', color: 'text-red-500', xp: 15 },
  { value: 'medium', label: 'Medium', color: 'text-secondary', xp: 10 },
  { value: 'low', label: 'Low', color: 'text-muted-foreground', xp: 5 },
];

export function AddTaskModal({ open, onOpenChange, onAddTask }: AddTaskModalProps) {
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    category: 'calls' as Task['category'],
    priority: 'medium',
    dueDate: new Date().toISOString().split('T')[0],
    dueTime: '',
  });

  const [errors, setErrors] = useState<Record<string, string>>({});

  const validateForm = () => {
    const newErrors: Record<string, string> = {};
    if (!formData.title.trim()) newErrors.title = 'Title is required';
    if (!formData.dueDate) newErrors.dueDate = 'Due date is required';
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = () => {
    if (!validateForm()) return;

    const priority = PRIORITIES.find(p => p.value === formData.priority);
    const dueString = formData.dueTime 
      ? `${formData.dueDate} ${formData.dueTime}`
      : formData.dueDate;

    onAddTask({
      title: formData.title,
      description: formData.description,
      category: formData.category,
      dueDate: dueString,
      performanceImpact: priority?.xp || 10,
    });

    setFormData({
      title: '',
      description: '',
      category: 'calls',
      priority: 'medium',
      dueDate: new Date().toISOString().split('T')[0],
      dueTime: '',
    });
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 font-serif">
            <div className="w-10 h-10 rounded-full bg-secondary/10 flex items-center justify-center">
              <CheckSquare className="w-5 h-5 text-secondary" />
            </div>
            Add New Task
          </DialogTitle>
          <DialogDescription>
            Create a task to track your work and earn XP.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-4">
          <div>
            <Label htmlFor="title" className="text-xs font-medium">Task Title *</Label>
            <Input
              id="title"
              value={formData.title}
              onChange={(e) => setFormData({ ...formData, title: e.target.value })}
              placeholder="e.g., Call 10 leads"
              className={errors.title ? 'border-red-500' : ''}
            />
            {errors.title && <p className="text-xs text-red-500 mt-1">{errors.title}</p>}
          </div>

          <div>
            <Label htmlFor="description" className="text-xs font-medium">Description</Label>
            <Textarea
              id="description"
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              placeholder="Add more details..."
              className="min-h-[60px]"
            />
          </div>

          <div>
            <Label className="text-xs font-medium mb-3 block">Category</Label>
            <div className="grid grid-cols-4 gap-2">
              {CATEGORIES.map((cat) => {
                const Icon = cat.icon;
                return (
                  <button
                    key={cat.value}
                    type="button"
                    onClick={() => setFormData({ ...formData, category: cat.value as Task['category'] })}
                    className={cn(
                      "p-3 rounded-lg border-2 transition-all text-center",
                      formData.category === cat.value
                        ? "border-secondary bg-secondary/10"
                        : "border-transparent bg-muted/50 hover:bg-muted"
                    )}
                  >
                    <Icon className={cn("w-5 h-5 mx-auto mb-1", cat.color)} />
                    <span className="text-xs">{cat.label}</span>
                  </button>
                );
              })}
            </div>
          </div>

          <div>
            <Label className="text-xs font-medium mb-3 block">Priority</Label>
            <RadioGroup 
              value={formData.priority} 
              onValueChange={(v) => setFormData({ ...formData, priority: v })}
              className="flex gap-3"
            >
              {PRIORITIES.map((priority) => (
                <div key={priority.value} className="flex-1">
                  <RadioGroupItem
                    value={priority.value}
                    id={`priority-${priority.value}`}
                    className="peer sr-only"
                  />
                  <Label
                    htmlFor={`priority-${priority.value}`}
                    className={cn(
                      "flex items-center justify-center gap-2 p-3 rounded-lg border-2 cursor-pointer transition-all",
                      formData.priority === priority.value
                        ? "border-secondary bg-secondary/10"
                        : "border-transparent bg-muted/50 hover:bg-muted"
                    )}
                  >
                    <Flag className={cn("w-4 h-4", priority.color)} />
                    <span className="text-sm">{priority.label}</span>
                    <span className="text-xs text-muted-foreground">+{priority.xp}</span>
                  </Label>
                </div>
              ))}
            </RadioGroup>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label htmlFor="dueDate" className="text-xs font-medium flex items-center gap-1">
                <Clock className="w-3 h-3" /> Due Date *
              </Label>
              <Input
                id="dueDate"
                type="date"
                value={formData.dueDate}
                onChange={(e) => setFormData({ ...formData, dueDate: e.target.value })}
                className={errors.dueDate ? 'border-red-500' : ''}
              />
            </div>
            <div>
              <Label htmlFor="dueTime" className="text-xs font-medium">Due Time (optional)</Label>
              <Input
                id="dueTime"
                type="time"
                value={formData.dueTime}
                onChange={(e) => setFormData({ ...formData, dueTime: e.target.value })}
              />
            </div>
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <Button onClick={handleSubmit} className="gap-2 bg-secondary hover:bg-secondary/90">
            <CheckSquare className="w-4 h-4" />
            Create Task
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
