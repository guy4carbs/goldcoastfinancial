import { useState } from "react";
import { motion } from "framer-motion";
import {
  Wand2, Copy, Check, Send, Mail, MessageSquare,
  ChevronRight, Sparkles
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Textarea } from "@/components/ui/textarea";
import { cn } from "@/lib/utils";
import { useAgentStore, type Lead } from "@/lib/agentStore";
import { getTemplate, fillTemplate, type MessageTemplate } from "@/lib/messageTemplates";

interface SmartTemplatePanelProps {
  lead: Lead;
  agentName?: string;
  onSend?: (channel: 'email' | 'text', content: string) => void;
  compact?: boolean;
}

export function SmartTemplatePanel({ lead, agentName = 'Your Agent', onSend, compact = false }: SmartTemplatePanelProps) {
  const { getSuggestedTemplate } = useAgentStore();
  const [copied, setCopied] = useState(false);
  const [showEditor, setShowEditor] = useState(false);
  const [editedContent, setEditedContent] = useState('');

  const suggestion = getSuggestedTemplate(lead);

  if (!suggestion) {
    return compact ? null : (
      <div className="p-4 rounded-xl bg-gray-50 border border-gray-200 text-center">
        <Wand2 className="w-5 h-5 text-gray-400 mx-auto mb-2" />
        <p className="text-sm text-gray-500">No template suggestion available</p>
      </div>
    );
  }

  const template = getTemplate(suggestion.templateId);
  if (!template) return null;

  const filledContent = fillTemplate(template.id, {
    firstName: lead.name.split(' ')[0],
    lastName: lead.name.split(' ').slice(1).join(' ') || '',
    fullName: lead.name,
    product: lead.product || 'life insurance',
    agentName,
    agentPhone: '(800) 555-0123',
    agentEmail: 'agent@goldcoastfnl.com',
    companyName: 'Gold Coast Financial',
    // Add more variables as needed
  });

  const handleCopy = async () => {
    await navigator.clipboard.writeText(editedContent || filledContent);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleSend = (channel: 'email' | 'text') => {
    onSend?.(channel, editedContent || filledContent);
    setShowEditor(false);
  };

  if (compact) {
    return (
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        className="p-3 rounded-xl bg-gradient-to-r from-purple-50 to-blue-50 border border-purple-200"
      >
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-full bg-purple-100 flex items-center justify-center">
              <Wand2 className="w-4 h-4 text-purple-600" />
            </div>
            <div>
              <p className="text-sm font-medium text-gray-900">{template.name}</p>
              <p className="text-xs text-gray-500">{suggestion.reason}</p>
            </div>
          </div>
          <Button
            size="sm"
            variant="outline"
            className="h-7 text-xs bg-white"
            onClick={() => setShowEditor(true)}
          >
            Use Template
            <ChevronRight className="w-3 h-3 ml-1" />
          </Button>
        </div>

        {showEditor && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            className="mt-3 pt-3 border-t border-purple-200"
          >
            <Textarea
              value={editedContent || filledContent}
              onChange={e => setEditedContent(e.target.value)}
              rows={4}
              className="text-sm mb-2"
            />
            <div className="flex gap-2">
              <Button size="sm" variant="outline" onClick={handleCopy} className="flex-1">
                {copied ? <Check className="w-3 h-3 mr-1" /> : <Copy className="w-3 h-3 mr-1" />}
                {copied ? 'Copied!' : 'Copy'}
              </Button>
              {template.channels.includes('email') && (
                <Button size="sm" onClick={() => handleSend('email')} className="flex-1">
                  <Mail className="w-3 h-3 mr-1" />
                  Email
                </Button>
              )}
              {template.channels.includes('text') && (
                <Button size="sm" onClick={() => handleSend('text')} className="flex-1">
                  <MessageSquare className="w-3 h-3 mr-1" />
                  Text
                </Button>
              )}
            </div>
          </motion.div>
        )}
      </motion.div>
    );
  }

  return (
    <div className="rounded-xl border border-purple-200 overflow-hidden">
      {/* Header */}
      <div className="p-4 bg-gradient-to-r from-purple-50 to-blue-50 border-b border-purple-200">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-purple-100 flex items-center justify-center">
              <Wand2 className="w-5 h-5 text-purple-600" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h4 className="font-semibold text-gray-900">{template.name}</h4>
                <Badge className="bg-purple-100 text-purple-700 text-[10px]">
                  <Sparkles className="w-2.5 h-2.5 mr-0.5" />
                  AI Suggested
                </Badge>
              </div>
              <p className="text-sm text-gray-500">{suggestion.reason}</p>
            </div>
          </div>
          <div className="flex gap-1">
            {template.channels.map(channel => (
              <Badge key={channel} variant="outline" className="text-xs capitalize">
                {channel === 'email' ? <Mail className="w-3 h-3 mr-1" /> : <MessageSquare className="w-3 h-3 mr-1" />}
                {channel}
              </Badge>
            ))}
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="p-4 bg-white">
        {template.subject && (
          <div className="mb-3">
            <p className="text-xs text-gray-500 mb-1">Subject:</p>
            <p className="text-sm font-medium text-gray-900">{template.subject}</p>
          </div>
        )}

        <div className="relative">
          <Textarea
            value={editedContent || filledContent}
            onChange={e => setEditedContent(e.target.value)}
            rows={6}
            className="text-sm resize-none"
            placeholder="Template content will appear here..."
          />
          {editedContent && editedContent !== filledContent && (
            <Badge className="absolute top-2 right-2 text-[10px] bg-amber-100 text-amber-700">
              Edited
            </Badge>
          )}
        </div>
      </div>

      {/* Actions */}
      <div className="p-4 bg-gray-50 border-t flex gap-2">
        <Button variant="outline" onClick={handleCopy} className="flex-1">
          {copied ? <Check className="w-4 h-4 mr-1" /> : <Copy className="w-4 h-4 mr-1" />}
          {copied ? 'Copied!' : 'Copy to Clipboard'}
        </Button>
        {template.channels.includes('email') && (
          <Button onClick={() => handleSend('email')} className="flex-1">
            <Mail className="w-4 h-4 mr-1" />
            Send Email
          </Button>
        )}
        {template.channels.includes('text') && (
          <Button onClick={() => handleSend('text')} className="flex-1 bg-green-600 hover:bg-green-700">
            <MessageSquare className="w-4 h-4 mr-1" />
            Send Text
          </Button>
        )}
      </div>
    </div>
  );
}
