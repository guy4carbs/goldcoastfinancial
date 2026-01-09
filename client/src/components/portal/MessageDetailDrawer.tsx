import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetDescription } from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { 
  MessageSquare, 
  Reply, 
  Paperclip, 
  Send,
  ArrowLeft,
  Clock
} from "lucide-react";
import { motion } from "framer-motion";
import { useState } from "react";
import { toast } from "sonner";

interface Message {
  from: string;
  subject: string;
  preview: string;
  date: string;
  unread: boolean;
}

interface MessageDetailDrawerProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  message: Message | null;
}

export function MessageDetailDrawer({ open, onOpenChange, message }: MessageDetailDrawerProps) {
  const [replyText, setReplyText] = useState("");
  const [isReplying, setIsReplying] = useState(false);
  const [showReplyBox, setShowReplyBox] = useState(false);

  if (!open || !message) return null;

  const fullMessage = {
    ...message,
    fullContent: message.from === "Jack Cook" 
      ? `Hi!

I wanted to reach out to schedule your annual policy review. It's been a year since we set up your coverage, and I'd like to make sure everything still aligns with your needs.

During our review, we'll cover:
• Any life changes that might affect your coverage needs
• Current policy performance and cash value growth
• Beneficiary information updates
• Premium optimization opportunities

Would you be available for a 30-minute call next week? I have openings on Tuesday afternoon or Thursday morning.

Looking forward to connecting with you!

Best regards,
Jack Cook
Principal Agent
Gold Coast Financial
(630) 555-0123`
      : message.from === "Nick Gallagher"
      ? `This confirms that your beneficiary update has been processed successfully.

Your updated beneficiaries are now on file:
• Primary: Sarah Johnson (60%)
• Primary: Michael Johnson (20%)
• Primary: Emily Johnson (20%)
• Contingent: Robert Johnson (100%)

These changes are effective immediately and will appear on your next policy statement.

If you have any questions or need to make additional changes, please don't hesitate to reach out.

Best regards,
Nick Gallagher
Senior Advisor
Gold Coast Financial`
      : `Welcome to Gold Coast Financial! We're excited to have you as part of our family.

Your client portal is now active, giving you 24/7 access to:
• View your policy details and coverage information
• Download important documents
• Send secure messages to your advisor
• Update your contact information and preferences

If you have any questions about navigating your portal or your policies, our team is here to help.

Thank you for trusting us with your financial protection needs.

Warm regards,
The Gold Coast Financial Team`,
    timestamp: message.date === "2 days ago" 
      ? "December 29, 2024 at 2:34 PM"
      : message.date === "1 week ago"
      ? "December 24, 2024 at 10:15 AM"
      : "January 15, 2024 at 9:00 AM"
  };

  const advisorEmails: Record<string, string> = {
    "Jack Cook": "jack.cook@goldcoastfnl.com",
    "Nick Gallagher": "nick.gallagher@goldcoastfnl.com",
    "Gaetano Carbonara": "gaetano.carbonara@goldcoastfnl.com",
    "Frank Carbonara": "frank.carbonara@goldcoastfnl.com",
    "Gold Coast Financial": "support@goldcoastfnl.com"
  };

  const handleSendReply = async () => {
    if (!replyText.trim()) {
      toast.error("Please enter a message");
      return;
    }
    
    setIsReplying(true);
    
    try {
      const recipientEmail = advisorEmails[message.from] || "support@goldcoastfnl.com";
      
      const response = await fetch("/api/portal/messages", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          recipientEmail,
          recipientName: message.from,
          subject: `Re: ${message.subject}`,
          message: replyText,
          priority: "normal"
        })
      });
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || "Failed to send reply");
      }
      
      toast.success("Reply sent successfully", {
        description: `Your reply has been sent to ${message.from}. They will respond within 1-2 business days.`
      });
      
      setReplyText("");
      setShowReplyBox(false);
    } catch (error: any) {
      toast.error("Failed to send reply", {
        description: error.message || "Please try again later."
      });
    } finally {
      setIsReplying(false);
    }
  };

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent className="w-full sm:max-w-2xl overflow-y-auto">
        <SheetHeader className="pb-4">
          <div className="flex items-center gap-3">
            <Button 
              variant="ghost" 
              size="icon" 
              className="shrink-0"
              onClick={() => onOpenChange(false)}
              data-testid="button-back-messages"
            >
              <ArrowLeft className="w-5 h-5" />
            </Button>
            <div className="flex-1">
              <SheetTitle className="text-lg font-serif line-clamp-1">{message.subject}</SheetTitle>
              <SheetDescription className="flex items-center gap-2">
                <Clock className="w-3 h-3" />
                {fullMessage.timestamp}
              </SheetDescription>
            </div>
          </div>
        </SheetHeader>

        <Separator className="my-4" />

        <div className="space-y-6">
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
          >
            <div className="flex items-start gap-4 mb-4">
              <Avatar className="h-12 w-12">
                <AvatarFallback className="bg-primary/10 text-primary font-medium">
                  {message.from.split(' ').map(n => n[0]).join('')}
                </AvatarFallback>
              </Avatar>
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-1">
                  <p className="font-semibold">{message.from}</p>
                  {message.from !== "Gold Coast Financial" && (
                    <Badge variant="secondary" className="text-xs">Advisor</Badge>
                  )}
                </div>
                <p className="text-sm text-muted-foreground">
                  {message.from === "Jack Cook" ? "Principal Agent" : 
                   message.from === "Nick Gallagher" ? "Senior Advisor" : 
                   "Client Services"}
                </p>
              </div>
            </div>

            <Card>
              <CardContent className="p-6">
                <div className="prose prose-sm max-w-none">
                  <pre className="whitespace-pre-wrap font-sans text-sm leading-relaxed text-foreground bg-transparent p-0 m-0">
                    {fullMessage.fullContent}
                  </pre>
                </div>
              </CardContent>
            </Card>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
          >
            {!showReplyBox ? (
              <Button 
                className="w-full bg-secondary text-secondary-foreground hover:bg-secondary/90"
                onClick={() => setShowReplyBox(true)}
                data-testid="button-reply"
              >
                <Reply className="w-4 h-4 mr-2" />
                Reply to {message.from}
              </Button>
            ) : (
              <Card>
                <CardContent className="p-4 space-y-4">
                  <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <Reply className="w-4 h-4" />
                    Replying to {message.from}
                  </div>
                  <Textarea
                    placeholder="Type your reply..."
                    className="min-h-[150px] resize-none"
                    value={replyText}
                    onChange={(e) => setReplyText(e.target.value)}
                    data-testid="textarea-reply"
                  />
                  <div className="flex items-center justify-between">
                    <Button variant="outline" size="sm" data-testid="button-attach-reply">
                      <Paperclip className="w-4 h-4 mr-2" />
                      Attach File
                    </Button>
                    <div className="flex gap-2">
                      <Button 
                        variant="outline" 
                        size="sm"
                        onClick={() => {
                          setShowReplyBox(false);
                          setReplyText("");
                        }}
                        data-testid="button-cancel-reply"
                      >
                        Cancel
                      </Button>
                      <Button 
                        size="sm"
                        className="bg-secondary text-secondary-foreground hover:bg-secondary/90"
                        onClick={handleSendReply}
                        disabled={isReplying}
                        data-testid="button-send-reply"
                      >
                        {isReplying ? (
                          <>
                            <div className="w-4 h-4 border-2 border-current border-t-transparent rounded-full animate-spin mr-2" />
                            Sending...
                          </>
                        ) : (
                          <>
                            <Send className="w-4 h-4 mr-2" />
                            Send Reply
                          </>
                        )}
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            )}
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
          >
            <Card className="border-blue-200 bg-blue-50">
              <CardContent className="p-4 flex items-start gap-3">
                <MessageSquare className="w-5 h-5 text-blue-600 shrink-0 mt-0.5" />
                <div>
                  <p className="text-sm font-medium text-blue-800">Secure Messaging</p>
                  <p className="text-xs text-blue-700">
                    All messages are encrypted and stored securely. Your advisor typically responds within 1-2 business days.
                  </p>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        </div>
      </SheetContent>
    </Sheet>
  );
}
