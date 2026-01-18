import { useState, useRef, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { MessageCircle, X, Send, Minimize2, User, Bot, Building2 } from "lucide-react";
import { Button } from "./button";
import { Input } from "./input";
import { Avatar, AvatarFallback } from "./avatar";

interface Message {
  id: string;
  text: string;
  isBot: boolean;
  timestamp: Date;
}

const quickReplies = [
  "Partnership inquiry",
  "Corporate contact",
  "Portfolio companies",
  "Investor relations",
];

const botResponses: { [key: string]: string } = {
  "partnership": "Thank you for your interest in partnership opportunities. For confidential discussions regarding acquisitions, partnerships, or strategic opportunities, please email corporate@goldcoastfnl.com or submit an inquiry through our Contact page. Our corporate development team reviews all inquiries within 2-3 business days.",
  "corporate": "For corporate and institutional inquiries:\n\n• Corporate Development: corporate@goldcoastfnl.com\n• General Inquiries: contact@goldcoastfnl.com\n• Media: media@goldcoastfnl.com\n• Applications: applications@goldcoastfnl.com\n\nOur offices are located in Naperville, Illinois.",
  "portfolio": "Gold Coast Financial currently oversees one active operating company:\n\n• Heritage Life Solutions - Independent life insurance brokerage serving all 50 states\n\nWe continue to evaluate opportunities in property & casualty, advisory services, and insurance technology. Would you like to learn more about partnership criteria?",
  "investor": "Gold Coast Financial is a private holding company. For institutional inquiries or discussions regarding capital partnerships, please contact our corporate development team at corporate@goldcoastfnl.com with details about your organization and interest.",
  "insurance": "Consumer insurance inquiries should be directed to Heritage Life Solutions, our life insurance operating company. Visit goldcoastfnl.com/heritage or contact their team directly for quotes and policy questions.",
  "default": "Thank you for reaching out to Gold Coast Financial. How may I assist you with your institutional or corporate inquiry today?",
};

export function InstitutionalLiveChat() {
  const [isOpen, setIsOpen] = useState(false);
  const [isMinimized, setIsMinimized] = useState(false);
  const [messages, setMessages] = useState<Message[]>([
    {
      id: "1",
      text: "Welcome to Gold Coast Financial. How may I assist you with your institutional inquiry?",
      isBot: true,
      timestamp: new Date(),
    },
  ]);
  const [inputValue, setInputValue] = useState("");
  const [isTyping, setIsTyping] = useState(false);
  const [hasNewMessage, setHasNewMessage] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  useEffect(() => {
    const timer = setTimeout(() => {
      if (!isOpen) {
        setHasNewMessage(true);
      }
    }, 8000);
    return () => clearTimeout(timer);
  }, []);

  const handleSendMessage = (text: string) => {
    if (!text.trim()) return;

    const userMessage: Message = {
      id: Date.now().toString(),
      text: text.trim(),
      isBot: false,
      timestamp: new Date(),
    };

    setMessages((prev) => [...prev, userMessage]);
    setInputValue("");
    setIsTyping(true);

    setTimeout(() => {
      const lowerText = text.toLowerCase();
      let response = botResponses.default;

      for (const [key, value] of Object.entries(botResponses)) {
        if (lowerText.includes(key)) {
          response = value;
          break;
        }
      }

      const botMessage: Message = {
        id: (Date.now() + 1).toString(),
        text: response,
        isBot: true,
        timestamp: new Date(),
      };

      setMessages((prev) => [...prev, botMessage]);
      setIsTyping(false);
    }, 1200 + Math.random() * 800);
  };

  const handleOpen = () => {
    setIsOpen(true);
    setIsMinimized(false);
    setHasNewMessage(false);
  };

  return (
    <>
      <AnimatePresence>
        {isOpen && !isMinimized && (
          <motion.div
            initial={{ opacity: 0, y: 20, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 20, scale: 0.95 }}
            transition={{ duration: 0.2 }}
            className="fixed bottom-24 right-4 md:right-6 w-[calc(100%-2rem)] md:w-96 max-w-sm bg-white rounded-lg shadow-2xl border border-border/60 overflow-hidden z-50"
          >
            {/* Header - Institutional styling */}
            <div className="bg-gradient-to-r from-[hsl(348,65%,18%)] to-[hsl(348,65%,22%)] p-4 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-white/10 flex items-center justify-center">
                  <Building2 className="w-5 h-5 text-[hsl(42,60%,55%)]" />
                </div>
                <div>
                  <h3 className="font-medium text-white text-sm">Corporate Inquiries</h3>
                  <p className="text-xs text-white/60 flex items-center gap-1">
                    <span className="w-1.5 h-1.5 bg-[hsl(42,60%,55%)] rounded-full" />
                    Gold Coast Financial
                  </p>
                </div>
              </div>
              <div className="flex gap-1">
                <Button
                  variant="ghost"
                  size="icon"
                  className="text-white/70 hover:text-white hover:bg-white/10 h-8 w-8"
                  onClick={() => setIsMinimized(true)}
                >
                  <Minimize2 className="w-4 h-4" />
                </Button>
                <Button
                  variant="ghost"
                  size="icon"
                  className="text-white/70 hover:text-white hover:bg-white/10 h-8 w-8"
                  onClick={() => setIsOpen(false)}
                >
                  <X className="w-4 h-4" />
                </Button>
              </div>
            </div>

            {/* Messages */}
            <div className="h-80 overflow-y-auto p-4 space-y-4 bg-gray-50/50">
              {messages.map((message) => (
                <motion.div
                  key={message.id}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className={`flex gap-2 ${message.isBot ? "" : "flex-row-reverse"}`}
                >
                  <Avatar className="w-8 h-8 shrink-0">
                    <AvatarFallback className={message.isBot ? "bg-[hsl(348,65%,20%)] text-white" : "bg-[hsl(42,60%,55%)] text-white"}>
                      {message.isBot ? <Bot className="w-4 h-4" /> : <User className="w-4 h-4" />}
                    </AvatarFallback>
                  </Avatar>
                  <div
                    className={`max-w-[80%] rounded-lg px-4 py-2.5 ${
                      message.isBot
                        ? "bg-white border border-border/60 shadow-sm rounded-tl-none"
                        : "bg-[hsl(348,65%,20%)] text-white rounded-tr-none"
                    }`}
                  >
                    <p className="text-sm whitespace-pre-line leading-relaxed">{message.text}</p>
                  </div>
                </motion.div>
              ))}

              {isTyping && (
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className="flex gap-2"
                >
                  <Avatar className="w-8 h-8">
                    <AvatarFallback className="bg-[hsl(348,65%,20%)] text-white">
                      <Bot className="w-4 h-4" />
                    </AvatarFallback>
                  </Avatar>
                  <div className="bg-white border border-border/60 shadow-sm rounded-lg rounded-tl-none px-4 py-3">
                    <div className="flex gap-1">
                      <span className="w-2 h-2 bg-gray-300 rounded-full animate-bounce" style={{ animationDelay: "0ms" }} />
                      <span className="w-2 h-2 bg-gray-300 rounded-full animate-bounce" style={{ animationDelay: "150ms" }} />
                      <span className="w-2 h-2 bg-gray-300 rounded-full animate-bounce" style={{ animationDelay: "300ms" }} />
                    </div>
                  </div>
                </motion.div>
              )}
              <div ref={messagesEndRef} />
            </div>

            {/* Quick Replies & Input */}
            <div className="p-3 border-t border-border/60 bg-white">
              <div className="flex flex-wrap gap-2 mb-3">
                {quickReplies.map((reply) => (
                  <button
                    key={reply}
                    onClick={() => handleSendMessage(reply)}
                    className="text-xs px-3 py-1.5 rounded-full border border-[hsl(348,65%,20%)]/20 text-[hsl(348,65%,20%)] hover:bg-[hsl(348,65%,20%)] hover:text-white transition-all duration-200"
                  >
                    {reply}
                  </button>
                ))}
              </div>
              <form
                onSubmit={(e) => {
                  e.preventDefault();
                  handleSendMessage(inputValue);
                }}
                className="flex gap-2"
              >
                <Input
                  value={inputValue}
                  onChange={(e) => setInputValue(e.target.value)}
                  placeholder="Type your inquiry..."
                  className="flex-1 rounded-lg text-sm"
                />
                <Button
                  type="submit"
                  size="icon"
                  className="rounded-lg bg-[hsl(348,65%,20%)] hover:bg-[hsl(348,65%,25%)] shrink-0"
                  disabled={!inputValue.trim()}
                >
                  <Send className="w-4 h-4" />
                </Button>
              </form>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Chat Button */}
      <motion.button
        initial={{ scale: 0 }}
        animate={{ scale: 1 }}
        transition={{ delay: 1, type: "spring", stiffness: 200 }}
        onClick={handleOpen}
        className="fixed bottom-4 right-4 md:right-6 w-14 h-14 bg-[hsl(348,65%,20%)] hover:bg-[hsl(348,65%,25%)] text-white rounded-full shadow-lg flex items-center justify-center z-50 group transition-all duration-200"
      >
        <AnimatePresence mode="wait">
          {isOpen && !isMinimized ? (
            <motion.div
              key="close"
              initial={{ rotate: -90, opacity: 0 }}
              animate={{ rotate: 0, opacity: 1 }}
              exit={{ rotate: 90, opacity: 0 }}
            >
              <X className="w-6 h-6" />
            </motion.div>
          ) : (
            <motion.div
              key="open"
              initial={{ rotate: 90, opacity: 0 }}
              animate={{ rotate: 0, opacity: 1 }}
              exit={{ rotate: -90, opacity: 0 }}
            >
              <MessageCircle className="w-6 h-6" />
            </motion.div>
          )}
        </AnimatePresence>

        {hasNewMessage && !isOpen && (
          <motion.span
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            className="absolute -top-1 -right-1 w-5 h-5 bg-[hsl(42,60%,55%)] text-[hsl(348,65%,15%)] text-xs rounded-full flex items-center justify-center font-bold"
          >
            1
          </motion.span>
        )}

        <span className="absolute right-full mr-3 px-3 py-1.5 bg-white rounded-lg shadow-lg text-sm text-[hsl(348,65%,20%)] font-medium whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none border border-border/60">
          Corporate Inquiry
        </span>
      </motion.button>
    </>
  );
}
