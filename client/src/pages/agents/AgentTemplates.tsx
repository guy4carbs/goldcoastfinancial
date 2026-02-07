import { useState } from "react";
import { motion } from "framer-motion";
import {
  FileText, Mail, MessageSquare, Clock, Send, Award, Filter, Search
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { cn } from "@/lib/utils";
import { MESSAGE_TEMPLATES, TEMPLATE_CATEGORIES, type MessageTemplate } from "@/lib/messageTemplates";
import { AgentLoungeLayout } from "@/components/agent/AgentLoungeLayout";
import { MessageTemplates } from "@/components/agent/MessageTemplates";

const CATEGORY_ICONS: Record<string, typeof Mail> = {
  outreach: Mail,
  'follow-up': Clock,
  quote: FileText,
  application: Send,
  policy: Award,
  general: MessageSquare,
};

export default function AgentTemplates() {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [selectedTemplate, setSelectedTemplate] = useState<MessageTemplate | null>(null);
  const [templateModalOpen, setTemplateModalOpen] = useState(false);

  // Filter templates
  const filteredTemplates = MESSAGE_TEMPLATES.filter(template => {
    const matchesCategory = selectedCategory === 'all' || template.category === selectedCategory;
    const matchesSearch = !searchQuery ||
      template.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      template.body.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesCategory && matchesSearch;
  });

  // Group templates by category
  const groupedTemplates = filteredTemplates.reduce((acc, template) => {
    if (!acc[template.category]) {
      acc[template.category] = [];
    }
    acc[template.category].push(template);
    return acc;
  }, {} as Record<string, MessageTemplate[]>);

  const handleOpenTemplate = (template: MessageTemplate) => {
    setSelectedTemplate(template);
    setTemplateModalOpen(true);
  };

  return (
    <AgentLoungeLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
          <div>
            <h1 className="text-2xl font-serif font-bold text-primary flex items-center gap-2">
              <FileText className="w-7 h-7" />
              Message Templates
            </h1>
            <p className="text-sm text-muted-foreground mt-1">
              Compliance-approved templates for client communication
            </p>
          </div>
        </div>

      {/* Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {TEMPLATE_CATEGORIES.slice(0, 4).map((category, index) => {
          const Icon = CATEGORY_ICONS[category.id] || FileText;
          const count = MESSAGE_TEMPLATES.filter(t => t.category === category.id).length;
          return (
            <motion.div
              key={category.id}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
              className="p-4 rounded-xl border bg-white shadow-sm"
            >
              <div className="flex items-center gap-2 mb-1">
                <Icon className="w-4 h-4 text-primary" />
                <span className="text-sm font-medium text-gray-600">{category.label}</span>
              </div>
              <p className="text-2xl font-bold text-primary">{count}</p>
            </motion.div>
          );
        })}
      </div>

      {/* Search & Filter */}
      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <Input
            placeholder="Search templates..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-9"
          />
        </div>
        <Select value={selectedCategory} onValueChange={setSelectedCategory}>
          <SelectTrigger className="w-full sm:w-48">
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

      {/* Template Grid */}
      <div className="space-y-6">
        {Object.entries(groupedTemplates).map(([category, templates]) => {
          const categoryInfo = TEMPLATE_CATEGORIES.find(c => c.id === category);
          const CategoryIcon = CATEGORY_ICONS[category] || FileText;

          return (
            <div key={category}>
              <div className="flex items-center gap-2 mb-3">
                <CategoryIcon className="w-5 h-5 text-primary" />
                <h2 className="font-semibold text-lg">
                  {categoryInfo?.label || category}
                </h2>
                <Badge variant="secondary" className="text-xs">
                  {templates.length}
                </Badge>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {templates.map((template) => (
                  <motion.div
                    key={template.id}
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    onClick={() => handleOpenTemplate(template)}
                    className="p-4 rounded-xl border bg-white shadow-sm cursor-pointer hover:border-primary/50 transition-all"
                  >
                    <div className="flex items-start justify-between mb-2">
                      <h3 className="font-medium text-gray-900">{template.name}</h3>
                      <Badge
                        className={cn(
                          "text-[10px]",
                          template.channel === 'email' ? "bg-blue-100 text-blue-700" :
                          template.channel === 'text' ? "bg-green-100 text-green-700" :
                          "bg-purple-100 text-purple-700"
                        )}
                      >
                        {template.channel === 'both' ? 'Email/Text' : template.channel}
                      </Badge>
                    </div>
                    <p className="text-sm text-gray-500 line-clamp-3">
                      {template.body.substring(0, 120)}...
                    </p>
                    <div className="mt-3 flex items-center gap-2">
                      <span className="text-xs text-gray-400">
                        {template.variables.length} variable{template.variables.length !== 1 ? 's' : ''}
                      </span>
                    </div>
                  </motion.div>
                ))}
              </div>
            </div>
          );
        })}

        {filteredTemplates.length === 0 && (
          <div className="text-center py-12 text-muted-foreground">
            <FileText className="w-12 h-12 mx-auto mb-3 opacity-30" />
            <p className="text-lg font-medium">No templates found</p>
            <p className="text-sm">Try adjusting your search or filter</p>
          </div>
        )}
      </div>

        {/* Template Modal */}
        <MessageTemplates
          open={templateModalOpen}
          onOpenChange={setTemplateModalOpen}
          lead={null}
        />
      </div>
    </AgentLoungeLayout>
  );
}
