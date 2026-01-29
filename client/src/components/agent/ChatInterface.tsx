import { useState, useRef, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import {
  Send, Smile, Paperclip, MoreVertical, Search,
  Phone, Video, Users, ChevronLeft, Check, CheckCheck,
  Image, File, Mic
} from "lucide-react";
import { cn } from "@/lib/utils";
import { fadeInUp, listItemVariants } from "@/lib/animations";

export interface ChatMessage {
  id: string;
  senderId: string;
  senderName: string;
  senderAvatar?: string;
  content: string;
  timestamp: string;
  status?: 'sent' | 'delivered' | 'read';
  isOwn?: boolean;
  type?: 'text' | 'image' | 'file';
}

export interface ChatContact {
  id: string;
  name: string;
  avatar?: string;
  status: 'online' | 'away' | 'offline';
  lastMessage?: string;
  lastMessageTime?: string;
  unreadCount?: number;
  role?: string;
}

interface ChatInterfaceProps {
  contacts: ChatContact[];
  messages: ChatMessage[];
  currentUserId: string;
  selectedContactId?: string;
  onSelectContact?: (contact: ChatContact) => void;
  onSendMessage?: (content: string) => void;
  className?: string;
}

const statusColors = {
  online: 'bg-green-500',
  away: 'bg-yellow-500',
  offline: 'bg-gray-400',
};

function MessageBubble({ message, isOwn }: { message: ChatMessage; isOwn: boolean }) {
  return (
    <motion.div
      variants={listItemVariants}
      initial="hidden"
      animate="visible"
      className={cn(
        "flex gap-2 max-w-[80%]",
        isOwn ? "ml-auto flex-row-reverse" : ""
      )}
    >
      {/* Avatar */}
      {!isOwn && (
        <div className="w-8 h-8 rounded-full bg-gradient-to-br from-primary to-violet-500 flex items-center justify-center text-white text-xs font-bold flex-shrink-0">
          {message.senderName.split(' ').map(n => n[0]).join('')}
        </div>
      )}

      {/* Bubble */}
      <div className={cn(
        "rounded-2xl px-4 py-2.5",
        isOwn
          ? "bg-primary text-white rounded-br-md"
          : "bg-gray-100 text-gray-900 rounded-bl-md"
      )}>
        {!isOwn && (
          <p className="text-xs font-semibold text-violet-500 mb-1">
            {message.senderName}
          </p>
        )}
        <p className="text-sm">{message.content}</p>
        <div className={cn(
          "flex items-center gap-1 mt-1",
          isOwn ? "justify-end" : "justify-start"
        )}>
          <span className={cn(
            "text-[10px]",
            isOwn ? "text-white/70" : "text-gray-500"
          )}>
            {message.timestamp}
          </span>
          {isOwn && message.status && (
            <span className="text-white/70">
              {message.status === 'read' ? (
                <CheckCheck className="w-3 h-3" />
              ) : (
                <Check className="w-3 h-3" />
              )}
            </span>
          )}
        </div>
      </div>
    </motion.div>
  );
}

function ContactItem({
  contact,
  isSelected,
  onClick,
}: {
  contact: ChatContact;
  isSelected: boolean;
  onClick: () => void;
}) {
  return (
    <motion.button
      whileHover={{ backgroundColor: "rgba(124, 124, 255, 0.05)" }}
      whileTap={{ scale: 0.98 }}
      onClick={onClick}
      className={cn(
        "w-full flex items-center gap-3 p-3 rounded-xl transition-colors text-left",
        isSelected && "bg-violet-500/10"
      )}
    >
      {/* Avatar with Status */}
      <div className="relative">
        <div className="w-12 h-12 rounded-full bg-gradient-to-br from-primary to-violet-500 flex items-center justify-center text-white font-bold">
          {contact.name.split(' ').map(n => n[0]).join('')}
        </div>
        <div className={cn(
          "absolute bottom-0 right-0 w-3.5 h-3.5 rounded-full border-2 border-white",
          statusColors[contact.status]
        )} />
      </div>

      {/* Info */}
      <div className="flex-1 min-w-0">
        <div className="flex items-center justify-between">
          <p className="font-semibold text-primary truncate">{contact.name}</p>
          {contact.lastMessageTime && (
            <span className="text-[10px] text-gray-400">{contact.lastMessageTime}</span>
          )}
        </div>
        {contact.role && (
          <p className="text-xs text-gray-500">{contact.role}</p>
        )}
        {contact.lastMessage && (
          <p className="text-xs text-gray-500 truncate">{contact.lastMessage}</p>
        )}
      </div>

      {/* Unread Badge */}
      {contact.unreadCount && contact.unreadCount > 0 && (
        <Badge className="bg-violet-500 text-white text-[10px] h-5 min-w-5 flex items-center justify-center">
          {contact.unreadCount}
        </Badge>
      )}
    </motion.button>
  );
}

export function ChatInterface({
  contacts,
  messages,
  currentUserId,
  selectedContactId,
  onSelectContact,
  onSendMessage,
  className,
}: ChatInterfaceProps) {
  const [inputValue, setInputValue] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const [showContacts, setShowContacts] = useState(true);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const selectedContact = contacts.find(c => c.id === selectedContactId);

  const filteredContacts = contacts.filter(c =>
    c.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleSend = () => {
    if (inputValue.trim() && onSendMessage) {
      onSendMessage(inputValue.trim());
      setInputValue('');
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  return (
    <Card className={cn("border-gray-100 overflow-hidden h-[600px] flex", className)}>
      {/* Contacts Sidebar */}
      <AnimatePresence>
        {(showContacts || !selectedContactId) && (
          <motion.div
            initial={{ width: 0, opacity: 0 }}
            animate={{ width: 320, opacity: 1 }}
            exit={{ width: 0, opacity: 0 }}
            className="border-r border-gray-100 flex flex-col bg-white"
          >
            {/* Header */}
            <div className="p-4 border-b border-gray-100">
              <h2 className="font-bold text-primary mb-3">Messages</h2>
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                <Input
                  placeholder="Search conversations..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-9 h-9"
                />
              </div>
            </div>

            {/* Contacts List */}
            <div className="flex-1 overflow-y-auto p-2 space-y-1">
              {filteredContacts.map((contact) => (
                <ContactItem
                  key={contact.id}
                  contact={contact}
                  isSelected={contact.id === selectedContactId}
                  onClick={() => {
                    onSelectContact?.(contact);
                    if (window.innerWidth < 768) {
                      setShowContacts(false);
                    }
                  }}
                />
              ))}
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Chat Area */}
      <div className="flex-1 flex flex-col bg-gray-50/50">
        {selectedContact ? (
          <>
            {/* Chat Header */}
            <div className="p-4 bg-white border-b border-gray-100 flex items-center gap-3">
              <Button
                variant="ghost"
                size="icon"
                className="md:hidden"
                onClick={() => setShowContacts(true)}
              >
                <ChevronLeft className="w-5 h-5" />
              </Button>

              <div className="relative">
                <div className="w-10 h-10 rounded-full bg-gradient-to-br from-primary to-violet-500 flex items-center justify-center text-white font-bold">
                  {selectedContact.name.split(' ').map(n => n[0]).join('')}
                </div>
                <div className={cn(
                  "absolute bottom-0 right-0 w-3 h-3 rounded-full border-2 border-white",
                  statusColors[selectedContact.status]
                )} />
              </div>

              <div className="flex-1">
                <p className="font-semibold text-primary">{selectedContact.name}</p>
                <p className="text-xs text-gray-500 capitalize">{selectedContact.status}</p>
              </div>

              <div className="flex items-center gap-1">
                <Button variant="ghost" size="icon" className="h-9 w-9">
                  <Phone className="w-4 h-4 text-gray-500" />
                </Button>
                <Button variant="ghost" size="icon" className="h-9 w-9">
                  <Video className="w-4 h-4 text-gray-500" />
                </Button>
                <Button variant="ghost" size="icon" className="h-9 w-9">
                  <MoreVertical className="w-4 h-4 text-gray-500" />
                </Button>
              </div>
            </div>

            {/* Messages */}
            <div className="flex-1 overflow-y-auto p-4 space-y-4">
              {messages.map((message) => (
                <MessageBubble
                  key={message.id}
                  message={message}
                  isOwn={message.senderId === currentUserId}
                />
              ))}
              <div ref={messagesEndRef} />
            </div>

            {/* Input Area */}
            <div className="p-4 bg-white border-t border-gray-100">
              <div className="flex items-center gap-2">
                <Button variant="ghost" size="icon" className="h-9 w-9 flex-shrink-0">
                  <Paperclip className="w-4 h-4 text-gray-500" />
                </Button>
                <div className="flex-1 relative">
                  <Input
                    placeholder="Type a message..."
                    value={inputValue}
                    onChange={(e) => setInputValue(e.target.value)}
                    onKeyPress={handleKeyPress}
                    className="pr-10"
                  />
                  <Button
                    variant="ghost"
                    size="icon"
                    className="absolute right-1 top-1/2 -translate-y-1/2 h-7 w-7"
                  >
                    <Smile className="w-4 h-4 text-gray-400" />
                  </Button>
                </div>
                <Button
                  size="icon"
                  onClick={handleSend}
                  disabled={!inputValue.trim()}
                  className="bg-primary hover:bg-primary/90 h-9 w-9 flex-shrink-0"
                >
                  <Send className="w-4 h-4" />
                </Button>
              </div>
            </div>
          </>
        ) : (
          /* Empty State */
          <div className="flex-1 flex items-center justify-center">
            <div className="text-center">
              <Users className="w-16 h-16 text-gray-300 mx-auto mb-4" />
              <h3 className="font-semibold text-primary mb-1">Select a conversation</h3>
              <p className="text-sm text-gray-500">Choose a contact to start chatting</p>
            </div>
          </div>
        )}
      </div>
    </Card>
  );
}

export default ChatInterface;
