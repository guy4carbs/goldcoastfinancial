/**
 * InjectMessageModal - Modal for injecting messages into debates
 *
 * Provides:
 * - Message content input
 * - Injection type (system, moderator, as avatar)
 * - Visibility options
 * - Preview before injection
 */

import { useState } from "react";
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
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Checkbox } from "@/components/ui/checkbox";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Syringe,
  Loader2,
  Eye,
  EyeOff,
  Bot,
  Shield,
  User,
} from "lucide-react";
import type { Avatar } from "@/lib/avatarCouncilStore";

// =============================================================================
// TYPES
// =============================================================================

export type InjectionType = "system" | "moderator" | "avatar";

export interface InjectMessageData {
  debateId: string;
  content: string;
  injectionType: InjectionType;
  asAvatarId?: string;
  isVisible: boolean;
}

export interface InjectMessageModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;

  // Context
  debateId: string;
  debateTopic: string;
  participants: Array<{ id: string; name: string; slug: string }>;
  availableAvatars: Avatar[];

  // Actions
  onInject: (data: InjectMessageData) => Promise<void>;

  // State
  isLoading?: boolean;
  error?: string;
}

// =============================================================================
// AVATAR COLORS
// =============================================================================

const AVATAR_COLORS: Record<string, string> = {
  "insurance-expert": "bg-blue-500",
  "sales-closer": "bg-orange-500",
  "mindset-coach": "bg-purple-500",
  "compliance-specialist": "bg-emerald-500",
  "persuasion-strategist": "bg-red-500",
  "objection-handler": "bg-amber-500",
  "underwriting-analyst": "bg-indigo-500",
  "intensity-coach": "bg-rose-500",
};

// =============================================================================
// COMPONENT
// =============================================================================

export function InjectMessageModal({
  open,
  onOpenChange,
  debateId,
  debateTopic,
  participants,
  availableAvatars,
  onInject,
  isLoading = false,
  error,
}: InjectMessageModalProps) {
  const [content, setContent] = useState("");
  const [injectionType, setInjectionType] = useState<InjectionType>("system");
  const [asAvatarId, setAsAvatarId] = useState<string>("");
  const [isVisible, setIsVisible] = useState(false);

  const isValid = content.trim().length > 0 && (injectionType !== "avatar" || asAvatarId);

  const handleSubmit = async () => {
    await onInject({
      debateId,
      content: content.trim(),
      injectionType,
      asAvatarId: injectionType === "avatar" ? asAvatarId : undefined,
      isVisible,
    });

    // Reset form on success
    setContent("");
    setInjectionType("system");
    setAsAvatarId("");
    setIsVisible(false);
  };

  const getPreviewLabel = () => {
    switch (injectionType) {
      case "system":
        return "System Guidance (invisible to users)";
      case "moderator":
        return "Moderator";
      case "avatar":
        const avatar = availableAvatars.find((a) => a.id === asAvatarId);
        return avatar?.name || "Avatar";
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Syringe className="w-5 h-5" />
            Inject Message
          </DialogTitle>
          <DialogDescription>
            Inject a message into the debate "{debateTopic}"
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6 py-4">
          {/* Injection Type */}
          <div className="space-y-3">
            <Label>Inject As</Label>
            <RadioGroup
              value={injectionType}
              onValueChange={(v) => setInjectionType(v as InjectionType)}
              className="space-y-2"
            >
              {/* System */}
              <div className="flex items-center space-x-3 p-3 rounded-lg border hover:bg-muted/50 transition-colors">
                <RadioGroupItem value="system" id="inject-system" />
                <Shield className="w-5 h-5 text-muted-foreground" />
                <div className="flex-1">
                  <Label htmlFor="inject-system" className="cursor-pointer font-medium">
                    System Guidance
                  </Label>
                  <p className="text-xs text-muted-foreground">
                    Invisible guidance that influences the next response
                  </p>
                </div>
              </div>

              {/* Moderator */}
              <div className="flex items-center space-x-3 p-3 rounded-lg border hover:bg-muted/50 transition-colors">
                <RadioGroupItem value="moderator" id="inject-moderator" />
                <User className="w-5 h-5 text-muted-foreground" />
                <div className="flex-1">
                  <Label htmlFor="inject-moderator" className="cursor-pointer font-medium">
                    Moderator
                  </Label>
                  <p className="text-xs text-muted-foreground">
                    Visible as a neutral moderator interjection
                  </p>
                </div>
              </div>

              {/* As Avatar */}
              <div className="flex items-center space-x-3 p-3 rounded-lg border hover:bg-muted/50 transition-colors">
                <RadioGroupItem value="avatar" id="inject-avatar" />
                <Bot className="w-5 h-5 text-muted-foreground" />
                <div className="flex-1">
                  <Label htmlFor="inject-avatar" className="cursor-pointer font-medium">
                    As Avatar
                  </Label>
                  <p className="text-xs text-muted-foreground">
                    Appears as if spoken by a specific avatar
                  </p>
                </div>
              </div>
            </RadioGroup>
          </div>

          {/* Avatar Selection (if inject as avatar) */}
          {injectionType === "avatar" && (
            <div className="space-y-2">
              <Label htmlFor="avatar-select">Select Avatar</Label>
              <Select value={asAvatarId} onValueChange={setAsAvatarId}>
                <SelectTrigger>
                  <SelectValue placeholder="Choose an avatar..." />
                </SelectTrigger>
                <SelectContent>
                  {/* Current participants */}
                  <div className="px-2 py-1 text-xs text-muted-foreground font-medium">
                    Current Participants
                  </div>
                  {participants.map((p) => {
                    const bgColor = AVATAR_COLORS[p.slug] || "bg-gray-500";
                    return (
                      <SelectItem key={p.id} value={p.id}>
                        <div className="flex items-center gap-2">
                          <div className={cn("w-4 h-4 rounded-full", bgColor)} />
                          {p.name}
                        </div>
                      </SelectItem>
                    );
                  })}

                  {/* Other avatars */}
                  {availableAvatars.filter((a) => !participants.some((p) => p.id === a.id)).length > 0 && (
                    <>
                      <div className="px-2 py-1 text-xs text-muted-foreground font-medium mt-2">
                        Other Avatars
                      </div>
                      {availableAvatars
                        .filter((a) => !participants.some((p) => p.id === a.id))
                        .map((avatar) => {
                          const bgColor = AVATAR_COLORS[avatar.slug] || "bg-gray-500";
                          return (
                            <SelectItem key={avatar.id} value={avatar.id}>
                              <div className="flex items-center gap-2">
                                <div className={cn("w-4 h-4 rounded-full", bgColor)} />
                                {avatar.name}
                              </div>
                            </SelectItem>
                          );
                        })}
                    </>
                  )}
                </SelectContent>
              </Select>
            </div>
          )}

          {/* Message Content */}
          <div className="space-y-2">
            <Label htmlFor="inject-content">Message</Label>
            <Textarea
              id="inject-content"
              value={content}
              onChange={(e) => setContent(e.target.value)}
              placeholder={
                injectionType === "system"
                  ? "Please focus your next response on the compliance implications..."
                  : "Enter your message..."
              }
              rows={4}
            />
          </div>

          {/* Visibility Toggle (for moderator/avatar) */}
          {injectionType !== "system" && (
            <div className="flex items-center space-x-3 p-3 rounded-lg bg-muted/50">
              <Checkbox
                id="is-visible"
                checked={isVisible}
                onCheckedChange={(c) => setIsVisible(c === true)}
              />
              <div className="flex-1">
                <Label htmlFor="is-visible" className="cursor-pointer font-medium">
                  Show in user transcript
                </Label>
                <p className="text-xs text-muted-foreground">
                  {isVisible
                    ? "Users will see this message in the debate"
                    : "Only visible in admin logs"}
                </p>
              </div>
              {isVisible ? (
                <Eye className="w-5 h-5 text-muted-foreground" />
              ) : (
                <EyeOff className="w-5 h-5 text-muted-foreground" />
              )}
            </div>
          )}

          {/* Preview */}
          {content.trim() && (
            <div className="space-y-2">
              <Label>Preview</Label>
              <div className="p-3 rounded-lg border bg-muted/30">
                <div className="flex items-center gap-2 mb-2">
                  {injectionType === "system" ? (
                    <Shield className="w-4 h-4 text-indigo-500" />
                  ) : injectionType === "moderator" ? (
                    <User className="w-4 h-4 text-blue-500" />
                  ) : (
                    <Bot className="w-4 h-4 text-primary" />
                  )}
                  <span className="text-sm font-medium">{getPreviewLabel()}</span>
                  {!isVisible && injectionType !== "system" && (
                    <EyeOff className="w-3 h-3 text-muted-foreground" />
                  )}
                </div>
                <p className="text-sm text-muted-foreground">{content}</p>
              </div>
            </div>
          )}

          {/* Error */}
          {error && (
            <div className="p-3 rounded-lg bg-destructive/10 text-destructive text-sm">
              {error}
            </div>
          )}
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <Button onClick={handleSubmit} disabled={!isValid || isLoading}>
            {isLoading && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
            <Syringe className="w-4 h-4 mr-2" />
            Inject Now
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

export default InjectMessageModal;
