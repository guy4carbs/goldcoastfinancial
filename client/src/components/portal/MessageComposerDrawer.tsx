import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetDescription } from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { 
  Send, 
  Paperclip, 
  X, 
  User,
  FileText,
  Image,
  AlertCircle,
  CheckCircle2,
  Clock
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { useState, useEffect, useRef } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { toast } from "sonner";

const messageSchema = z.object({
  recipient: z.string().min(1, "Please select a recipient"),
  subject: z.string().min(1, "Subject is required").max(100, "Subject is too long"),
  message: z.string().min(10, "Message must be at least 10 characters").max(5000, "Message is too long"),
  priority: z.enum(["normal", "high"]).default("normal")
});

type MessageFormData = z.infer<typeof messageSchema>;

interface MessageComposerDrawerProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  initialSubject?: string;
  initialMessage?: string;
}

interface Attachment {
  id: string;
  name: string;
  size: string;
  type: "pdf" | "image" | "other";
}

export function MessageComposerDrawer({ open, onOpenChange, initialSubject, initialMessage }: MessageComposerDrawerProps) {
  const [attachments, setAttachments] = useState<Attachment[]>([]);
  const [isSending, setIsSending] = useState(false);
  const [charCount, setCharCount] = useState(initialMessage?.length || 0);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const advisors = [
    { id: "jack", name: "Jack Cook", title: "Principal Agent", avatar: "JC", email: "jack.cook@goldcoastfnl.com" },
    { id: "nick", name: "Nick Gallagher", title: "Senior Advisor", avatar: "NG", email: "nick.gallagher@goldcoastfnl.com" },
    { id: "gaetano", name: "Gaetano Carbonara", title: "Client Specialist", avatar: "GC", email: "gaetano.carbonara@goldcoastfnl.com" },
    { id: "frank", name: "Frank Carbonara", title: "Mortgage Protection Specialist", avatar: "FC", email: "frank.carbonara@goldcoastfnl.com" },
    { id: "support", name: "Client Support Team", title: "General Inquiries", avatar: "CS", email: "support@goldcoastfnl.com" }
  ];

  const subjectTemplates = [
    "Policy Question",
    "Payment Inquiry",
    "Beneficiary Update Request",
    "Coverage Review Request",
    "Document Request",
    "Policy Change Request",
    "General Question",
    "Other"
  ];

  const form = useForm<MessageFormData>({
    resolver: zodResolver(messageSchema),
    defaultValues: {
      recipient: "",
      subject: initialSubject || "",
      message: initialMessage || "",
      priority: "normal"
    }
  });

  useEffect(() => {
    if (open) {
      form.reset({
        recipient: "",
        subject: initialSubject || "",
        message: initialMessage || "",
        priority: "normal"
      });
      setCharCount(initialMessage?.length || 0);
    }
  }, [open, initialSubject, initialMessage, form]);

  const handleAddAttachment = () => {
    fileInputRef.current?.click();
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    const newAttachments: Attachment[] = [];
    const maxSize = 10 * 1024 * 1024; // 10MB

    Array.from(files).forEach(file => {
      if (file.size > maxSize) {
        toast.error(`${file.name} is too large`, {
          description: "Maximum file size is 10MB"
        });
        return;
      }

      const fileType = file.type.startsWith("image/") ? "image" : 
                       file.type === "application/pdf" ? "pdf" : "other";
      
      const sizeInKB = file.size / 1024;
      const sizeDisplay = sizeInKB > 1024 
        ? `${(sizeInKB / 1024).toFixed(1)} MB` 
        : `${Math.round(sizeInKB)} KB`;

      newAttachments.push({
        id: `${Date.now()}-${file.name}`,
        name: file.name,
        size: sizeDisplay,
        type: fileType
      });
    });

    if (newAttachments.length > 0) {
      setAttachments([...attachments, ...newAttachments]);
      toast.success(`${newAttachments.length} file(s) attached`);
    }

    // Reset input so same file can be selected again
    e.target.value = '';
  };

  const handleRemoveAttachment = (id: string) => {
    setAttachments(attachments.filter(a => a.id !== id));
  };

  const onSubmit = async (data: MessageFormData) => {
    setIsSending(true);
    
    try {
      const selectedAdvisor = advisors.find(a => a.id === data.recipient);
      if (!selectedAdvisor) {
        toast.error("Please select a recipient");
        setIsSending(false);
        return;
      }
      
      const response = await fetch("/api/portal/messages/send", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          recipientEmail: selectedAdvisor.email,
          recipientName: selectedAdvisor.name,
          subject: data.subject,
          message: data.message,
          priority: data.priority
        })
      });
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || "Failed to send message");
      }
      
      toast.success("Message sent successfully", {
        description: `Your message has been sent to ${selectedAdvisor.name}. They will respond within 1-2 business days.`
      });
      
      form.reset();
      setAttachments([]);
      setCharCount(0);
      onOpenChange(false);
    } catch (error: any) {
      toast.error("Failed to send message", {
        description: error.message || "Please try again later."
      });
    } finally {
      setIsSending(false);
    }
  };

  const getAttachmentIcon = (type: Attachment["type"]) => {
    switch (type) {
      case "pdf":
        return <FileText className="w-4 h-4 text-red-500" />;
      case "image":
        return <Image className="w-4 h-4 text-blue-500" />;
      default:
        return <FileText className="w-4 h-4 text-gray-500" />;
    }
  };

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent className="w-full sm:max-w-xl overflow-y-auto">
        <SheetHeader className="pb-6">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-xl bg-secondary/20 flex items-center justify-center">
              <Send className="w-6 h-6 text-secondary" />
            </div>
            <div>
              <SheetTitle className="text-xl font-serif">New Message</SheetTitle>
              <SheetDescription>Send a secure message to your advisor</SheetDescription>
            </div>
          </div>
        </SheetHeader>

        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="space-y-2"
          >
            <Label htmlFor="recipient">Send To</Label>
            <Select
              value={form.watch("recipient")}
              onValueChange={(value) => form.setValue("recipient", value)}
            >
              <SelectTrigger className="w-full" data-testid="select-recipient">
                <SelectValue placeholder="Select a recipient" />
              </SelectTrigger>
              <SelectContent>
                {advisors.map((advisor) => (
                  <SelectItem key={advisor.id} value={advisor.id}>
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center text-xs font-medium text-primary">
                        {advisor.avatar}
                      </div>
                      <div>
                        <p className="font-medium">{advisor.name}</p>
                        <p className="text-xs text-muted-foreground">{advisor.title}</p>
                      </div>
                    </div>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            {form.formState.errors.recipient && (
              <p className="text-destructive text-sm">{form.formState.errors.recipient.message}</p>
            )}
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.15 }}
            className="space-y-2"
          >
            <Label htmlFor="subject">Subject</Label>
            <Select
              value={form.watch("subject")}
              onValueChange={(value) => form.setValue("subject", value)}
            >
              <SelectTrigger className="w-full rounded-lg" data-testid="select-subject">
                <SelectValue placeholder="Select a subject" />
              </SelectTrigger>
              <SelectContent>
                {subjectTemplates.map((subject) => (
                  <SelectItem key={subject} value={subject}>
                    {subject}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            {form.formState.errors.subject && (
              <p className="text-destructive text-sm">{form.formState.errors.subject.message}</p>
            )}
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="space-y-2"
          >
            <div className="flex items-center justify-between">
              <Label htmlFor="message">Message</Label>
              <span className={`text-xs ${charCount > 4500 ? "text-destructive" : "text-muted-foreground"}`}>
                {charCount}/5000
              </span>
            </div>
            <Textarea
              id="message"
              placeholder="Type your message here..."
              className="min-h-[200px] resize-none"
              data-testid="textarea-message"
              {...form.register("message")}
              onChange={(e) => {
                form.register("message").onChange(e);
                setCharCount(e.target.value.length);
              }}
            />
            {form.formState.errors.message && (
              <p className="text-destructive text-sm">{form.formState.errors.message.message}</p>
            )}
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.25 }}
            className="space-y-3"
          >
            <div className="flex items-center justify-between">
              <Label>Attachments</Label>
              <input
                type="file"
                ref={fileInputRef}
                onChange={handleFileChange}
                accept=".pdf,.jpg,.jpeg,.png"
                multiple
                className="hidden"
                data-testid="input-file"
              />
              <Button 
                type="button" 
                variant="outline" 
                size="sm"
                onClick={handleAddAttachment}
                data-testid="button-add-attachment"
              >
                <Paperclip className="w-4 h-4 mr-2" />
                Add File
              </Button>
            </div>
            
            <AnimatePresence>
              {attachments.length > 0 && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: "auto" }}
                  exit={{ opacity: 0, height: 0 }}
                  className="space-y-2"
                >
                  {attachments.map((attachment) => (
                    <motion.div
                      key={attachment.id}
                      initial={{ opacity: 0, x: -10 }}
                      animate={{ opacity: 1, x: 0 }}
                      exit={{ opacity: 0, x: 10 }}
                    >
                      <Card>
                        <CardContent className="p-3 flex items-center justify-between">
                          <div className="flex items-center gap-3">
                            {getAttachmentIcon(attachment.type)}
                            <div>
                              <p className="text-sm font-medium">{attachment.name}</p>
                              <p className="text-xs text-muted-foreground">{attachment.size}</p>
                            </div>
                          </div>
                          <Button
                            type="button"
                            variant="ghost"
                            size="icon"
                            className="h-8 w-8"
                            onClick={() => handleRemoveAttachment(attachment.id)}
                            data-testid={`button-remove-attachment-${attachment.id}`}
                          >
                            <X className="w-4 h-4" />
                          </Button>
                        </CardContent>
                      </Card>
                    </motion.div>
                  ))}
                </motion.div>
              )}
            </AnimatePresence>
            
            <p className="text-xs text-muted-foreground">
              Supported formats: PDF, JPG, PNG (max 10MB each)
            </p>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
          >
            <Card className="border-blue-200 bg-blue-50">
              <CardContent className="p-4 flex items-start gap-3">
                <Clock className="w-5 h-5 text-blue-600 shrink-0 mt-0.5" />
                <div>
                  <p className="text-sm font-medium text-blue-800">Response Time</p>
                  <p className="text-xs text-blue-700">
                    Your advisor typically responds within 1-2 business days. For urgent matters, please call (630) 555-0123.
                  </p>
                </div>
              </CardContent>
            </Card>
          </motion.div>

          <div className="flex gap-3 pt-4">
            <Button 
              type="button" 
              variant="outline" 
              className="flex-1"
              onClick={() => onOpenChange(false)}
            >
              Cancel
            </Button>
            <Button 
              type="submit" 
              className="flex-1 bg-secondary text-secondary-foreground hover:bg-secondary/90"
              disabled={isSending}
            >
              {isSending ? (
                <>
                  <div className="w-4 h-4 border-2 border-current border-t-transparent rounded-full animate-spin mr-2" />
                  Sending...
                </>
              ) : (
                <>
                  <Send className="w-4 h-4 mr-2" />
                  Send Message
                </>
              )}
            </Button>
          </div>
        </form>
      </SheetContent>
    </Sheet>
  );
}
