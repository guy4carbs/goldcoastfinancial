/**
 * AvatarEditModal - Modal for creating/editing avatars
 *
 * Provides:
 * - Basic info (name, slug, domains)
 * - Speaking and debate style
 * - System prompt editor
 * - Advanced settings (temperature, tokens)
 * - Bias/constraint configuration
 */

import { useState, useEffect } from "react";
import { cn } from "@/lib/utils";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Slider } from "@/components/ui/slider";
import { Switch } from "@/components/ui/switch";
import { Badge } from "@/components/ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "@/components/ui/tabs";
import {
  Bot,
  Loader2,
  X,
  Plus,
  AlertTriangle,
} from "lucide-react";
import type { Avatar } from "@/lib/avatarCouncilStore";

// =============================================================================
// TYPES
// =============================================================================

export type DebateStyle = "analytical" | "aggressive" | "empathetic";

export interface AvatarFormData {
  name: string;
  slug: string;
  domainExpertise: string[];
  speakingStyle: string;
  debateStyle: DebateStyle;
  responsePriority: number;
  systemPrompt: string;
  isActive: boolean;

  // Advanced
  maxTokens: number;
  temperature: number;
  topP: number;

  // Bias/Constraints
  biasInstructions: string;
  constraints: string[];
}

export interface AvatarEditModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;

  // If provided, editing; otherwise creating
  avatar?: Avatar;

  // Actions
  onSave: (data: AvatarFormData) => Promise<void>;

  // State
  isLoading?: boolean;
  error?: string;
}

// =============================================================================
// DEFAULT VALUES
// =============================================================================

const DEFAULT_FORM_DATA: AvatarFormData = {
  name: "",
  slug: "",
  domainExpertise: [],
  speakingStyle: "",
  debateStyle: "analytical",
  responsePriority: 5,
  systemPrompt: "",
  isActive: true,
  maxTokens: 1024,
  temperature: 0.7,
  topP: 1.0,
  biasInstructions: "",
  constraints: [],
};

// =============================================================================
// COMPONENT
// =============================================================================

export function AvatarEditModal({
  open,
  onOpenChange,
  avatar,
  onSave,
  isLoading = false,
  error,
}: AvatarEditModalProps) {
  const [formData, setFormData] = useState<AvatarFormData>(DEFAULT_FORM_DATA);
  const [newDomain, setNewDomain] = useState("");
  const [newConstraint, setNewConstraint] = useState("");

  const isEditing = !!avatar;
  const title = isEditing ? `Edit ${avatar.name}` : "Create New Avatar";

  // Reset form when modal opens or avatar changes
  useEffect(() => {
    if (open) {
      if (avatar) {
        setFormData({
          name: avatar.name,
          slug: avatar.slug,
          domainExpertise: avatar.domainExpertise,
          speakingStyle: avatar.speakingStyle,
          debateStyle: avatar.debateStyle as DebateStyle,
          responsePriority: avatar.responsePriority,
          systemPrompt: avatar.systemPrompt,
          isActive: avatar.isActive,
          maxTokens: 1024,
          temperature: 0.7,
          topP: 1.0,
          biasInstructions: "",
          constraints: [],
        });
      } else {
        setFormData(DEFAULT_FORM_DATA);
      }
    }
  }, [open, avatar]);

  // Generate slug from name
  const handleNameChange = (name: string) => {
    setFormData((prev) => ({
      ...prev,
      name,
      slug: isEditing ? prev.slug : name.toLowerCase().replace(/\s+/g, "-").replace(/[^a-z0-9-]/g, ""),
    }));
  };

  // Domain management
  const addDomain = () => {
    if (newDomain.trim() && !formData.domainExpertise.includes(newDomain.trim())) {
      setFormData((prev) => ({
        ...prev,
        domainExpertise: [...prev.domainExpertise, newDomain.trim().toLowerCase()],
      }));
      setNewDomain("");
    }
  };

  const removeDomain = (domain: string) => {
    setFormData((prev) => ({
      ...prev,
      domainExpertise: prev.domainExpertise.filter((d) => d !== domain),
    }));
  };

  // Constraint management
  const addConstraint = () => {
    if (newConstraint.trim() && !formData.constraints.includes(newConstraint.trim())) {
      setFormData((prev) => ({
        ...prev,
        constraints: [...prev.constraints, newConstraint.trim()],
      }));
      setNewConstraint("");
    }
  };

  const removeConstraint = (constraint: string) => {
    setFormData((prev) => ({
      ...prev,
      constraints: prev.constraints.filter((c) => c !== constraint),
    }));
  };

  const handleSubmit = async () => {
    await onSave(formData);
  };

  const isValid = formData.name.trim() && formData.slug.trim() && formData.domainExpertise.length > 0;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[700px] max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Bot className="w-5 h-5" />
            {title}
          </DialogTitle>
          <DialogDescription>
            Configure the avatar's personality, expertise, and behavior.
          </DialogDescription>
        </DialogHeader>

        <Tabs defaultValue="basic" className="mt-4">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="basic">Basic Info</TabsTrigger>
            <TabsTrigger value="prompt">System Prompt</TabsTrigger>
            <TabsTrigger value="advanced">Advanced</TabsTrigger>
          </TabsList>

          {/* ===== BASIC INFO TAB ===== */}
          <TabsContent value="basic" className="space-y-4 mt-4">
            {/* Name & Slug */}
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="name">Name</Label>
                <Input
                  id="name"
                  value={formData.name}
                  onChange={(e) => handleNameChange(e.target.value)}
                  placeholder="Insurance Expert"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="slug">Slug</Label>
                <Input
                  id="slug"
                  value={formData.slug}
                  onChange={(e) => setFormData({ ...formData, slug: e.target.value })}
                  placeholder="insurance-expert"
                  disabled={isEditing}
                />
              </div>
            </div>

            {/* Domain Expertise */}
            <div className="space-y-2">
              <Label>Domain Expertise</Label>
              <div className="flex flex-wrap gap-2 mb-2">
                {formData.domainExpertise.map((domain) => (
                  <Badge key={domain} variant="secondary" className="gap-1">
                    {domain}
                    <button onClick={() => removeDomain(domain)}>
                      <X className="w-3 h-3" />
                    </button>
                  </Badge>
                ))}
              </div>
              <div className="flex gap-2">
                <Input
                  value={newDomain}
                  onChange={(e) => setNewDomain(e.target.value)}
                  placeholder="Add domain..."
                  onKeyDown={(e) => e.key === "Enter" && (e.preventDefault(), addDomain())}
                />
                <Button type="button" variant="outline" onClick={addDomain}>
                  <Plus className="w-4 h-4" />
                </Button>
              </div>
            </div>

            {/* Speaking Style */}
            <div className="space-y-2">
              <Label htmlFor="speaking-style">Speaking Style</Label>
              <Textarea
                id="speaking-style"
                value={formData.speakingStyle}
                onChange={(e) => setFormData({ ...formData, speakingStyle: e.target.value })}
                placeholder="Professional, thorough, uses technical terminology..."
                rows={2}
              />
            </div>

            {/* Debate Style & Priority */}
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="debate-style">Debate Style</Label>
                <Select
                  value={formData.debateStyle}
                  onValueChange={(v) => setFormData({ ...formData, debateStyle: v as DebateStyle })}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="analytical">Analytical</SelectItem>
                    <SelectItem value="aggressive">Aggressive</SelectItem>
                    <SelectItem value="empathetic">Empathetic</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label>Response Priority: {formData.responsePriority}/10</Label>
                <Slider
                  value={[formData.responsePriority]}
                  onValueChange={([v]) => setFormData({ ...formData, responsePriority: v })}
                  min={1}
                  max={10}
                  step={1}
                  className="mt-2"
                />
              </div>
            </div>

            {/* Active Toggle */}
            <div className="flex items-center justify-between p-3 rounded-lg bg-muted">
              <div>
                <Label htmlFor="is-active">Active</Label>
                <p className="text-sm text-muted-foreground">
                  Enable this avatar for routing
                </p>
              </div>
              <Switch
                id="is-active"
                checked={formData.isActive}
                onCheckedChange={(c) => setFormData({ ...formData, isActive: c })}
              />
            </div>
          </TabsContent>

          {/* ===== SYSTEM PROMPT TAB ===== */}
          <TabsContent value="prompt" className="space-y-4 mt-4">
            <div className="space-y-2">
              <Label htmlFor="system-prompt">System Prompt</Label>
              <p className="text-sm text-muted-foreground">
                The core instructions that define this avatar's behavior and personality.
              </p>
              <Textarea
                id="system-prompt"
                value={formData.systemPrompt}
                onChange={(e) => setFormData({ ...formData, systemPrompt: e.target.value })}
                placeholder="You are an Insurance Expert AI assistant..."
                rows={12}
                className="font-mono text-sm"
              />
            </div>

            {/* Bias Instructions */}
            <div className="space-y-2">
              <Label htmlFor="bias-instructions">Bias Instructions (Optional)</Label>
              <p className="text-sm text-muted-foreground">
                Additional guidance that influences responses without being visible to users.
              </p>
              <Textarea
                id="bias-instructions"
                value={formData.biasInstructions}
                onChange={(e) => setFormData({ ...formData, biasInstructions: e.target.value })}
                placeholder="Always emphasize compliance and ethical practices..."
                rows={3}
              />
            </div>
          </TabsContent>

          {/* ===== ADVANCED TAB ===== */}
          <TabsContent value="advanced" className="space-y-4 mt-4">
            {/* Model Parameters */}
            <div className="space-y-4">
              <h4 className="font-medium">Model Parameters</h4>

              <div className="grid grid-cols-3 gap-4">
                <div className="space-y-2">
                  <Label>Max Tokens: {formData.maxTokens}</Label>
                  <Slider
                    value={[formData.maxTokens]}
                    onValueChange={([v]) => setFormData({ ...formData, maxTokens: v })}
                    min={256}
                    max={4096}
                    step={128}
                  />
                </div>
                <div className="space-y-2">
                  <Label>Temperature: {formData.temperature.toFixed(1)}</Label>
                  <Slider
                    value={[formData.temperature]}
                    onValueChange={([v]) => setFormData({ ...formData, temperature: v })}
                    min={0}
                    max={2}
                    step={0.1}
                  />
                </div>
                <div className="space-y-2">
                  <Label>Top P: {formData.topP.toFixed(1)}</Label>
                  <Slider
                    value={[formData.topP]}
                    onValueChange={([v]) => setFormData({ ...formData, topP: v })}
                    min={0}
                    max={1}
                    step={0.1}
                  />
                </div>
              </div>
            </div>

            {/* Hard Constraints */}
            <div className="space-y-2">
              <Label>Hard Constraints</Label>
              <p className="text-sm text-muted-foreground">
                Things this avatar should never do or mention.
              </p>
              <div className="flex flex-wrap gap-2 mb-2">
                {formData.constraints.map((constraint) => (
                  <Badge key={constraint} variant="destructive" className="gap-1">
                    {constraint}
                    <button onClick={() => removeConstraint(constraint)}>
                      <X className="w-3 h-3" />
                    </button>
                  </Badge>
                ))}
              </div>
              <div className="flex gap-2">
                <Input
                  value={newConstraint}
                  onChange={(e) => setNewConstraint(e.target.value)}
                  placeholder="Never mention competitor products..."
                  onKeyDown={(e) => e.key === "Enter" && (e.preventDefault(), addConstraint())}
                />
                <Button type="button" variant="outline" onClick={addConstraint}>
                  <Plus className="w-4 h-4" />
                </Button>
              </div>
            </div>
          </TabsContent>
        </Tabs>

        {/* Error Display */}
        {error && (
          <div className="flex items-center gap-2 p-3 rounded-lg bg-destructive/10 text-destructive">
            <AlertTriangle className="w-4 h-4 flex-shrink-0" />
            <span className="text-sm">{error}</span>
          </div>
        )}

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <Button onClick={handleSubmit} disabled={!isValid || isLoading}>
            {isLoading && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
            {isEditing ? "Save Changes" : "Create Avatar"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

export default AvatarEditModal;
