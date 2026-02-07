import { useState, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Mail, MessageSquare, FileText, Send, Award, Clock, Copy,
  Check, AlertCircle, ChevronDown, X, Search, Filter
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { cn } from "@/lib/utils";
import {
  MESSAGE_TEMPLATES,
  TEMPLATE_CATEGORIES,
  substituteVariables,
  getUnsubstitutedVariables,
  type MessageTemplate
} from "@/lib/messageTemplates";
import { useAgentStore, type Lead } from "@/lib/agentStore";

interface MessageTemplatesProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  lead?: Lead | null;
  onSend?: (message: { channel: 'email' | 'text'; subject?: string; body: string }) => void;
}

const CATEGORY_ICONS: Record<string, typeof Mail> = {
  outreach: Mail,
  'follow-up': Clock,
  quote: FileText,
  application: Send,
  policy: Award,
  general: MessageSquare,
};

export function MessageTemplates({ open, onOpenChange, lead, onSend }: MessageTemplatesProps) {
  const { currentUser } = useAgentStore();
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedTemplate, setSelectedTemplate] = useState<MessageTemplate | null>(null);
  const [customValues, setCustomValues] = useState<Record<string, string>>({});
  const [copied, setCopied] = useState(false);

  // Initialize default values when template or lead changes
  const defaultValues = useMemo(() => {
    const values: Record<string, string> = {
      agentName: currentUser?.name || 'Agent',
      agentPhone: '(555) 123-4567', // Default - should come from agent profile
    };

    if (lead) {
      values.firstName = lead.name.split(' ')[0];
      values.productType = lead.product || 'life insurance';
      values.lastContactDate = lead.lastContactDate
        ? new Date(lead.lastContactDate).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })
        : 'recently';
      if (lead.carrier) values.carrier = lead.carrier;
      if (lead.policyNumber) values.policyNumber = lead.policyNumber;
    }

    return values;
  }, [lead, currentUser]);

  // Filter templates
  const filteredTemplates = useMemo(() => {
    return MESSAGE_TEMPLATES.filter(template => {
      const matchesCategory = selectedCategory === 'all' || template.category === selectedCategory;
      const matchesSearch = !searchQuery ||
        template.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        template.body.toLowerCase().includes(searchQuery.toLowerCase());
      return matchesCategory && matchesSearch;
    });
  }, [selectedCategory, searchQuery]);

  // Get preview with substituted values
  const getPreview = (template: MessageTemplate) => {
    const allValues = { ...defaultValues, ...customValues };
    return {
      subject: template.subject ? substituteVariables(template.subject, allValues) : undefined,
      body: substituteVariables(template.body, allValues),
    };
  };

  // Get missing variables
  const getMissingVariables = (template: MessageTemplate) => {
    const allValues = { ...defaultValues, ...customValues };
    return getUnsubstitutedVariables(template.body + (template.subject || ''), allValues);
  };

  const handleSelectTemplate = (template: MessageTemplate) => {
    setSelectedTemplate(template);
    setCustomValues({});
  };

  const handleCopy = async () => {
    if (!selectedTemplate) return;
    const preview = getPreview(selectedTemplate);
    const textToCopy = preview.subject
      ? `Subject: ${preview.subject}\n\n${preview.body}`
      : preview.body;

    await navigator.clipboard.writeText(textToCopy);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleSend = () => {
    if (!selectedTemplate || !onSend) return;
    const preview = getPreview(selectedTemplate);
    onSend({
      channel: selectedTemplate.channel === 'both' ? 'email' : selectedTemplate.channel,
      subject: preview.subject,
      body: preview.body,
    });
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-4xl max-h-[85vh] overflow-hidden flex flex-col">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 font-serif">
            <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
              <FileText className="w-5 h-5 text-primary" />
            </div>
            Message Templates
          </DialogTitle>
          <DialogDescription>
            Choose a compliance-approved template and personalize it for your client.
          </DialogDescription>
        </DialogHeader>

        <div className="flex-1 overflow-hidden flex gap-4">
          {/* Template List */}
          <div className="w-1/2 flex flex-col overflow-hidden border-r pr-4">
            {/* Search & Filter */}
            <div className="space-y-3 mb-4">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                <Input
                  placeholder="Search templates..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-9"
                />
              </div>
              <Select value={selectedCategory} onValueChange={setSelectedCategory}>
                <SelectTrigger>
                  <Filter className="w-4 h-4 mr-2" />
                  <SelectValue placeholder="All Categories" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Categories</SelectItem>
                  {TEMPLATE_CATEGORIES.map((cat) => (
                    <SelectItem key={cat.id} value={cat.id}>{cat.label}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Template List */}
            <div className="flex-1 overflow-y-auto space-y-2">
              {filteredTemplates.map((template) => {
                const CategoryIcon = CATEGORY_ICONS[template.category] || MessageSquare;
                const isSelected = selectedTemplate?.id === template.id;

                return (
                  <motion.div
                    key={template.id}
                    whileHover={{ scale: 1.01 }}
                    whileTap={{ scale: 0.99 }}
                    onClick={() => handleSelectTemplate(template)}
                    className={cn(
                      "p-3 rounded-lg border cursor-pointer transition-all",
                      isSelected
                        ? "border-primary bg-primary/5"
                        : "border-gray-200 hover:border-gray-300 bg-white"
                    )}
                  >
                    <div className="flex items-start gap-3">
                      <div className={cn(
                        "w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0",
                        isSelected ? "bg-primary/10" : "bg-gray-100"
                      )}>
                        <CategoryIcon className={cn(
                          "w-4 h-4",
                          isSelected ? "text-primary" : "text-gray-500"
                        )} />
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2">
                          <h4 className="font-medium text-sm truncate">{template.name}</h4>
                          <Badge variant="outline" className="text-[10px] shrink-0">
                            {template.channel === 'both' ? 'Email/Text' : template.channel}
                          </Badge>
                        </div>
                        <p className="text-xs text-muted-foreground line-clamp-2 mt-1">
                          {template.body.substring(0, 80)}...
                        </p>
                      </div>
                    </div>
                  </motion.div>
                );
              })}

              {filteredTemplates.length === 0 && (
                <div className="text-center py-8 text-muted-foreground">
                  <FileText className="w-8 h-8 mx-auto mb-2 opacity-30" />
                  <p className="text-sm">No templates found</p>
                </div>
              )}
            </div>
          </div>

          {/* Template Preview & Customization */}
          <div className="w-1/2 flex flex-col overflow-hidden">
            {selectedTemplate ? (
              <>
                <div className="flex-1 overflow-y-auto space-y-4">
                  {/* Template Info */}
                  <div className="flex items-center justify-between">
                    <h3 className="font-semibold text-lg">{selectedTemplate.name}</h3>
                    <Badge
                      className={cn(
                        selectedTemplate.channel === 'email' ? "bg-blue-100 text-blue-700" :
                        selectedTemplate.channel === 'text' ? "bg-green-100 text-green-700" :
                        "bg-purple-100 text-purple-700"
                      )}
                    >
                      {selectedTemplate.channel === 'both' ? 'Email/Text' : selectedTemplate.channel}
                    </Badge>
                  </div>

                  {/* Missing Variables */}
                  {getMissingVariables(selectedTemplate).length > 0 && (
                    <div className="bg-amber-50 border border-amber-200 rounded-lg p-3">
                      <div className="flex items-center gap-2 text-amber-700 mb-2">
                        <AlertCircle className="w-4 h-4" />
                        <span className="text-sm font-medium">Complete these fields:</span>
                      </div>
                      <div className="grid grid-cols-2 gap-2">
                        {getMissingVariables(selectedTemplate).map((variable) => (
                          <div key={variable}>
                            <Label className="text-xs text-amber-800 capitalize">
                              {variable.replace(/([A-Z])/g, ' $1').trim()}
                            </Label>
                            <Input
                              value={customValues[variable] || ''}
                              onChange={(e) => setCustomValues(prev => ({
                                ...prev,
                                [variable]: e.target.value
                              }))}
                              placeholder={`Enter ${variable}`}
                              className="text-sm h-8 bg-white"
                            />
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Preview */}
                  <div className="space-y-2">
                    <Label className="text-xs font-medium">Preview</Label>
                    <div className="bg-gray-50 rounded-lg p-4 space-y-2">
                      {selectedTemplate.channel !== 'text' && selectedTemplate.subject && (
                        <div>
                          <span className="text-xs text-gray-500">Subject: </span>
                          <span className="text-sm font-medium">
                            {getPreview(selectedTemplate).subject}
                          </span>
                        </div>
                      )}
                      <p className="text-sm whitespace-pre-wrap text-gray-700">
                        {getPreview(selectedTemplate).body}
                      </p>
                    </div>
                  </div>

                  {/* Compliance Notes */}
                  {selectedTemplate.complianceNotes && (
                    <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
                      <div className="flex items-center gap-2 text-blue-700">
                        <AlertCircle className="w-4 h-4" />
                        <span className="text-xs font-medium">Compliance Note:</span>
                      </div>
                      <p className="text-xs text-blue-600 mt-1">
                        {selectedTemplate.complianceNotes}
                      </p>
                    </div>
                  )}
                </div>

                {/* Actions */}
                <div className="flex gap-2 pt-4 border-t mt-4">
                  <Button
                    variant="outline"
                    className="flex-1 gap-2"
                    onClick={handleCopy}
                  >
                    {copied ? (
                      <>
                        <Check className="w-4 h-4 text-green-500" />
                        Copied!
                      </>
                    ) : (
                      <>
                        <Copy className="w-4 h-4" />
                        Copy to Clipboard
                      </>
                    )}
                  </Button>
                  {onSend && (
                    <Button
                      className="flex-1 gap-2 bg-primary hover:bg-primary/90"
                      onClick={handleSend}
                      disabled={getMissingVariables(selectedTemplate).length > 0}
                    >
                      <Send className="w-4 h-4" />
                      Send Message
                    </Button>
                  )}
                </div>
              </>
            ) : (
              <div className="flex-1 flex items-center justify-center text-center text-muted-foreground">
                <div>
                  <FileText className="w-12 h-12 mx-auto mb-3 opacity-20" />
                  <p className="text-sm">Select a template to preview</p>
                  {lead && (
                    <p className="text-xs mt-1">
                      Personalizing for: <span className="font-medium">{lead.name}</span>
                    </p>
                  )}
                </div>
              </div>
            )}
          </div>
        </div>

        <DialogFooter className="border-t pt-4">
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Close
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
